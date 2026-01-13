# Agent Onboarding Pipeline Implementation Summary

## ✅ Implementation Complete

This document summarizes the implementation of the Agent Onboarding Pipeline integration.

---

## 📋 What Was Implemented

### 1. **Database Schema Changes**

#### **AgentOnboarding Model** - Added Pipeline Integration
- `pipelineId` - Links to the "Agent Onboarding" pipeline
- `currentStageId` - Tracks which stage the agent is currently in
- `stageEnteredAt` - Timestamp when agent entered current stage
- `stageCompletedAt` - Timestamp when agent completed current stage

#### **PipelineStageTaskSet Model** - New Join Table
- Links `PipelineStage` to `TaskSet`
- Fields:
  - `stageId` - The pipeline stage
  - `taskSetId` - The task set to assign
  - `order` - Order if multiple task sets per stage
  - `isRequired` - Whether this task set is required
  - `defaultDueDays` - Days from stage entry to task due date (editable)

#### **Task Model** - Added Stage Tracking
- `stageId` - Links task to the pipeline stage it belongs to

### 2. **API Endpoints Created**

#### **Pipeline Stage Task Set Management**
- `GET /api/pipelines/[id]/stages/[stageId]/task-sets` - List task sets for a stage
- `POST /api/pipelines/[id]/stages/[stageId]/task-sets` - Assign task set to stage
- `PUT /api/pipelines/[id]/stages/[stageId]/task-sets/[taskSetId]` - Update assignment (order, isRequired, defaultDueDays)
- `DELETE /api/pipelines/[id]/stages/[stageId]/task-sets/[taskSetId]` - Remove task set from stage

#### **Agent Onboarding Stage Management**
- `GET /api/onboarding/[id]/current-stage` - Get current stage info and progress
- `POST /api/onboarding/[id]/enter-stage` - Move agent to a specific stage (assigns tasks)
- `POST /api/onboarding/[id]/complete-stage` - Mark stage complete (manual admin approval)

### 3. **Business Logic**

#### **Stage Entry Handler** (`src/core/utils/onboarding-stage-handler.ts`)
- `enterStage()` - Enters a stage and assigns all tasks from linked task sets
- `isStageComplete()` - Checks if all required tasks in a stage are completed
- `getNextStage()` - Gets the next stage in the pipeline

### 4. **Auto-Enrollment on Agent Creation**

When an agent is created:
1. ✅ `AgentOnboarding` record is automatically created
2. ✅ System finds "Agent Onboarding" pipeline (by name)
3. ✅ Agent is linked to the pipeline
4. ✅ Agent enters first stage automatically
5. ✅ Tasks are assigned from all task sets linked to the first stage
6. ✅ Tasks get due dates based on `defaultDueDays` configuration

---

## 🎯 4-Stage Onboarding Pipeline

### **Stage 1: "Profile Setup"**
- Default due date: **2 days** (editable)
- Task sets: Assign "Basic Information Set", "Contact Details Set", etc.

### **Stage 2: "Compliance"**
- Default due date: **5 days** (editable)
- Task sets: Assign "RECO Documents Set", "Insurance Set", etc.

### **Stage 3: "Training"**
- Default due date: **7 days** (editable)
- Task sets: Assign "Training Set", "Agreements Set", etc.

### **Stage 4: "Final Approval"**
- Default due date: **3 days** (editable)
- Task sets: Assign "Review Set", etc.

---

## 📝 Next Steps: Setup Instructions

### **Step 1: Run Database Migration**

```bash
# Run the migration SQL file
psql -U your_user -d your_database -f database/migrations/007_add_pipeline_onboarding_integration.sql
```

Or execute the SQL directly in your database client.

### **Step 2: Regenerate Prisma Client**

```bash
npx prisma generate
```

### **Step 3: Create "Agent Onboarding" Pipeline**

1. Go to `/crm/pipeline`
2. Create a new pipeline named **"Agent Onboarding"**
3. Add 4 stages in order:
   - Stage 1: "Profile Setup" (order: 0)
   - Stage 2: "Compliance" (order: 1)
   - Stage 3: "Training" (order: 2)
   - Stage 4: "Final Approval" (order: 3)

### **Step 4: Create Task Sets**

1. Go to `/crm/tasks` (Task Sets section)
2. Create task sets for each stage:
   - **"Basic Information Set"** - For Stage 1
   - **"Contact Details Set"** - For Stage 1
   - **"RECO Documents Set"** - For Stage 2
   - **"Insurance Set"** - For Stage 2
   - **"Training Set"** - For Stage 3
   - **"Agreements Set"** - For Stage 3
   - **"Review Set"** - For Stage 4

### **Step 5: Assign Task Sets to Pipeline Stages**

For each stage in the "Agent Onboarding" pipeline:

1. **Option A: Via API** (recommended for bulk setup)
```typescript
// Assign task set to stage
POST /api/pipelines/[pipelineId]/stages/[stageId]/task-sets
{
  "taskSetId": "task-set-id",
  "order": 0,
  "isRequired": true,
  "defaultDueDays": 2  // 2 days for Stage 1, 5 for Stage 2, etc.
}
```

2. **Option B: Via UI** (to be implemented)
   - Add "Task Sets" tab to pipeline stage configuration modal
   - Allow assigning multiple task sets per stage
   - Set default due days per task set

### **Step 6: Test Agent Creation**

1. Create a new agent via `/crm/agents`
2. Verify:
   - AgentOnboarding record is created
   - Agent is linked to "Agent Onboarding" pipeline
   - Agent enters Stage 1 automatically
   - Tasks are assigned from Stage 1's task sets
   - Tasks have correct due dates

---

## 🔄 Workflow Flow

### **Agent Creation**
```
Agent Created
    ↓
AgentOnboarding Created
    ↓
Find "Agent Onboarding" Pipeline
    ↓
Enter Stage 1: "Profile Setup"
    ↓
Auto-assign tasks from Stage 1's task sets
    ↓
Tasks get due dates (2 days from now)
```

### **Stage Progression (Manual)**
```
All tasks in Stage 1 complete?
    ↓
Admin approves → POST /api/onboarding/[id]/complete-stage
    ↓
Mark Stage 1 complete
    ↓
Move to Stage 2: "Compliance"
    ↓
Auto-assign tasks from Stage 2's task sets
    ↓
Tasks get due dates (5 days from now)
```

---

## 📊 API Usage Examples

### **Get Current Stage Info**
```typescript
GET /api/onboarding/[agentId]/current-stage

Response:
{
  "success": true,
  "data": {
    "currentStage": {
      "id": "...",
      "name": "Profile Setup",
      "order": 0
    },
    "tasks": [...],
    "progress": {
      "tasksTotal": 5,
      "tasksCompleted": 2,
      "tasksRemaining": 3,
      "stageComplete": false,
      "currentStageIndex": 0,
      "totalStages": 4
    }
  }
}
```

### **Move Agent to Next Stage**
```typescript
POST /api/onboarding/[agentId]/enter-stage
{
  "stageId": "stage-id",
  "assignedBy": "user-id"
}
```

### **Complete Stage (Manual Approval)**
```typescript
POST /api/onboarding/[agentId]/complete-stage
{
  "approvedBy": "admin-user-id",
  "moveToNextStage": true  // Automatically move to next stage
}
```

---

## ⚙️ Configuration

### **Default Due Dates (Editable)**
- Stage 1: 2 days
- Stage 2: 5 days
- Stage 3: 7 days
- Stage 4: 3 days

These can be changed per task set assignment via:
- `PUT /api/pipelines/[id]/stages/[stageId]/task-sets/[taskSetId]`
- Update `defaultDueDays` field

### **Stage Progression**
- **Manual** (as requested)
- Admin must approve stage completion
- Use `POST /api/onboarding/[id]/complete-stage`
- Can optionally auto-advance to next stage with `moveToNextStage: true`

---

## 🐛 Troubleshooting

### **Agent not enrolled in pipeline?**
- Check if "Agent Onboarding" pipeline exists and is Active
- Check if pipeline has at least one stage
- Check server logs for errors

### **No tasks assigned?**
- Verify task sets are assigned to the stage
- Verify task sets contain active task templates
- Check `defaultDueDays` is set correctly

### **Stage progression not working?**
- Verify all required tasks are completed
- Check `isRequired` flag on task sets
- Verify admin approval endpoint is called

---

## 🚀 Future Enhancements

1. **UI Components**
   - Pipeline stage configuration UI with task set assignment
   - Agent onboarding dashboard showing current stage and progress
   - Task list view filtered by stage

2. **Automatic Stage Progression**
   - Option to enable auto-progression when all tasks complete
   - Configurable per pipeline

3. **Analytics**
   - Time spent in each stage
   - Stage completion rates
   - Task completion rates per stage

---

## ✅ Implementation Checklist

- [x] Database schema updated (Prisma)
- [x] Migration SQL file created
- [x] Pipeline stage task set management APIs
- [x] Agent onboarding stage management APIs
- [x] Stage entry handler with task assignment
- [x] Auto-enrollment on agent creation
- [ ] UI components (pipeline configuration, onboarding dashboard)
- [ ] Task list filtering by stage

---

## 📚 Related Files

- `prisma/schema.prisma` - Database schema
- `database/migrations/007_add_pipeline_onboarding_integration.sql` - Migration
- `src/core/utils/onboarding-stage-handler.ts` - Business logic
- `src/app/api/pipelines/[id]/stages/[stageId]/task-sets/route.ts` - Task set management
- `src/app/api/onboarding/[id]/enter-stage/route.ts` - Stage entry
- `src/app/api/onboarding/[id]/complete-stage/route.ts` - Stage completion
- `src/app/api/agents/route.ts` - Agent creation (auto-enrollment)

---

**Implementation Date:** 2024
**Status:** ✅ Backend Complete - Ready for UI Implementation
