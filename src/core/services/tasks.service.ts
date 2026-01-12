/**
 * Tasks Service
 * 
 * Service functions for interacting with the Tasks API
 */

import {
  Task,
  TaskTemplate,
  TaskResponse,
  TaskTemplateResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateTaskTemplateRequest,
  UpdateTaskTemplateRequest,
  TaskSet,
  TaskSetResponse,
  CreateTaskSetRequest,
  UpdateTaskSetRequest,
  AssignTaskSetRequest,
} from '@/core/data/interface/task.interface';

const API_BASE_URL = '/api/tasks';
const TEMPLATES_API_BASE_URL = '/api/tasks/templates';
const TASK_SETS_API_BASE_URL = '/api/tasks/sets';

/**
 * Get all tasks
 */
export async function getTasks(params?: {
  search?: string;
  status?: string;
  agentId?: string;
  isCompleted?: boolean;
  limit?: number;
  offset?: number;
}): Promise<TaskResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.agentId) queryParams.append('agentId', params.agentId);
    if (params?.isCompleted !== undefined) queryParams.append('isCompleted', String(params.isCompleted));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));

    const url = `${API_BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error fetching tasks:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch tasks',
    };
  }
}

/**
 * Get tasks for a specific agent
 */
export async function getAgentTasks(
  agentId: string,
  params?: {
    status?: string;
    isCompleted?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<TaskResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.isCompleted !== undefined) queryParams.append('isCompleted', String(params.isCompleted));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));

    const url = `${API_BASE_URL}/agent/${agentId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error fetching agent tasks:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch agent tasks',
    };
  }
}

/**
 * Get single task
 */
export async function getTask(id: string): Promise<TaskResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error fetching task:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch task',
    };
  }
}

/**
 * Create new task
 */
export async function createTask(taskData: CreateTaskRequest): Promise<TaskResponse> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error creating task:', error);
    return {
      success: false,
      error: error.message || 'Failed to create task',
    };
  }
}

/**
 * Update task
 */
export async function updateTask(
  id: string,
  taskData: UpdateTaskRequest
): Promise<TaskResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error updating task:', error);
    return {
      success: false,
      error: error.message || 'Failed to update task',
    };
  }
}

/**
 * Delete task
 */
export async function deleteTask(id: string): Promise<TaskResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error deleting task:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete task',
    };
  }
}

/**
 * Toggle task completion
 */
export async function toggleTaskCompletion(
  id: string,
  isCompleted: boolean,
  completedBy?: string
): Promise<TaskResponse> {
  return updateTask(id, {
    isCompleted,
    completedBy,
    completedAt: isCompleted ? new Date().toISOString() : undefined,
  });
}

// ============================================
// Task Templates Service Functions
// ============================================

/**
 * Get all task templates
 */
export async function getTaskTemplates(params?: {
  isActive?: boolean;
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<TaskTemplateResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params?.category) queryParams.append('category', params.category);
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));

    const url = `${TEMPLATES_API_BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error fetching task templates:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch task templates',
    };
  }
}

/**
 * Get single task template
 */
export async function getTaskTemplate(id: string): Promise<TaskTemplateResponse> {
  try {
    const response = await fetch(`${TEMPLATES_API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error fetching task template:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch task template',
    };
  }
}

/**
 * Create new task template
 */
export async function createTaskTemplate(
  templateData: CreateTaskTemplateRequest
): Promise<TaskTemplateResponse> {
  try {
    const response = await fetch(TEMPLATES_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error creating task template:', error);
    return {
      success: false,
      error: error.message || 'Failed to create task template',
    };
  }
}

/**
 * Update task template
 */
export async function updateTaskTemplate(
  id: string,
  templateData: UpdateTaskTemplateRequest
): Promise<TaskTemplateResponse> {
  try {
    const response = await fetch(`${TEMPLATES_API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(templateData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error updating task template:', error);
    return {
      success: false,
      error: error.message || 'Failed to update task template',
    };
  }
}

/**
 * Delete task template
 */
export async function deleteTaskTemplate(id: string): Promise<TaskTemplateResponse> {
  try {
    const response = await fetch(`${TEMPLATES_API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error deleting task template:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete task template',
    };
  }
}

/**
 * Assign tasks from templates to an agent
 */
export async function assignTasksFromTemplates(
  agentId: string,
  templateIds?: string[]
): Promise<TaskResponse> {
  try {
    // Get active task templates
    const templatesResponse = await getTaskTemplates({ isActive: true });
    
    if (!templatesResponse.success || !templatesResponse.data) {
      return {
        success: false,
        error: 'Failed to fetch task templates',
      };
    }

    const templates = Array.isArray(templatesResponse.data)
      ? templatesResponse.data
      : [templatesResponse.data];

    // Filter by templateIds if provided
    const templatesToAssign = templateIds
      ? templates.filter((t) => templateIds.includes(t.id))
      : templates;

    // Create tasks from templates
    const createdTasks = [];
    for (const template of templatesToAssign) {
      const taskResponse = await createTask({
        title: template.name,
        description: template.description,
        category: template.category,
        priority: template.priority,
        agentId,
        templateId: template.id,
        status: 'Pending',
      });

      if (taskResponse.success && taskResponse.data) {
        createdTasks.push(taskResponse.data);
      }
    }

    return {
      success: true,
      data: createdTasks as Task[],
    };
  } catch (error: any) {
    console.error('❌ Network error assigning tasks:', error);
    return {
      success: false,
      error: error.message || 'Failed to assign tasks',
    };
  }
}

// ============================================
// Task Set Service Functions
// ============================================

/**
 * Get all task sets
 */
export async function getTaskSets(params?: {
  search?: string;
  category?: string;
  isActive?: boolean;
  includeTemplates?: boolean;
}): Promise<TaskSetResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params?.includeTemplates) queryParams.append('includeTemplates', 'true');

    const url = `${TASK_SETS_API_BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching task sets:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch task sets',
    };
  }
}

/**
 * Get single task set by ID
 */
export async function getTaskSet(id: string): Promise<TaskSetResponse> {
  try {
    const response = await fetch(`${TASK_SETS_API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching task set:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch task set',
    };
  }
}

/**
 * Create new task set
 */
export async function createTaskSet(taskSetData: CreateTaskSetRequest): Promise<TaskSetResponse> {
  try {
    const response = await fetch(TASK_SETS_API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskSetData),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error creating task set:', error);
    return {
      success: false,
      error: error.message || 'Failed to create task set',
    };
  }
}

/**
 * Update task set
 */
export async function updateTaskSet(
  id: string,
  taskSetData: UpdateTaskSetRequest
): Promise<TaskSetResponse> {
  try {
    const response = await fetch(`${TASK_SETS_API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskSetData),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error updating task set:', error);
    return {
      success: false,
      error: error.message || 'Failed to update task set',
    };
  }
}

/**
 * Delete task set
 */
export async function deleteTaskSet(id: string): Promise<TaskSetResponse> {
  try {
    const response = await fetch(`${TASK_SETS_API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error deleting task set:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete task set',
    };
  }
}

/**
 * Assign task set to agent
 */
export async function assignTaskSetToAgent(
  taskSetId: string,
  assignData: AssignTaskSetRequest
): Promise<TaskResponse> {
  try {
    const response = await fetch(`${TASK_SETS_API_BASE_URL}/${taskSetId}/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assignData),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error assigning task set:', error);
    return {
      success: false,
      error: error.message || 'Failed to assign task set',
    };
  }
}
