import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/services/ai";
import { logger } from "@smarthire/logger";

/** POST /api/ai/score-resume — Score a resume against a job description */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeContent, jobDescription, requiredSkills, preferredSkills, minExperienceYears } =
      body as {
        resumeContent: string;
        jobDescription: string;
        requiredSkills: string[];
        preferredSkills?: string[];
        minExperienceYears?: number;
      };

    if (!resumeContent || !jobDescription || !requiredSkills) {
      return NextResponse.json(
        { error: "resumeContent, jobDescription, and requiredSkills are required" },
        { status: 400 }
      );
    }

    logger.info("[API] POST /api/ai/score-resume");
    const result = await AIService.scoreResume({
      resumeContent,
      jobDescription,
      requiredSkills,
      preferredSkills,
      minExperienceYears,
    });
    return NextResponse.json({ data: result });
  } catch (err: unknown) {
    logger.error("[API] score-resume error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Resume scoring failed", message }, { status: 500 });
  }
}
