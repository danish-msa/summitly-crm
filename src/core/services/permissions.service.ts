/**
 * Permissions Service
 * 
 * Service functions for interacting with the Permissions API
 */

import {
  Permission,
  PermissionResponse,
  PermissionsResponse,
  CreatePermissionRequest,
  UpdatePermissionRequest,
} from '@/core/data/interface/user.interface';

const API_BASE_URL = '/api/permissions';

/**
 * Get all permissions
 */
export async function getPermissions(params?: {
  search?: string;
  category?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}): Promise<PermissionsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.isActive !== undefined) queryParams.append('isActive', String(params.isActive));
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
    console.error('❌ Network error fetching permissions:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch permissions',
    };
  }
}

/**
 * Create new permission
 */
export async function createPermission(permissionData: CreatePermissionRequest): Promise<PermissionResponse> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(permissionData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error creating permission:', error);
    return {
      success: false,
      error: error.message || 'Failed to create permission',
    };
  }
}
