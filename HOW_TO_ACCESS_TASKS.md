# How to Access Tasks on the Website

## 🎯 Quick Access Methods

### Method 1: Direct URL
Navigate directly to the tasks page:
```
/crm/tasks
```

Or use the full URL:
```
http://your-domain.com/crm/tasks
```

### Method 2: Through Navigation Menu
1. Look for the **"Tasks"** menu item in the sidebar navigation
2. Click on it to access the tasks page

### Method 3: From Agent Details Page
1. Go to any agent's details page: `/crm/agents-details?id=agent-id`
2. Scroll down to the sidebar on the right
3. You'll see the **"Tasks Checklist"** component showing all tasks assigned to that agent

## 📋 What You Can Do on the Tasks Page

### View All Tasks
- See all tasks in the system
- Tasks are grouped by creation date
- View task details including:
  - Title and description
  - Status (Pending, In Progress, Completed, Cancelled)
  - Priority (Low, Medium, High, Urgent)
  - Assigned agent
  - Due date
  - Category

### Search Tasks
- Use the search box at the top to search by task title or description
- Search is real-time and filters results as you type

### Filter Tasks
- **All Tasks**: View all tasks (default)
- **Important**: View important/high priority tasks
- **Completed**: View only completed tasks
- Use the filter dropdown to apply additional filters

### Manage Tasks
- **Toggle Completion**: Click the checkbox next to any task to mark it as complete/incomplete
- **View Agent**: Click the dropdown menu (three dots) and select "View Agent" to see the agent's details
- **Delete Task**: Click the dropdown menu and select "Delete" to remove a task

### Add New Task
- Click the **"Add New Task"** button at the top right
- Fill in the task details in the modal
- Assign it to an agent (optional)
- Save the task

## 🔗 Related Pages

### Task Views
- **All Tasks**: `/crm/tasks` - View all tasks
- **Important Tasks**: `/crm/tasks-important` - View important tasks
- **Completed Tasks**: `/crm/tasks-completed` - View completed tasks

### Agent Tasks
- **Agent Details**: `/crm/agents-details?id=agent-id` - View tasks for a specific agent
- Tasks are automatically assigned when you create a new agent

## 🎨 Task Status Colors

Tasks are color-coded by status:
- **Pending** (Yellow/Warning) - Task is waiting to be started
- **In Progress** (Blue/Info) - Task is currently being worked on
- **Completed** (Green/Success) - Task is finished
- **Cancelled** (Red/Danger) - Task has been cancelled

## 📊 Task Priority Levels

Tasks can have different priority levels:
- **Low** - Not urgent
- **Medium** - Normal priority (default)
- **High** - Important
- **Urgent** - Critical, needs immediate attention

## 💡 Tips

1. **Auto-Assigned Tasks**: When you create a new agent, tasks are automatically assigned from active task templates
2. **Progress Tracking**: On agent details pages, you can see a progress bar showing task completion percentage
3. **Grouped by Date**: Tasks are automatically grouped by creation date for easier navigation
4. **Real-time Updates**: Task completion status updates immediately when you toggle the checkbox

## 🐛 Troubleshooting

### Tasks page not loading
- Check if you're logged in
- Verify the route `/crm/tasks` is accessible
- Check browser console for errors

### No tasks showing
- Make sure you've created at least one agent (tasks are auto-assigned)
- Or manually create a task using the "Add New Task" button
- Check if filters are hiding your tasks

### Can't see tasks on agent page
- Verify the agent ID is correct
- Check if tasks were assigned to that agent
- Refresh the page

## 📝 Next Steps

After accessing tasks, you can:
1. Create custom tasks for specific agents
2. Manage task templates (admin feature)
3. Track task completion progress
4. Filter and search tasks efficiently

For more information, see [TASKS_MODULE_SETUP.md](./TASKS_MODULE_SETUP.md)
