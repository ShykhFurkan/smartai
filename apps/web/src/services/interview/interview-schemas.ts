import { z } from "zod";

const interviewTypeSchema = z.enum([
  "HR",
  "Technical",
  "Coding",
  "System Design",
  "Behavioral",
  "Managerial",
  "Final Round",
  "Custom",
]);

const meetingProviderSchema = z.enum(["google_meet", "zoom", "msteams"]);

const scorecardRecommendationSchema = z.enum([
  "strong_hire",
  "hire",
  "neutral",
  "no_hire",
  "strong_no_hire",
]);

export const scheduleInterviewSchema = z.object({
  applicationId: z.string().uuid("Invalid application ID"),
  meetingTitle: z.string().min(3, "Title must be at least 3 characters"),
  type: interviewTypeSchema,
  roundNumber: z.number().int().min(1).default(1),
  startTime: z.string().datetime("Start time must be a valid ISO datetime"),
  endTime: z.string().datetime("End time must be a valid ISO datetime"),
  timezone: z.string().min(2, "Invalid timezone"),
  durationMinutes: z.number().int().min(5, "Duration must be at least 5 minutes"),
  instructions: z.string().optional(),
  meetingProviderType: meetingProviderSchema.default("google_meet"),
  interviewers: z.array(z.string().uuid("Invalid interviewer recruiter ID")).min(1, "At least one interviewer is required"),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

export const rescheduleInterviewSchema = z.object({
  startTime: z.string().datetime("Start time must be a valid ISO datetime"),
  endTime: z.string().datetime("End time must be a valid ISO datetime"),
  durationMinutes: z.number().int().min(5).optional(),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

export const recruiterAvailabilitySchema = z.object({
  startTime: z.string().datetime("Start time must be a valid ISO datetime"),
  endTime: z.string().datetime("End time must be a valid ISO datetime"),
}).refine(
  (data) => new Date(data.endTime) > new Date(data.startTime),
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

export const bookSlotSchema = z.object({
  slotId: z.string().uuid("Invalid slot ID"),
  applicationId: z.string().uuid("Invalid application ID"),
  meetingTitle: z.string().min(3).default("Job Interview"),
  type: interviewTypeSchema.default("Technical"),
  meetingProviderType: meetingProviderSchema.default("google_meet"),
});

export const scorecardSchema = z.object({
  interviewerId: z.string().uuid("Invalid interviewer panel ID"),
  recruiterId: z.string().uuid("Invalid recruiter ID"),
  technicalScore: z.number().int().min(1).max(5).optional(),
  communicationScore: z.number().int().min(1).max(5).optional(),
  problemSolvingScore: z.number().int().min(1).max(5).optional(),
  cultureFitScore: z.number().int().min(1).max(5).optional(),
  confidenceLevel: z.number().int().min(1).max(5).optional(),
  strengths: z.string().optional(),
  weaknesses: z.string().optional(),
  notes: z.string().optional(),
  recommendation: scorecardRecommendationSchema,
});
