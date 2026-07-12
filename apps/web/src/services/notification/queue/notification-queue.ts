/**
 * Notification Service — In-Memory Notification Queue
 *
 * Buffers outbound notification jobs and processes them with exponential
 * back-off retry logic. Dead-letters jobs that exceed maxAttempts.
 *
 * In production, replace this with a durable queue (e.g. BullMQ + Redis,
 * Supabase pg_cron, or a cloud task queue) for persistence across restarts.
 */


import {
  INotificationQueue,
  QueueJob,
  QueueJobStatus,
  EnqueueOptions,
} from "../interfaces/notification-queue.interface";
import {
  NotificationChannel,
  NotificationPayload,
  NotificationRecipient,
  INotificationChannel,
} from "../interfaces/notification-channel.interface";
import { logger } from "@smarthire/logger";

const DEFAULT_MAX_ATTEMPTS = 3;
/** Base delay in ms for exponential back-off: attempt^2 * BASE_DELAY_MS */
const BASE_RETRY_DELAY_MS = 1000;

export class InMemoryNotificationQueue implements INotificationQueue {
  private jobs = new Map<string, QueueJob>();
  private channels = new Map<NotificationChannel, INotificationChannel>();

  /**
   * Register a channel implementation for processing.
   */
  registerChannel(channel: INotificationChannel): void {
    this.channels.set(channel.channel, channel);
    logger.info(`[NotificationQueue] Channel registered: ${channel.channel}`);
  }

  async enqueue(
    channel: NotificationChannel,
    recipient: NotificationRecipient,
    payload: NotificationPayload,
    options?: EnqueueOptions
  ): Promise<string> {
    const jobId = crypto.randomUUID();
    const now = new Date().toISOString();
    const delayMs = options?.delayMs ?? 0;
    const nextRetryAt = new Date(Date.now() + delayMs).toISOString();

    const job: QueueJob = {
      id: jobId,
      channel,
      recipient,
      payload,
      status: "pending",
      attempts: 0,
      maxAttempts: options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS,
      nextRetryAt,
      lastError: null,
      createdAt: now,
      updatedAt: now,
    };

    this.jobs.set(jobId, job);
    logger.info(`[NotificationQueue] Job enqueued: ${jobId}`, {
      channel,
      userId: recipient.userId,
      type: payload.type,
    });

    return jobId;
  }

  async process(): Promise<void> {
    const now = Date.now();
    const pending = Array.from(this.jobs.values()).filter(
      (job) =>
        job.status === "pending" &&
        job.nextRetryAt !== null &&
        new Date(job.nextRetryAt).getTime() <= now
    );

    logger.info(`[NotificationQueue] Processing ${pending.length} pending job(s)`);

    for (const job of pending) {
      await this.processJob(job);
    }
  }

  async listJobs(filter?: { status?: QueueJobStatus }): Promise<QueueJob[]> {
    const all = Array.from(this.jobs.values());
    if (filter?.status) {
      return all.filter((j) => j.status === filter.status);
    }
    return all;
  }

  async getStats(): Promise<{ pending: number; processing: number; failed: number; deadLettered: number }> {
    const jobs = Array.from(this.jobs.values());
    return {
      pending: jobs.filter((j) => j.status === "pending").length,
      processing: jobs.filter((j) => j.status === "processing").length,
      failed: jobs.filter((j) => j.status === "failed").length,
      deadLettered: jobs.filter((j) => j.status === "dead_lettered").length,
    };
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private async processJob(job: QueueJob): Promise<void> {
    const channel = this.channels.get(job.channel);
    if (!channel) {
      logger.error(`[NotificationQueue] No channel registered for: ${job.channel}`);
      this.updateJob(job.id, { status: "dead_lettered", lastError: `No channel: ${job.channel}` });
      return;
    }

    this.updateJob(job.id, { status: "processing" });

    try {
      const result = await channel.send(job.recipient, job.payload);

      if (result.success) {
        this.updateJob(job.id, { status: "delivered", nextRetryAt: null });
        logger.info(`[NotificationQueue] Job delivered: ${job.id}`, {
          channel: job.channel,
          externalId: result.externalId,
        });
      } else {
        this.handleFailure(job, result.error ?? "Channel returned failure");
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : String(err);
      this.handleFailure(job, error);
    }
  }

  private handleFailure(job: QueueJob, error: string): void {
    const attempts = job.attempts + 1;

    if (attempts >= job.maxAttempts) {
      this.updateJob(job.id, {
        status: "dead_lettered",
        attempts,
        lastError: error,
        nextRetryAt: null,
      });
      logger.error(`[NotificationQueue] Job dead-lettered after ${attempts} attempts: ${job.id}`, { error });
    } else {
      // Exponential back-off: 1s, 4s, 9s, 16s, …
      const delayMs = Math.pow(attempts + 1, 2) * BASE_RETRY_DELAY_MS;
      const nextRetryAt = new Date(Date.now() + delayMs).toISOString();

      this.updateJob(job.id, {
        status: "pending",
        attempts,
        lastError: error,
        nextRetryAt,
      });
      logger.warn(`[NotificationQueue] Job ${job.id} will retry at ${nextRetryAt} (attempt ${attempts}/${job.maxAttempts})`, { error });
    }
  }

  private updateJob(id: string, patch: Partial<QueueJob>): void {
    const existing = this.jobs.get(id);
    if (!existing) return;
    this.jobs.set(id, { ...existing, ...patch, updatedAt: new Date().toISOString() });
  }
}

/** Singleton queue instance */
export const notificationQueue = new InMemoryNotificationQueue();
