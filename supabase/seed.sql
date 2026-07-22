-- ─────────────────────────────────────────────────────────────────────────────
-- Smart Hire — Database Seed Script
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Create Auth Users (in auth.users)
-- Passwords are set to 'password123'
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  role,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  created_at,
  updated_at
) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@smarthire.ai',
    crypt('password123', gen_salt('bf')),
    now(),
    'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name": "Admin", "last_name": "User", "role": "platform-admin"}'::jsonb,
    'authenticated',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'recruiter@acme.com',
    crypt('password123', gen_salt('bf')),
    now(),
    'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name": "Alice", "last_name": "Johnson", "role": "recruiter"}'::jsonb,
    'authenticated',
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'candidate@smarthire.ai',
    crypt('password123', gen_salt('bf')),
    now(),
    'authenticated',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"first_name": "Jane", "last_name": "Doe", "role": "candidate"}'::jsonb,
    'authenticated',
    now(),
    now()
  )
ON CONFLICT (id) DO NOTHING;

-- 2. Create Demo Company
INSERT INTO organization.companies (
  id,
  name,
  slug,
  domain,
  logo_url,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Acme Corp',
  'acme-corp',
  'acme.com',
  'https://pub-company-assets.supabase.co/logos/acme.png',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 3. Create Department
INSERT INTO organization.departments (
  id,
  company_id,
  name,
  created_at,
  updated_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Engineering',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 4. Assign Recruiter Membership
INSERT INTO organization.recruiters (
  id,
  user_id,
  company_id,
  role,
  created_at,
  updated_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000002',
  '11111111-1111-1111-1111-111111111111',
  'owner',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 5. Standardized Skills Registry
INSERT INTO candidate.skills (id, name, created_at)
VALUES
  ('a1f77d3b-967a-42c2-8419-48e0259b3601', 'React', now()),
  ('a1f77d3b-967a-42c2-8419-48e0259b3602', 'TypeScript', now()),
  ('a1f77d3b-967a-42c2-8419-48e0259b3603', 'Node.js', now()),
  ('a1f77d3b-967a-42c2-8419-48e0259b3604', 'Python', now()),
  ('a1f77d3b-967a-42c2-8419-48e0259b3605', 'PostgreSQL', now()),
  ('a1f77d3b-967a-42c2-8419-48e0259b3606', 'AWS', now())
ON CONFLICT (name) DO NOTHING;

-- 6. Create Candidate Profile
INSERT INTO candidate.candidates (
  id,
  user_id,
  email,
  phone,
  first_name,
  last_name,
  summary,
  created_at,
  updated_at
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000003',
  'candidate@smarthire.ai',
  '+15550199',
  'Jane',
  'Doe',
  'Full Stack developer specializing in React, TypeScript, and Node.js backend development.',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 7. Populate Candidate Relations
INSERT INTO candidate.education (
  id,
  candidate_id,
  institution,
  degree,
  field_of_study,
  start_date,
  end_date,
  is_current,
  created_at,
  updated_at
) VALUES (
  '55555555-5555-5555-5555-555555555555',
  '44444444-4444-4444-4444-444444444444',
  'Stanford University',
  'Bachelor of Science',
  'Computer Science',
  '2022-09-01',
  '2026-06-15',
  false,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO candidate.experience (
  id,
  candidate_id,
  company_name,
  job_title,
  description,
  start_date,
  end_date,
  is_current,
  created_at,
  updated_at
) VALUES (
  '66666666-6666-6666-6666-666666666666',
  '44444444-4444-4444-4444-444444444444',
  'Tech Innovators LLC',
  'Junior Frontend Engineer',
  'Built reusable components using React and TypeScript. Managed global state migrations.',
  '2025-06-01',
  NULL,
  true,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- 8. Assign Candidate Skills
INSERT INTO candidate.candidate_skills (candidate_id, skill_id, years_of_experience)
VALUES
  ('44444444-4444-4444-4444-444444444444', 'a1f77d3b-967a-42c2-8419-48e0259b3601', 3),
  ('44444444-4444-4444-4444-444444444444', 'a1f77d3b-967a-42c2-8419-48e0259b3602', 2)
ON CONFLICT (candidate_id, skill_id) DO NOTHING;
