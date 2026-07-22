/**
 * Assessment Service — TypeScript Interfaces
 */

export type QuestionType =
  | "mcq"
  | "multiple-select"
  | "true-false"
  | "short-answer"
  | "coding"
  | "file-upload";

export type QuestionCategory =
  | "programming"
  | "aptitude"
  | "logical-reasoning"
  | "english"
  | "custom";

export type DifficultyLevel = "easy" | "medium" | "hard";

export type AssessmentStatus = "draft" | "published" | "archived";

export type AssignmentStatus = "assigned" | "in-progress" | "completed" | "expired";

export type AttemptStatus = "started" | "in-progress" | "completed" | "timed-out";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  assessmentId: string;
  questionText: string;
  questionType: QuestionType;
  correctAnswer?: string; // Stored answer key or solution string
  points: number;
  options?: QuestionOption[]; // MCQ / multiple-select options
  difficulty: DifficultyLevel;
  category: QuestionCategory;
  section?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentTemplate {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  durationMinutes: number;
  status: AssessmentStatus;
  passingPercentage: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  questions?: Question[];
}

export interface AssessmentAssignment {
  id: string;
  assessmentId: string;
  companyId: string;
  applicationId?: string;
  candidateId: string;
  expiresAt?: string;
  attemptLimit: number;
  attemptsCount: number;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateAttempt {
  id: string;
  assessmentId: string;
  assignmentId?: string;
  applicationId: string;
  candidateId: string;
  score?: number;
  passed?: boolean;
  answers: Record<string, string | string[]>; // Map of questionId -> selected/input answers
  timeSpentSeconds: number;
  status: AttemptStatus;
  sectionScores: Record<string, number>;
  gradingResults: Record<string, {
    correct: boolean;
    pointsEarned: number;
    feedback?: string;
  }>;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SectionBreakdown {
  category: string;
  totalPointsPossible: number;
  pointsEarned: number;
  percentage: number;
}

export interface DetailedResults {
  attempt: CandidateAttempt;
  assessment: AssessmentTemplate;
  totalQuestionsCount: number;
  correctQuestionsCount: number;
  sectionsBreakdown: SectionBreakdown[];
  timeLimitMinutes: number;
  timeSpentSeconds: number;
}
