export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "candidate" | "recruiter" | "company-admin" | "platform-admin";
  createdAt: Date | string;
}

export interface Candidate {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  resumeUrl?: string;
  skills: string[];
  experienceYears: number;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  status: "draft" | "published" | "closed";
  createdAt: Date | string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  status: "applied" | "screening" | "interview" | "offered" | "rejected";
  score?: number;
  appliedAt: Date | string;
}
