-- ─────────────────────────────────────────────────────────────────────────────
-- Smart Hire — Database Migration (Add Per-Stage Score Columns)
-- ─────────────────────────────────────────────────────────────────────────────
-- Adds dedicated score columns for each pipeline stage so scores persist
-- independently and are not overwritten when candidates move between stages.

-- 1. Add per-stage score columns
ALTER TABLE application.applications
  ADD COLUMN IF NOT EXISTS screening_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS mcq_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS mcq_total numeric(5,2),
  ADD COLUMN IF NOT EXISTS mcq_passed boolean,
  ADD COLUMN IF NOT EXISTS coding_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS coding_total numeric(5,2),
  ADD COLUMN IF NOT EXISTS coding_passed boolean,
  ADD COLUMN IF NOT EXISTS interview_avg_score numeric(3,1),
  ADD COLUMN IF NOT EXISTS interview_recommendation varchar(50);

-- 2. Fix the application status CHECK constraint to include 'mcq' and 'coding'
-- The frontend code and Zod schema already use these values, but the DB
-- constraint was missing them.
ALTER TABLE application.applications DROP CONSTRAINT IF EXISTS chk_application_status;
ALTER TABLE application.applications ADD CONSTRAINT chk_application_status
  CHECK (status IN ('applied', 'screening', 'mcq', 'coding', 'interview', 'offered', 'rejected', 'withdrawn'));
