-- Migration: Create Task Sets Tables
-- Description: Creates task_sets and task_set_templates tables for grouping task templates into sets

-- Create task_sets table
CREATE TABLE IF NOT EXISTS task_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255)
);

-- Create task_set_templates join table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS task_set_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_set_id UUID NOT NULL REFERENCES task_sets(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES task_templates(id) ON DELETE CASCADE,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(task_set_id, template_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_task_sets_is_active ON task_sets(is_active);
CREATE INDEX IF NOT EXISTS idx_task_sets_category ON task_sets(category);
CREATE INDEX IF NOT EXISTS idx_task_set_templates_task_set_id ON task_set_templates(task_set_id);
CREATE INDEX IF NOT EXISTS idx_task_set_templates_template_id ON task_set_templates(template_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_task_sets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_sets_updated_at
    BEFORE UPDATE ON task_sets
    FOR EACH ROW
    EXECUTE FUNCTION update_task_sets_updated_at();

-- Insert some default task sets (optional - can be removed if not needed)
-- Example: Onboarding Set
INSERT INTO task_sets (name, description, category, is_active, "order")
VALUES 
    ('Onboarding Set', 'Standard onboarding tasks for new agents', 'Onboarding', true, 1),
    ('Compliance Set', 'Compliance and regulatory tasks', 'Compliance', true, 2),
    ('Training Set', 'Training and development tasks', 'Training', true, 3)
ON CONFLICT DO NOTHING;
