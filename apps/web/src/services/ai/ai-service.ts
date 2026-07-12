/**
 * AI Service — Public Facade
 *
 * The AIService is the single entry point for all AI capabilities.
 * Route Handlers and other services call methods on this facade;
 * they never interact with a provider or registry directly.
 *
 * The facade:
 * - Resolves the active provider from AIProviderRegistry
 * - Delegates each operation to the appropriate sub-interface
 * - Applies cross-cutting concerns (logging, error wrapping)
 */

import { AIProviderRegistry } from "./providers/ai-provider-registry";
import { ResumeParserInput } from "./interfaces/resume-parser.interface";
import { ResumeScorerInput } from "./interfaces/resume-scorer.interface";
import { SkillExtractorInput } from "./interfaces/skill-extractor.interface";
import { CandidateRankerInput } from "./interfaces/candidate-ranker.interface";
import { JobMatcherInput } from "./interfaces/job-matcher.interface";
import { QuestionGeneratorInput } from "./interfaces/question-generator.interface";
import { logger } from "@smarthire/logger";

export const AIService = {
  /**
   * Parse a resume document into structured fields.
   */
  parseResume: async (input: ResumeParserInput) => {
    logger.info("[AIService] parseResume");
    const provider = AIProviderRegistry.getProvider();
    return provider.resumeParser.parse(input);
  },

  /**
   * Score a resume against a job description.
   */
  scoreResume: async (input: ResumeScorerInput) => {
    logger.info("[AIService] scoreResume");
    const provider = AIProviderRegistry.getProvider();
    return provider.resumeScorer.score(input);
  },

  /**
   * Extract and normalise skills from free-form text.
   */
  extractSkills: async (input: SkillExtractorInput) => {
    logger.info("[AIService] extractSkills");
    const provider = AIProviderRegistry.getProvider();
    return provider.skillExtractor.extract(input);
  },

  /**
   * Rank a pool of candidates for a job posting.
   */
  rankCandidates: async (input: CandidateRankerInput) => {
    logger.info("[AIService] rankCandidates");
    const provider = AIProviderRegistry.getProvider();
    return provider.candidateRanker.rank(input);
  },

  /**
   * Match a candidate profile against a list of job postings.
   */
  matchJobs: async (input: JobMatcherInput) => {
    logger.info("[AIService] matchJobs");
    const provider = AIProviderRegistry.getProvider();
    return provider.jobMatcher.match(input);
  },

  /**
   * Generate interview or assessment questions for a role.
   */
  generateQuestions: async (input: QuestionGeneratorInput) => {
    logger.info("[AIService] generateQuestions");
    const provider = AIProviderRegistry.getProvider();
    return provider.questionGenerator.generate(input);
  },

  /**
   * Check the health of the active AI provider.
   */
  healthCheck: async () => {
    logger.info("[AIService] healthCheck");
    const provider = AIProviderRegistry.getProvider();
    const status = await provider.healthCheck();
    return {
      ...status,
      providerName: provider.name,
      providerVersion: provider.version,
    };
  },
};
