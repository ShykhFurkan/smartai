/**
 * Notification Service — Template Engine
 *
 * In-memory template store with mustache-style {{variable}} interpolation.
 * Templates are registered at startup and resolved at notification dispatch time.
 */

import {
  ITemplateEngine,
  NotificationTemplate,
  TemplateVariables,
  ResolvedTemplate,
} from "../interfaces/notification-template.interface";
import { logger } from "@smarthire/logger";

/**
 * Interpolate {{variable}} placeholders in a template string.
 */
function interpolate(template: string, variables: TemplateVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = variables[key];
    return value !== undefined && value !== null ? String(value) : `{{${key}}}`;
  });
}

export class TemplateEngine implements ITemplateEngine {
  private store = new Map<string, NotificationTemplate>();

  constructor() {
    // Register all built-in Smart Hire notification templates
    this.registerBuiltins();
  }

  register(template: NotificationTemplate): void {
    logger.info(`[TemplateEngine] Registering template: ${template.id}`);
    this.store.set(template.id, template);
  }

  list(): NotificationTemplate[] {
    return Array.from(this.store.values());
  }

  async resolve(templateId: string, variables: TemplateVariables): Promise<ResolvedTemplate> {
    const template = this.store.get(templateId);

    if (!template) {
      throw new Error(`Notification template not found: "${templateId}"`);
    }
    if (!template.isActive) {
      throw new Error(`Notification template is inactive: "${templateId}"`);
    }

    return {
      subject: interpolate(template.subjectTemplate, variables),
      body: interpolate(template.bodyTemplate, variables),
      htmlBody: template.htmlBodyTemplate
        ? interpolate(template.htmlBodyTemplate, variables)
        : undefined,
    };
  }

  // ─── Built-in templates ────────────────────────────────────────────────────

  private registerBuiltins(): void {
    const builtins: NotificationTemplate[] = [
      {
        id: "application.submitted",
        name: "Application Submitted",
        subjectTemplate: "Your application to {{jobTitle}} has been received",
        bodyTemplate:
          "Hi {{candidateName}}, we've received your application for {{jobTitle}} at {{companyName}}. We'll be in touch shortly.",
        htmlBodyTemplate:
          "<p>Hi <strong>{{candidateName}}</strong>,</p><p>We've received your application for <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong>. We'll be in touch shortly.</p>",
        supportedChannels: ["email", "in_app"],
        isActive: true,
      },
      {
        id: "application.status_updated",
        name: "Application Status Updated",
        subjectTemplate: "Update on your application for {{jobTitle}}",
        bodyTemplate:
          "Hi {{candidateName}}, your application for {{jobTitle}} at {{companyName}} has been moved to {{newStatus}}.",
        htmlBodyTemplate:
          "<p>Hi <strong>{{candidateName}}</strong>,</p><p>Your application for <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong> has been moved to <strong>{{newStatus}}</strong>.</p>",
        supportedChannels: ["email", "sms", "in_app"],
        isActive: true,
      },
      {
        id: "application.withdrawn",
        name: "Application Withdrawn",
        subjectTemplate: "Application withdrawn for {{jobTitle}}",
        bodyTemplate:
          "Hi {{candidateName}}, your application for {{jobTitle}} at {{companyName}} has been withdrawn as requested.",
        htmlBodyTemplate:
          "<p>Hi <strong>{{candidateName}}</strong>,</p><p>Your application for <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong> has been withdrawn as requested.</p>",
        supportedChannels: ["email", "in_app"],
        isActive: true,
      },
      {
        id: "application.rejected",
        name: "Application Rejected",
        subjectTemplate: "Update on your application for {{jobTitle}}",
        bodyTemplate:
          "Hi {{candidateName}}, after careful consideration, we won't be moving forward with your application for {{jobTitle}} at {{companyName}} at this time. Thank you for your interest.",
        htmlBodyTemplate:
          "<p>Hi <strong>{{candidateName}}</strong>,</p><p>After careful consideration, we won't be moving forward with your application for <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong> at this time. Thank you for your interest.</p>",
        supportedChannels: ["email", "in_app"],
        isActive: true,
      },
      {
        id: "application.offered",
        name: "Offer Extended",
        subjectTemplate: "Congratulations! Offer for {{jobTitle}} at {{companyName}}",
        bodyTemplate:
          "Hi {{candidateName}}, congratulations! We're pleased to extend an offer for the {{jobTitle}} position at {{companyName}}. Please check your email for details.",
        htmlBodyTemplate:
          "<p>Hi <strong>{{candidateName}}</strong>,</p><p>🎉 Congratulations! We're pleased to extend an offer for the <strong>{{jobTitle}}</strong> position at <strong>{{companyName}}</strong>. Please check your email for full details.</p>",
        supportedChannels: ["email", "sms", "push", "in_app"],
        isActive: true,
      },
      {
        id: "interview.scheduled",
        name: "Interview Scheduled",
        subjectTemplate: "Interview scheduled for {{jobTitle}}",
        bodyTemplate:
          "Hi {{candidateName}}, your interview for {{jobTitle}} at {{companyName}} has been scheduled for {{interviewDate}} at {{interviewTime}}.",
        htmlBodyTemplate:
          "<p>Hi <strong>{{candidateName}}</strong>,</p><p>Your interview for <strong>{{jobTitle}}</strong> at <strong>{{companyName}}</strong> has been scheduled for <strong>{{interviewDate}}</strong> at <strong>{{interviewTime}}</strong>.</p>",
        supportedChannels: ["email", "sms", "push", "in_app"],
        isActive: true,
      },
      {
        id: "recruiter.invitation",
        name: "Recruiter Invitation",
        subjectTemplate: "You've been invited to join {{companyName}} on Smart Hire",
        bodyTemplate:
          "Hi {{recruiterName}}, you've been invited to join {{companyName}} as a recruiter on Smart Hire. Accept your invitation here: {{invitationLink}}",
        htmlBodyTemplate:
          "<p>Hi <strong>{{recruiterName}}</strong>,</p><p>You've been invited to join <strong>{{companyName}}</strong> as a recruiter on Smart Hire.</p><p><a href=\"{{invitationLink}}\">Accept Invitation</a></p>",
        supportedChannels: ["email"],
        isActive: true,
      },
      {
        id: "auth.password_reset",
        name: "Password Reset",
        subjectTemplate: "Reset your Smart Hire password",
        bodyTemplate:
          "Hi {{userName}}, click the link below to reset your password. This link expires in 1 hour: {{resetLink}}",
        htmlBodyTemplate:
          "<p>Hi <strong>{{userName}}</strong>,</p><p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href=\"{{resetLink}}\">Reset Password</a></p>",
        supportedChannels: ["email"],
        isActive: true,
      },
      {
        id: "auth.email_verification",
        name: "Email Verification",
        subjectTemplate: "Verify your Smart Hire email address",
        bodyTemplate:
          "Hi {{userName}}, please verify your email address by clicking: {{verificationLink}}",
        htmlBodyTemplate:
          "<p>Hi <strong>{{userName}}</strong>,</p><p>Please verify your email address by clicking the link below.</p><p><a href=\"{{verificationLink}}\">Verify Email</a></p>",
        supportedChannels: ["email"],
        isActive: true,
      },
    ];

    builtins.forEach((t) => this.store.set(t.id, t));
    logger.info(`[TemplateEngine] ${builtins.length} built-in templates registered`);
  }
}

/** Singleton template engine instance */
export const templateEngine = new TemplateEngine();
