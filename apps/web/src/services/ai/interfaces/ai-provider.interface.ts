/**
 * AI Service — Master Provider Interface
 *
 * Any concrete AI provider (OpenAI, Gemini, Anthropic, custom fine-tune, etc.)
 * must implement this interface to be registered with the AI Service registry.
 * This enforces the Provider Abstraction pattern — the rest of the codebase
 * depends only on this contract, never on a vendor SDK directly.
 */

import { IResumeParser } from "./resume-parser.interface";
import { IResumeScorer } from "./resume-scorer.interface";
import { ISkillExtractor } from "./skill-extractor.interface";
import { ICandidateRanker } from "./candidate-ranker.interface";
import { IJobMatcher } from "./job-matcher.interface";
import { IQuestionGenerator } from "./question-generator.interface";

/**
 * Provider health / status report
 */
export interface AIProviderStatus {
  /** Whether the provider is reachable and operational */
  isHealthy: boolean;
  /** Human-readable status message */
  message: string;
  /** ISO timestamp of last health check */
  checkedAt: string;
}

/**
 * Master AI Provider Interface
 *
 * Every registered provider exposes:
 * - Identity metadata (name, version)
 * - A health check method
 * - All six AI capability sub-interfaces
 */
export interface IAIProvider {
  /** Human-readable provider name (e.g. "OpenAI GPT-4o", "Gemini 1.5 Pro") */
  readonly name: string;

  /** Semantic version of the provider implementation */
  readonly version: string;

  /**
   * Perform a health / connectivity check against the underlying AI backend.
   */
  healthCheck(): Promise<AIProviderStatus>;

  /** Resume parsing capability */
  resumeParser: IResumeParser;

  /** Resume scoring against job descriptions */
  resumeScorer: IResumeScorer;

  /** Skill extraction from free-form text */
  skillExtractor: ISkillExtractor;

  /** Candidate ranking for a job pool */
  candidateRanker: ICandidateRanker;

  /** Job matching for a candidate profile */
  jobMatcher: IJobMatcher;

  /** Interview / assessment question generation */
  questionGenerator: IQuestionGenerator;
}
