import { z } from "zod";

/**
 * Candidate Profile Validation Schema
 */
export const candidateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid candidate email format").max(255),
  phone: z.string().max(50).optional().nullable(),
  summary: z.string().optional().nullable(),
});

/**
 * Candidate Education Validation Schema
 */
export const candidateEducationSchema = z
  .object({
    institution: z.string().min(1, "Institution name is required").max(255),
    degree: z.string().min(1, "Degree description is required").max(150),
    fieldOfStudy: z.string().max(150).optional().nullable(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD")
      .optional()
      .nullable(),
    isCurrent: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.isCurrent) return true;
      if (!data.endDate) return false;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be greater than or equal to start date",
      path: ["endDate"],
    }
  );

/**
 * Candidate Experience Validation Schema
 */
export const candidateExperienceSchema = z
  .object({
    companyName: z.string().min(1, "Company name is required").max(255),
    jobTitle: z.string().min(1, "Job title is required").max(150),
    description: z.string().optional().nullable(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD")
      .optional()
      .nullable(),
    isCurrent: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.isCurrent) return true;
      if (!data.endDate) return false;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be greater than or equal to start date",
      path: ["endDate"],
    }
  );

/**
 * Candidate Project Validation Schema
 */
export const candidateProjectSchema = z
  .object({
    title: z.string().min(1, "Project title is required").max(255),
    description: z.string().optional().nullable(),
    url: z.string().url("Invalid project URL format").max(512).optional().nullable(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD")
      .optional()
      .nullable(),
  })
  .refine(
    (data) => {
      if (!data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: "End date must be greater than or equal to start date",
      path: ["endDate"],
    }
  );

/**
 * Candidate Certificate Validation Schema
 */
export const candidateCertificateSchema = z.object({
  name: z.string().min(1, "Certificate name is required").max(255),
  issuer: z.string().min(1, "Issuer organization is required").max(255),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Issue date must be YYYY-MM-DD"),
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Expiry date must be YYYY-MM-DD")
    .optional()
    .nullable(),
  credentialId: z.string().max(255).optional().nullable(),
  credentialUrl: z.string().url("Invalid credential URL format").max(512).optional().nullable(),
});

/**
 * Candidate Social Link Validation Schema
 */
export const candidateSocialLinkSchema = z.object({
  platform: z.string().min(1, "Platform name is required").max(100),
  url: z.string().url("Invalid social URL format").max(512),
});

/**
 * Candidate Skill Association Validation Schema
 */
export const candidateSkillSchema = z.object({
  skillId: z.string().uuid("Invalid skill ID format"),
  yearsOfExperience: z.number().min(0, "Years of experience cannot be negative").default(0),
});
