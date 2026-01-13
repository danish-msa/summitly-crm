/**
 * Delete Requests Service
 * 
 * Service functions for interacting with the Delete Requests API
 */

const API_BASE_URL = '/api/delete-requests';

export interface DeleteRequest {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName?: string;
    image?: string;
    role?: {
      id: string;
      name: string;
    };
  };
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeleteRequestsResponse {
  success: boolean;
  data?: DeleteRequest[];
  total?: number;
  limit?: number;
  offset?: number;
  error?: string;
}

export interface DeleteRequestResponse {
  success: boolean;
  data?: DeleteRequest;
  error?: string;
  message?: string;
}

/**
 * Get all delete requests
 */
export async function getDeleteRequests(params?: {
  status?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}): Promise<DeleteRequestsResponse> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.userId) queryParams.append('userId', params.userId);
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
    console.error('❌ Network error fetching delete requests:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch delete requests',
    };
  }
}

/**
 * Get single delete request
 */
export async function getDeleteRequest(id: string): Promise<DeleteRequestResponse> {
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
    console.error('❌ Network error fetching delete request:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch delete request',
    };
  }
}

/**
 * Create delete request
 */
export async function createDeleteRequest(userId: string, reason?: string): Promise<DeleteRequestResponse> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, reason }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error creating delete request:', error);
    return {
      success: false,
      error: error.message || 'Failed to create delete request',
    };
  }
}

/**
 * Approve delete request
 */
export async function approveDeleteRequest(
  id: string,
  reviewNotes?: string,
  reviewedBy?: string
): Promise<DeleteRequestResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'Approved',
        reviewNotes,
        reviewedBy,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error approving delete request:', error);
    return {
      success: false,
      error: error.message || 'Failed to approve delete request',
    };
  }
}

/**
 * Reject delete request
 */
export async function rejectDeleteRequest(
  id: string,
  reviewNotes?: string,
  reviewedBy?: string
): Promise<DeleteRequestResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'Rejected',
        reviewNotes,
        reviewedBy,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error rejecting delete request:', error);
    return {
      success: false,
      error: error.message || 'Failed to reject delete request',
    };
  }
}
