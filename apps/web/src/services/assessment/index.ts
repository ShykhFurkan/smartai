/**
 * Assessment Service — Module Index
 */

export { AssessmentService } from "./assessment-service";
export { assessmentRepository } from "./assessment-repository";

// Types
export type {
  QuestionType,
  QuestionCategory,
  DifficultyLevel,
  AssessmentStatus,
  AssignmentStatus,
  AttemptStatus,
  QuestionOption,
  Question,
  AssessmentTemplate,
  AssessmentAssignment,
  CandidateAttempt,
  SectionBreakdown,
  DetailedResults,
} from "./interfaces/assessment.interface";

export type {
  createAssessmentSchema,
  updateAssessmentSchema,
  assignAssessmentSchema,
  startAttemptSchema,
  saveProgressSchema,
} from "./assessment-schemas";
