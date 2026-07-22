# Database Setup & Migrations Guide

This guide describes how to run and manage the database migrations, schemas, Row Level Security (RLS) policies, and seed data for **Smart Hire** using the Supabase CLI.

---

## 1. Prerequisites

Before running the commands below, make sure you have the following installed on your machine:

1. **Docker Desktop**: Required to run the local Supabase containers.
2. **Node.js & pnpm**: To run the project-wide package scripts.

---

## 2. Configuration Files

The database layer is configured via the following files:
*   [supabase/config.toml](file:///c:/Users/Furkan/Desktop/smart%20hire/supabase/config.toml): Exposes all 9 custom schemas, sets up token/JWT timings, and configures storage.
*   [supabase/migrations/20260712080323_init_schemas.sql](file:///c:/Users/Furkan/Desktop/smart%20hire/supabase/migrations/20260712080323_init_schemas.sql): Sets up schemas, tables, references, RLS, functions, triggers, storage, and realtime.
*   [supabase/seed.sql](file:///c:/Users/Furkan/Desktop/smart%20hire/supabase/seed.sql): Generates auth users (platform admin, recruiter, candidate) and business records.

---

## 3. Workflow Commands

We have mapped several helper scripts in the root `package.json` to simplify database management:

### 3.1. Start Local Database
Launches the local Docker containers (Database, Auth, Studio, Storage, SMTP, Realtime):
```bash
pnpm db:start
```
Once started, you can access the local Supabase Studio dashboard at:
👉 **[http://localhost:54323](http://localhost:54323)**

### 3.2. Stop Local Database
Stops all running Supabase containers without losing your local database state:
```bash
pnpm db:stop
```

### 3.3. Reset Database & Seeds
Re-runs all migrations from scratch and applies the mock seed data. This is useful during development to reset state:
```bash
pnpm db:reset
```

### 3.4. Push Migrations
Applies local migration files to your remote Supabase staging or production database:
```bash
pnpm db:migrate
```

---

## 4. Seed User Accounts

The [supabase/seed.sql](file:///c:/Users/Furkan/Desktop/smart%20hire/supabase/seed.sql) file populates the database with the following demo credentials (password is `password123` for all):

| Role | Email | User ID | Business Mapping |
|---|---|---|---|
| **Platform Admin** | `admin@smarthire.ai` | `00000000-0000-0000-0000-000000000001` | Mapped to `identity.users` |
| **Demo Recruiter** | `recruiter@acme.com` | `00000000-0000-0000-0000-000000000002` | Member/Owner of Acme Corp |
| **Demo Candidate** | `candidate@smarthire.ai` | `00000000-0000-0000-0000-000000000003` | Linked to profile, education, and experience |

---

## 5. Local Connection Details

When the local Supabase instance is running, connect using these details:

- **PostgreSQL Connection String**:
  ```text
  postgresql://postgres:postgres@localhost:54322/postgres
  ```
- **Studio Interface**: `http://localhost:54323`
- **In-Blue Email Testing (Local SMTP)**: `http://localhost:54324`
- **API URL**: `http://localhost:54321`
- **API Anon Key**: Found in `supabase/config.toml` or terminal output on start.
