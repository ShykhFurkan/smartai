import { NextRequest, NextResponse } from "next/server";
import { AIService, CandidateProfile } from "@/services/ai";
import { logger } from "@smarthire/logger";

/** POST /api/ai/rank-candidates — Rank a pool of candidates for a job */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobDescription, requiredSkills, minExperienceYears, candidates } = body as {
      jobDescription: string;
      requiredSkills: string[];
      minExperienceYears?: number;
      candidates: CandidateProfile[];
    };

    if (!jobDescription || !requiredSkills || !candidates?.length) {
      return NextResponse.json(
        { error: "jobDescription, requiredSkills, and candidates are required" },
        { status: 400 }
      );
    }

    logger.info("[API] POST /api/ai/rank-candidates");
    const result = await AIService.rankCandidates({
      jobDescription,
      requiredSkills,
      minExperienceYears,
      candidates,
    });
    return NextResponse.json({ data: result });
  } catch (err: unknown) {
    logger.error("[API] rank-candidates error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Candidate ranking failed", message }, { status: 500 });
  }
}
