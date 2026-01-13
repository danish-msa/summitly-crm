-- Add User Assignment to Tasks
-- This migration adds the ability to assign tasks to users (in addition to agents)

-- Add user_id column to tasks table
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- Create index for user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

-- Add comment to document the column
COMMENT ON COLUMN tasks.user_id IS 'User assigned to this task. Tasks can be assigned to either an agent or a user.';
