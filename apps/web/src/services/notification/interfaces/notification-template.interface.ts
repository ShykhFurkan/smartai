/**
 * Notification Service — Template Interfaces
 *
 * Defines contracts for the template engine that resolves notification
 * templates into ready-to-send subject/body strings.
 */

export interface NotificationTemplate {
  /** Unique template identifier (e.g. "application.submitted") */
  id: string;
  /** Display name */
  name: string;
  /** Subject line template (supports {{variable}} interpolation) */
  subjectTemplate: string;
  /** Plain-text body template */
  bodyTemplate: string;
  /** HTML body template (optional — email only) */
  htmlBodyTemplate?: string;
  /** Which channels this template supports */
  supportedChannels: Array<"email" | "sms" | "push" | "in_app">;
  /** Whether this template is active */
  isActive: boolean;
}

export interface TemplateVariables {
  [key: string]: string | number | boolean | null | undefined;
}

export interface ResolvedTemplate {
  subject: string;
  body: string;
  htmlBody?: string;
}

export interface ITemplateEngine {
  /**
   * Resolve a template by ID, interpolating the provided variables.
   * Throws if the template ID is not found or is inactive.
   */
  resolve(templateId: string, variables: TemplateVariables): Promise<ResolvedTemplate>;

  /**
   * Register or upsert a template in the engine's store.
   */
  register(template: NotificationTemplate): void;

  /**
   * List all registered templates.
   */
  list(): NotificationTemplate[];
}
