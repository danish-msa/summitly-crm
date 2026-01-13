/**
 * Roles Service
 * 
 * Service functions for interacting with the Roles API
 */

import {
  Role,
  RoleResponse,
  RolesResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '@/core/data/interface/user.interface';

const API_BASE_URL = '/api/roles';

/**
 * Get all roles
 */
export async function getRoles(params?: {
  search?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
  includePermissions?: boolean;
  includeUserCount?: boolean;
}): Promise<RolesResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));
    if (params?.includePermissions) queryParams.append('includePermissions', 'true');
    if (params?.includeUserCount) queryParams.append('includeUserCount', 'true');

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
    console.error('❌ Network error fetching roles:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch roles',
    };
  }
}

/**
 * Get single role
 */
export async function getRole(
  id: string,
  includePermissions?: boolean,
  includeUserCount?: boolean
): Promise<RoleResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (includePermissions !== false) queryParams.append('includePermissions', 'true');
    if (includeUserCount) queryParams.append('includeUserCount', 'true');

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
    console.error('❌ Network error fetching role:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch role',
    };
  }
}

/**
 * Create new role
 */
export async function createRole(roleData: CreateRoleRequest): Promise<RoleResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000); // 35 second timeout (increased for RDS latency)

    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roleData),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    
    // Check if response is ok before parsing JSON
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      console.error('❌ API Error:', errorData);
      return {
        success: false,
        ...errorData,
      };
    }
    
    const data = await response.json();
    
    // Ensure we have a valid response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format from server');
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error creating role:', error);
    
    // If it's an abort (timeout), the role might have been created
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      return {
        success: false,
        error: 'Request timed out. The role may have been created. Please refresh the page to check.',
      };
    }
    
    // If it's a JSON parse error, the response might have been successful
    if (error.message?.includes('JSON') || error.message?.includes('Unexpected')) {
      return {
        success: false,
        error: 'Error parsing server response. The role may have been created. Please refresh the page to check.',
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to create role',
    };
  }
}

/**
 * Update role
 */
export async function updateRole(
  id: string,
  roleData: UpdateRoleRequest
): Promise<RoleResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roleData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error updating role:', error);
    return {
      success: false,
      error: error.message || 'Failed to update role',
    };
  }
}

/**
 * Delete role
 */
export async function deleteRole(id: string): Promise<RoleResponse> {
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
    console.error('❌ Network error deleting role:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete role',
    };
  }
}
