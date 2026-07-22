-- Add onboarding and settings columns to companies table
ALTER TABLE organization.companies ADD COLUMN IF NOT EXISTS industry varchar(100);
ALTER TABLE organization.companies ADD COLUMN IF NOT EXISTS company_size varchar(50);
ALTER TABLE organization.companies ADD COLUMN IF NOT EXISTS phone varchar(50);
ALTER TABLE organization.companies ADD COLUMN IF NOT EXISTS email varchar(255);
ALTER TABLE organization.companies ADD COLUMN IF NOT EXISTS timezone varchar(100);
ALTER TABLE organization.companies ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE organization.companies ADD COLUMN IF NOT EXISTS banner_url varchar(512);
ALTER TABLE organization.companies ADD COLUMN IF NOT EXISTS country varchar(100);
ALTER TABLE organization.companies ADD COLUMN IF NOT EXISTS state varchar(100);
ALTER TABLE organization.companies ADD COLUMN IF NOT EXISTS city varchar(100);
ALTER TABLE organization.companies ADD COLUMN IF NOT EXISTS primary_color varchar(50);
ALTER TABLE organization.companies ADD COLUMN IF NOT EXISTS accent_color varchar(50);
ALTER TABLE organization.companies ADD COLUMN IF NOT EXISTS subscription_tier varchar(50) DEFAULT 'free';
