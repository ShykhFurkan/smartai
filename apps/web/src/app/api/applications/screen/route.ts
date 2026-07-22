import { NextRequest, NextResponse } from "next/server";
import { createAppClient } from "@/utils/supabase/application";
import { AIService } from "@/services/ai";
import { logger } from "@smarthire/logger";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createAppClient();

    // 1. Authenticate recruiter session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { jobId } = await request.json();
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    logger.info(`[ATS Screening] Recruiter ${user.id} initiated screening for job ${jobId}`);

    // 2. Fetch applications in screening status
    const { data: apps, error: appsErr } = await supabase
      .from("applications")
      .select("id, candidate_id, resume_id")
      .eq("job_id", jobId)
      .eq("status", "screening")
      .is("deleted_at", null);

    if (appsErr) {
      logger.error("Failed to fetch applications for screening", appsErr);
      return NextResponse.json({ error: "Database query failed" }, { status: 500 });
    }

    if (!apps || apps.length === 0) {
      return NextResponse.json({ data: [], message: "No applications found in Profile Screening stage" });
    }

    const candidateIds = apps.map((a) => a.candidate_id);

    // 3. Fetch candidate profiles from candidate schema
    const { data: cands, error: candsErr } = await supabase
      .schema("candidate")
      .from("candidates")
      .select("id, tags, summary, headline")
      .in("id", candidateIds);

    if (candsErr) {
      logger.error("Failed to fetch candidate profiles for screening", candsErr);
      return NextResponse.json({ error: "Failed to fetch candidate profiles" }, { status: 500 });
    }

    // 4. Fetch resumes for candidates
    const { data: resumes, error: resumesErr } = await supabase
      .schema("candidate")
      .from("resumes")
      .select("candidate_id, parsed_text")
      .in("candidate_id", candidateIds);

    if (resumesErr) {
      logger.warn("Failed to fetch resumes, proceeding with profile summaries", resumesErr);
    }

    // 5. Fetch job details
    const { data: job, error: jobErr } = await supabase
      .schema("job")
      .from("jobs")
      .select("title, description")
      .eq("id", jobId)
      .single();

    if (jobErr || !job) {
      logger.error("Failed to fetch job details", jobErr);
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
    }

    // 6. Map to candidate profiles for ranker input
    const candidatesPayload = apps.map((app) => {
      const cand = cands?.find((c) => c.id === app.candidate_id);
      const res = resumes?.find((r) => r.candidate_id === app.candidate_id);
      return {
        candidateId: app.id, // Rank the application ID directly
        skills: cand?.tags || [],
        totalExperienceYears: 3, // Mock default experience
        educationLevel: "bachelor",
        resumeContent: res?.parsed_text || cand?.summary || cand?.headline || "Applicant profile",
      };
    });

    const requiredSkills = ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Node.js", "SQL", "Git"];

    // 7. Run AI Ranker
    const rankedEntries = await AIService.rankCandidates({
      jobDescription: job.description || job.title || "",
      requiredSkills,
      minExperienceYears: 2,
      candidates: candidatesPayload,
    });

    // 8. Update scores in applications table (both legacy score and new screening_score)
    for (const entry of rankedEntries) {
      const scoreOutOf10 = Math.round((entry.score / 10) * 10) / 10; // e.g. 8.5
      await supabase
        .from("applications")
        .update({ score: scoreOutOf10, screening_score: scoreOutOf10 })
        .eq("id", entry.candidateId);
    }

    logger.info(`[ATS Screening] Completed screening for job ${jobId}. Screened ${rankedEntries.length} candidates.`);
    return NextResponse.json({ success: true, count: rankedEntries.length });
  } catch (err: unknown) {
    logger.error("API error in applications screen route", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Screening execution failed", message }, { status: 500 });
  }
}
