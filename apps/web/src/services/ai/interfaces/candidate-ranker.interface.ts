/**
 * AI Service — Candidate Ranking Interface
 *
 * Defines the contract for any AI provider that ranks a pool of candidates
 * for a specific job posting based on structured profile data.
 */

export interface CandidateRankingEntry {
  /** Candidate identifier */
  candidateId: string;
  /** Rank position (1-indexed, 1 = best match) */
  rank: number;
  /** Composite ranking score (0–100) */
  score: number;
  /** Human-readable rationale for the ranking position */
  rationale: string | null;
  /** Key strengths that contributed positively to ranking */
  highlights: string[];
  /** Notable gaps that affected the ranking */
  gaps: string[];
}

export interface CandidateProfile {
  /** Candidate identifier */
  candidateId: string;
  /** Skills the candidate holds */
  skills: string[];
  /** Total years of professional experience */
  totalExperienceYears: number;
  /** Education level (e.g. "bachelor", "master", "phd") */
  educationLevel: string | null;
  /** Raw or structured resume text */
  resumeContent: string;
}

export interface CandidateRankerInput {
  /** Job description text */
  jobDescription: string;
  /** Required skills for the position */
  requiredSkills: string[];
  /** Minimum years of experience required */
  minExperienceYears?: number;
  /** Pool of candidates to rank */
  candidates: CandidateProfile[];
}

export interface ICandidateRanker {
  /**
   * Rank a pool of candidates for a given job.
   * @param input - Job requirements and candidate pool
   * @returns Sorted list of ranked candidate entries
   */
  rank(input: CandidateRankerInput): Promise<CandidateRankingEntry[]>;
}
