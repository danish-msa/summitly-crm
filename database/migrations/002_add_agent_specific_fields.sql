-- Migration: Add Agent-Specific Fields
-- Adds license, dates, status options, team, commission, banking, emergency contact, and notes

-- Add new columns to agents table
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS license_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS license_expiry_date DATE,
  ADD COLUMN IF NOT EXISTS brokerage_start_date DATE,
  ADD COLUMN IF NOT EXISTS team_office VARCHAR(255),
  ADD COLUMN IF NOT EXISTS commission_split JSONB,
  ADD COLUMN IF NOT EXISTS banking_info JSONB,
  ADD COLUMN IF NOT EXISTS emergency_contact JSONB,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update status column to support new status values
-- Note: PostgreSQL doesn't have ENUM by default, so we'll use CHECK constraint
-- First, let's see if we need to update existing 'Inactive' to 'Terminated' or keep both
-- For now, we'll allow: Active, Suspended, Terminated, Inactive (for backward compatibility)

-- Add index on license_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_agents_license_number ON agents(license_number);

-- Add index on team_office for filtering
CREATE INDEX IF NOT EXISTS idx_agents_team_office ON agents(team_office);

-- Add index on status for filtering
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);

-- Add index on license_expiry_date for expiration tracking
CREATE INDEX IF NOT EXISTS idx_agents_license_expiry ON agents(license_expiry_date);
