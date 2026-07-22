-- ─────────────────────────────────────────────────────────────────────────────
-- Smart Hire — Database Migration (Add Assessment Links to Jobs)
-- ─────────────────────────────────────────────────────────────────────────────
-- Add optional MCQ and Coding assessment template links to job postings

ALTER TABLE job.jobs
  ADD COLUMN IF NOT EXISTS mcq_assessment_id uuid REFERENCES assessment.assessments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS coding_assessment_id uuid REFERENCES assessment.assessments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_jobs_mcq_assessment ON job.jobs(mcq_assessment_id);
CREATE INDEX IF NOT EXISTS idx_jobs_coding_assessment ON job.jobs(coding_assessment_id);
