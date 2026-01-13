# Agent Onboarding Pipeline Architecture Recommendation

## 🎯 Overview

This document outlines the recommended architecture for integrating **Agent Onboarding** with **Pipelines** and **Task Sets** to create a structured, stage-based onboarding workflow.

---

## 📊 Current State Analysis

### Existing Models:
1. **Agent** - Basic agent information
2. **AgentOnboarding** - Onboarding status tracking (but no pipeline linkage)
3. **Pipeline** & **PipelineStage** - Workflow structure (just created)
4. **TaskSet** & **TaskSetTemplate** - Grouped task collections
5. **Task** & **TaskTemplate** - Individual tasks with deadlines

### Current Flow:
- When agent is created → Tasks are assigned from active templates (not organized by stages)
- AgentOnboarding exists but isn't linked to pipeline stages
- No stage-based task assignment

---

## 🏗️ Recommended Architecture: **Hybrid Approach**

### Core Concept:
**Link AgentOnboarding to Pipeline → Associate Task Sets with Pipeline Stages → Auto-assign tasks when agent enters a stage**

---

## 📐 Database Schema Changes

### 1. **Extend AgentOnboarding Model**

Add pipeline tracking fields:

```prisma
model AgentOnboarding {
  // ... existing fields ...
  
  // NEW: Pipeline Integration
  pipelineId      String?   @map("pipeline_id")
  pipeline        Pipeline? @relation(fields: [pipelineId], references: [id], onDelete: SetNull)
  currentStageId  String?   @map("current_stage_id")
  currentStage    PipelineStage? @relation(fields: [currentStageId], references: [id], onDelete: SetNull)
  
  // Stage progression tracking
  stageEnteredAt  DateTime? @map("stage_entered_at")
  stageCompletedAt DateTime? @map("stage_completed_at")
  
  // ... existing relations ...
}
```

### 2. **Link Pipeline Stages to Task Sets**

Create a join table to associate task sets with pipeline stages:

```prisma
model PipelineStageTaskSet {
  id          String    @id @default(uuid())
  stageId     String    @map("stage_id")
  stage       PipelineStage @relation(fields: [stageId], references: [id], onDelete: Cascade)
  taskSetId   String    @map("task_set_id")
  taskSet     TaskSet   @relation(fields: [taskSetId], references: [id], onDelete: Cascade)
  order       Int       @default(0) // Order if multiple task sets per stage
  isRequired  Boolean   @default(true) @map("is_required")
  
  // Optional: Stage-specific task deadlines
  defaultDueDays Int?   @map("default_due_days") // Days from stage entry to task due date
  
  createdAt   DateTime  @default(now()) @map("created_at")
  
  @@unique([stageId, taskSetId])
  @@index([stageId])
  @@index([taskSetId])
  @@map("pipeline_stage_task_sets")
}
```

### 3. **Update PipelineStage Model**

Add relation to task sets:

```prisma
model PipelineStage {
  // ... existing fields ...
  
  // NEW: Relations
  taskSets    PipelineStageTaskSet[]
  onboardingRecords AgentOnboarding[] // Agents currently in this stage
}
```

### 4. **Update TaskSet Model**

Add relation to pipeline stages:

```prisma
model TaskSet {
  // ... existing fields ...
  
  // NEW: Relations
  pipelineStages PipelineStageTaskSet[]
}
```

### 5. **Enhance Task Model** (Optional but Recommended)

Add stage tracking:

```prisma
model Task {
  // ... existing fields ...
  
  // NEW: Stage tracking
  stageId     String?   @map("stage_id")
  stage       PipelineStage? @relation(fields: [stageId], references: [id], onDelete: SetNull)
}
```

---

## 🔄 Workflow Flow

### **Step 1: Agent Creation**
```
1. Agent is created via POST /api/agents
2. Automatically create AgentOnboarding record
3. Find "Agent Onboarding" pipeline (by name or ID)
4. Set pipelineId and currentStageId = first stage
5. Trigger stage entry logic
```

### **Step 2: Stage Entry Logic**
```
When agent enters a stage:
1. Find all TaskSets linked to that PipelineStage
2. For each TaskSet:
   - Get all active TaskTemplates in the set
   - Create Task instances for the agent
   - Set dueDate based on defaultDueDays (if configured)
   - Link task to stageId
3. Update AgentOnboarding:
   - currentStageId = new stage
   - stageEnteredAt = now()
```

### **Step 3: Stage Progression**
```
When all tasks in a stage are completed:
1. Check if stage is complete (all required tasks done)
2. Auto-advance to next stage (or manual approval)
3. Trigger stage entry logic for next stage
4. Update AgentOnboarding:
   - stageCompletedAt = now()
   - currentStageId = next stage
```

### **Step 4: Task Completion**
```
When a task is marked complete:
1. Update task.isCompleted = true
2. Check if all tasks in current stage are complete
3. If yes, trigger stage progression logic
```

---

## 🎨 Example: 4-Stage Onboarding Pipeline

### **Stage 1: "Profile Setup"**
- **Task Sets**: "Basic Information Set", "Contact Details Set"
- **Tasks**: Fill profile, Upload photo, Add emergency contact
- **Due Date**: 2 days from entry

### **Stage 2: "Compliance & Documents"**
- **Task Sets**: "RECO Documents Set", "Insurance Set"
- **Tasks**: Upload RECO license, E&O Insurance, Government ID
- **Due Date**: 5 days from entry

### **Stage 3: "Training & Agreements"**
- **Task Sets**: "Training Set", "Agreements Set"
- **Tasks**: Complete brokerage policies training, Sign contractor agreement
- **Due Date**: 7 days from entry

### **Stage 4: "Final Approval"**
- **Task Sets**: "Review Set"
- **Tasks**: Admin review, Final approval, Account activation
- **Due Date**: 3 days from entry

---

## 💻 Implementation Plan

### **Phase 1: Database Schema**
1. ✅ Create migration for `PipelineStageTaskSet` table
2. ✅ Add `pipelineId`, `currentStageId` to `AgentOnboarding`
3. ✅ Add `stageId` to `Task` (optional)
4. ✅ Update Prisma schema
5. ✅ Run migration

### **Phase 2: API Endpoints**

#### **A. Pipeline Stage Management**
- `POST /api/pipelines/[id]/stages/[stageId]/task-sets` - Assign task set to stage
- `GET /api/pipelines/[id]/stages/[stageId]/task-sets` - Get task sets for stage
- `DELETE /api/pipelines/[id]/stages/[stageId]/task-sets/[taskSetId]` - Remove task set from stage

#### **B. Agent Onboarding Pipeline**
- `POST /api/onboarding/[id]/enter-stage` - Move agent to next stage
- `GET /api/onboarding/[id]/current-stage` - Get current stage info
- `POST /api/onboarding/[id]/complete-stage` - Mark stage complete

#### **C. Auto-Assignment**
- Modify `POST /api/agents` to:
  - Create AgentOnboarding
  - Link to "Agent Onboarding" pipeline
  - Enter first stage
  - Auto-assign tasks from stage's task sets

### **Phase 3: Business Logic**

#### **Stage Entry Handler**
```typescript
async function enterStage(agentId: string, stageId: string) {
  // 1. Get stage with task sets
  const stage = await prisma.pipelineStage.findUnique({
    where: { id: stageId },
    include: {
      taskSets: {
        include: {
          taskSet: {
            include: {
              templates: {
                include: { template: true },
                where: { template: { isActive: true } }
              }
            }
          }
        }
      }
    }
  });

  // 2. Create tasks from all task sets
  const tasks = [];
  for (const stageTaskSet of stage.taskSets) {
    const taskSet = stageTaskSet.taskSet;
    const dueDate = stageTaskSet.defaultDueDays 
      ? addDays(new Date(), stageTaskSet.defaultDueDays)
      : null;
    
    for (const tst of taskSet.templates) {
      tasks.push({
        title: tst.template.name,
        description: tst.template.description,
        category: tst.template.category,
        priority: tst.template.priority,
        status: 'Pending',
        agentId,
        templateId: tst.template.id,
        stageId,
        dueDate,
        isCompleted: false,
      });
    }
  }

  // 3. Create all tasks
  await prisma.task.createMany({ data: tasks });

  // 4. Update AgentOnboarding
  await prisma.agentOnboarding.update({
    where: { agentId },
    data: {
      currentStageId: stageId,
      stageEnteredAt: new Date(),
    }
  });
}
```

### **Phase 4: UI Components**

#### **A. Pipeline Configuration UI**
- Add "Task Sets" tab to pipeline stage configuration
- Allow assigning multiple task sets per stage
- Set default due days per task set

#### **B. Agent Onboarding Dashboard**
- Show current stage with progress
- Display tasks for current stage
- Show stage completion status
- Allow manual stage advancement (if needed)

#### **C. Task List View**
- Filter by stage
- Show stage badge on tasks
- Group tasks by stage

---

## ✅ Advantages of This Approach

1. **Reuses Existing Infrastructure**
   - Leverages Pipeline system you already built
   - Uses TaskSet system already in place
   - Minimal new code needed

2. **Flexible & Scalable**
   - Easy to add/remove stages
   - Can assign multiple task sets per stage
   - Supports different onboarding paths (Salesperson vs Broker)

3. **Clear Separation of Concerns**
   - Pipeline = Structure (stages)
   - TaskSet = Content (tasks)
   - AgentOnboarding = Progress tracking

4. **Deadline Management**
   - Can set default due days per stage/task set
   - Tasks automatically get deadlines when assigned

5. **Future-Proof**
   - Can reuse pipelines for other workflows (e.g., "Agent Training Pipeline")
   - Task sets can be reused across different pipelines

---

## 🤔 Alternative Approaches Considered

### **Option A: Use Only AgentOnboarding (No Pipeline)**
- ❌ Would duplicate pipeline functionality
- ❌ Less flexible for future workflows
- ❌ Harder to maintain

### **Option B: Use Only Pipeline (No AgentOnboarding)**
- ❌ Loses agent-specific onboarding fields
- ❌ Can't track detailed onboarding status
- ❌ Less specialized for agent onboarding

### **Option C: Hybrid (RECOMMENDED) ✅**
- ✅ Best of both worlds
- ✅ Flexible and maintainable
- ✅ Scalable for future needs

---

## 📝 Next Steps

1. **Review this architecture** - Does it meet your requirements?
2. **Confirm the 4 stages** - What should they be named?
3. **Define task sets** - What task sets do you want per stage?
4. **Set deadlines** - What are reasonable due dates per stage?
5. **Start implementation** - Begin with Phase 1 (Database Schema)

---

## ❓ Questions for You

1. Should stage progression be **automatic** (when all tasks complete) or **manual** (admin approval)?
2. Can an agent be in multiple stages at once, or strictly one at a time?
3. What happens if an agent skips a stage? (Should this be prevented?)
4. Do you want to track **time spent in each stage** for analytics?
5. Should tasks have **different deadlines** within the same stage, or all the same?

---

## 🚀 Ready to Implement?

Once you approve this architecture, I'll:
1. Create the database migration
2. Update Prisma schema
3. Implement the API endpoints
4. Update agent creation to auto-enroll in pipeline
5. Build the UI components

Let me know your thoughts and any adjustments needed!
