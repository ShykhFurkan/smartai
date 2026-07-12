/**
 * AI Service — Question Generation Interface
 *
 * Defines the contract for any AI provider that generates assessment or
 * interview questions tailored to a job posting and candidate profile.
 */

export interface GeneratedQuestion {
  /** Unique identifier for this question */
  id: string;
  /** The question text */
  text: string;
  /** Category of question */
  category: QuestionCategory;
  /** Difficulty level */
  difficulty: QuestionDifficulty;
  /** Skill or topic area the question targets */
  targetSkill: string | null;
  /** Expected answer guidance (for recruiter reference) */
  expectedAnswerGuidance: string | null;
  /** Follow-up probes for interviewers */
  followUpProbes: string[];
}

export type QuestionCategory =
  | "technical"
  | "behavioral"
  | "situational"
  | "culture_fit"
  | "role_specific"
  | "general";

export type QuestionDifficulty = "easy" | "medium" | "hard";

export interface QuestionGeneratorInput {
  /** Job title for context */
  jobTitle: string;
  /** Job description text */
  jobDescription: string;
  /** Skills to probe */
  targetSkills: string[];
  /** Candidate's resume content (optional — for personalised questions) */
  candidateResumeContent?: string;
  /** Number of questions to generate */
  count?: number;
  /** Question category filters to include */
  categories?: QuestionCategory[];
  /** Difficulty filter */
  difficulty?: QuestionDifficulty;
}

export interface IQuestionGenerator {
  /**
   * Generate interview or assessment questions for a role.
   * @param input - Job context, target skills, and generation parameters
   * @returns List of generated question objects
   */
  generate(input: QuestionGeneratorInput): Promise<GeneratedQuestion[]>;
}
