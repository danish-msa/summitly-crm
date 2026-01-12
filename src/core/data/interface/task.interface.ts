/**
 * Task Interface
 * 
 * This interface defines the structure of Tasks in the CRM system.
 * Tasks are linked to agents and can be created from templates.
 */

export interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  estimatedDuration?: number; // in minutes
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  
  // Assignment
  agentId?: string;
  agent?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  
  // Template Reference
  templateId?: string;
  template?: TaskTemplate;
  
  // Completion Tracking
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  
  // Due Date
  dueDate?: string;
  
  // Additional Metadata
  tags?: string[];
  notes?: string;
  
  // Assignment Info
  assignedBy?: string;
  assignedAt?: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskResponse {
  success: boolean;
  data?: Task | Task[];
  total?: number;
  limit?: number;
  offset?: number;
  error?: string;
}

export interface TaskTemplateResponse {
  success: boolean;
  data?: TaskTemplate | TaskTemplate[];
  total?: number;
  error?: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  category?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  status?: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  agentId?: string;
  templateId?: string;
  dueDate?: string;
  tags?: string[];
  notes?: string;
  assignedBy?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  category?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  status?: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  isCompleted?: boolean;
  completedAt?: string;
  completedBy?: string;
  dueDate?: string;
  tags?: string[];
  notes?: string;
}

export interface CreateTaskTemplateRequest {
  name: string;
  description?: string;
  category?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  estimatedDuration?: number;
  isActive?: boolean;
  order?: number;
  createdBy?: string;
}

export interface UpdateTaskTemplateRequest {
  name?: string;
  description?: string;
  category?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  estimatedDuration?: number;
  isActive?: boolean;
  order?: number;
}
