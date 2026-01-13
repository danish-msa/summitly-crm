# Test Agent Onboarding Pipeline Flow

## ✅ Current Status
- ✅ Pipeline created: "Agent Onboarding"
- ✅ 4 stages created: Profile Setup, Compliance, Training, Final Approval
- ✅ Task sets assigned to stages with due dates (2, 5, 7, 3 days)

---

## 🧪 Step 1: Create a Test Agent

1. Go to `/crm/agents`
2. Click "Add Agent" button
3. Fill in the form:
   - First Name: `Test`
   - Last Name: `Agent`
   - Email: `test.agent@example.com`
   - (Fill other required fields)
4. Click "Save"

**Expected Result:**
- Agent is created successfully
- AgentOnboarding record is automatically created
- Agent is linked to "Agent Onboarding" pipeline
- Agent enters Stage 1: "Profile Setup" automatically
- Tasks are assigned from Stage 1's task sets
- Tasks have due dates (2 days from now)

---

## 🔍 Step 2: Verify Auto-Enrollment

Run this in browser console to check the agent's onboarding status:

```javascript
// Replace AGENT_ID with the ID of the agent you just created
const agentId = 'YOUR_AGENT_ID';

fetch(`/api/onboarding/${agentId}/current-stage`)
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      console.log('✅ Agent Onboarding Status:');
      console.log('Pipeline:', data.data.pipeline?.name);
      console.log('Current Stage:', data.data.currentStage?.name);
      console.log('Stage Entered At:', data.data.stageEnteredAt);
      console.log('\n📋 Tasks Assigned:');
      console.log(`Total: ${data.data.progress.tasksTotal}`);
      console.log(`Completed: ${data.data.progress.tasksCompleted}`);
      console.log(`Remaining: ${data.data.progress.tasksRemaining}`);
      console.log('\nTasks:');
      data.data.tasks.forEach(task => {
        console.log(`- ${task.title}`);
        console.log(`  Status: ${task.status}`);
        console.log(`  Due Date: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}`);
        console.log(`  Completed: ${task.isCompleted}`);
      });
    } else {
      console.error('❌ Error:', data.error);
    }
  });
```

**Expected Output:**
```
✅ Agent Onboarding Status:
Pipeline: Agent Onboarding
Current Stage: Profile Setup
Stage Entered At: 2024-01-XX...

📋 Tasks Assigned:
Total: X
Completed: 0
Remaining: X

Tasks:
- Task Name 1
  Status: Pending
  Due Date: 1/XX/2024 (2 days from now)
  Completed: false
```

---

## 📋 Step 3: Check Tasks in UI

1. Go to `/crm/tasks`
2. Filter by the agent you just created
3. Verify:
   - ✅ Tasks are visible
   - ✅ Tasks have due dates (2 days from now)
   - ✅ Tasks are linked to Stage 1
   - ✅ Tasks show status "Pending"

---

## 🎯 Step 4: Test Stage Progression (Manual)

### Complete Stage 1 Tasks

1. Go to `/crm/tasks`
2. Mark all Stage 1 tasks as completed
3. Or use API:

```javascript
// Get tasks for agent
fetch(`/api/tasks?agentId=${agentId}`)
  .then(r => r.json())
  .then(data => {
    const stage1Tasks = data.data.filter(t => t.stageId === 'ec1b1026-dd15-4cb5-abbd-41d2280af7fb');
    console.log(`Found ${stage1Tasks.length} tasks in Stage 1`);
    
    // Mark all as completed (you'll need to implement task completion API)
    // For now, this is just to show the tasks
  });
```

### Manually Complete Stage 1

```javascript
// Complete Stage 1 and move to Stage 2
fetch(`/api/onboarding/${agentId}/complete-stage`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    approvedBy: 'admin-user-id', // Replace with actual user ID
    moveToNextStage: true  // Automatically move to next stage
  })
})
.then(r => r.json())
.then(data => {
  if (data.success) {
    console.log('✅ Stage completed!');
    console.log('Completed:', data.data.completedStageName);
    console.log('Moved to:', data.data.nextStageName);
  } else {
    console.error('❌ Error:', data.error);
  }
});
```

**Expected Result:**
- Stage 1 marked as complete
- Agent moves to Stage 2: "Compliance"
- New tasks assigned from Stage 2's task sets
- New tasks have due dates (5 days from now)

---

## 🔄 Step 5: Verify Stage 2 Tasks

```javascript
fetch(`/api/onboarding/${agentId}/current-stage`)
  .then(r => r.json())
  .then(data => {
    console.log('Current Stage:', data.data.currentStage?.name);
    console.log('Tasks:', data.data.tasks.length);
    data.data.tasks.forEach(task => {
      console.log(`- ${task.title} (Due: ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'})`);
    });
  });
```

---

## 📊 Step 6: Check Agent Details Page

1. Go to `/crm/agents`
2. Click on the test agent
3. Go to "Tasks Checklist" tab
4. Verify:
   - ✅ Current stage is displayed
   - ✅ Tasks are grouped by stage
   - ✅ Progress is shown
   - ✅ Due dates are visible

---

## 🐛 Troubleshooting

### Agent not enrolled in pipeline?

**Check:**
```javascript
fetch(`/api/agents/${agentId}`)
  .then(r => r.json())
  .then(data => {
    console.log('Agent:', data.data);
    if (data.data.onboarding) {
      console.log('Onboarding exists:', data.data.onboarding);
    } else {
      console.log('❌ No onboarding record found');
    }
  });
```

**Fix:** Check server logs when creating agent. Look for:
- "Agent enrolled in pipeline..."
- "Error setting up agent onboarding..."

### No tasks assigned?

**Check:**
```javascript
fetch(`/api/tasks?agentId=${agentId}`)
  .then(r => r.json())
  .then(data => {
    console.log('Tasks:', data.data.length);
    if (data.data.length === 0) {
      console.log('❌ No tasks found. Check:');
      console.log('1. Are task sets assigned to Stage 1?');
      console.log('2. Do task sets contain active task templates?');
      console.log('3. Check server logs for errors');
    }
  });
```

**Fix:**
1. Verify task sets are assigned: Check `/api/pipelines/[id]/stages/[stageId]/task-sets`
2. Verify task templates are active in the task sets
3. Check server console for errors

### Tasks don't have due dates?

**Check:**
```javascript
fetch(`/api/tasks?agentId=${agentId}`)
  .then(r => r.json())
  .then(data => {
    data.data.forEach(task => {
      if (!task.dueDate) {
        console.log(`❌ Task "${task.title}" has no due date`);
      }
    });
  });
```

**Fix:** Verify `defaultDueDays` is set correctly on the stage-task-set assignment.

---

## ✅ Success Criteria

Your setup is working correctly if:

1. ✅ New agent is automatically enrolled in "Agent Onboarding" pipeline
2. ✅ Agent enters Stage 1 automatically
3. ✅ Tasks are assigned from Stage 1's task sets
4. ✅ Tasks have correct due dates (2 days from now)
5. ✅ Tasks are linked to Stage 1
6. ✅ Stage progression works (manual approval)
7. ✅ New tasks are assigned when entering next stage
8. ✅ New tasks have correct due dates for their stage

---

## 🚀 Next Steps After Testing

Once everything works:

1. **Create more task sets** for each stage if needed
2. **Add more task templates** to existing task sets
3. **Customize due dates** per task set if needed
4. **Build UI components** for:
   - Pipeline stage configuration (assign task sets via UI)
   - Agent onboarding dashboard
   - Stage progression UI

---

## 📝 Quick Test Checklist

- [ ] Create test agent
- [ ] Verify agent enrolled in pipeline
- [ ] Verify agent in Stage 1
- [ ] Verify tasks assigned
- [ ] Verify tasks have due dates
- [ ] Complete Stage 1 tasks
- [ ] Manually approve Stage 1
- [ ] Verify agent moved to Stage 2
- [ ] Verify Stage 2 tasks assigned
- [ ] Verify Stage 2 tasks have due dates (5 days)

---

**Ready to test?** Create a new agent and follow the steps above! 🎉
