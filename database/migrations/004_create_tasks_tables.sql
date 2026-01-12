-- Create Tasks Module Tables
-- Run this SQL script in your database to create the tasks tables

-- ============================================
-- Task Templates Table
-- Pre-defined tasks that can be assigned to agents
-- ============================================

CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  estimated_duration INTEGER, -- in minutes
  is_active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(255)
);

-- Create indexes for task_templates
CREATE INDEX IF NOT EXISTS idx_task_templates_is_active ON task_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_task_templates_category ON task_templates(category);

-- ============================================
-- Tasks Table
-- Individual task instances linked to agents
-- ============================================

CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled')),
  
  -- Assignment
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  template_id UUID REFERENCES task_templates(id) ON DELETE SET NULL,
  
  -- Completion Tracking
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  completed_by VARCHAR(255),
  
  -- Due Date
  due_date TIMESTAMP,
  
  -- Additional Metadata
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  
  -- Assignment Info
  assigned_by VARCHAR(255),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for tasks
CREATE INDEX IF NOT EXISTS idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_template_id ON tasks(template_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_is_completed ON tasks(is_completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Create trigger to automatically update updated_at for task_templates
CREATE TRIGGER update_task_templates_updated_at BEFORE UPDATE ON task_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically update updated_at for tasks
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Insert Default Task Templates
-- ============================================

INSERT INTO task_templates (name, description, category, priority, "order", is_active) VALUES
('Complete Agent Profile', 'Fill out all required agent profile information including contact details, license information, and banking details', 'Onboarding', 'High', 1, true),
('Submit License Documentation', 'Upload and verify real estate license documentation and expiration dates', 'Compliance', 'High', 2, true),
('Complete Onboarding Training', 'Complete all required onboarding training modules and assessments', 'Training', 'Medium', 3, true),
('Set Up Banking Information', 'Provide banking details for commission payments and verify account information', 'Financial', 'High', 4, true),
('Review Brokerage Policies', 'Read and acknowledge all brokerage policies and code of conduct', 'Compliance', 'Medium', 5, true),
('Configure CRM Access', 'Set up CRM account access, permissions, and initial configuration', 'Setup', 'Medium', 6, true),
('Schedule Initial Meeting', 'Schedule and attend initial meeting with team lead or manager', 'Onboarding', 'Medium', 7, true),
('Complete Background Check', 'Submit required information for background verification process', 'Compliance', 'High', 8, true)
ON CONFLICT DO NOTHING;
