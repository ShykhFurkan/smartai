/**
 * AI Service — Resume Parsing Interface
 *
 * Defines the contract for any AI provider that parses raw resume content
 * into structured data fields.
 */

export interface ParsedResume {
  /** Candidate's full name extracted from the resume */
  fullName: string | null;
  /** Primary email address */
  email: string | null;
  /** Phone number */
  phone: string | null;
  /** Location or address extracted from the resume */
  location: string | null;
  /** Professional summary or objective statement */
  summary: string | null;
  /** List of extracted work experience entries */
  experience: ParsedExperience[];
  /** List of extracted education entries */
  education: ParsedEducation[];
  /** List of extracted skill labels */
  skills: string[];
  /** List of extracted certifications */
  certifications: string[];
  /** List of extracted languages */
  languages: string[];
  /** Raw text extracted before parsing */
  rawText: string;
  /** Confidence score of the parse result (0–1) */
  confidence: number;
}

export interface ParsedExperience {
  title: string | null;
  company: string | null;
  location: string | null;
  startDate: string | null;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
}

export interface ParsedEducation {
  institution: string | null;
  degree: string | null;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
  gpa: string | null;
}

export interface ResumeParserInput {
  /** Raw text content of the resume */
  content: string;
  /** MIME type of the source file */
  mimeType: string;
  /** Candidate ID for correlation */
  candidateId?: string;
}

export interface IResumeParser {
  /**
   * Parse a resume document and extract structured fields.
   * @param input - Raw resume content and metadata
   * @returns Structured parsed resume object
   */
  parse(input: ResumeParserInput): Promise<ParsedResume>;
}
