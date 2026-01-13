# Guide: Assign Task Sets to Pipeline Stages

This guide shows you how to assign task sets to each stage of your "Agent Onboarding" pipeline.

---

## 📋 Prerequisites

Before you start, you need:
1. ✅ "Agent Onboarding" pipeline created
2. ✅ 4 stages created in the pipeline
3. ✅ Task sets created (e.g., "Basic Information Set", "RECO Documents Set", etc.)

---

## 🔍 Step 1: Get Your Pipeline and Stage IDs

### Option A: Via Browser Console (Easiest)

1. Go to `/crm/pipeline` in your browser
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run this code:

```javascript
// Fetch pipelines
fetch('/api/pipelines?includeStages=true')
  .then(r => r.json())
  .then(data => {
    const pipeline = data.data.find(p => p.name.includes('Agent Onboarding'));
    if (pipeline) {
      console.log('Pipeline ID:', pipeline.id);
      console.log('Pipeline Name:', pipeline.name);
      console.log('\nStages:');
      pipeline.stages.forEach((stage, index) => {
        console.log(`Stage ${index + 1}: ${stage.name}`);
        console.log(`  ID: ${stage.id}`);
        console.log(`  Order: ${stage.order}`);
        console.log('');
      });
    } else {
      console.log('Pipeline not found');
    }
  });
```

### Option B: Via API Directly

```bash
# Get all pipelines with stages
curl "http://localhost:3000/api/pipelines?includeStages=true"
```

Look for the pipeline named "Agent Onboarding" and note:
- Pipeline ID
- Stage IDs (in order: Profile Setup, Compliance, Training, Final Approval)

---

## 🔍 Step 2: Get Your Task Set IDs

### Option A: Via Browser Console

1. Go to `/crm/tasks` in your browser
2. Open browser DevTools (F12)
3. Go to Console tab
4. Run this code:

```javascript
// Fetch task sets
fetch('/api/tasks/sets')
  .then(r => r.json())
  .then(data => {
    console.log('Task Sets:');
    data.data.forEach(set => {
      console.log(`Name: ${set.name}`);
      console.log(`  ID: ${set.id}`);
      console.log(`  Category: ${set.category || 'N/A'}`);
      console.log('');
    });
  });
```

### Option B: Via API Directly

```bash
# Get all task sets
curl "http://localhost:3000/api/tasks/sets"
```

Note the IDs of the task sets you want to assign to each stage.

---

## 📝 Step 3: Assign Task Sets to Stages

Use the following API calls. Replace:
- `[PIPELINE_ID]` with your pipeline ID
- `[STAGE_ID]` with the stage ID
- `[TASK_SET_ID]` with the task set ID

### Stage 1: "Profile Setup" (defaultDueDays: 2)

```bash
POST /api/pipelines/[PIPELINE_ID]/stages/[STAGE_1_ID]/task-sets
Content-Type: application/json

{
  "taskSetId": "[TASK_SET_ID]",
  "order": 0,
  "isRequired": true,
  "defaultDueDays": 2
}
```

**Example using curl:**
```bash
curl -X POST "http://localhost:3000/api/pipelines/YOUR_PIPELINE_ID/stages/YOUR_STAGE_1_ID/task-sets" \
  -H "Content-Type: application/json" \
  -d '{
    "taskSetId": "YOUR_TASK_SET_ID",
    "order": 0,
    "isRequired": true,
    "defaultDueDays": 2
  }'
```

**Example using JavaScript (Browser Console):**
```javascript
fetch('/api/pipelines/YOUR_PIPELINE_ID/stages/YOUR_STAGE_1_ID/task-sets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskSetId: 'YOUR_TASK_SET_ID',
    order: 0,
    isRequired: true,
    defaultDueDays: 2
  })
})
.then(r => r.json())
.then(data => console.log('Success:', data));
```

---

### Stage 2: "Compliance" (defaultDueDays: 5)

```bash
POST /api/pipelines/[PIPELINE_ID]/stages/[STAGE_2_ID]/task-sets
Content-Type: application/json

{
  "taskSetId": "[TASK_SET_ID]",
  "order": 0,
  "isRequired": true,
  "defaultDueDays": 5
}
```

---

### Stage 3: "Training" (defaultDueDays: 7)

```bash
POST /api/pipelines/[PIPELINE_ID]/stages/[STAGE_3_ID]/task-sets
Content-Type: application/json

{
  "taskSetId": "[TASK_SET_ID]",
  "order": 0,
  "isRequired": true,
  "defaultDueDays": 7
}
```

---

### Stage 4: "Final Approval" (defaultDueDays: 3)

```bash
POST /api/pipelines/[PIPELINE_ID]/stages/[STAGE_4_ID]/task-sets
Content-Type: application/json

{
  "taskSetId": "[TASK_SET_ID]",
  "order": 0,
  "isRequired": true,
  "defaultDueDays": 3
}
```

---

## 🚀 Complete Script (Copy & Paste)

Here's a complete script you can run in your browser console to do everything at once:

```javascript
// ============================================
// Complete Script: Assign Task Sets to Stages
// ============================================

// STEP 1: Update these IDs after running the "Get IDs" scripts above
const CONFIG = {
  pipelineId: 'YOUR_PIPELINE_ID',
  stages: {
    'Profile Setup': {
      id: 'YOUR_STAGE_1_ID',
      defaultDueDays: 2,
      taskSetIds: ['TASK_SET_ID_1', 'TASK_SET_ID_2'] // Can assign multiple
    },
    'Compliance': {
      id: 'YOUR_STAGE_2_ID',
      defaultDueDays: 5,
      taskSetIds: ['TASK_SET_ID_3']
    },
    'Training': {
      id: 'YOUR_STAGE_3_ID',
      defaultDueDays: 7,
      taskSetIds: ['TASK_SET_ID_4']
    },
    'Final Approval': {
      id: 'YOUR_STAGE_4_ID',
      defaultDueDays: 3,
      taskSetIds: ['TASK_SET_ID_5']
    }
  }
};

// Function to assign task set to stage
async function assignTaskSetToStage(pipelineId, stageId, taskSetId, order, defaultDueDays) {
  try {
    const response = await fetch(`/api/pipelines/${pipelineId}/stages/${stageId}/task-sets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskSetId,
        order,
        isRequired: true,
        defaultDueDays
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ Assigned task set ${taskSetId} to stage (${defaultDueDays} days)`);
      return data;
    } else {
      console.error(`❌ Failed:`, data.error);
      return null;
    }
  } catch (error) {
    console.error(`❌ Error:`, error);
    return null;
  }
}

// Assign all task sets
async function assignAll() {
  console.log('🚀 Starting task set assignments...\n');
  
  for (const [stageName, stageConfig] of Object.entries(CONFIG.stages)) {
    console.log(`\n📋 Assigning to stage: ${stageName}`);
    
    for (let i = 0; i < stageConfig.taskSetIds.length; i++) {
      const taskSetId = stageConfig.taskSetIds[i];
      await assignTaskSetToStage(
        CONFIG.pipelineId,
        stageConfig.id,
        taskSetId,
        i, // order
        stageConfig.defaultDueDays
      );
      
      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log('\n✅ All assignments complete!');
}

// Run the script
assignAll();
```

---

## ✅ Verify Assignments

After assigning, verify the assignments:

```javascript
// Get task sets for a specific stage
fetch('/api/pipelines/YOUR_PIPELINE_ID/stages/YOUR_STAGE_ID/task-sets')
  .then(r => r.json())
  .then(data => {
    console.log('Task Sets for Stage:');
    data.data.forEach(sts => {
      console.log(`- ${sts.taskSet.name}`);
      console.log(`  Due Days: ${sts.defaultDueDays}`);
      console.log(`  Required: ${sts.isRequired}`);
    });
  });
```

---

## 📝 Example: Real-World Scenario

Let's say you have:
- **Pipeline ID**: `abc123`
- **Stage 1 ID** (Profile Setup): `stage1`
- **Stage 2 ID** (Compliance): `stage2`
- **Task Set "Basic Info" ID**: `taskset1`
- **Task Set "RECO Docs" ID**: `taskset2`

### Assign to Stage 1:
```javascript
fetch('/api/pipelines/abc123/stages/stage1/task-sets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskSetId: 'taskset1',
    order: 0,
    isRequired: true,
    defaultDueDays: 2
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

### Assign to Stage 2:
```javascript
fetch('/api/pipelines/abc123/stages/stage2/task-sets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    taskSetId: 'taskset2',
    order: 0,
    isRequired: true,
    defaultDueDays: 5
  })
})
.then(r => r.json())
.then(data => console.log(data));
```

---

## 🎯 Quick Reference

| Stage | defaultDueDays | Example Task Sets |
|-------|----------------|-------------------|
| Profile Setup | 2 | Basic Information Set, Contact Details Set |
| Compliance | 5 | RECO Documents Set, Insurance Set |
| Training | 7 | Training Set, Agreements Set |
| Final Approval | 3 | Review Set |

---

## ❓ Troubleshooting

### Error: "Task set is already assigned to this stage"
- The task set is already assigned. You can update it using `PUT` instead of `POST`.

### Error: "Pipeline stage not found"
- Check that the stage ID is correct.
- Verify the stage belongs to the pipeline.

### Error: "Task set not found"
- Check that the task set ID is correct.
- Verify the task set exists.

---

## 🔄 Update Existing Assignment

To update an existing assignment (e.g., change defaultDueDays):

```javascript
PUT /api/pipelines/[PIPELINE_ID]/stages/[STAGE_ID]/task-sets/[TASK_SET_ID]

{
  "defaultDueDays": 10,  // Update to 10 days
  "isRequired": true,
  "order": 0
}
```

---

**Need help?** Check the API response for detailed error messages!
