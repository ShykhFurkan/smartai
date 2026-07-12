# Database Guidelines

This document outlines the database design patterns, conventions, schema guidelines, and migration policies for **Smart Hire**.

---

## 1. Database-per-Service Architecture

To achieve absolute service isolation and maintain microservice boundaries:

- **No Shared Databases**: Every microservice owns and interacts with its own dedicated database.
- **Cross-Service Data Access**: Services must never run direct queries (e.g. SQL joins) across databases owned by other services. Data sharing must occur strictly via **REST APIs** or **Event-driven messaging** (Event Bus).
- **Technology Choice**: High-relational services (Jobs, Candidates) use **PostgreSQL**. Heavy-read search workloads may configure **Elasticsearch** (for candidate profile searching).

---

## 2. Table and Column Conventions

To keep databases consistent across all services, follow these naming conventions:

- **Casing**:
  - **Tables**: Use `snake_case` and plural nouns (e.g. `users`, `job_postings`).
  - **Columns**: Use `snake_case` (e.g. `first_name`, `resume_url`).
- **Identifiers**: Primary keys must be typed as UUIDs or NanoIDs (`varchar`) to prevent ID enumeration attacks (avoid auto-incrementing integer IDs in public APIs). Name the column `id`.
- **Foreign Keys**: Name foreign keys as `singular_table_name_id` (e.g. `job_id` referencing table `jobs`).

---

## 3. Auditing & Lifecycle Fields

Every transactional database table must include fields for tracing creation, updates, and deletion.

| Field        | Type                       | Description                                             |
| :----------- | :------------------------- | :------------------------------------------------------ |
| `id`         | `uuid` / `varchar`         | Unique identifier (Primary Key).                        |
| `created_at` | `timestamp with time zone` | Record insertion timestamp. Defaults to `now()`.        |
| `updated_at` | `timestamp with time zone` | Timestamp when record was last modified.                |
| `deleted_at` | `timestamp with time zone` | Timestamp when record was soft-deleted. Null if active. |

---

## 4. Soft Deletes Policy

To maintain history and support audit trails, records representing key entities (e.g. Candidates, Applications, Jobs) must not be deleted physically from the database.

- **Implementation**: Set `deleted_at` to the current timestamp.
- **Querying**: Data access layers (ORM models or repositories) must automatically filter out soft-deleted records (`WHERE deleted_at IS NULL`) in standard queries, unless specifically requested otherwise.

---

## 5. Migration Strategy

- **Migration Tooling**: Services use Prisma or Knex migrations to version control schema changes.
- **Declarative Files**: Schema modifications must be written as incremental migration scripts (`.sql` or framework-specific migration code) checked into the service's source repository.
- **Rollback Policy**: Every migration must be tested alongside a corresponding rollback (down) step.
- **Zero-Downtime Deployments**: Migrations must be designed to be backwards-compatible (e.g. adding a new column must default to null or specify a default value, allowing older versions of the app container to run concurrently during rolling deployments).

---

- **Primary Keys & Foreign Keys**: Index primary keys automatically. Foreign key columns must always be indexed (`CREATE INDEX idx_table_fk ON table(fk_id)`) to speed up relational joins.
- **Soft Delete Indexing**: When querying tables with high delete volume, append `WHERE deleted_at IS NULL` to partial indexes.
- **Composite Indexes**: Use composite indexes when running queries that filter by multiple fields frequently (e.g. sorting jobs by status and creation date: index on `(status, created_at)`.

---

## 7. Supabase Database Schema Design

This section details the layout, keys, validation constraints, indexing structures, and relationships for the 17 core PostgreSQL tables under the Supabase public schema.

---

### 7.1. users

- **Description**: Central user profile synced with Supabase `auth.users`.
- **Columns**:
  - `id` (`uuid`, Primary Key): References `auth.users(id) ON DELETE CASCADE`.
  - `email` (`varchar(255)`, Unique, Not Null)
  - `first_name` (`varchar(100)`, Not Null)
  - `last_name` (`varchar(100)`, Not Null)
  - `role` (`varchar(30)`, Not Null)
  - `created_at` (`timestamptz`, Default: `now()`)
  - `updated_at` (`timestamptz`, Default: `now()`)
  - `deleted_at` (`timestamptz`, Nullable)
- **Constraints**:
  - `chk_user_role`: `role` must be one of `('admin', 'recruiter', 'candidate')`.
  - `chk_user_email`: Basic email format validation.
- **Indexes**:
  - `idx_users_email` (Unique) on `email` where `deleted_at IS NULL`.
  - `idx_users_role` on `role`.
- **Relationships**:
  - One-to-One with Supabase `auth.users` on `id`.
  - One-to-Many with `recruiters`.
  - One-to-One with `candidates`.
- **Soft Delete**: Sets `deleted_at = now()`.

---

### 7.2. companies

- **Description**: Client organizations operating on the platform.
- **Columns**:
  - `id` (`uuid`, Primary Key, Default: `gen_random_uuid()`)
  - `name` (`varchar(255)`, Not Null)
  - `slug` (`varchar(255)`, Unique, Not Null)
  - `domain` (`varchar(255)`, Nullable)
  - `logo_url` (`varchar(512)`, Nullable)
  - `created_at` (`timestamptz`, Default: `now()`)
  - `updated_at` (`timestamptz`, Default: `now()`)
  - `deleted_at` (`timestamptz`, Nullable)
- **Indexes**:
  - `idx_companies_slug` (Unique) on `slug` where `deleted_at IS NULL`.
  - `idx_companies_domain` on `domain`.
- **Relationships**:
  - One-to-Many with `departments`.
  - One-to-Many with `recruiters`.
- **Soft Delete**: Sets `deleted_at = now()`.

---

### 7.3. departments

- **Description**: Department subgroups within companies.
- **Columns**:
  - `id` (`uuid`, Primary Key, Default: `gen_random_uuid()`)
  - `company_id` (`uuid`, Not Null): References `companies(id) ON DELETE CASCADE`.
  - `name` (`varchar(150)`, Not Null)
  - `created_at` (`timestamptz`, Default: `now()`)
  - `updated_at` (`timestamptz`, Default: `now()`)
  - `deleted_at` (`timestamptz`, Nullable)
- **Constraints**:
  - `uniq_company_dept_name`: Unique `(company_id, name)` where `deleted_at IS NULL`.
- **Indexes**:
  - `idx_departments_company` on `company_id`.
- **Relationships**:
  - Many-to-One with `companies`.
  - One-to-Many with `jobs`.
- **Soft Delete**: Sets `deleted_at = now()`.

---

### 7.4. recruiters

- **Description**: Recruiter/Hiring Manager profiles mapped to organizations.
- **Columns**:
  - `id` (`uuid`, Primary Key, Default: `gen_random_uuid()`)
  - `user_id` (`uuid`, Not Null): References `users(id) ON DELETE CASCADE`.
  - `company_id` (`uuid`, Not Null): References `companies(id) ON DELETE CASCADE`.
  - `role` (`varchar(50)`, Not Null): Permissions designation.
  - `created_at` (`timestamptz`, Default: `now()`)
  - `updated_at` (`timestamptz`, Default: `now()`)
  - `deleted_at` (`timestamptz`, Nullable)
- **Constraints**:
  - `chk_recruiter_role`: `role` must be one of `('owner', 'recruiter', 'hiring_manager')`.
  - `uniq_user_company`: Unique `(user_id, company_id)` where `deleted_at IS NULL`.
- **Indexes**:
  - `idx_recruiters_user` on `user_id`.
  - `idx_recruiters_company` on `company_id`.
- **Relationships**:
  - Many-to-One with `users`.
  - Many-to-One with `companies`.
  - One-to-Many with `jobs`.
- **Soft Delete**: Sets `deleted_at = now()`.

---

### 7.5. candidates

- **Description**: Candidate profiles, supporting work experience and resume references.
- **Columns**:
  - `id` (`uuid`, Primary Key, Default: `gen_random_uuid()`)
  - `user_id` (`uuid`, Nullable): References `users(id) ON DELETE SET NULL`.
  - `email` (`varchar(255)`, Not Null)
  - `phone` (`varchar(50)`, Nullable)
  - `first_name` (`varchar(100)`, Not Null)
  - `last_name` (`varchar(100)`, Not Null)
  - `summary` (`text`, Nullable)
  - `created_at` (`timestamptz`, Default: `now()`)
  - `updated_at` (`timestamptz`, Default: `now()`)
  - `deleted_at` (`timestamptz`, Nullable)
- **Indexes**:
  - `idx_candidates_email` on `email` where `deleted_at IS NULL`.
  - `idx_candidates_user` (Unique) on `user_id` where `deleted_at IS NULL`.
- **Relationships**:
  - One-to-One with `users` (via `user_id`).
  - One-to-Many with `education`, `experience`, `resumes`, and `applications`.
- **Soft Delete**: Sets `deleted_at = now()`.

---

### 7.6. education

- **Description**: Educational records for candidates.
- **Columns**:
  - `id` (`uuid`, Primary Key, Default: `gen_random_uuid()`)
  - `candidate_id` (`uuid`, Not Null): References `candidates(id) ON DELETE CASCADE`.
  - `institution` (`varchar(255)`, Not Null)
  - `degree` (`varchar(150)`, Not Null)
  - `field_of_study` (`varchar(150)`, Nullable)
  - `start_date` (`date`, Not Null)
  - `end_date` (`date`, Nullable)
  - `is_current` (`boolean`, Default: `false`)
  - `created_at` (`timestamptz`, Default: `now()`)
  - `updated_at` (`timestamptz`, Default: `now()`)
- **Constraints**:
  - `chk_education_dates`: `end_date >= start_date` or `end_date IS NULL`.
- **Indexes**:
  - `idx_education_candidate` on `candidate_id`.
- **Relationships**:
  - Many-to-One with `candidates`.
- **Soft Delete**: None (record deletion cascade matches parent `candidate` profile deletion).

---

### 7.7. experience

- **Description**: Professional experience records for candidates.
- **Columns**:
  - `id` (`uuid`, Primary Key, Default: `gen_random_uuid()`)
  - `candidate_id` (`uuid`, Not Null): References `candidates(id) ON DELETE CASCADE`.
  - `company_name` (`varchar(255)`, Not Null)
  - `job_title` (`varchar(150)`, Not Null)
  - `description` (`text`, Nullable)
  - `start_date` (`date`, Not Null)
  - `end_date` (`date`, Nullable)
  - `is_current` (`boolean`, Default: `false`)
  - `created_at` (`timestamptz`, Default: `now()`)
  - `updated_at` (`timestamptz`, Default: `now()`)
- **Constraints**:
  - `chk_experience_dates`: `end_date >= start_date` or `end_date IS NULL`.
- **Indexes**:
  - `idx_experience_candidate` on `candidate_id`.
- **Relationships**:
  - Many-to-One with `candidates`.
- **Soft Delete**: None.

---

### 7.8. skills

- **Description**: Global registry of standardized candidate skills.
- **Columns**:
  - `id` (`uuid`, Primary Key, Default: `gen_random_uuid()`)
  - `name` (`varchar(100)`, Unique, Not Null)
  - `created_at` (`timestamptz`, Default: `now()`)
- **Indexes**:
  - `idx_skills_name` (Unique) on `name`.
- **Relationships**:
  - Many-to-Many with `candidates` via junction table `candidate_skills`.
  - Many-to-Many with `jobs` via junction table `job_skills`.

#### 7.8.1. candidate_skills (Junction Table)

- **Columns**:
  - `candidate_id` (`uuid`): References `candidates(id) ON DELETE CASCADE`.
  - `skill_id` (`uuid`): References `skills(id) ON DELETE CASCADE`.
  - `years_of_experience` (`integer`, Default: `0`)
- **Primary Key**: `(candidate_id, skill_id)`

#### 7.8.2. job_skills (Junction Table)

- **Columns**:
  - `job_id` (`uuid`): References `jobs(id) ON DELETE CASCADE`.
  - `skill_id` (`uuid`): References `skills(id) ON DELETE CASCADE`.
  - `is_required` (`boolean`, Default: `true`)
- **Primary Key**: `(job_id, skill_id)`

---

### 7.9. resumes

- **Description**: Stored candidate resume files and metadata.
- **Columns**:
  - `id` (`uuid`, Primary Key, Default: `gen_random_uuid()`)
  - `candidate_id` (`uuid`, Not Null): References `candidates(id) ON DELETE CASCADE`.
  - `s3_key` (`varchar(512)`, Not Null)
  - `file_name` (`varchar(255)`, Not Null)
  - `file_size` (`integer`, Not Null)
  - `mime_type` (`varchar(100)`, Not Null)
  - `parsed_text` (`text`, Nullable)
  - `created_at` (`timestamptz`, Default: `now()`)
  - `updated_at` (`timestamptz`, Default: `now()`)
  - `deleted_at` (`timestamptz`, Nullable)
- **Indexes**:
  - `idx_resumes_candidate` on `candidate_id`.
- **Relationships**:
  - Many-to-One with `candidates`.
  - One-to-Many with `applications`.
- **Soft Delete**: Sets `deleted_at = now()`.

---

### 7.10. jobs

- **Description**: Job postings managed by recruiters.
- **Columns**:
  - `id` (`uuid`, Primary Key, Default: `gen_random_uuid()`)
  - `company_id` (`uuid`, Not Null): References `companies(id) ON DELETE CASCADE`.
  - `department_id` (`uuid`, Nullable): References `departments(id) ON DELETE SET NULL`.
  - `recruiter_id` (`uuid`, Not Null): References `recruiters(id) ON DELETE RESTRICT`.
  - `title` (`varchar(255)`, Not Null)
  - `description` (`text`, Not Null)
  - `location` (`varchar(150)`, Nullable)
  - `type` (`varchar(50)`, Not Null)
  - `status` (`varchar(50)`, Not Null, Default: `'draft'`)
  - `salary_min` (`numeric(12,2)`, Nullable)
  - `salary_max` (`numeric(12,2)`, Nullable)
  - `created_at` (`timestamptz`, Default: `now()`)
  - `updated_at` (`timestamptz`, Default: `now()`)
  - `deleted_at` (`timestamptz`, Nullable)
- **Constraints**:
  - `chk_job_status`: `status` in `('draft', 'published', 'closed')`.
  - `chk_job_type`: `type` in `('full-time', 'part-time', 'contract', 'internship')`.
  - `chk_job_salary`: `salary_max >= salary_min` or `salary_max IS NULL`.
- **Indexes**:
  - `idx_jobs_company` on `company_id`.
  - `idx_jobs_department` on `department_id`.
  - `idx_jobs_status_created` on `(status, created_at)` where `deleted_at IS NULL`.
- **Relationships**:
  - Many-to-One with `companies`.
  - Many-to-One with `departments`.
  - Many-to-One with `recruiters`.
  - One-to-Many with `applications`.
- **Soft Delete**: Sets `deleted_at = now()`.

---

### 7.11. applications

- **Description**: Job application submissions and pipeline workflow tracking.
- **Columns**:
  - `id` (`uuid`, Primary Key, Default: `gen_random_uuid()`)
  - `job_id` (`uuid`, Not Null): References `jobs(id) ON DELETE RESTRICT`.
  - `candidate_id` (`uuid`, Not Null): References `candidates(id) ON DELETE RESTRICT`.
  - `resume_id` (`uuid`, Nullable): References `resumes(id) ON DELETE SET NULL`.
  - `status` (`varchar(50)`, Not Null, Default: `'applied'`)
  - `score` (`numeric(5,2)`, Nullable): AI matching score.
  - `created_at` (`timestamptz`, Default: `now()`)
  - `updated_at` (`timestamptz`, Default: `now()`)
  - `deleted_at` (`timestamptz`, Nullable)
- **Constraints**:
  - `chk_application_status`: `status` in `('applied', 'screening', 'interview', 'offered', 'rejected', 'withdrawn')`.
- **Indexes**:
  - `idx_applications_job` on `job_id`.
  - `idx_applications_candidate` on `candidate_id`.
  - `idx_applications_status` on `status`.
- **Relationships**:
  - Many-to-One with `jobs`.
  - Many-to-One with `candidates`.
  - Many-to-One with `resumes`.
  - One-to-Many with `attempts` and `interviews`.
- **Soft Delete**: Sets `deleted_at = now()`.

---

### 7.12. assessments

- **Description**: Technical challenges and quizzes created by companies.
- **Columns**:
  - `id` (`uuid`, Primary Key, Default: `gen_random_uuid()`)
  - `company_id` (`uuid`, Not Null): References `companies(id) ON DELETE CASCADE`.
  - `title` (`varchar(255)`, Not Null)
  - `description` (`text`, Nullable)
  - `duration_minutes` (`integer`, Not Null, Default: `60`)
  - `created_at` (`timestamptz`, Default: `now()`)
  - `updated_at` (`timestamptz`, Default: `now()`)
  - `deleted_at` (`timestamptz`, Nullable)
- **Indexes**:
  - `idx_assessments_company` on `company_id`.
- **Relationships**:
  - Many-to-One with `companies`.
  - One-to-Many with `questions` and `attempts`.
- **Soft Delete**: Sets `deleted_at = now()`.

---

### 7.13. questions

- **Description**: Questions linked to assessment challenges.
- **Columns**:
  - `id` (`uuid`, Primary Key, Default: `gen_random_uuid()`)
  - `assessment_id` (`uuid`, Not Null): References `assessments(id) ON DELETE CASCADE`.
  - `question_text` (`text`, Not Null)
  - `question_type` (`varchar(50)`, Not Null)
  - `correct_answer` (`text`, Nullable)
  - `points` (`integer`, Not Null, Default: `10`)
  - `created_at` (`timestamptz`, Default: `now()`)
  - `updated_at` (`timestamptz`, Default: `now()`)
- **Constraints**:
  - `chk_question_type`: `question_type` in `('multiple-choice', 'text', 'coding')`.
- **Indexes**:
  - `idx_questions_assessment` on `assessment_id`.
- **Relationships**:
  - Many-to-One with `assessments`.

---

### 7.14. attempts

- **Description**: Attempts submitted by candidates for assessments.
- **Columns**:
  - `id` (`uuid`, Primary Key, Default: `gen_random_uuid()`)
  - `assessment_id` (`uuid`, Not Null): References `assessments(id) ON DELETE RESTRICT`.
  - `application_id` (`uuid`, Not Null): References `applications(id) ON DELETE CASCADE`.
  - `candidate_id` (`uuid`, Not Null): References `candidates(id) ON DELETE RESTRICT`.
  - `score` (`numeric(5,2)`, Nullable)
  - `passed` (`boolean`, Nullable)
  - `started_at` (`timestamptz`, Default: `now()`)
  - `completed_at` (`timestamptz`, Nullable)
  - `created_at` (`timestamptz`, Default: `now()`)
  - `updated_at` (`timestamptz`, Default: `now()`)
- **Indexes**:
  - `idx_attempts_application` on `application_id`.
  - `idx_attempts_assessment` on `assessment_id`.
- **Relationships**:
  - Many-to-One with `assessments`.
  - Many-to-One with `applications`.
  - Many-to-One with `candidates`.

---

### 7.15. interviews

- **Description**: Scheduled interview slots, meeting details, and scorecards.
- **Columns**:
  - `id` (`uuid`, Primary Key, Default: `gen_random_uuid()`)
  - `application_id` (`uuid`, Not Null): References `applications(id) ON DELETE CASCADE`.
  - `recruiter_id` (`uuid`, Not Null): References `recruiters(id) ON DELETE RESTRICT`.
  - `meeting_title` (`varchar(255)`, Not Null)
  - `meeting_link` (`varchar(512)`, Nullable)
  - `start_time` (`timestamptz`, Not Null)
  - `end_time` (`timestamptz`, Not Null)
  - `score` (`integer`, Nullable): Score 1 to 5.
  - `feedback_notes` (`text`, Nullable)
  - `created_at` (`timestamptz`, Default: `now()`)
  - `updated_at` (`timestamptz`, Default: `now()`)
  - `deleted_at` (`timestamptz`, Nullable)
- **Constraints**:
  - `chk_interview_times`: `end_time > start_time`.
  - `chk_interview_score`: `score` between `1` and `5`.
- **Indexes**:
  - `idx_interviews_application` on `application_id`.
  - `idx_interviews_recruiter` on `recruiter_id`.
  - `idx_interviews_start_time` on `start_time`.
- **Relationships**:
  - Many-to-One with `applications`.
  - Many-to-One with `recruiters`.
- **Soft Delete**: Sets `deleted_at = now()`.

---

### 7.16. notifications

- **Description**: Transactional messages dispatched to users.
- **Columns**:
  - `id` (`uuid`, Primary Key, Default: `gen_random_uuid()`)
  - `user_id` (`uuid`, Not Null): References `users(id) ON DELETE CASCADE`.
  - `title` (`varchar(255)`, Not Null)
  - `message` (`text`, Not Null)
  - `channel` (`varchar(50)`, Not Null)
  - `is_read` (`boolean`, Default: `false`)
  - `sent_at` (`timestamptz`, Default: `now()`)
  - `created_at` (`timestamptz`, Default: `now()`)
- **Constraints**:
  - `chk_notification_channel`: `channel` in `('email', 'sms', 'in-app')`.
- **Indexes**:
  - `idx_notifications_user_unread` on `user_id` where `is_read = false`.
- **Relationships**:
  - Many-to-One with `users`.

---

### 7.17. audit_logs

- **Description**: Read-only tracking table capturing core platform mutations.
- **Columns**:
  - `id` (`uuid`, Primary Key, Default: `gen_random_uuid()`)
  - `user_id` (`uuid`, Nullable): References `users(id) ON DELETE SET NULL`.
  - `action` (`varchar(100)`, Not Null): E.g., `application.stage_changed`.
  - `entity_name` (`varchar(100)`, Not Null)
  - `entity_id` (`uuid`, Not Null)
  - `old_values` (`jsonb`, Nullable)
  - `new_values` (`jsonb`, Nullable)
  - `ip_address` (`varchar(45)`, Nullable)
  - `created_at` (`timestamptz`, Default: `now()`)
- **Indexes**:
  - `idx_audit_logs_user` on `user_id`.
  - `idx_audit_logs_entity` on `(entity_name, entity_id)`.
  - `idx_audit_logs_created` on `created_at` DESC.
- **Relationships**:
  - Many-to-One with `users`.
