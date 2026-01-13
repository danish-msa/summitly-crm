/**
 * Pipelines Service
 * 
 * Service functions for interacting with the Pipelines API
 */

import {
  Pipeline,
  PipelineResponse,
  CreatePipelineRequest,
  UpdatePipelineRequest,
} from '@/core/data/interface/pipeline.interface';

const API_BASE_URL = '/api/pipelines';

/**
 * Get all pipelines
 */
export async function getPipelines(params?: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
  includeStages?: boolean;
  includeAccessUsers?: boolean;
}): Promise<PipelineResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));
    if (params?.includeStages) queryParams.append('includeStages', 'true');
    if (params?.includeAccessUsers) queryParams.append('includeAccessUsers', 'true');

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
    console.error('❌ Network error fetching pipelines:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch pipelines',
    };
  }
}

/**
 * Get single pipeline
 */
export async function getPipeline(
  id: string,
  includeStages?: boolean,
  includeAccessUsers?: boolean
): Promise<PipelineResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (includeStages) queryParams.append('includeStages', 'true');
    if (includeAccessUsers) queryParams.append('includeAccessUsers', 'true');

    const url = `${API_BASE_URL}/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
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
    console.error('❌ Network error fetching pipeline:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch pipeline',
    };
  }
}

/**
 * Create new pipeline
 */
export async function createPipeline(
  pipelineData: CreatePipelineRequest
): Promise<PipelineResponse> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipelineData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error creating pipeline:', error);
    return {
      success: false,
      error: error.message || 'Failed to create pipeline',
    };
  }
}

/**
 * Update pipeline
 */
export async function updatePipeline(
  id: string,
  pipelineData: UpdatePipelineRequest
): Promise<PipelineResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pipelineData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error updating pipeline:', error);
    return {
      success: false,
      error: error.message || 'Failed to update pipeline',
    };
  }
}

/**
 * Delete pipeline
 */
export async function deletePipeline(id: string): Promise<PipelineResponse> {
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
    console.error('❌ Network error deleting pipeline:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete pipeline',
    };
  }
}

// Export types for convenience
export type { Pipeline, PipelineResponse, CreatePipelineRequest, UpdatePipelineRequest };
