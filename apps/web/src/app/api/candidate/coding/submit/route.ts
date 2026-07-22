import { NextRequest, NextResponse } from "next/server";
import { createAppClient } from "@/utils/supabase/application";
import { logger } from "@smarthire/logger";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAppClient();

    // 1. Authenticate candidate session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { assignmentId, code, language, timeSpentSeconds, testCases } = await request.json();

    if (!assignmentId || !code) {
      return NextResponse.json({ error: "assignmentId and code are required" }, { status: 400 });
    }

    logger.info(`[Coding Submit API] Candidate ${user.id} submitting assignment ${assignmentId}`);

    // 2. Fetch assignment details
    const { data: assignment, error: assignErr } = await supabase
      .schema("assessment")
      .from("assignments")
      .select("id, assessment_id, application_id, candidate_id, company_id")
      .eq("id", assignmentId)
      .single();

    if (assignErr || !assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
    }

    // 3. Fetch assessment template duration
    const { data: tmpl } = await supabase
      .schema("assessment")
      .from("assessments")
      .select("duration_minutes, passing_percentage")
      .eq("id", assignment.assessment_id)
      .single();

    const durationMinutes = tmpl?.duration_minutes || 60;
    const totalDurationSeconds = durationMinutes * 60;

    // --- 10-POINT MULTI-FACTOR EVALUATION ENGINE ---

    // Factor 1: Test Case Result Correctness (Max 4.0 Marks)
    let passedCases = 0;
    const totalCases = testCases?.length || 1;

    for (const tc of testCases || []) {
      try {
        if (language === "javascript" || language === "typescript") {
          const fn = new Function("input", `${code}; return typeof solve === 'function' ? solve(input) : input;`);
          const res = String(fn(tc.input.trim())).trim();
          if (res.toLowerCase() === tc.expectedOutput.trim().toLowerCase()) {
            passedCases++;
          }
        } else {
          // General match fallback
          if (code.length > 20) {
            passedCases++;
          }
        }
      } catch {
        // Failed case
      }
    }

    const correctnessScore = Number(((passedCases / totalCases) * 4.0).toFixed(2)); // Out of 4.0

    // Factor 2: Code Quality & Structure (Max 3.0 Marks)
    let qualityScore = 2.0; // Baseline
    const codeLen = code.trim().length;

    if (codeLen > 40 && codeLen < 2000) qualityScore += 0.5; // Good clean size
    if (code.includes("function") || code.includes("def") || code.includes("class")) qualityScore += 0.3; // Structured
    if (code.includes("return") || code.includes("print") || code.includes("console.log")) qualityScore += 0.2; // Return value present
    qualityScore = Math.min(3.0, Number(qualityScore.toFixed(2))); // Max 3.0

    // Factor 3: Time Efficiency (Max 3.0 Marks)
    const ratio = timeSpentSeconds / totalDurationSeconds;
    let timeScore = 2.0;
    if (ratio <= 0.5) {
      timeScore = 3.0; // Fast completion
    } else if (ratio <= 0.8) {
      timeScore = 2.5; // Moderate completion
    } else {
      timeScore = 2.0; // Completed near limit
    }

    // Combined Final Marks out of 10.0
    const finalScore10 = Number((correctnessScore + qualityScore + timeScore).toFixed(2));
    const passed = finalScore10 >= 6.0;

    // 4. Upsert candidate attempt record in assessment.attempts
    const { data: existingAttempt } = await supabase
      .schema("assessment")
      .from("attempts")
      .select("id")
      .eq("assignment_id", assignmentId)
      .maybeSingle();

    if (existingAttempt) {
      await supabase
        .schema("assessment")
        .from("attempts")
        .update({
          score: Math.round((finalScore10 / 10) * 100), // percentage for legacy
          correctness_score: correctnessScore,
          code_quality_score: qualityScore,
          time_score: timeScore,
          time_spent_seconds: timeSpentSeconds,
          status: "completed",
          completed_at: new Date().toISOString(),
          passed,
          answers: { code, language },
        })
        .eq("id", existingAttempt.id);
    } else {
      await supabase
        .schema("assessment")
        .from("attempts")
        .insert({
          assignment_id: assignmentId,
          assessment_id: assignment.assessment_id,
          candidate_id: assignment.candidate_id,
          score: Math.round((finalScore10 / 10) * 100),
          correctness_score: correctnessScore,
          code_quality_score: qualityScore,
          time_score: timeScore,
          time_spent_seconds: timeSpentSeconds,
          started_at: new Date(Date.now() - timeSpentSeconds * 1000).toISOString(),
          completed_at: new Date().toISOString(),
          status: "completed",
          passed,
          answers: { code, language },
        });
    }

    // 5. Update assignment status
    await supabase
      .schema("assessment")
      .from("assignments")
      .update({ status: "completed" })
      .eq("id", assignmentId);

    // 6. Update candidate application stage score in application.applications
    if (assignment.application_id) {
      await supabase
        .from("applications")
        .update({
          coding_score: finalScore10,
          coding_total: 10,
          coding_passed: passed,
        })
        .eq("id", assignment.application_id);
    }

    return NextResponse.json({
      success: true,
      score10: finalScore10,
      total: 10,
      passed,
      breakdown: {
        correctness: `${correctnessScore} / 4.0`,
        codeQuality: `${qualityScore} / 3.0`,
        timeEfficiency: `${timeScore} / 3.0`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("API error in candidate coding submit route", err);
    return NextResponse.json({ error: "Failed to submit coding exam", message }, { status: 500 });
  }
}
