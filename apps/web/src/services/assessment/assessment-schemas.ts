import { z } from "zod";

const questionTypeSchema = z.enum(["mcq", "multiple-select", "true-false", "short-answer", "coding", "file-upload"]);
const difficultySchema = z.enum(["easy", "medium", "hard"]);
const categorySchema = z.enum(["programming", "aptitude", "logical-reasoning", "english", "custom"]);

export const questionOptionSchema = z.object({
  id: z.string().uuid("Invalid option ID"),
  text: z.string().min(1, "Option text cannot be empty"),
});

export const questionInputSchema = z.object({
  questionText: z.string().min(3, "Question text must be at least 3 characters"),
  questionType: questionTypeSchema,
  correctAnswer: z.string().optional(),
  points: z.number().int().min(1, "Points must be at least 1").default(10),
  options: z.array(questionOptionSchema).optional(),
  difficulty: difficultySchema.default("medium"),
  category: categorySchema.default("custom"),
  section: z.string().optional(),
});

export const createAssessmentSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5, "Duration must be at least 5 minutes").default(60),
  passingPercentage: z.number().int().min(0).max(100).default(60),
  questions: z.array(questionInputSchema).optional(),
});

export const updateAssessmentSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  durationMinutes: z.number().int().min(5).optional(),
  passingPercentage: z.number().int().min(0).max(100).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export const assignAssessmentSchema = z.object({
  assessmentId: z.string().uuid("Invalid assessment ID"),
  candidateId: z.string().uuid("Invalid candidate ID"),
  applicationId: z.string().uuid("Invalid application ID").optional(),
  expiresAt: z.string().datetime("Invalid ISO datetime").optional(),
  attemptLimit: z.number().int().min(1).default(1),
});

export const startAttemptSchema = z.object({
  assignmentId: z.string().uuid("Invalid assignment ID"),
});

export const saveProgressSchema = z.object({
  answers: z.record(z.string(), z.union([z.string(), z.array(z.string())])), // Map of questionId -> answers
  timeSpentSeconds: z.number().int().min(0),
});
