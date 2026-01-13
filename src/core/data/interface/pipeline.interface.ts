/**
 * Pipeline Module Interfaces
 */

export interface PipelineStage {
  id: string;
  pipelineId: string;
  name: string;
  order: number;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineAccessUser {
  id: string;
  pipelineId: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  createdAt: string;
}

export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  status: 'Active' | 'Inactive';
  accessType: 'All' | 'Selected';
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  stages?: PipelineStage[];
  accessUsers?: PipelineAccessUser[];
  // Calculated fields
  totalDealValue?: string;
  numberOfDeals?: number;
}

export interface CreatePipelineRequest {
  name: string;
  description?: string;
  status?: 'Active' | 'Inactive';
  accessType?: 'All' | 'Selected';
  stages?: Array<{
    name: string;
    order?: number;
    color?: string;
  }>;
  accessUserIds?: string[];
}

export interface UpdatePipelineRequest {
  name?: string;
  description?: string;
  status?: 'Active' | 'Inactive';
  accessType?: 'All' | 'Selected';
  stages?: Array<{
    id?: string; // For existing stages
    name: string;
    order?: number;
    color?: string;
  }>;
  accessUserIds?: string[];
}

export interface PipelineResponse {
  success: boolean;
  data?: Pipeline | Pipeline[];
  error?: string;
  total?: number;
  limit?: number;
  offset?: number;
}
