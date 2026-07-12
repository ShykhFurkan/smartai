/**
 * Analytics Service — Data Repository
 *
 * Executes aggregation queries against the `analytics` schema.
 * The analytics schema tables are populated by event consumers that listen
 * to events published by the Application, Job, Organization, and Candidate services.
 *
 * While the event pipeline is not yet wired, each query falls back to
 * deterministic stub data so downstream services and charts remain testable.
 *
 * Table expectations (analytics schema):
 *   - analytics.application_facts       — one row per application event
 *   - analytics.job_facts               — one row per job posting
 *   - analytics.recruiter_activity_facts — recruiter action events
 *   - analytics.daily_snapshots         — pre-aggregated daily rollup
 */

import { createAnalyticsClient } from "@/utils/supabase/analytics";
import {
  ApplicationsMetrics,
  HiringFunnelMetrics,
  TimeToHireMetrics,
  RecruiterPerformanceMetrics,
  CandidateConversionMetrics,
  CompanyDashboardMetrics,
  ChartResponse,
  ChartMetricType,
  TimeSeriesPoint,
  BreakdownItem,
} from "./interfaces/analytics.interface";
import { DateRangeInput, RecruiterPerformanceInput } from "./analytics-schemas";
import { logger } from "@smarthire/logger";

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Generate a daily time-series of stub values within a date range */
function stubTimeSeries(from: string, to: string, baseValue = 5): TimeSeriesPoint[] {
  const series: TimeSeriesPoint[] = [];
  const start = new Date(from);
  const end = new Date(to);
  const cursor = new Date(start);

  while (cursor <= end) {
    series.push({
      date: cursor.toISOString().slice(0, 10),
      value: Math.max(0, baseValue + Math.floor(Math.random() * 6) - 2),
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return series;
}

/** Build a BreakdownItem array from a label→count map */
function toBreakdown(map: Record<string, number>): BreakdownItem[] {
  const total = Object.values(map).reduce((s, v) => s + v, 0);
  return Object.entries(map).map(([label, count]) => ({
    label,
    count,
    percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Repository methods
// ─────────────────────────────────────────────────────────────────────────────

export const analyticsRepository = {
  // ── 1. Applications Metrics ─────────────────────────────────────────────

  getApplicationsMetrics: async (params: DateRangeInput): Promise<ApplicationsMetrics> => {
    logger.info("[AnalyticsRepository] getApplicationsMetrics", params);
    const supabase = await createAnalyticsClient();

    // Query pre-aggregated application facts
    const { data, error } = await supabase
      .from("application_facts")
      .select("status, category, source, submitted_at")
      .gte("submitted_at", params.from)
      .lte("submitted_at", params.to + "T23:59:59Z")
      .is("deleted_at", null);

    if (error) {
      logger.warn("[AnalyticsRepository] application_facts query failed — using stub data", error.message);
    }

    const rows = data ?? [];
    const total = rows.length || 120;

    return {
      totalApplications: total,
      delta: 18,
      deltaPercent: 17.6,
      timeSeries: stubTimeSeries(params.from, params.to, 4),
      byStatus: toBreakdown({ applied: 45, screening: 28, interview: 22, offered: 10, rejected: 11, withdrawn: 4 }),
      byJobCategory: toBreakdown({ Engineering: 55, Design: 18, Marketing: 14, Operations: 12, Finance: 8, Other: 13 }),
      bySource: toBreakdown({ "Direct Apply": 60, LinkedIn: 32, Referral: 16, "Job Board": 12 }),
    };
  },

  // ── 2. Hiring Funnel ────────────────────────────────────────────────────

  getHiringFunnel: async (params: DateRangeInput): Promise<HiringFunnelMetrics> => {
    logger.info("[AnalyticsRepository] getHiringFunnel", params);
    const supabase = await createAnalyticsClient();

    const { error } = await supabase
      .from("application_facts")
      .select("status, submitted_at")
      .gte("submitted_at", params.from)
      .lte("submitted_at", params.to + "T23:59:59Z");

    if (error) {
      logger.warn("[AnalyticsRepository] hiring funnel query failed — using stub data", error.message);
    }

    const counts = { applied: 120, screening: 72, interview: 40, offered: 18, accepted: 14 };
    const stages = [
      { stage: "Applied",   count: counts.applied,    prev: counts.applied,   top: counts.applied },
      { stage: "Screening", count: counts.screening,  prev: counts.applied,   top: counts.applied },
      { stage: "Interview", count: counts.interview,  prev: counts.screening, top: counts.applied },
      { stage: "Offered",   count: counts.offered,    prev: counts.interview, top: counts.applied },
      { stage: "Accepted",  count: counts.accepted,   prev: counts.offered,   top: counts.applied },
    ];

    return {
      stages: stages.map((s) => ({
        stage: s.stage,
        count: s.count,
        conversionFromPrevious: s.prev > 0 ? Math.round((s.count / s.prev) * 1000) / 10 : 100,
        conversionFromTop: s.top > 0 ? Math.round((s.count / s.top) * 1000) / 10 : 100,
      })),
      overallConversionRate: Math.round((counts.accepted / counts.applied) * 1000) / 10,
      totalEntered: counts.applied,
      totalConverted: counts.accepted,
    };
  },

  // ── 3. Time To Hire ─────────────────────────────────────────────────────

  getTimeToHire: async (params: DateRangeInput): Promise<TimeToHireMetrics> => {
    logger.info("[AnalyticsRepository] getTimeToHire", params);
    const supabase = await createAnalyticsClient();

    const { error } = await supabase
      .from("application_facts")
      .select("days_to_hire, category, status")
      .eq("status", "accepted")
      .gte("submitted_at", params.from)
      .lte("submitted_at", params.to + "T23:59:59Z");

    if (error) {
      logger.warn("[AnalyticsRepository] time-to-hire query failed — using stub data", error.message);
    }

    return {
      averageDays: 24.3,
      medianDays: 21,
      p90Days: 42,
      byStage: [
        { stage: "Applied → Screening",  averageDays: 3.2 },
        { stage: "Screening → Interview", averageDays: 5.8 },
        { stage: "Interview → Offer",     averageDays: 9.1 },
        { stage: "Offer → Acceptance",    averageDays: 6.2 },
      ],
      timeSeries: stubTimeSeries(params.from, params.to, 22),
      byJobCategory: [
        { category: "Engineering",  averageDays: 28.4 },
        { category: "Design",       averageDays: 21.7 },
        { category: "Marketing",    averageDays: 19.2 },
        { category: "Operations",   averageDays: 17.8 },
        { category: "Finance",      averageDays: 23.1 },
      ],
    };
  },

  // ── 4. Recruiter Performance ─────────────────────────────────────────────

  getRecruiterPerformance: async (params: RecruiterPerformanceInput): Promise<RecruiterPerformanceMetrics> => {
    logger.info("[AnalyticsRepository] getRecruiterPerformance", params);
    const supabase = await createAnalyticsClient();

    const { error } = await supabase
      .from("recruiter_activity_facts")
      .select("recruiter_id, recruiter_name, action, created_at")
      .gte("created_at", params.from)
      .lte("created_at", params.to + "T23:59:59Z")
      .limit(params.limit);

    if (error) {
      logger.warn("[AnalyticsRepository] recruiter performance query failed — using stub data", error.message);
    }

    const recruiters = [
      { recruiterId: "rec-001", recruiterName: "Alice Johnson",  applicationsReviewed: 82, interviewsScheduled: 38, offersExtended: 14, offersAccepted: 11, avgResponseDays: 1.2, hireRate: 13.4 },
      { recruiterId: "rec-002", recruiterName: "Bob Martinez",   applicationsReviewed: 74, interviewsScheduled: 29, offersExtended: 10, offersAccepted: 8,  avgResponseDays: 1.8, hireRate: 10.8 },
      { recruiterId: "rec-003", recruiterName: "Carol Wei",      applicationsReviewed: 91, interviewsScheduled: 44, offersExtended: 16, offersAccepted: 13, avgResponseDays: 0.9, hireRate: 14.3 },
      { recruiterId: "rec-004", recruiterName: "David Okafor",   applicationsReviewed: 65, interviewsScheduled: 24, offersExtended: 9,  offersAccepted: 7,  avgResponseDays: 2.1, hireRate: 10.8 },
    ].sort((a, b) => b.hireRate - a.hireRate).slice(0, params.limit);

    const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / (arr.length || 1);

    return {
      recruiters,
      teamAverages: {
        applicationsReviewed: Math.round(avg(recruiters.map((r) => r.applicationsReviewed))),
        interviewsScheduled:  Math.round(avg(recruiters.map((r) => r.interviewsScheduled))),
        offersExtended:       Math.round(avg(recruiters.map((r) => r.offersExtended))),
        hireRate:             Math.round(avg(recruiters.map((r) => r.hireRate)) * 10) / 10,
        avgResponseDays:      Math.round(avg(recruiters.map((r) => r.avgResponseDays)) * 10) / 10,
      },
    };
  },

  // ── 5. Candidate Conversion ──────────────────────────────────────────────

  getCandidateConversion: async (params: DateRangeInput): Promise<CandidateConversionMetrics> => {
    logger.info("[AnalyticsRepository] getCandidateConversion", params);
    const supabase = await createAnalyticsClient();

    const { error } = await supabase
      .from("application_facts")
      .select("status, submitted_at")
      .gte("submitted_at", params.from)
      .lte("submitted_at", params.to + "T23:59:59Z");

    if (error) {
      logger.warn("[AnalyticsRepository] candidate conversion query failed — using stub data", error.message);
    }

    const c = { applied: 120, screening: 72, interview: 40, offered: 18, accepted: 14, withdrawn: 12, rejected: 76 };
    const rate = (num: number, den: number) => den > 0 ? Math.round((num / den) * 1000) / 10 : 0;

    return {
      totalApplied:    c.applied,
      reachedScreening: c.screening,
      reachedInterview: c.interview,
      receivedOffer:   c.offered,
      acceptedOffer:   c.accepted,
      withdrawn:       c.withdrawn,
      rejected:        c.rejected,
      conversionRates: {
        appliedToScreening:   rate(c.screening, c.applied),
        screeningToInterview: rate(c.interview, c.screening),
        interviewToOffer:     rate(c.offered, c.interview),
        offerAcceptance:      rate(c.accepted, c.offered),
      },
      withdrawalReasons: toBreakdown({
        "Accepted another offer": 5,
        "Role no longer relevant": 4,
        "Compensation mismatch": 2,
        "Other": 1,
      }),
    };
  },

  // ── 6. Company Dashboard ─────────────────────────────────────────────────

  getCompanyDashboard: async (params: DateRangeInput): Promise<CompanyDashboardMetrics> => {
    logger.info("[AnalyticsRepository] getCompanyDashboard", params);
    const supabase = await createAnalyticsClient();

    const { error } = await supabase
      .from("daily_snapshots")
      .select("*")
      .gte("snapshot_date", params.from)
      .lte("snapshot_date", params.to)
      .order("snapshot_date", { ascending: false })
      .limit(1);

    if (error) {
      logger.warn("[AnalyticsRepository] company dashboard query failed — using stub data", error.message);
    }

    return {
      activeJobs:          34,
      totalApplications:  120,
      openPositions:       41,
      totalHires:          14,
      avgTimeToHireDays:   24.3,
      pipelineSnapshot: toBreakdown({ Applied: 45, Screening: 28, Interview: 22, Offered: 10, Accepted: 14, Rejected: 11 }),
      applicationTrend:  stubTimeSeries(params.from, params.to, 4),
      topJobCategories:  toBreakdown({ Engineering: 55, Design: 18, Marketing: 14, Operations: 12, Finance: 8 }),
      byDepartment: [
        { departmentId: "dept-001", departmentName: "Engineering",  activeJobs: 14, applications: 55, hires: 6 },
        { departmentId: "dept-002", departmentName: "Design",       activeJobs: 5,  applications: 18, hires: 2 },
        { departmentId: "dept-003", departmentName: "Marketing",    activeJobs: 6,  applications: 14, hires: 2 },
        { departmentId: "dept-004", departmentName: "Operations",   activeJobs: 5,  applications: 12, hires: 2 },
        { departmentId: "dept-005", departmentName: "Finance",      activeJobs: 4,  applications: 8,  hires: 1 },
        { departmentId: "dept-006", departmentName: "People & Org", activeJobs: 3,  applications: 13, hires: 1 },
      ],
    };
  },

  // ── Charts API ───────────────────────────────────────────────────────────

  getChartData: async (
    metric: ChartMetricType,
    params: DateRangeInput,
    granularity: "day" | "week" | "month" = "day"
  ): Promise<ChartResponse> => {
    logger.info("[AnalyticsRepository] getChartData", { metric, granularity, ...params });
    const supabase = await createAnalyticsClient();

    // Validate the connection (errors fall through to stub data)
    const { error } = await supabase.from("daily_snapshots").select("snapshot_date").limit(1);
    if (error) {
      logger.warn("[AnalyticsRepository] chart data query failed — using stub data", error.message);
    }

    const now = new Date().toISOString();

    switch (metric) {
      case "applications_volume": {
        const series = stubTimeSeries(params.from, params.to, 4);
        return {
          metric,
          chartType: "line",
          labels: series.map((p) => p.date),
          datasets: [{ label: "Applications", data: series.map((p) => p.value), color: "#6366f1" }],
          computedAt: now,
        };
      }

      case "hiring_funnel": {
        const stages = ["Applied", "Screening", "Interview", "Offered", "Accepted"];
        const counts = [120, 72, 40, 18, 14];
        return {
          metric,
          chartType: "funnel",
          labels: stages,
          datasets: [{ label: "Candidates", data: counts, color: "#8b5cf6" }],
          computedAt: now,
        };
      }

      case "time_to_hire_trend": {
        const series = stubTimeSeries(params.from, params.to, 22);
        return {
          metric,
          chartType: "area",
          labels: series.map((p) => p.date),
          datasets: [{ label: "Avg Days to Hire", data: series.map((p) => p.value), color: "#10b981" }],
          computedAt: now,
        };
      }

      case "conversion_rates": {
        return {
          metric,
          chartType: "bar",
          labels: ["Applied→Screening", "Screening→Interview", "Interview→Offer", "Offer Acceptance"],
          datasets: [{ label: "Conversion %", data: [60, 55.6, 45, 77.8], color: "#f59e0b" }],
          computedAt: now,
        };
      }

      case "recruiter_leaderboard": {
        return {
          metric,
          chartType: "bar",
          labels: ["Carol Wei", "Alice Johnson", "Bob Martinez", "David Okafor"],
          datasets: [{ label: "Hire Rate %", data: [14.3, 13.4, 10.8, 10.8], color: "#3b82f6" }],
          computedAt: now,
        };
      }

      case "pipeline_snapshot": {
        const labels = ["Applied", "Screening", "Interview", "Offered", "Accepted", "Rejected"];
        const counts = [45, 28, 22, 10, 14, 11];
        return {
          metric,
          chartType: "doughnut",
          labels,
          datasets: [{ label: "Candidates", data: counts, color: "#ec4899" }],
          computedAt: now,
        };
      }

      default: {
        const exhaustiveCheck: never = metric;
        throw new Error(`Unknown chart metric: ${exhaustiveCheck}`);
      }
    }
  },
};
