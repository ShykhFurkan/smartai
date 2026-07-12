# Supabase Configuration & Integration Guide

This document outlines the architectural setup, schema separation, storage rules, Row Level Security (RLS) policies, Realtime, and Edge Functions strategy for **Smart Hire** on Supabase.

---

## 1. Multi-Schema Database Strategy

To preserve microservice boundary isolation inside a single Supabase PostgreSQL database, tables are organized across distinct **Postgres Schemas**. By separating tables logically rather than using the default `public` schema, we ensure modularity.

```sql
-- Schema Declarations
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS organization;
CREATE SCHEMA IF NOT EXISTS candidate;
CREATE SCHEMA IF NOT EXISTS job;
CREATE SCHEMA IF NOT EXISTS application;
CREATE SCHEMA IF NOT EXISTS assessment;
CREATE SCHEMA IF NOT EXISTS interview;
CREATE SCHEMA IF NOT EXISTS notification;
CREATE SCHEMA IF NOT EXISTS analytics;
```

---

## 2. Authentication & User Sync Strategy

Smart Hire relies on Supabase Auth for token issuance (JWT), session handling, and OAuth provider handshakes (e.g. Google and Microsoft Azure AD).

### 2.1. User Metadata Replication Trigger

To link Supabase Auth accounts to the application domain, a security-definer trigger automatically replicates new signups from the protected `auth.users` table into our custom `identity.users` table.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO identity.users (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'candidate')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 3. Storage Buckets Configuration

We define two storage buckets in Supabase Storage with strict isolation scopes:

| Bucket Name          | Access Scope | Allowed File Types      | Max File Size | Purpose                                                                                                                        |
| :------------------- | :----------- | :---------------------- | :------------ | :----------------------------------------------------------------------------------------------------------------------------- |
| **`resumes`**        | **Private**  | `.pdf`, `.docx`, `.txt` | `10MB`        | Holds candidate resumes. Only candidate owners or recruiters evaluating application details can generate signed download URLs. |
| **`company-assets`** | **Public**   | `.png`, `.jpg`, `.jpeg` | `5MB`         | Holds company logos, avatars, and branding materials. Readable publicly by anyone, writeable only by workspace admins.         |

---

## 4. Row Level Security (RLS) & Policies

**Row Level Security (RLS)** is enabled globally across all custom schemas. No query can read or write data unless it satisfies an explicit SQL Policy.

### 4.1. Security Helper Functions

We define lightweight SQL helper functions to inspect user attributes from JWT claims or db queries without duplicating rules:

- **`auth.get_user_role()`**: Returns the role of the current authenticated user (`'admin'`, `'recruiter'`, `'candidate'`).
- **`auth.get_user_company_id()`**: Returns the active `company_id` linked to the recruiter user.

### 4.2. Schema Policies Mapping

#### public.companies

- **Read**: Allow public read access (`true`).
- **Write/Update**: Restricted to recruiters with admin privilege:
  ```sql
  auth.uid() IN (
    SELECT user_id FROM organization.recruiters
    WHERE company_id = id AND role = 'owner'
  )
  ```

#### job.jobs

- **Read**: Allow public read if status is `'published'`. Allow read to any recruiter belonging to the owner company:
  ```sql
  status = 'published' OR company_id = auth.get_user_company_id()
  ```
- **Insert/Update**: Restricted to recruiters of the owning company:
  ```sql
  company_id = auth.get_user_company_id()
  ```

#### application.applications

- **Read/Insert**: Candidates can read and write only their own applications:
  ```sql
  candidate_id IN (
    SELECT id FROM candidate.candidates WHERE user_id = auth.uid()
  )
  ```
- **Update (Stage/Status)**: Restricted to recruiters belonging to the company hosting the job:
  ```sql
  job_id IN (
    SELECT id FROM job.jobs WHERE company_id = auth.get_user_company_id()
  )
  ```

---

## 5. Realtime Channel Strategy

Supabase Realtime (using WebSockets) is enabled selectively to prevent performance bottlenecks.

- **Realtime Enabled**:
  - **`application.applications`**: Broadcasts application stage transitions (supports hot dashboard board updates).
  - **`interview.interviews`**: Syncs calendar scheduling and meeting slots.
  - **`notification.notifications`**: Dispatches instant in-app alerts directly to screens.
- **Realtime Disabled**:
  - `identity.users`, `analytics.audit_logs`, and assessment configurations.

---

## 6. Edge Functions Strategy

Serverless Deno tasks are used for external processing, integrations, or calculations requiring high privilege.

1. **`parse-resume`** (Triggered via Webhook on storage bucket uploads):
   - Initiates OCR/parsing workers.
   - Extracts structured details and populates Candidate attributes under security role permissions (`service_role` bypassing RLS).
2. **`assess-match`** (Triggered when an application is submitted):
   - Passes job parameters and Candidate JSON profiles to the AI matching service.
   - Calculates the match score and saves the score to `application.applications`.
3. **`sync-calendar`** (Triggered on interview scheduler changes):
   - Interacts with Google/Outlook APIs to schedule meeting links.
   - Saves coordinates into `interview.interviews`.
