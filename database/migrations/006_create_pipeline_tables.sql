-- Migration: Create Pipeline Module Tables
-- Description: Creates pipelines, pipeline_stages, and pipeline_access_users tables

-- ============================================
-- Pipelines Table
-- Main pipeline configurations
-- ============================================

CREATE TABLE IF NOT EXISTS pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  access_type VARCHAR(20) DEFAULT 'All' CHECK (access_type IN ('All', 'Selected')),
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for pipelines
CREATE INDEX IF NOT EXISTS idx_pipelines_status ON pipelines(status);
CREATE INDEX IF NOT EXISTS idx_pipelines_access_type ON pipelines(access_type);
CREATE INDEX IF NOT EXISTS idx_pipelines_created_at ON pipelines(created_at);

-- ============================================
-- Pipeline Stages Table
-- Stages within each pipeline
-- ============================================

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  "order" INTEGER DEFAULT 0,
  color VARCHAR(7), -- Hex color code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for pipeline_stages
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_pipeline_id ON pipeline_stages(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_order ON pipeline_stages("order");

-- ============================================
-- Pipeline Access Users Table
-- Users who have access to specific pipelines
-- ============================================

CREATE TABLE IF NOT EXISTS pipeline_access_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(pipeline_id, user_id)
);

-- Indexes for pipeline_access_users
CREATE INDEX IF NOT EXISTS idx_pipeline_access_users_pipeline_id ON pipeline_access_users(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_access_users_user_id ON pipeline_access_users(user_id);

-- Create trigger to update updated_at timestamp for pipelines
CREATE OR REPLACE FUNCTION update_pipelines_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pipelines_updated_at
    BEFORE UPDATE ON pipelines
    FOR EACH ROW
    EXECUTE FUNCTION update_pipelines_updated_at();

-- Create trigger to update updated_at timestamp for pipeline_stages
CREATE OR REPLACE FUNCTION update_pipeline_stages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pipeline_stages_updated_at
    BEFORE UPDATE ON pipeline_stages
    FOR EACH ROW
    EXECUTE FUNCTION update_pipeline_stages_updated_at();
