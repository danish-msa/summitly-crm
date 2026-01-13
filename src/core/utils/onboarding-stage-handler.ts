/**
 * Utility functions for handling agent onboarding stage progression
 */

import { prisma } from '@/core/database/prisma';

/**
 * Enter a stage: Assign tasks from all task sets linked to the stage
 */
export async function enterStage(agentId: string, stageId: string, assignedBy?: string) {
  // 1. Get stage with task sets
  const stage = await prisma.pipelineStage.findUnique({
    where: { id: stageId },
    include: {
      taskSets: {
        include: {
          taskSet: {
            include: {
              templates: {
                include: {
                  template: true,
                },
                orderBy: {
                  order: 'asc',
                },
              },
            },
          },
        },
        orderBy: {
          order: 'asc',
        },
      },
      pipeline: true,
    },
  });

  if (!stage) {
    throw new Error('Pipeline stage not found');
  }

  // 2. Get agent onboarding record
  const onboarding = await prisma.agentOnboarding.findUnique({
    where: { agentId },
  });

  if (!onboarding) {
    throw new Error('Agent onboarding record not found');
  }

  // 3. Create tasks from all task sets
  const tasksToCreate = [];
  
  for (const stageTaskSet of stage.taskSets) {
    const taskSet = stageTaskSet.taskSet;
    
    // Calculate due date based on defaultDueDays
    let dueDate: Date | null = null;
    if (stageTaskSet.defaultDueDays !== null && stageTaskSet.defaultDueDays !== undefined) {
      dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + stageTaskSet.defaultDueDays);
    }
    
    // Only include active templates
    for (const tst of taskSet.templates) {
      if (tst.template.isActive) {
        tasksToCreate.push({
          title: tst.template.name,
          description: tst.template.description,
          category: tst.template.category,
          priority: tst.template.priority as 'Low' | 'Medium' | 'High' | 'Urgent',
          status: 'Pending' as const,
          agentId,
          templateId: tst.template.id,
          stageId,
          dueDate,
          isCompleted: false,
          assignedBy: assignedBy || null,
        });
      }
    }
  }

  // 4. Create all tasks in a transaction
  if (tasksToCreate.length > 0) {
    await prisma.task.createMany({
      data: tasksToCreate,
    });
  }

  // 5. Update AgentOnboarding
  await prisma.agentOnboarding.update({
    where: { agentId },
    data: {
      currentStageId: stageId,
      stageEnteredAt: new Date(),
      // Update status if needed
      status: onboarding.status === 'Invited' ? 'Onboarding Started' : onboarding.status,
      onboardingStartedAt: onboarding.onboardingStartedAt || new Date(),
    },
  });

  return {
    stage,
    tasksCreated: tasksToCreate.length,
    tasks: tasksToCreate,
  };
}

/**
 * Check if all required tasks in a stage are completed
 */
export async function isStageComplete(agentId: string, stageId: string): Promise<boolean> {
  // Get all required task sets for this stage
  const stage = await prisma.pipelineStage.findUnique({
    where: { id: stageId },
    include: {
      taskSets: {
        where: {
          isRequired: true,
        },
      },
    },
  });

  if (!stage || stage.taskSets.length === 0) {
    return true; // No required task sets, stage is complete
  }

  // Get all tasks for this agent in this stage
  const tasks = await prisma.task.findMany({
    where: {
      agentId,
      stageId,
    },
  });

  if (tasks.length === 0) {
    return false; // No tasks assigned yet
  }

  // Check if all required tasks are completed
  const allCompleted = tasks.every((task) => task.isCompleted);
  
  return allCompleted;
}

/**
 * Get next stage in pipeline
 */
export async function getNextStage(pipelineId: string, currentStageId: string): Promise<string | null> {
  const currentStage = await prisma.pipelineStage.findUnique({
    where: { id: currentStageId },
  });

  if (!currentStage) {
    return null;
  }

  // Get next stage by order
  const nextStage = await prisma.pipelineStage.findFirst({
    where: {
      pipelineId,
      order: {
        gt: currentStage.order,
      },
    },
    orderBy: {
      order: 'asc',
    },
  });

  return nextStage?.id || null;
}
