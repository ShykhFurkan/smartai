# Notification Service — API Documentation

This document describes the architecture, channels, template engine, queue model, retry logic, preferences system, and REST API for the **Notification Service** in Smart Hire.

---

## 1. Architecture Overview

```
REST API Routes
      │
      ▼
NotificationService (facade)
      │
      ├─── TemplateEngine        — resolves {{variable}} templates
      ├─── notificationRepository — in-app DB CRUD + preferences
      └─── InMemoryNotificationQueue
                │
                ├── EmailChannel     (stub → replace with Resend/SendGrid)
                ├── SMSChannel       (placeholder → Twilio/AWS SNS)
                ├── PushChannel      (placeholder → FCM/Expo)
                └── InAppChannel     (DB-backed via notification schema)
```

---

## 2. Channels

| Channel  | Status                          | Provider Placeholder                        |
| -------- | ------------------------------- | ------------------------------------------- |
| `email`  | ✅ Stub (structurally complete) | Resend / SendGrid / Nodemailer              |
| `sms`    | 🔲 Placeholder                  | Twilio / AWS SNS                            |
| `push`   | 🔲 Placeholder                  | Firebase FCM / Expo Push                    |
| `in_app` | ✅ Fully implemented            | Supabase `notification.notifications` table |

---

## 3. Template Engine

Templates use `{{variable}}` mustache-style interpolation.

### Built-in Templates

| Template ID                  | Description                  | Channels                 |
| ---------------------------- | ---------------------------- | ------------------------ |
| `application.submitted`      | Candidate applied for a job  | email, in_app            |
| `application.status_updated` | Pipeline stage changed       | email, sms, in_app       |
| `application.withdrawn`      | Candidate withdrew           | email, in_app            |
| `application.rejected`       | Application rejected         | email, in_app            |
| `application.offered`        | Offer extended               | email, sms, push, in_app |
| `interview.scheduled`        | Interview time confirmed     | email, sms, push, in_app |
| `recruiter.invitation`       | Recruiter invited to company | email                    |
| `auth.password_reset`        | Password reset link          | email                    |
| `auth.email_verification`    | Email verification link      | email                    |

### Example Variables per Template

**`application.submitted`**:

```json
{ "candidateName": "Jane", "jobTitle": "Backend Engineer", "companyName": "Acme Corp" }
```

**`interview.scheduled`**:

```json
{
  "candidateName": "Jane",
  "jobTitle": "Backend Engineer",
  "companyName": "Acme Corp",
  "interviewDate": "2026-08-01",
  "interviewTime": "14:00 UTC"
}
```

---

## 4. Queue & Retry Logic

- **Type**: In-memory (swap to BullMQ + Redis or Supabase pg_cron in production)
- **Default max attempts**: 3
- **Retry strategy**: Exponential back-off — `attempt² × 1000ms`
  - Attempt 2: 4 seconds
  - Attempt 3: 9 seconds
- **Dead-letter**: Jobs exceeding `maxAttempts` are marked `dead_lettered`

### Job Lifecycle

```
pending → processing → delivered ✓
                     ↘ failed → pending (retry with back-off)
                              ↘ dead_lettered (max attempts exceeded)
```

---

## 5. Notification Preferences

Per-user opt-in/out per `(notificationType, channel)` pair.

- Default: **opted in** if no preference record exists.
- `notificationType = "*"` acts as a wildcard preference (all types on that channel).
- Specific type preferences take precedence over wildcard.

---

## 6. Database Tables (notification schema)

### `notifications`

| Column            | Type        | Notes                        |
| ----------------- | ----------- | ---------------------------- |
| `id`              | uuid PK     |                              |
| `user_id`         | uuid        | FK → identity.users          |
| `type`            | text        | Template ID / event name     |
| `subject`         | text        | Resolved subject             |
| `body`            | text        | Resolved plain-text body     |
| `metadata`        | jsonb       | Arbitrary event data         |
| `idempotency_key` | text        | Unique — prevents duplicates |
| `is_read`         | boolean     | Default false                |
| `read_at`         | timestamptz | Nullable                     |
| `deleted_at`      | timestamptz | Soft delete                  |
| `created_at`      | timestamptz |                              |

### `notification_preferences`

| Column              | Type                                    | Notes                       |
| ------------------- | --------------------------------------- | --------------------------- |
| `id`                | uuid PK                                 |                             |
| `user_id`           | uuid                                    | FK → identity.users         |
| `notification_type` | text                                    | Template ID or "*" wildcard |
| `channel`           | text                                    | email / sms / push / in_app |
| `enabled`           | boolean                                 |                             |
| `updated_at`        | timestamptz                             |                             |
| Unique constraint   | `(user_id, notification_type, channel)` |                             |

---

## 7. REST API Reference

### 7.1. Send Notification

**POST `/api/notifications/send`**

Dispatches a notification to a user via one or more channels.
Returns `202 Accepted` with enqueued job IDs.

**Request body**:

```json
{
  "userId": "user_uuid",
  "templateId": "application.submitted",
  "channels": ["email", "in_app"],
  "variables": {
    "candidateName": "Jane Doe",
    "jobTitle": "Backend Engineer",
    "companyName": "Acme Corp"
  },
  "recipientEmail": "jane@example.com",
  "metadata": { "applicationId": "app_uuid" }
}
```

**Response `202`**:

```json
{
  "data": {
    "idempotencyKey": "user_uuid:application.submitted:uuid",
    "jobIds": [
      { "channel": "email", "jobId": "job_uuid_1" },
      { "channel": "in_app", "jobId": "job_uuid_2" }
    ]
  }
}
```

---

### 7.2. In-App Notifications

**GET `/api/notifications/in-app`**

List in-app notifications for the authenticated user.

| Query param | Type                  | Default | Description           |
| ----------- | --------------------- | ------- | --------------------- |
| `isRead`    | `"true"` \| `"false"` | —       | Filter by read status |
| `limit`     | number                | 20      | Max results           |
| `offset`    | number                | 0       | Pagination offset     |

**PATCH `/api/notifications/in-app`**

Mark **all** in-app notifications as read.

**PATCH `/api/notifications/in-app/[id]/read`**

Mark a **single** in-app notification as read.

---

### 7.3. Preferences

**GET `/api/notifications/preferences`**

Returns all preference records for the authenticated user.

**Response `200`**:

```json
{
  "data": [
    {
      "userId": "uuid",
      "notificationType": "application.submitted",
      "channel": "email",
      "enabled": true,
      "updatedAt": "..."
    },
    {
      "userId": "uuid",
      "notificationType": "*",
      "channel": "sms",
      "enabled": false,
      "updatedAt": "..."
    }
  ]
}
```

**PUT `/api/notifications/preferences`**

Update a single preference.

```json
{ "notificationType": "application.submitted", "channel": "sms", "enabled": false }
```

---

### 7.4. Templates

**GET `/api/notifications/templates`**

Returns all registered templates (ID, name, supported channels, active flag).

---

### 7.5. Queue Management

**GET `/api/notifications/queue/stats`**

```json
{ "data": { "pending": 2, "processing": 0, "failed": 1, "deadLettered": 0 } }
```

**POST `/api/notifications/queue/stats`**

Manually trigger queue processing (useful for dev/testing without a scheduler).
