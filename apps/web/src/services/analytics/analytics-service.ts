/**
 * Analytics Service — Public Facade
 *
 * Single entry point for all analytics metric operations.
 * Validates query parameters with Zod, delegates to the repository,
 * and applies cross-cutting concerns (logging, error wrapping).
 */

import { analyticsRepository } from "./analytics-repository";
import {
  dateRangeSchema,
  recruiterPerformanceSchema,
  chartQuerySchema,
} from "./analytics-schemas";
import { logger } from "@smarthire/logger";

export const AnalyticsService = {
  /**
   * Applications submitted, by status, category, and source
   */
  getApplicationsMetrics: async (query: unknown) => {
    const params = dateRangeSchema.parse(query);
    logger.info("[AnalyticsService] getApplicationsMetrics", params);
    return analyticsRepository.getApplicationsMetrics(params);
  },

  /**
   * Stage-by-stage hiring funnel with conversion rates
   */
  getHiringFunnel: async (query: unknown) => {
    const params = dateRangeSchema.parse(query);
    logger.info("[AnalyticsService] getHiringFunnel", params);
    return analyticsRepository.getHiringFunnel(params);
  },

  /**
   * Average, median, and p90 time-to-hire with stage breakdown
   */
  getTimeToHire: async (query: unknown) => {
    const params = dateRangeSchema.parse(query);
    logger.info("[AnalyticsService] getTimeToHire", params);
    return analyticsRepository.getTimeToHire(params);
  },

  /**
   * Per-recruiter performance metrics and team averages
   */
  getRecruiterPerformance: async (query: unknown) => {
    const params = recruiterPerformanceSchema.parse(query);
    logger.info("[AnalyticsService] getRecruiterPerformance", params);
    return analyticsRepository.getRecruiterPerformance(params);
  },

  /**
   * Candidate conversion rates through the pipeline
   */
  getCandidateConversion: async (query: unknown) => {
    const params = dateRangeSchema.parse(query);
    logger.info("[AnalyticsService] getCandidateConversion", params);
    return analyticsRepository.getCandidateConversion(params);
  },

  /**
   * High-level company dashboard snapshot with department breakdown
   */
  getCompanyDashboard: async (query: unknown) => {
    const params = dateRangeSchema.parse(query);
    logger.info("[AnalyticsService] getCompanyDashboard", params);
    return analyticsRepository.getCompanyDashboard(params);
  },

  /**
   * Chart-ready dataset for a specific metric type
   */
  getChartData: async (query: unknown) => {
    const params = chartQuerySchema.parse(query);
    const { metric, granularity, ...dateRange } = params;
    logger.info("[AnalyticsService] getChartData", { metric, granularity });
    return analyticsRepository.getChartData(metric, dateRange, granularity);
  },
};
