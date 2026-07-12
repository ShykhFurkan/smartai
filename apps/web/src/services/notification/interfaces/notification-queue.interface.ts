/**
 * Notification Service — Queue & Retry Interfaces
 *
 * Defines the contract for the notification queue which buffers outbound
 * notifications and handles retry logic with exponential back-off.
 */

import { NotificationChannel, NotificationPayload, NotificationRecipient } from "./notification-channel.interface";

export type QueueJobStatus = "pending" | "processing" | "delivered" | "failed" | "dead_lettered";

export interface QueueJob {
  /** Unique job identifier */
  id: string;
  /** Target delivery channel */
  channel: NotificationChannel;
  /** Recipient */
  recipient: NotificationRecipient;
  /** Resolved notification payload */
  payload: NotificationPayload;
  /** Current job status */
  status: QueueJobStatus;
  /** Number of delivery attempts made so far */
  attempts: number;
  /** Maximum allowed attempts before dead-lettering */
  maxAttempts: number;
  /** ISO timestamp of next scheduled retry */
  nextRetryAt: string | null;
  /** Error message from last failed attempt */
  lastError: string | null;
  /** ISO timestamp when the job was created */
  createdAt: string;
  /** ISO timestamp of last status update */
  updatedAt: string;
}

export interface EnqueueOptions {
  /** Maximum delivery attempts (default: 3) */
  maxAttempts?: number;
  /** Delay in milliseconds before first attempt (default: 0) */
  delayMs?: number;
}

export interface INotificationQueue {
  /**
   * Add a notification delivery job to the queue.
   * Returns the created job ID.
   */
  enqueue(
    channel: NotificationChannel,
    recipient: NotificationRecipient,
    payload: NotificationPayload,
    options?: EnqueueOptions
  ): Promise<string>;

  /**
   * Process all pending jobs in the queue.
   * Should be called by a scheduler or background worker.
   */
  process(): Promise<void>;

  /**
   * Return all jobs currently in the queue (for monitoring).
   */
  listJobs(filter?: { status?: QueueJobStatus }): Promise<QueueJob[]>;

  /**
   * Return queue depth metrics.
   */
  getStats(): Promise<{ pending: number; processing: number; failed: number; deadLettered: number }>;
}
