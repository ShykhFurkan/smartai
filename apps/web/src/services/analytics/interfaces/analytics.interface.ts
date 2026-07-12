/**
 * Analytics Service — Metric Interfaces
 *
 * Defines the TypeScript shapes for every analytics metric returned by the
 * Analytics Service. These are the contracts between the repository layer
 * and the REST API response bodies.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Shared primitives
// ─────────────────────────────────────────────────────────────────────────────

export interface DateRange {
  from: string; // ISO date: "2026-01-01"
  to: string;   // ISO date: "2026-12-31"
}

export interface TimeSeriesPoint {
  /** ISO date label (daily/weekly/monthly bucket) */
  date: string;
  value: number;
}

export interface BreakdownItem {
  label: string;
  count: number;
  percentage: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Applications Metrics
// ─────────────────────────────────────────────────────────────────────────────

export interface ApplicationsMetrics {
  /** Total number of applications in the period */
  totalApplications: number;
  /** Change vs prior period (absolute) */
  delta: number;
  /** Change vs prior period (percentage, +/- %) */
  deltaPercent: number;
  /** Applications submitted per day in the period */
  timeSeries: TimeSeriesPoint[];
  /** Breakdown by pipeline status */
  byStatus: BreakdownItem[];
  /** Breakdown by job category */
  byJobCategory: BreakdownItem[];
  /** Breakdown by source / referral channel */
  bySource: BreakdownItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Hiring Funnel
// ─────────────────────────────────────────────────────────────────────────────

export interface HiringFunnelStage {
  stage: string;
  count: number;
  /** Conversion rate from the previous stage (0–100 %) */
  conversionFromPrevious: number;
  /** Overall conversion rate from top-of-funnel (0–100 %) */
  conversionFromTop: number;
}

export interface HiringFunnelMetrics {
  /** Ordered funnel stages from broadest to narrowest */
  stages: HiringFunnelStage[];
  /** Overall funnel conversion: applied → offered (0–100 %) */
  overallConversionRate: number;
  /** Total candidates who entered the funnel in the period */
  totalEntered: number;
  /** Total candidates who exited with an offer */
  totalConverted: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Time To Hire
// ─────────────────────────────────────────────────────────────────────────────

export interface TimeToHireMetrics {
  /** Average days from application to offer, in the period */
  averageDays: number;
  /** Median days from application to offer */
  medianDays: number;
  /** 90th-percentile days (long-tail SLA indicator) */
  p90Days: number;
  /** Average days per pipeline stage */
  byStage: Array<{
    stage: string;
    averageDays: number;
  }>;
  /** Time-to-hire distribution over the period */
  timeSeries: TimeSeriesPoint[];
  /** Breakdown by job category */
  byJobCategory: Array<{
    category: string;
    averageDays: number;
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Recruiter Performance
// ─────────────────────────────────────────────────────────────────────────────

export interface RecruiterPerformanceEntry {
  recruiterId: string;
  recruiterName: string;
  /** Total applications reviewed */
  applicationsReviewed: number;
  /** Candidates moved to interview stage */
  interviewsScheduled: number;
  /** Offers extended */
  offersExtended: number;
  /** Offers accepted */
  offersAccepted: number;
  /** Average days to first action after application received */
  avgResponseDays: number;
  /** Hire rate: accepted / reviewed (0–100 %) */
  hireRate: number;
}

export interface RecruiterPerformanceMetrics {
  /** Ranked recruiter performance entries (best first by hire rate) */
  recruiters: RecruiterPerformanceEntry[];
  /** Team-wide averages for comparison */
  teamAverages: {
    applicationsReviewed: number;
    interviewsScheduled: number;
    offersExtended: number;
    hireRate: number;
    avgResponseDays: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Candidate Conversion
// ─────────────────────────────────────────────────────────────────────────────

export interface CandidateConversionMetrics {
  /** Candidates who applied in the period */
  totalApplied: number;
  /** Candidates who reached screening */
  reachedScreening: number;
  /** Candidates who reached interview */
  reachedInterview: number;
  /** Candidates who received an offer */
  receivedOffer: number;
  /** Candidates who accepted an offer */
  acceptedOffer: number;
  /** Candidates who withdrew */
  withdrawn: number;
  /** Candidates who were rejected */
  rejected: number;
  /** Stage-to-stage conversion rates */
  conversionRates: {
    appliedToScreening: number;
    screeningToInterview: number;
    interviewToOffer: number;
    offerAcceptance: number;
  };
  /** Candidate withdrawal reasons breakdown */
  withdrawalReasons: BreakdownItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Company Dashboard (aggregated overview)
// ─────────────────────────────────────────────────────────────────────────────

export interface CompanyDashboardMetrics {
  /** Total active job postings */
  activeJobs: number;
  /** Total applications received in the period */
  totalApplications: number;
  /** Total open positions (draft + published) */
  openPositions: number;
  /** Total hires made in the period */
  totalHires: number;
  /** Average time-to-hire across all positions */
  avgTimeToHireDays: number;
  /** Pipeline status snapshot */
  pipelineSnapshot: BreakdownItem[];
  /** Application volume trend (last 30 days) */
  applicationTrend: TimeSeriesPoint[];
  /** Top performing job categories by application volume */
  topJobCategories: BreakdownItem[];
  /** Department-level hiring activity */
  byDepartment: Array<{
    departmentId: string;
    departmentName: string;
    activeJobs: number;
    applications: number;
    hires: number;
  }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Charts API
// ─────────────────────────────────────────────────────────────────────────────

export type ChartMetricType =
  | "applications_volume"
  | "hiring_funnel"
  | "time_to_hire_trend"
  | "conversion_rates"
  | "recruiter_leaderboard"
  | "pipeline_snapshot";

export type ChartType = "line" | "bar" | "doughnut" | "area" | "funnel";

export interface ChartDataset {
  label: string;
  data: number[];
  /** Optional hex colour hint for the chart renderer */
  color?: string;
}

export interface ChartResponse {
  metric: ChartMetricType;
  chartType: ChartType;
  /** X-axis labels */
  labels: string[];
  datasets: ChartDataset[];
  /** ISO timestamp when this chart data was computed */
  computedAt: string;
}
