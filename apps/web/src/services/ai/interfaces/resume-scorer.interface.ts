/**
 * AI Service — Resume Scoring Interface
 *
 * Defines the contract for any AI provider that scores a resume against
 * a job description and returns structured match metrics.
 */

export interface ResumeScore {
  /** Overall match score between 0 and 100 */
  overallScore: number;
  /** Score breakdown by dimension */
  breakdown: ResumeScoreBreakdown;
  /** List of matched skill labels */
  matchedSkills: string[];
  /** List of required skills not found in the resume */
  missingSkills: string[];
  /** Human-readable strengths identified */
  strengths: string[];
  /** Human-readable gaps identified */
  gaps: string[];
  /** Recommendation summary */
  recommendation: string | null;
}

export interface ResumeScoreBreakdown {
  /** Skills alignment score (0–100) */
  skills: number;
  /** Experience relevance score (0–100) */
  experience: number;
  /** Education alignment score (0–100) */
  education: number;
  /** Seniority level alignment score (0–100) */
  seniority: number;
}

export interface ResumeScorerInput {
  /** Structured or raw resume content */
  resumeContent: string;
  /** Full job description text */
  jobDescription: string;
  /** Required skills listed in the job posting */
  requiredSkills: string[];
  /** Preferred skills listed in the job posting */
  preferredSkills?: string[];
  /** Minimum years of experience required */
  minExperienceYears?: number;
}

export interface IResumeScorer {
  /**
   * Score a resume against a specific job posting.
   * @param input - Resume content and job requirements
   * @returns Structured score report
   */
  score(input: ResumeScorerInput): Promise<ResumeScore>;
}
