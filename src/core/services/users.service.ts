/**
 * Users Service
 * 
 * Service functions for interacting with the Users API
 */

import {
  User,
  UserResponse,
  UsersResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from '@/core/data/interface/user.interface';

const API_BASE_URL = '/api/users';

/**
 * Get all users
 */
export async function getUsers(params?: {
  search?: string;
  status?: string;
  roleId?: string;
  limit?: number;
  offset?: number;
  includeRole?: boolean;
}): Promise<UsersResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.roleId) queryParams.append('roleId', params.roleId);
    if (params?.limit) queryParams.append('limit', String(params.limit));
    if (params?.offset) queryParams.append('offset', String(params.offset));
    if (params?.includeRole) queryParams.append('includeRole', 'true');

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
    console.error('❌ Network error fetching users:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch users',
    };
  }
}

/**
 * Get single user
 */
export async function getUser(
  id: string,
  includeRole?: boolean
): Promise<UserResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (includeRole) queryParams.append('includeRole', 'true');

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
    console.error('❌ Network error fetching user:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch user',
    };
  }
}

/**
 * Create new user
 */
export async function createUser(userData: CreateUserRequest): Promise<UserResponse> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error creating user:', error);
    return {
      success: false,
      error: error.message || 'Failed to create user',
    };
  }
}

/**
 * Update user
 */
export async function updateUser(
  id: string,
  userData: UpdateUserRequest
): Promise<UserResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error updating user:', error);
    return {
      success: false,
      error: error.message || 'Failed to update user',
    };
  }
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<UserResponse> {
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
    console.error('❌ Network error deleting user:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete user',
    };
  }
}
