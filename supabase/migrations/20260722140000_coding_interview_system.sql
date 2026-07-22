-- ─────────────────────────────────────────────────────────────────────────────
-- Smart Hire — Database Migration (Coding Interview System)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add coding_scheduled_start_at and coding_assessment_id columns to job.jobs
ALTER TABLE job.jobs
  ADD COLUMN IF NOT EXISTS coding_scheduled_start_at timestamptz,
  ADD COLUMN IF NOT EXISTS coding_assessment_id uuid REFERENCES assessment.assessments(id) ON DELETE SET NULL;

-- 2. Expand assessment.attempts to store 10-point scoring breakdown and terminal logs
ALTER TABLE assessment.attempts
  ADD COLUMN IF NOT EXISTS correctness_score numeric(4,2),
  ADD COLUMN IF NOT EXISTS code_quality_score numeric(4,2),
  ADD COLUMN IF NOT EXISTS time_score numeric(4,2),
  ADD COLUMN IF NOT EXISTS terminal_logs jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS code_submissions jsonb DEFAULT '{}'::jsonb;

-- 3. Index for coding scheduled start
CREATE INDEX IF NOT EXISTS idx_jobs_coding_scheduled ON job.jobs(coding_scheduled_start_at);
