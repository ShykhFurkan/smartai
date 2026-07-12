/**
 * AI Service — Job Matching Interface
 *
 * Defines the contract for any AI provider that matches a candidate profile
 * against a catalogue of job postings and returns ranked recommendations.
 */

export interface JobMatch {
  /** Job posting identifier */
  jobId: string;
  /** Match score between the candidate and this job (0–100) */
  matchScore: number;
  /** Key reasons why this job was matched */
  matchReasons: string[];
  /** Skills the candidate has that align with the job */
  alignedSkills: string[];
  /** Skills the candidate is missing for this job */
  missingSkills: string[];
  /** Whether the candidate meets the minimum experience requirement */
  meetsExperienceRequirement: boolean;
}

export interface JobPosting {
  /** Job posting identifier */
  jobId: string;
  /** Job title */
  title: string;
  /** Full job description text */
  description: string;
  /** Required skills */
  requiredSkills: string[];
  /** Preferred skills */
  preferredSkills?: string[];
  /** Minimum years of experience required */
  minExperienceYears?: number;
  /** Employment type */
  employmentType?: string;
}

export interface JobMatcherInput {
  /** Candidate skills list */
  candidateSkills: string[];
  /** Candidate's total years of experience */
  candidateExperienceYears: number;
  /** Candidate's resume text (optional enrichment) */
  resumeContent?: string;
  /** Pool of job postings to match against */
  jobs: JobPosting[];
  /** Maximum number of matches to return */
  topN?: number;
}

export interface IJobMatcher {
  /**
   * Match a candidate profile against a list of job postings.
   * @param input - Candidate profile and job pool
   * @returns Top job matches sorted by score descending
   */
  match(input: JobMatcherInput): Promise<JobMatch[]>;
}
