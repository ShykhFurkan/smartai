import { NextRequest, NextResponse } from "next/server";
import { AIService, QuestionCategory, QuestionDifficulty } from "@/services/ai";
import { logger } from "@smarthire/logger";

/** POST /api/ai/generate-questions — Generate interview/assessment questions */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      jobTitle,
      jobDescription,
      targetSkills,
      candidateResumeContent,
      count,
      categories,
      difficulty,
    } = body as {
      jobTitle: string;
      jobDescription: string;
      targetSkills: string[];
      candidateResumeContent?: string;
      count?: number;
      categories?: QuestionCategory[];
      difficulty?: QuestionDifficulty;
    };

    if (!jobTitle || !jobDescription || !targetSkills?.length) {
      return NextResponse.json(
        { error: "jobTitle, jobDescription, and targetSkills are required" },
        { status: 400 }
      );
    }

    logger.info("[API] POST /api/ai/generate-questions");
    const result = await AIService.generateQuestions({
      jobTitle,
      jobDescription,
      targetSkills,
      candidateResumeContent,
      count,
      categories,
      difficulty,
    });
    return NextResponse.json({ data: result });
  } catch (err: unknown) {
    logger.error("[API] generate-questions error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Question generation failed", message }, { status: 500 });
  }
}
