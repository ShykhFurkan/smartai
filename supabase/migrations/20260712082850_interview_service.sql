-- ─────────────────────────────────────────────────────────────────────────────
-- Smart Hire — Database Migration (Interview Service)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create interviews table
CREATE TABLE IF NOT EXISTS interview.interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES application.applications(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES organization.companies(id) ON DELETE CASCADE,
  meeting_title varchar(255) NOT NULL,
  reference_number varchar(100) UNIQUE NOT NULL,
  type varchar(50) NOT NULL CHECK (type IN ('HR', 'Technical', 'Coding', 'System Design', 'Behavioral', 'Managerial', 'Final Round', 'Custom')),
  round_number integer DEFAULT 1 CHECK (round_number >= 1),
  status varchar(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'rescheduled', 'in-progress', 'completed', 'cancelled', 'no-show', 'rejected')),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  timezone varchar(100) NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  instructions text,
  meeting_provider_type varchar(50) DEFAULT 'google_meet' CHECK (meeting_provider_type IN ('google_meet', 'zoom', 'msteams')),
  meeting_link varchar(512),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT chk_interview_times CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_interviews_application ON interview.interviews(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_company ON interview.interviews(company_id);
CREATE INDEX IF NOT EXISTS idx_interviews_start_time ON interview.interviews(start_time);
CREATE INDEX IF NOT EXISTS idx_interviews_reference ON interview.interviews(reference_number);

CREATE TRIGGER update_interviews_timestamp
  BEFORE UPDATE ON interview.interviews
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- 2. Create availability slots table
CREATE TABLE IF NOT EXISTS interview.availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES organization.recruiters(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES organization.companies(id) ON DELETE CASCADE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_booked boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT chk_slot_times CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_availability_recruiter ON interview.availability_slots(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_availability_times ON interview.availability_slots(start_time, end_time);

CREATE TRIGGER update_availability_timestamp
  BEFORE UPDATE ON interview.availability_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- 3. Create interviewers panel table
CREATE TABLE IF NOT EXISTS interview.interviewers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES interview.interviews(id) ON DELETE CASCADE,
  recruiter_id uuid NOT NULL REFERENCES organization.recruiters(id) ON DELETE CASCADE,
  role varchar(50) DEFAULT 'interviewer',
  status varchar(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'declined')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT uniq_interview_recruiter UNIQUE (interview_id, recruiter_id)
);

CREATE INDEX IF NOT EXISTS idx_interviewers_interview ON interview.interviewers(interview_id);
CREATE INDEX IF NOT EXISTS idx_interviewers_recruiter ON interview.interviewers(recruiter_id);

CREATE TRIGGER update_interviewers_timestamp
  BEFORE UPDATE ON interview.interviewers
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- 4. Create scorecards table
CREATE TABLE IF NOT EXISTS interview.scorecards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES interview.interviews(id) ON DELETE CASCADE,
  interviewer_id uuid NOT NULL REFERENCES interview.interviewers(id) ON DELETE CASCADE,
  recruiter_id uuid NOT NULL REFERENCES organization.recruiters(id) ON DELETE CASCADE,
  technical_score integer CHECK (technical_score >= 1 AND technical_score <= 5),
  communication_score integer CHECK (communication_score >= 1 AND communication_score <= 5),
  problem_solving_score integer CHECK (problem_solving_score >= 1 AND problem_solving_score <= 5),
  culture_fit_score integer CHECK (culture_fit_score >= 1 AND culture_fit_score <= 5),
  confidence_level integer CHECK (confidence_level >= 1 AND confidence_level <= 5),
  strengths text,
  weaknesses text,
  notes text,
  recommendation varchar(50) NOT NULL CHECK (recommendation IN ('strong_hire', 'hire', 'neutral', 'no_hire', 'strong_no_hire')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT uniq_scorecard_interviewer UNIQUE (interview_id, interviewer_id)
);

CREATE INDEX IF NOT EXISTS idx_scorecards_interview ON interview.scorecards(interview_id);

CREATE TRIGGER update_scorecards_timestamp
  BEFORE UPDATE ON interview.scorecards
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- 5. Create interview events table for auditing
CREATE TABLE IF NOT EXISTS interview.interview_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id uuid NOT NULL REFERENCES interview.interviews(id) ON DELETE CASCADE,
  event_type varchar(100) NOT NULL,
  payload jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interview_events_interview ON interview.interview_events(interview_id);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE interview.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview.interviewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview.scorecards ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview.interview_events ENABLE ROW LEVEL SECURITY;

-- 7. Policies
-- Interviews
CREATE POLICY interviews_recruiter_all ON interview.interviews
  FOR ALL TO authenticated USING (company_id = auth.get_user_company_id());

CREATE POLICY interviews_candidate_read ON interview.interviews
  FOR SELECT TO authenticated USING (
    application_id IN (
      SELECT id FROM application.applications WHERE candidate_id IN (
        SELECT id FROM candidate.candidates WHERE user_id = auth.uid()
      )
    )
  );

-- Availability Slots
CREATE POLICY availability_recruiter_all ON interview.availability_slots
  FOR ALL TO authenticated USING (company_id = auth.get_user_company_id());

CREATE POLICY availability_candidate_read ON interview.availability_slots
  FOR SELECT TO authenticated USING (true); -- Candidates need to view open slots for booking

-- Interviewers
CREATE POLICY interviewers_recruiter_all ON interview.interviewers
  FOR ALL TO authenticated USING (
    interview_id IN (
      SELECT id FROM interview.interviews WHERE company_id = auth.get_user_company_id()
    )
  );

-- Scorecards
CREATE POLICY scorecards_recruiter_all ON interview.scorecards
  FOR ALL TO authenticated USING (
    interview_id IN (
      SELECT id FROM interview.interviews WHERE company_id = auth.get_user_company_id()
    )
  );

-- Events
CREATE POLICY events_recruiter_all ON interview.interview_events
  FOR ALL TO authenticated USING (
    interview_id IN (
      SELECT id FROM interview.interviews WHERE company_id = auth.get_user_company_id()
    )
  );
