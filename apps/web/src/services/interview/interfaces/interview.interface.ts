/**
 * Interview Service — TypeScript Interfaces
 */

export type InterviewType =
  | "HR"
  | "Technical"
  | "Coding"
  | "System Design"
  | "Behavioral"
  | "Managerial"
  | "Final Round"
  | "Custom";

export type InterviewStatus =
  | "scheduled"
  | "confirmed"
  | "rescheduled"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "no-show"
  | "rejected";

export type InterviewerStatus = "pending" | "confirmed" | "declined";

export type RecommendationType =
  | "strong_hire"
  | "hire"
  | "neutral"
  | "no_hire"
  | "strong_no_hire";

export type MeetingProviderType = "google_meet" | "zoom" | "msteams";

export interface Interview {
  id: string;
  applicationId: string;
  companyId: string;
  meetingTitle: string;
  referenceNumber: string;
  type: InterviewType;
  roundNumber: number;
  status: InterviewStatus;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  timezone: string;
  durationMinutes: number;
  instructions?: string;
  meetingProviderType: MeetingProviderType;
  meetingLink?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  interviewers?: Interviewer[];
}

export interface AvailabilitySlot {
  id: string;
  recruiterId: string;
  companyId: string;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  isBooked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Interviewer {
  id: string;
  interviewId: string;
  recruiterId: string;
  role: string;
  status: InterviewerStatus;
  createdAt: string;
  updatedAt: string;
  scorecard?: Scorecard;
}

export interface Scorecard {
  id: string;
  interviewId: string;
  interviewerId: string;
  recruiterId: string;
  technicalScore?: number; // 1-5
  communicationScore?: number; // 1-5
  problemSolvingScore?: number; // 1-5
  cultureFitScore?: number; // 1-5
  confidenceLevel?: number; // 1-5
  strengths?: string;
  weaknesses?: string;
  notes?: string;
  recommendation: RecommendationType;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewEvent {
  id: string;
  interviewId: string;
  eventType: string;
  payload: Record<string, unknown>;
  createdAt: string;
}
