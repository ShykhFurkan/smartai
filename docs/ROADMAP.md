# Project Roadmap - Smart Hire

This roadmap outlines the phases of development for the **Smart Hire** recruitment platform.

---

## Roadmap Overview

```
Phase 1 (Done)     Phase 2            Phase 3            Phase 4            Phase 5
 Foundation  ───► Ingestion  ───► Job Portal  ───► AI Scoring  ───► Integration
  Monorepo,        Resume PDF       Creation,       Semantic Fit,       Calendar,
  Docker Dev        Parsing       Public Board      Bias Filtering      Analytics
```

---

## Detailed Phases

### Phase 1: Workspace Foundation (Completed)

Establish the monorepo structure and ensure standard developer workflows are enforced.

- [x] Configure Turborepo pipelines and pnpm workspaces.
- [x] Integrate shared `packages/config` containing base ESLint v9 Flat configs and TSConfigs.
- [x] Create Next.js 15 App Router web project.
- [x] Implement shared packages: `@smarthire/ui`, `@smarthire/utils`, `@smarthire/logger`, and `@smarthire/types`.
- [x] Set up Husky pre-commit hooks and lint-staged automation.
- [x] Write local Docker development compose environments.

---

### Phase 2: Resume Ingestion & Parsing (Target: Q3 2026)

Focus on applicant file ingestion, secure cloud storage, and structured text extraction.

- **Milestones**:
  - Ingest raw `.pdf` and `.docx` documents securely.
  - Parse and structure applicant history into standardized JSON formats.
- **Core Tasks**:
  - **S3 Storage Setup**: Configure MinIO for local development and AWS S3 buckets for staging/production storage.
  - **Resume Parsing Worker**: Conceptually introduce a service mapping Python or Node-based text extractors to candidates files.
  - **Types Expansion**: Expand `@smarthire/types` to model work experience records, skill lists, and parsed resume outputs.

---

### Phase 3: Sourcing & Job Portal (Target: Q4 2026)

Construct the entry point for job listings and recruiter management interfaces.

- **Milestones**:
  - Create and manage jobs listings.
  - Search public listings boards.
- **Core Tasks**:
  - **Job Posting Module**: Construct CRUD APIs for jobs creation with custom recruitment pipeline stages.
  - **UI Package Expansion**: Add form controls, search bars, and dropdown filters to `@smarthire/ui`.
  - **Public Pages**: Develop public job lists and application landing pages under `apps/web`.

---

### Phase 4: AI Matching & Screening (Target: Q1 2027)

Integrate semantic screening models to automate evaluation workflows.

- **Milestones**:
  - Generate candidate match scores based on resume-to-job descriptions.
  - Review resumes in anonymized modes.
- **Core Tasks**:
  - **LLM/Embeddings Service**: Interface with LLMs to evaluate candidate resume text against job postings.
  - **Scoring Pipeline**: Implement background processing workers to calculate match scores and record detailed reasoning.
  - **Bias Mitigation Toggle**: Implement interface filters in `apps/web` to hide demographic metadata from recruiter screens.

---

### Phase 5: Unified Scheduling & Integrations (Target: Q2 2027)

Close the loop by automating interviews coordination and analytics dashboarding.

- **Milestones**:
  - Sync calendars and schedule interviews directly.
  - Track metrics (e.g. application volume, interview success rates).
- **Core Tasks**:
  - **OAuth Calendar Sync**: Implement Google Calendar and Microsoft Graph Outlook integration.
  - **Self-Booking System**: Candidate portal that presents slots matching recruiter availability.
  - **Analytics Engine**: Establish dashboards aggregating time-to-hire, drop-off rates, and sourcing channels performance.
