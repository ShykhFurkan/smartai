-- ─────────────────────────────────────────────────────────────────────────────
-- Smart Hire — Database Migration (Assessment Service Expansion)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Alter assessments table to add status, passing percentage, and ownership
ALTER TABLE assessment.assessments 
  ADD COLUMN IF NOT EXISTS status varchar(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  ADD COLUMN IF NOT EXISTS passing_percentage integer DEFAULT 60 CHECK (passing_percentage >= 0 AND passing_percentage <= 100),
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES identity.users(id) ON DELETE SET NULL;

-- 2. Expand questions table with options, difficulty, category, and section
-- First, drop the old question type constraint
ALTER TABLE assessment.questions DROP CONSTRAINT IF EXISTS chk_question_type;

-- Re-apply expanded question type constraint and new columns
ALTER TABLE assessment.questions
  ADD COLUMN IF NOT EXISTS options jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS difficulty varchar(50) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  ADD COLUMN IF NOT EXISTS category varchar(100) DEFAULT 'custom' CHECK (category IN ('programming', 'aptitude', 'logical-reasoning', 'english', 'custom')),
  ADD COLUMN IF NOT EXISTS section varchar(150),
  ADD CONSTRAINT chk_question_type CHECK (question_type IN ('mcq', 'multiple-select', 'true-false', 'short-answer', 'coding', 'file-upload'));

-- 3. Create assessment assignments table
CREATE TABLE IF NOT EXISTS assessment.assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessment.assessments(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES organization.companies(id) ON DELETE CASCADE,
  application_id uuid REFERENCES application.applications(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES candidate.candidates(id) ON DELETE CASCADE,
  expires_at timestamptz,
  attempt_limit integer DEFAULT 1 CHECK (attempt_limit >= 1),
  attempts_count integer DEFAULT 0 CHECK (attempts_count >= 0),
  status varchar(50) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in-progress', 'completed', 'expired')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assignments_assessment ON assessment.assignments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assignments_candidate ON assessment.assignments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_assignments_company ON assessment.assignments(company_id);

CREATE TRIGGER update_assignments_timestamp
  BEFORE UPDATE ON assessment.assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- 4. Expand attempts table to link to assignments, and hold response states
ALTER TABLE assessment.attempts DROP CONSTRAINT IF EXISTS attempts_assessment_id_fkey;
ALTER TABLE assessment.attempts
  ADD COLUMN IF NOT EXISTS assignment_id uuid REFERENCES assessment.assignments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS answers jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS time_spent_seconds integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status varchar(50) DEFAULT 'started' CHECK (status IN ('started', 'in-progress', 'completed', 'timed-out')),
  ADD COLUMN IF NOT EXISTS section_scores jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS grading_results jsonb DEFAULT '{}'::jsonb;

-- 5. Enable RLS and Policies for assignments
ALTER TABLE assessment.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY assignments_recruiter_all ON assessment.assignments
  FOR ALL TO authenticated USING (company_id = auth.get_user_company_id());

CREATE POLICY assignments_candidate_read ON assessment.assignments
  FOR SELECT TO authenticated USING (candidate_id IN (
    SELECT id FROM candidate.candidates WHERE user_id = auth.uid()
  ));
