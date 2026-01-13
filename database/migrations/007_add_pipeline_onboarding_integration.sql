-- Migration: Add Pipeline Onboarding Integration
-- Description: Links AgentOnboarding to Pipeline, creates PipelineStageTaskSet join table, adds stageId to Tasks

-- ============================================
-- 1. Add Pipeline fields to AgentOnboarding
-- ============================================

-- Add pipeline_id column
ALTER TABLE agent_onboarding
ADD COLUMN IF NOT EXISTS pipeline_id UUID REFERENCES pipelines(id) ON DELETE SET NULL;

-- Add current_stage_id column
ALTER TABLE agent_onboarding
ADD COLUMN IF NOT EXISTS current_stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL;

-- Add stage progression tracking columns
ALTER TABLE agent_onboarding
ADD COLUMN IF NOT EXISTS stage_entered_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE agent_onboarding
ADD COLUMN IF NOT EXISTS stage_completed_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for pipeline fields
CREATE INDEX IF NOT EXISTS idx_onboarding_pipeline_id ON agent_onboarding(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_current_stage_id ON agent_onboarding(current_stage_id);

-- ============================================
-- 2. Create PipelineStageTaskSet join table
-- ============================================

CREATE TABLE IF NOT EXISTS pipeline_stage_task_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id UUID NOT NULL REFERENCES pipeline_stages(id) ON DELETE CASCADE,
  task_set_id UUID NOT NULL REFERENCES task_sets(id) ON DELETE CASCADE,
  "order" INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT TRUE,
  default_due_days INTEGER, -- Days from stage entry to task due date
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Prevent duplicate task sets in same stage
  UNIQUE(stage_id, task_set_id)
);

-- Indexes for pipeline_stage_task_sets
CREATE INDEX IF NOT EXISTS idx_pipeline_stage_task_sets_stage_id ON pipeline_stage_task_sets(stage_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_stage_task_sets_task_set_id ON pipeline_stage_task_sets(task_set_id);

-- ============================================
-- 3. Add stage_id to Tasks table
-- ============================================

-- Add stage_id column to tasks
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS stage_id UUID REFERENCES pipeline_stages(id) ON DELETE SET NULL;

-- Create index for stage_id
CREATE INDEX IF NOT EXISTS idx_tasks_stage_id ON tasks(stage_id);

-- ============================================
-- Migration Complete
-- ============================================

-- Notes:
-- 1. AgentOnboarding now tracks which pipeline and stage an agent is in
-- 2. PipelineStageTaskSet links task sets to pipeline stages
-- 3. Tasks can be linked to a specific stage for better organization
-- 4. All foreign keys have appropriate CASCADE/SET NULL behavior
