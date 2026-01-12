# Tasks Module - Implementation Guide

## ✅ What Has Been Completed

### 1. Database Schema (Prisma)
- ✅ **TaskTemplate** - Pre-defined tasks that can be assigned to agents
- ✅ **Task** - Individual task instances linked to agents
- ✅ Relationship between Agent and Task models
- ✅ Relationship between TaskTemplate and Task models

### 2. Database Migration
- ✅ SQL migration script created (`database/migrations/004_create_tasks_tables.sql`)
- ✅ Includes indexes for performance
- ✅ Includes triggers for `updated_at` timestamps
- ✅ Includes default task templates (8 pre-defined tasks for agent onboarding)

### 3. TypeScript Interfaces
- ✅ Complete type definitions in `src/core/data/interface/task.interface.ts`
- ✅ Task, TaskTemplate, and all request/response interfaces

### 4. API Routes
- ✅ `GET /api/tasks` - List all tasks with filters
- ✅ `POST /api/tasks` - Create new task
- ✅ `GET /api/tasks/[id]` - Get single task
- ✅ `PUT /api/tasks/[id]` - Update task
- ✅ `DELETE /api/tasks/[id]` - Delete task
- ✅ `GET /api/tasks/agent/[agentId]` - Get tasks for a specific agent
- ✅ `GET /api/tasks/templates` - List all task templates
- ✅ `POST /api/tasks/templates` - Create new task template
- ✅ `GET /api/tasks/templates/[id]` - Get single task template
- ✅ `PUT /api/tasks/templates/[id]` - Update task template
- ✅ `DELETE /api/tasks/templates/[id]` - Delete task template

### 5. Service Layer
- ✅ Complete service functions in `src/core/services/tasks.service.ts`
- ✅ Functions for tasks CRUD operations
- ✅ Functions for task templates CRUD operations
- ✅ Helper function to assign tasks from templates to agents

### 6. Agent Integration
- ✅ Updated agent creation API to automatically assign pre-defined tasks
- ✅ When an agent is created, all active task templates are automatically assigned
- ✅ Option to skip task assignment via `skipTaskAssignment` flag

### 7. UI Components
- ✅ **AgentTasksChecklist** component for agent details page
- ✅ Displays tasks in a checklist format
- ✅ Shows progress bar with completion percentage
- ✅ Separates pending and completed tasks
- ✅ Allows toggling task completion status
- ✅ Integrated into agent details page

## 🚀 Setup Instructions

### Step 1: Run Database Migration

1. Connect to your PostgreSQL database
2. Run the migration SQL:

```bash
# Option 1: Using psql command line
psql -h your-rds-endpoint.region.rds.amazonaws.com -U your_username -d summitly_crm -f database/migrations/004_create_tasks_tables.sql

# Option 2: Copy and paste the SQL into your database client (pgAdmin, DBeaver, etc.)
```

The SQL file is located at: `database/migrations/004_create_tasks_tables.sql`

### Step 2: Generate Prisma Client

After running the migration, regenerate the Prisma client to include the new models:

```bash
npx prisma generate
```

### Step 3: Verify Environment Variables

Make sure your `.env.local` file has the correct database connection:

```env
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

### Step 4: Test the Implementation

1. **Create a new agent** - Tasks should be automatically assigned
2. **View agent details** - Check the Tasks Checklist component in the sidebar
3. **Toggle task completion** - Click checkboxes to mark tasks as complete
4. **View task progress** - See the progress bar update automatically

## 📋 Default Task Templates

The following 8 task templates are automatically created when you run the migration:

1. **Complete Agent Profile** - Fill out all required agent profile information
2. **Submit License Documentation** - Upload and verify real estate license
3. **Complete Onboarding Training** - Complete all required onboarding training modules
4. **Set Up Banking Information** - Provide banking details for commission payments
5. **Review Brokerage Policies** - Read and acknowledge all brokerage policies
6. **Configure CRM Access** - Set up CRM account access and permissions
7. **Schedule Initial Meeting** - Schedule and attend initial meeting with team lead
8. **Complete Background Check** - Submit required information for background verification

## 🎯 How It Works

### Automatic Task Assignment

When you create a new agent via the API:

1. The agent is created in the database
2. The system automatically fetches all active task templates
3. Tasks are created from these templates and assigned to the agent
4. All tasks start with status "Pending" and `isCompleted: false`

### Task Management

- **View Tasks**: Tasks are displayed in the agent details page sidebar
- **Complete Tasks**: Click the checkbox to mark a task as complete
- **Task Status**: Tasks can be Pending, In Progress, Completed, or Cancelled
- **Progress Tracking**: Progress bar shows completion percentage

### Task Templates

- **Pre-defined Tasks**: Templates define reusable tasks that can be assigned
- **Active/Inactive**: Templates can be activated or deactivated
- **Categories**: Tasks can be categorized (Onboarding, Training, Compliance, etc.)
- **Priority Levels**: Tasks can have Low, Medium, High, or Urgent priority

## 🔧 API Usage Examples

### Get Tasks for an Agent

```typescript
import { getAgentTasks } from '@/core/services/tasks.service';

const response = await getAgentTasks('agent-id-here');
if (response.success && response.data) {
  const tasks = Array.isArray(response.data) ? response.data : [response.data];
  console.log('Agent tasks:', tasks);
}
```

### Toggle Task Completion

```typescript
import { toggleTaskCompletion } from '@/core/services/tasks.service';

const response = await toggleTaskCompletion('task-id-here', true, 'user-id');
if (response.success) {
  console.log('Task marked as complete');
}
```

### Create Custom Task

```typescript
import { createTask } from '@/core/services/tasks.service';

const response = await createTask({
  title: 'Custom Task',
  description: 'Task description',
  agentId: 'agent-id-here',
  priority: 'High',
  dueDate: '2025-12-31',
});
```

## 📝 Future Enhancements

The Tasks module is designed to be extensible. Future enhancements could include:

- Link tasks to other modules (Deals, Contacts, etc.)
- Task dependencies (task B requires task A to be completed)
- Task notifications and reminders
- Task comments and attachments
- Task time tracking
- Task assignment to multiple agents
- Task templates for different agent roles

## 🐛 Troubleshooting

### Tasks not appearing after agent creation

1. Check if task templates exist: `SELECT * FROM task_templates WHERE is_active = true;`
2. Check if tasks were created: `SELECT * FROM tasks WHERE agent_id = 'your-agent-id';`
3. Verify the agent creation API response includes task assignment

### Prisma errors

1. Make sure you've run `npx prisma generate` after adding the new models
2. Verify your Prisma schema matches the database structure
3. Check that all required fields are provided when creating tasks

### UI not updating

1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check network tab for failed requests

## 📚 Related Documentation

- [Agents Module Setup](./AGENTS_MODULE_SETUP.md)
- [Agents CRUD Setup](./AGENTS_CRUD_SETUP.md)
- [Prisma Migration Guide](./PRISMA_MIGRATION.md)
