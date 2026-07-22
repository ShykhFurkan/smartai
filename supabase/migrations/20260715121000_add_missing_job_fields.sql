-- ─────────────────────────────────────────────────────────────────────────────
-- Smart Hire — Database Migration (Add missing job fields)
-- ─────────────────────────────────────────────────────────────────────────────
-- Add experience_level, category, and benefits columns to job.jobs

ALTER TABLE job.jobs
  ADD COLUMN IF NOT EXISTS experience_level varchar(50) DEFAULT 'mid',
  ADD COLUMN IF NOT EXISTS category varchar(100),
  ADD COLUMN IF NOT EXISTS benefits jsonb DEFAULT '[]'::jsonb;
