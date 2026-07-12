/**
 * Analytics Service — Public Module Index
 */

export { AnalyticsService } from "./analytics-service";

// Types
export type {
  DateRange, TimeSeriesPoint, BreakdownItem,
  ApplicationsMetrics,
  HiringFunnelMetrics, HiringFunnelStage,
  TimeToHireMetrics,
  RecruiterPerformanceMetrics, RecruiterPerformanceEntry,
  CandidateConversionMetrics,
  CompanyDashboardMetrics,
  ChartResponse, ChartDataset, ChartMetricType, ChartType,
} from "./interfaces/analytics.interface";

export type { DateRangeInput, RecruiterPerformanceInput, ChartQueryInput } from "./analytics-schemas";
