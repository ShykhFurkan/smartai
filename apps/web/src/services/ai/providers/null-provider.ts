/**
 * AI Service — Null Provider (Stub / No-Op Implementation)
 *
 * Satisfies the full IAIProvider contract without making any external calls.
 * Used as the default provider in development and test environments until
 * a concrete LLM provider (OpenAI, Gemini, Anthropic, etc.) is registered.
 *
 * All methods return deterministic, structurally valid placeholder responses
 * so that dependent services can be built and tested end-to-end.
 */

import { IAIProvider, AIProviderStatus } from "../interfaces/ai-provider.interface";
import { IResumeParser, ResumeParserInput, ParsedResume } from "../interfaces/resume-parser.interface";
import { IResumeScorer, ResumeScorerInput, ResumeScore } from "../interfaces/resume-scorer.interface";
import { ISkillExtractor, SkillExtractorInput, ExtractedSkill } from "../interfaces/skill-extractor.interface";
import { ICandidateRanker, CandidateRankerInput, CandidateRankingEntry } from "../interfaces/candidate-ranker.interface";
import { IJobMatcher, JobMatcherInput, JobMatch } from "../interfaces/job-matcher.interface";
import { IQuestionGenerator, QuestionGeneratorInput, GeneratedQuestion } from "../interfaces/question-generator.interface";
import { logger } from "@smarthire/logger";

// ---------------------------------------------------------------------------
// Sub-capability stubs
// ---------------------------------------------------------------------------

const nullResumeParser: IResumeParser = {
  async parse(input: ResumeParserInput): Promise<ParsedResume> {
    logger.info("[NullAIProvider] resumeParser.parse called — returning stub");
    return {
      fullName: null,
      email: null,
      phone: null,
      location: null,
      summary: null,
      experience: [],
      education: [],
      skills: [],
      certifications: [],
      languages: [],
      rawText: input.content,
      confidence: 0,
    };
  },
};

const nullResumeScorer: IResumeScorer = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async score(_: ResumeScorerInput): Promise<ResumeScore> {
    logger.info("[NullAIProvider] resumeScorer.score called — returning stub");
    return {
      overallScore: 0,
      breakdown: { skills: 0, experience: 0, education: 0, seniority: 0 },
      matchedSkills: [],
      missingSkills: [],
      strengths: [],
      gaps: [],
      recommendation: "No AI provider configured. Scores are placeholder values.",
    };
  },
};

const nullSkillExtractor: ISkillExtractor = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async extract(_: SkillExtractorInput): Promise<ExtractedSkill[]> {
    logger.info("[NullAIProvider] skillExtractor.extract called — returning stub");
    return [];
  },
};

const nullCandidateRanker: ICandidateRanker = {
  async rank(input: CandidateRankerInput): Promise<CandidateRankingEntry[]> {
    logger.info("[NullAIProvider] candidateRanker.rank called — returning stub");
    return input.candidates.map((candidate, index) => ({
      candidateId: candidate.candidateId,
      rank: index + 1,
      score: 0,
      rationale: "No AI provider configured. Ranking is unordered.",
      highlights: [],
      gaps: [],
    }));
  },
};

const nullJobMatcher: IJobMatcher = {
  async match(input: JobMatcherInput): Promise<JobMatch[]> {
    logger.info("[NullAIProvider] jobMatcher.match called — returning stub");
    const topN = input.topN ?? input.jobs.length;
    return input.jobs.slice(0, topN).map((job) => ({
      jobId: job.jobId,
      matchScore: 0,
      matchReasons: [],
      alignedSkills: [],
      missingSkills: job.requiredSkills,
      meetsExperienceRequirement: false,
    }));
  },
};

const nullQuestionGenerator: IQuestionGenerator = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async generate(_: QuestionGeneratorInput): Promise<GeneratedQuestion[]> {
    logger.info("[NullAIProvider] questionGenerator.generate called — returning stub");
    return [
      {
        id: "stub-question-1",
        text: "No AI provider configured. This is a placeholder question.",
        category: "general",
        difficulty: "easy",
        targetSkill: null,
        expectedAnswerGuidance: null,
        followUpProbes: [],
      },
    ];
  },
};

// ---------------------------------------------------------------------------
// NullAIProvider — wires all stubs into the IAIProvider contract
// ---------------------------------------------------------------------------

export class NullAIProvider implements IAIProvider {
  readonly name = "NullAIProvider";
  readonly version = "0.0.0";

  resumeParser = nullResumeParser;
  resumeScorer = nullResumeScorer;
  skillExtractor = nullSkillExtractor;
  candidateRanker = nullCandidateRanker;
  jobMatcher = nullJobMatcher;
  questionGenerator = nullQuestionGenerator;

  async healthCheck(): Promise<AIProviderStatus> {
    return {
      isHealthy: true,
      message: "NullAIProvider is operational (no-op stub — no external calls are made).",
      checkedAt: new Date().toISOString(),
    };
  }
}
