import { jobRepository, JobFilters } from "./job-repository";
import { jobCreateSchema, jobUpdateSchema } from "./job-schemas";
import { logger } from "@smarthire/logger";

/**
 * Service Layer for Job Service (Clean Architecture Logic)
 */
export const jobService = {
  /**
   * List jobs based on filter parameters
   */
  listJobs: async (filters: JobFilters) => {
    logger.info("Service: listJobs initiated with filters", filters);
    return await jobRepository.listJobs(filters);
  },

  /**
   * Fetch single job by ID
   */
  getJobDetails: async (jobId: string) => {
    logger.info(`Service: getJobDetails for: ${jobId}`);
    return await jobRepository.getJobById(jobId);
  },

  /**
   * Create a job posting
   */
  createJob: async (payload: unknown) => {
    logger.info("Service: createJob initiated");
    const result = jobCreateSchema.safeParse(payload);

    if (!result.success) {
      logger.error("Service: Job creation validation failed", result.error.flatten());
      throw new Error(JSON.stringify(result.error.flatten()));
    }

    return await jobRepository.insertJob(result.data);
  },

  /**
   * Edit a job posting
   */
  editJob: async (jobId: string, payload: unknown) => {
    logger.info(`Service: editJob for ID: ${jobId}`);
    const result = jobUpdateSchema.safeParse(payload);

    if (!result.success) {
      logger.error("Service: Job update validation failed", result.error.flatten());
      throw new Error(JSON.stringify(result.error.flatten()));
    }

    return await jobRepository.updateJob(jobId, result.data);
  },

  /**
   * Transition Job Status to Published
   */
  publishJob: async (jobId: string) => {
    logger.info(`Service: Publishing job: ${jobId}`);

    const existing = await jobRepository.getJobById(jobId);
    if (!existing) {
      throw new Error("Job posting not found");
    }

    return await jobRepository.updateJobStatus(jobId, "published");
  },

  /**
   * Transition Job Status to Closed / Archived
   */
  archiveJob: async (jobId: string) => {
    logger.info(`Service: Archiving job: ${jobId}`);

    const existing = await jobRepository.getJobById(jobId);
    if (!existing) {
      throw new Error("Job posting not found");
    }

    return await jobRepository.updateJobStatus(jobId, "closed");
  },

  /**
   * Soft delete a job posting
   */
  deleteJob: async (jobId: string) => {
    logger.info(`Service: Deleting job: ${jobId}`);

    const existing = await jobRepository.getJobById(jobId);
    if (!existing) {
      throw new Error("Job posting not found");
    }

    return await jobRepository.softDeleteJob(jobId);
  },
};
