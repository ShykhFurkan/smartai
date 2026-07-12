import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD format");

export const baseDateRangeSchema = z.object({
  from: isoDate,
  to: isoDate,
  companyId: z.string().uuid("Invalid companyId").optional(),
  departmentId: z.string().uuid("Invalid departmentId").optional(),
});

/**
 * Common date range query params shared by most analytics endpoints
 */
export const dateRangeSchema = baseDateRangeSchema.refine((d) => d.from <= d.to, { message: "from must be before to" });

/**
 * Recruiter Performance — optional recruiter filter
 */
export const recruiterPerformanceSchema = baseDateRangeSchema.extend({
  recruiterId: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10),
}).refine((d) => d.from <= d.to, { message: "from must be before to" });

/**
 * Charts API — metric type + date range + granularity
 */
export const chartQuerySchema = baseDateRangeSchema.extend({
  metric: z.enum([
    "applications_volume",
    "hiring_funnel",
    "time_to_hire_trend",
    "conversion_rates",
    "recruiter_leaderboard",
    "pipeline_snapshot",
  ]),
  granularity: z.enum(["day", "week", "month"]).default("day"),
}).refine((d) => d.from <= d.to, { message: "from must be before to" });

export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type RecruiterPerformanceInput = z.infer<typeof recruiterPerformanceSchema>;
export type ChartQueryInput = z.infer<typeof chartQuerySchema>;

