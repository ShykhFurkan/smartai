import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/services/ai";
import { logger } from "@smarthire/logger";

/** POST /api/ai/extract-skills — Extract skills from free-form text */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, context } = body as {
      content: string;
      context?: "resume" | "job_description" | "freeform";
    };

    if (!content) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }

    logger.info("[API] POST /api/ai/extract-skills");
    const result = await AIService.extractSkills({ content, context });
    return NextResponse.json({ data: result });
  } catch (err: unknown) {
    logger.error("[API] extract-skills error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Skill extraction failed", message }, { status: 500 });
  }
}
