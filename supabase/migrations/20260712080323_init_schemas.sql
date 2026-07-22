-- ─────────────────────────────────────────────────────────────────────────────
-- Smart Hire — Database Migration (Initial Schemas Setup)
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Schema Declarations
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS organization;
CREATE SCHEMA IF NOT EXISTS candidate;
CREATE SCHEMA IF NOT EXISTS job;
CREATE SCHEMA IF NOT EXISTS application;
CREATE SCHEMA IF NOT EXISTS assessment;
CREATE SCHEMA IF NOT EXISTS interview;
CREATE SCHEMA IF NOT EXISTS notification;
CREATE SCHEMA IF NOT EXISTS analytics;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Common Utility Trigger Functions
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_timestamp_column()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Security Helper Functions
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS text AS $$
DECLARE
  r text;
BEGIN
  -- Try extracting from JWT user metadata claim first
  r := coalesce(
    current_setting('request.jwt.claims', true)::json->'user_metadata'->>'role',
    current_setting('request.jwt.claims', true)::json->'app_metadata'->>'role'
  );
  IF r IS NULL OR r = '' THEN
    -- Fallback database query
    SELECT role INTO r FROM identity.users WHERE id = auth.uid() AND deleted_at IS NULL;
  END IF;
  RETURN coalesce(r, 'candidate');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.get_user_company_id()
RETURNS uuid AS $$
DECLARE
  c_id uuid;
BEGIN
  SELECT company_id INTO c_id FROM organization.recruiters WHERE user_id = auth.uid() AND deleted_at IS NULL LIMIT 1;
  RETURN c_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Identity Bounded Context Tables
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE identity.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email varchar(255) NOT NULL,
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  role varchar(30) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT chk_user_role CHECK (role IN ('platform-admin', 'company-admin', 'recruiter', 'candidate')),
  CONSTRAINT chk_user_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE UNIQUE INDEX idx_users_email ON identity.users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON identity.users(role);

-- Create trigger function to sync new signups automatically
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

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger update_timestamp for users
CREATE TRIGGER update_users_timestamp
  BEFORE UPDATE ON identity.users
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Organization Bounded Context Tables
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE organization.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  slug varchar(255) NOT NULL,
  domain varchar(255),
  logo_url varchar(512),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX idx_companies_slug ON organization.companies(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_domain ON organization.companies(domain);

CREATE TRIGGER update_companies_timestamp
  BEFORE UPDATE ON organization.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- Departments
CREATE TABLE organization.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES organization.companies(id) ON DELETE CASCADE,
  name varchar(150) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX uniq_company_dept_name ON organization.departments(company_id, name) WHERE deleted_at IS NULL;
CREATE INDEX idx_departments_company ON organization.departments(company_id);

CREATE TRIGGER update_departments_timestamp
  BEFORE UPDATE ON organization.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- Recruiters memberships
CREATE TABLE organization.recruiters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES organization.companies(id) ON DELETE CASCADE,
  role varchar(50) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT chk_recruiter_role CHECK (role IN ('owner', 'recruiter', 'hiring_manager'))
);

CREATE UNIQUE INDEX uniq_user_company ON organization.recruiters(user_id, company_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_recruiters_user ON organization.recruiters(user_id);
CREATE INDEX idx_recruiters_company ON organization.recruiters(company_id);

CREATE TRIGGER update_recruiters_timestamp
  BEFORE UPDATE ON organization.recruiters
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- Recruiter invitations
CREATE TABLE organization.recruiter_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES organization.companies(id) ON DELETE CASCADE,
  email varchar(255) NOT NULL,
  role varchar(50) NOT NULL,
  token uuid NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'pending',
  invited_by uuid REFERENCES identity.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_recruiter_invitations_token ON organization.recruiter_invitations(token);
CREATE INDEX idx_recruiter_invitations_email ON organization.recruiter_invitations(email);

CREATE TRIGGER update_recruiter_invitations_timestamp
  BEFORE UPDATE ON organization.recruiter_invitations
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Candidate Bounded Context Tables
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE candidate.candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES identity.users(id) ON DELETE SET NULL,
  email varchar(255) NOT NULL,
  phone varchar(50),
  first_name varchar(100) NOT NULL,
  last_name varchar(100) NOT NULL,
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE UNIQUE INDEX idx_candidates_user ON candidate.candidates(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_candidates_email ON candidate.candidates(email) WHERE deleted_at IS NULL;

CREATE TRIGGER update_candidates_timestamp
  BEFORE UPDATE ON candidate.candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- Education
CREATE TABLE candidate.education (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidate.candidates(id) ON DELETE CASCADE,
  institution varchar(255) NOT NULL,
  degree varchar(150) NOT NULL,
  field_of_study varchar(150),
  start_date date NOT NULL,
  end_date date,
  is_current boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT chk_education_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_education_candidate ON candidate.education(candidate_id);

CREATE TRIGGER update_education_timestamp
  BEFORE UPDATE ON candidate.education
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- Experience
CREATE TABLE candidate.experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidate.candidates(id) ON DELETE CASCADE,
  company_name varchar(255) NOT NULL,
  job_title varchar(150) NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date,
  is_current boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT chk_experience_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_experience_candidate ON candidate.experience(candidate_id);

CREATE TRIGGER update_experience_timestamp
  BEFORE UPDATE ON candidate.experience
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- Projects
CREATE TABLE candidate.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidate.candidates(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  description text,
  url varchar(512),
  start_date date NOT NULL,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_projects_candidate ON candidate.projects(candidate_id);

CREATE TRIGGER update_projects_timestamp
  BEFORE UPDATE ON candidate.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- Certificates
CREATE TABLE candidate.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidate.candidates(id) ON DELETE CASCADE,
  name varchar(255) NOT NULL,
  issuer varchar(255) NOT NULL,
  issue_date date NOT NULL,
  expiry_date date,
  credential_id varchar(150),
  credential_url varchar(512),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_certificates_candidate ON candidate.certificates(candidate_id);

CREATE TRIGGER update_certificates_timestamp
  BEFORE UPDATE ON candidate.certificates
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- Social links
CREATE TABLE candidate.social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidate.candidates(id) ON DELETE CASCADE,
  platform varchar(100) NOT NULL,
  url varchar(512) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_social_links_candidate ON candidate.social_links(candidate_id);

CREATE TRIGGER update_social_links_timestamp
  BEFORE UPDATE ON candidate.social_links
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- Skills
CREATE TABLE candidate.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX idx_skills_name ON candidate.skills(name);

-- Candidate Skills Junction Table
CREATE TABLE candidate.candidate_skills (
  candidate_id uuid REFERENCES candidate.candidates(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES candidate.skills(id) ON DELETE CASCADE,
  years_of_experience integer DEFAULT 0,
  PRIMARY KEY (candidate_id, skill_id)
);

CREATE INDEX idx_candidate_skills_candidate ON candidate.candidate_skills(candidate_id);
CREATE INDEX idx_candidate_skills_skill ON candidate.candidate_skills(skill_id);

-- Resumes
CREATE TABLE candidate.resumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES candidate.candidates(id) ON DELETE CASCADE,
  s3_key varchar(512) NOT NULL,
  file_name varchar(255) NOT NULL,
  file_size integer NOT NULL,
  mime_type varchar(100) NOT NULL,
  parsed_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_resumes_candidate ON candidate.resumes(candidate_id);

CREATE TRIGGER update_resumes_timestamp
  BEFORE UPDATE ON candidate.resumes
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Job Bounded Context Tables
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE job.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES organization.companies(id) ON DELETE CASCADE,
  department_id uuid REFERENCES organization.departments(id) ON DELETE SET NULL,
  recruiter_id uuid NOT NULL REFERENCES organization.recruiters(id) ON DELETE RESTRICT,
  title varchar(255) NOT NULL,
  description text NOT NULL,
  location varchar(150),
  type varchar(50) NOT NULL,
  status varchar(50) NOT NULL DEFAULT 'draft',
  salary_min numeric(12,2),
  salary_max numeric(12,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT chk_job_status CHECK (status IN ('draft', 'published', 'closed')),
  CONSTRAINT chk_job_type CHECK (type IN ('full-time', 'part-time', 'contract', 'internship')),
  CONSTRAINT chk_job_salary CHECK (salary_max IS NULL OR salary_max >= salary_min)
);

CREATE INDEX idx_jobs_company ON job.jobs(company_id);
CREATE INDEX idx_jobs_department ON job.jobs(department_id);
CREATE INDEX idx_jobs_status_created ON job.jobs(status, created_at) WHERE deleted_at IS NULL;

CREATE TRIGGER update_jobs_timestamp
  BEFORE UPDATE ON job.jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- Job Skills Junction Table
CREATE TABLE job.job_skills (
  job_id uuid REFERENCES job.jobs(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES candidate.skills(id) ON DELETE CASCADE,
  is_required boolean DEFAULT true,
  PRIMARY KEY (job_id, skill_id)
);

CREATE INDEX idx_job_skills_job ON job.job_skills(job_id);
CREATE INDEX idx_job_skills_skill ON job.job_skills(skill_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Application Bounded Context Tables
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE application.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES job.jobs(id) ON DELETE RESTRICT,
  candidate_id uuid NOT NULL REFERENCES candidate.candidates(id) ON DELETE RESTRICT,
  resume_id uuid REFERENCES candidate.resumes(id) ON DELETE SET NULL,
  status varchar(50) NOT NULL DEFAULT 'applied',
  score numeric(5,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT chk_application_status CHECK (status IN ('applied', 'screening', 'interview', 'offered', 'rejected', 'withdrawn'))
);

CREATE INDEX idx_applications_job ON application.applications(job_id);
CREATE INDEX idx_applications_candidate ON application.applications(candidate_id);
CREATE INDEX idx_applications_status ON application.applications(status);

CREATE TRIGGER update_applications_timestamp
  BEFORE UPDATE ON application.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- Application status history logs
CREATE TABLE application.application_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES application.applications(id) ON DELETE CASCADE,
  from_status varchar(50) NOT NULL,
  to_status varchar(50) NOT NULL,
  notes text,
  changed_by uuid REFERENCES identity.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_application_status_history_application ON application.application_status_history(application_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Assessment Bounded Context Tables
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE assessment.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES organization.companies(id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  description text,
  duration_minutes integer NOT NULL DEFAULT 60,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_assessments_company ON assessment.assessments(company_id);

CREATE TRIGGER update_assessments_timestamp
  BEFORE UPDATE ON assessment.assessments
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- Questions
CREATE TABLE assessment.questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessment.assessments(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type varchar(50) NOT NULL,
  correct_answer text,
  points integer NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT chk_question_type CHECK (question_type IN ('multiple-choice', 'text', 'coding'))
);

CREATE INDEX idx_questions_assessment ON assessment.questions(assessment_id);

CREATE TRIGGER update_questions_timestamp
  BEFORE UPDATE ON assessment.questions
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- Attempts
CREATE TABLE assessment.attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES assessment.assessments(id) ON DELETE RESTRICT,
  application_id uuid NOT NULL REFERENCES application.applications(id) ON DELETE CASCADE,
  candidate_id uuid NOT NULL REFERENCES candidate.candidates(id) ON DELETE RESTRICT,
  score numeric(5,2),
  passed boolean,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_attempts_application ON assessment.attempts(application_id);
CREATE INDEX idx_attempts_assessment ON assessment.attempts(assessment_id);

CREATE TRIGGER update_attempts_timestamp
  BEFORE UPDATE ON assessment.attempts
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Interview Bounded Context Tables
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE interview.interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES application.applications(id) ON DELETE CASCADE,
  recruiter_id uuid NOT NULL REFERENCES organization.recruiters(id) ON DELETE RESTRICT,
  meeting_title varchar(255) NOT NULL,
  meeting_link varchar(512),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  score integer,
  feedback_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz,
  CONSTRAINT chk_interview_times CHECK (end_time > start_time),
  CONSTRAINT chk_interview_score CHECK (score IS NULL OR (score >= 1 AND score <= 5))
);

CREATE INDEX idx_interviews_application ON interview.interviews(application_id);
CREATE INDEX idx_interviews_recruiter ON interview.interviews(recruiter_id);
CREATE INDEX idx_interviews_start_time ON interview.interviews(start_time);

CREATE TRIGGER update_interviews_timestamp
  BEFORE UPDATE ON interview.interviews
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 11. Notification Bounded Context Tables
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE notification.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  type varchar(100) NOT NULL,
  subject varchar(255) NOT NULL,
  body text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  idempotency_key varchar(255),
  is_read boolean DEFAULT false,
  read_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_notifications_user_unread ON notification.notifications(user_id) WHERE is_read = false;

CREATE TRIGGER update_notifications_timestamp
  BEFORE UPDATE ON notification.notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- Notification preferences
CREATE TABLE notification.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES identity.users(id) ON DELETE CASCADE,
  notification_type varchar(100) NOT NULL,
  channel varchar(50) NOT NULL,
  enabled boolean NOT NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX uniq_user_type_channel ON notification.notification_preferences(user_id, notification_type, channel);

CREATE TRIGGER update_notification_preferences_timestamp
  BEFORE UPDATE ON notification.notification_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_timestamp_column();

-- ─────────────────────────────────────────────────────────────────────────────
-- 12. Analytics Bounded Context Tables
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE analytics.application_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL,
  status varchar(50) NOT NULL,
  category varchar(100) NOT NULL,
  source varchar(100) NOT NULL,
  days_to_hire integer,
  submitted_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_application_facts_submitted ON analytics.application_facts(submitted_at);

-- Recruiter activity facts
CREATE TABLE analytics.recruiter_activity_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL,
  recruiter_name varchar(255) NOT NULL,
  action varchar(100) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Daily Rollup snapshot metrics
CREATE TABLE analytics.daily_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date date UNIQUE NOT NULL,
  active_jobs integer NOT NULL,
  total_applications integer NOT NULL,
  open_positions integer NOT NULL,
  total_hires integer NOT NULL,
  avg_time_to_hire_days numeric(5,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 13. Enable RLS (Row Level Security) Globals
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE identity.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization.recruiter_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate.candidate_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE job.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job.job_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE application.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application.application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.application_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.recruiter_activity_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.daily_snapshots ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────────
-- 14. Define Row Level Security Policies
-- ─────────────────────────────────────────────────────────────────────────────

-- 14.1. identity.users policies
CREATE POLICY users_self_all ON identity.users
  FOR ALL TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY users_recruiters_read ON identity.users
  FOR SELECT TO authenticated USING (
    auth.get_user_role() IN ('platform-admin', 'company-admin', 'recruiter')
  );

-- 14.2. organization.companies policies
CREATE POLICY companies_public_read ON organization.companies
  FOR SELECT TO authenticated USING (true);

CREATE POLICY companies_owner_write ON organization.companies
  FOR ALL TO authenticated USING (
    id = auth.get_user_company_id() AND auth.get_user_role() = 'company-admin'
  );

CREATE POLICY companies_admin_all ON organization.companies
  FOR ALL TO authenticated USING (auth.get_user_role() = 'platform-admin');

-- 14.3. organization.departments policies
CREATE POLICY departments_company_read ON organization.departments
  FOR SELECT TO authenticated USING (company_id = auth.get_user_company_id());

CREATE POLICY departments_company_write ON organization.departments
  FOR ALL TO authenticated USING (
    company_id = auth.get_user_company_id() AND auth.get_user_role() IN ('company-admin', 'recruiter')
  );

CREATE POLICY departments_admin_all ON organization.departments
  FOR ALL TO authenticated USING (auth.get_user_role() = 'platform-admin');

-- 14.4. organization.recruiters policies
CREATE POLICY recruiters_company_read ON organization.recruiters
  FOR SELECT TO authenticated USING (company_id = auth.get_user_company_id());

CREATE POLICY recruiters_owner_write ON organization.recruiters
  FOR ALL TO authenticated USING (
    company_id = auth.get_user_company_id() AND auth.get_user_role() = 'company-admin'
  );

CREATE POLICY recruiters_admin_all ON organization.recruiters
  FOR ALL TO authenticated USING (auth.get_user_role() = 'platform-admin');

-- 14.5. candidate.candidates policies
CREATE POLICY candidates_self_all ON candidate.candidates
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY candidates_recruiter_read ON candidate.candidates
  FOR SELECT TO authenticated USING (auth.get_user_role() IN ('company-admin', 'recruiter'));

-- 14.6. candidate sub-tables (education, experience, projects, certificates, social_links)
CREATE POLICY education_self_all ON candidate.education
  FOR ALL TO authenticated USING (candidate_id IN (SELECT id FROM candidate.candidates WHERE user_id = auth.uid()));
CREATE POLICY education_recruiter_read ON candidate.education
  FOR SELECT TO authenticated USING (auth.get_user_role() IN ('company-admin', 'recruiter'));

CREATE POLICY experience_self_all ON candidate.experience
  FOR ALL TO authenticated USING (candidate_id IN (SELECT id FROM candidate.candidates WHERE user_id = auth.uid()));
CREATE POLICY experience_recruiter_read ON candidate.experience
  FOR SELECT TO authenticated USING (auth.get_user_role() IN ('company-admin', 'recruiter'));

CREATE POLICY projects_self_all ON candidate.projects
  FOR ALL TO authenticated USING (candidate_id IN (SELECT id FROM candidate.candidates WHERE user_id = auth.uid()));
CREATE POLICY projects_recruiter_read ON candidate.projects
  FOR SELECT TO authenticated USING (auth.get_user_role() IN ('company-admin', 'recruiter'));

CREATE POLICY certificates_self_all ON candidate.certificates
  FOR ALL TO authenticated USING (candidate_id IN (SELECT id FROM candidate.candidates WHERE user_id = auth.uid()));
CREATE POLICY certificates_recruiter_read ON candidate.certificates
  FOR SELECT TO authenticated USING (auth.get_user_role() IN ('company-admin', 'recruiter'));

CREATE POLICY social_links_self_all ON candidate.social_links
  FOR ALL TO authenticated USING (candidate_id IN (SELECT id FROM candidate.candidates WHERE user_id = auth.uid()));
CREATE POLICY social_links_recruiter_read ON candidate.social_links
  FOR SELECT TO authenticated USING (auth.get_user_role() IN ('company-admin', 'recruiter'));

-- 14.7. candidate.skills policies
CREATE POLICY skills_public_read ON candidate.skills
  FOR SELECT TO authenticated USING (true);
CREATE POLICY skills_admin_write ON candidate.skills
  FOR ALL TO authenticated USING (auth.get_user_role() = 'platform-admin');

-- 14.8. candidate.candidate_skills policies
CREATE POLICY candidate_skills_self_all ON candidate.candidate_skills
  FOR ALL TO authenticated USING (candidate_id IN (SELECT id FROM candidate.candidates WHERE user_id = auth.uid()));
CREATE POLICY candidate_skills_recruiter_read ON candidate.candidate_skills
  FOR SELECT TO authenticated USING (auth.get_user_role() IN ('company-admin', 'recruiter'));

-- 14.9. candidate.resumes policies
CREATE POLICY resumes_self_all ON candidate.resumes
  FOR ALL TO authenticated USING (candidate_id IN (SELECT id FROM candidate.candidates WHERE user_id = auth.uid()));
CREATE POLICY resumes_recruiter_read ON candidate.resumes
  FOR SELECT TO authenticated USING (auth.get_user_role() IN ('company-admin', 'recruiter'));

-- 14.10. job.jobs policies
CREATE POLICY jobs_public_read ON job.jobs
  FOR SELECT TO authenticated USING (status = 'published' OR company_id = auth.get_user_company_id());

CREATE POLICY jobs_recruiter_write ON job.jobs
  FOR ALL TO authenticated USING (company_id = auth.get_user_company_id() AND auth.get_user_role() IN ('company-admin', 'recruiter'));

-- 14.11. job.job_skills policies
CREATE POLICY job_skills_public_read ON job.job_skills
  FOR SELECT TO authenticated USING (true);
CREATE POLICY job_skills_recruiter_write ON job.job_skills
  FOR ALL TO authenticated USING (job_id IN (SELECT id FROM job.jobs WHERE company_id = auth.get_user_company_id()));

-- 14.12. application.applications policies
CREATE POLICY applications_self_read_insert ON application.applications
  FOR ALL TO authenticated USING (candidate_id IN (SELECT id FROM candidate.candidates WHERE user_id = auth.uid()));

CREATE POLICY applications_recruiter_all ON application.applications
  FOR ALL TO authenticated USING (job_id IN (SELECT id FROM job.jobs WHERE company_id = auth.get_user_company_id()));

-- 14.13. application.application_status_history policies
CREATE POLICY app_history_self_read ON application.application_status_history
  FOR SELECT TO authenticated USING (application_id IN (
    SELECT id FROM application.applications WHERE candidate_id IN (
      SELECT id FROM candidate.candidates WHERE user_id = auth.uid()
    )
  ));
CREATE POLICY app_history_recruiter_all ON application.application_status_history
  FOR ALL TO authenticated USING (application_id IN (
    SELECT id FROM application.applications WHERE job_id IN (
      SELECT id FROM job.jobs WHERE company_id = auth.get_user_company_id()
    )
  ));

-- 14.14. assessment.assessments policies
CREATE POLICY assessments_recruiter_all ON assessment.assessments
  FOR ALL TO authenticated USING (company_id = auth.get_user_company_id());
CREATE POLICY assessments_candidate_read ON assessment.assessments
  FOR SELECT TO authenticated USING (id IN (
    SELECT assessment_id FROM assessment.attempts WHERE candidate_id IN (
      SELECT id FROM candidate.candidates WHERE user_id = auth.uid()
    )
  ));

-- 14.15. assessment.questions policies
CREATE POLICY questions_recruiter_all ON assessment.questions
  FOR ALL TO authenticated USING (assessment_id IN (SELECT id FROM assessment.assessments WHERE company_id = auth.get_user_company_id()));
CREATE POLICY questions_candidate_read ON assessment.questions
  FOR SELECT TO authenticated USING (assessment_id IN (
    SELECT assessment_id FROM assessment.attempts WHERE candidate_id IN (
      SELECT id FROM candidate.candidates WHERE user_id = auth.uid()
    )
  ));

-- 14.16. assessment.attempts policies
CREATE POLICY attempts_self_all ON assessment.attempts
  FOR ALL TO authenticated USING (candidate_id IN (SELECT id FROM candidate.candidates WHERE user_id = auth.uid()));
CREATE POLICY attempts_recruiter_read ON assessment.attempts
  FOR SELECT TO authenticated USING (assessment_id IN (SELECT id FROM assessment.assessments WHERE company_id = auth.get_user_company_id()));

-- 14.17. interview.interviews policies
CREATE POLICY interviews_self_read ON interview.interviews
  FOR SELECT TO authenticated USING (application_id IN (
    SELECT id FROM application.applications WHERE candidate_id IN (
      SELECT id FROM candidate.candidates WHERE user_id = auth.uid()
    )
  ));
CREATE POLICY interviews_recruiter_all ON interview.interviews
  FOR ALL TO authenticated USING (application_id IN (
    SELECT id FROM application.applications WHERE job_id IN (
      SELECT id FROM job.jobs WHERE company_id = auth.get_user_company_id()
    )
  ));

-- 14.18. notification.notifications policies
CREATE POLICY notifications_self_all ON notification.notifications
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 14.19. notification.notification_preferences policies
CREATE POLICY preferences_self_all ON notification.notification_preferences
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 14.20. analytics tables policies
CREATE POLICY facts_admin_all ON analytics.application_facts FOR ALL TO authenticated USING (auth.get_user_role() = 'platform-admin');
CREATE POLICY recruiter_facts_admin_all ON analytics.recruiter_activity_facts FOR ALL TO authenticated USING (auth.get_user_role() = 'platform-admin');
CREATE POLICY snapshots_admin_all ON analytics.daily_snapshots FOR ALL TO authenticated USING (auth.get_user_role() = 'platform-admin');

-- ─────────────────────────────────────────────────────────────────────────────
-- 15. Create Storage Buckets
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('resumes', 'resumes', false, 10485760, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']),
  ('company-assets', 'company-assets', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Define Policies for Storage Objects (in storage.objects)
CREATE POLICY resumes_access ON storage.objects
  FOR ALL TO authenticated USING (
    bucket_id = 'resumes' AND (
      owner = auth.uid()::text OR auth.get_user_role() IN ('platform-admin', 'company-admin', 'recruiter')
    )
  );

CREATE POLICY assets_access ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'company-assets');

CREATE POLICY assets_write ON storage.objects
  FOR ALL TO authenticated USING (
    bucket_id = 'company-assets' AND auth.get_user_role() IN ('platform-admin', 'company-admin', 'recruiter')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 16. Enable Realtime Replication
-- ─────────────────────────────────────────────────────────────────────────────

alter publication supabase_realtime add table application.applications;
alter publication supabase_realtime add table interview.interviews;
alter publication supabase_realtime add table notification.notifications;
