import { NextRequest, NextResponse } from "next/server";
import { AIService } from "@/services/ai";
import { logger } from "@smarthire/logger";

/** POST /api/ai/parse-resume — Parse a resume into structured fields */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, mimeType, candidateId } = body as {
      content: string;
      mimeType: string;
      candidateId?: string;
    };

    if (!content || !mimeType) {
      return NextResponse.json(
        { error: "content and mimeType are required" },
        { status: 400 }
      );
    }

    logger.info("[API] POST /api/ai/parse-resume");
    const result = await AIService.parseResume({ content, mimeType, candidateId });
    return NextResponse.json({ data: result });
  } catch (err: unknown) {
    logger.error("[API] parse-resume error", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Resume parsing failed", message }, { status: 500 });
  }
}
