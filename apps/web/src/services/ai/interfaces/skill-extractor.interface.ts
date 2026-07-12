/**
 * AI Service — Skill Extraction Interface
 *
 * Defines the contract for any AI provider that extracts and normalises
 * skills from raw text (resume, job description, or free-form input).
 */

export interface ExtractedSkill {
  /** Normalised skill label (e.g. "React", "Python") */
  label: string;
  /** Skill category (e.g. "programming", "soft", "tool", "domain") */
  category: SkillCategory;
  /** Proficiency level inferred from context */
  proficiency: SkillProficiency | null;
  /** Years of experience inferred from context, if detectable */
  yearsOfExperience: number | null;
  /** Confidence score for this extraction (0–1) */
  confidence: number;
}

export type SkillCategory =
  | "programming"
  | "framework"
  | "tool"
  | "platform"
  | "domain"
  | "soft"
  | "language"
  | "certification"
  | "other";

export type SkillProficiency =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert";

export interface SkillExtractorInput {
  /** Text from which to extract skills */
  content: string;
  /** Optional context hint: resume or job-description */
  context?: "resume" | "job_description" | "freeform";
}

export interface ISkillExtractor {
  /**
   * Extract and normalise skills from free-form text.
   * @param input - Text content and optional context
   * @returns List of extracted and categorised skill objects
   */
  extract(input: SkillExtractorInput): Promise<ExtractedSkill[]>;
}
