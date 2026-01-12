/**
 * Agents Service
 * Handles all API calls for agents CRUD operations
 */

import { Agent, AgentListData } from '@/core/data/interface/agent.interface';

const API_BASE_URL = '/api/agents';

export interface AgentsResponse {
  success: boolean;
  data?: Agent[];
  total?: number;
  limit?: number;
  offset?: number;
  error?: string;
}

export interface AgentResponse {
  success: boolean;
  data?: Agent;
  error?: string;
}

export interface DeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Get all agents with optional filters
 */
export async function getAgents(params?: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<AgentsResponse> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `${API_BASE_URL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch agents',
    };
  }
}

/**
 * Get single agent by ID
 */
export async function getAgentById(id: string): Promise<AgentResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching agent:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch agent',
    };
  }
}

/**
 * Create new agent
 */
export async function createAgent(agentData: Partial<Agent>): Promise<AgentResponse> {
  try {
    console.log('📤 Sending create agent request:', agentData);
    
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentData),
    });

    console.log('📥 Response status:', response.status, response.statusText);

    const data = await response.json();
    console.log('📥 Response data:', data);
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error creating agent:', error);
    return {
      success: false,
      error: error.message || 'Failed to create agent',
    };
  }
}

/**
 * Update agent
 */
export async function updateAgent(
  id: string,
  agentData: Partial<Agent>
): Promise<AgentResponse> {
  try {
    console.log('📤 Sending update request to:', `${API_BASE_URL}/${id}`, agentData);
    
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentData),
    });

    console.log('📥 Response status:', response.status, response.statusText);

    const data = await response.json();
    console.log('📥 Response data:', data);
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    }
    
    return data;
  } catch (error: any) {
    console.error('❌ Network error updating agent:', error);
    return {
      success: false,
      error: error.message || 'Failed to update agent',
    };
  }
}

/**
 * Delete agent
 */
export async function deleteAgent(id: string): Promise<DeleteResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error deleting agent:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete agent',
    };
  }
}

/**
 * Transform database agent to list format
 */
export function transformAgentToListData(agent: Agent): AgentListData {
  return {
    key: agent.id,
    Name: `${agent.firstName} ${agent.lastName}`,
    Role: agent.jobTitle || '',
    Phone: agent.phone1 || '',
    Tags: agent.tags && agent.tags.length > 0 ? agent.tags[0] : '',
    Location: agent.country || '',
    Rating: agent.rating ? agent.rating.toString() : '0',
    Image: agent.image || 'avatar-14.jpg',
    Flags: getCountryFlag(agent.country || ''),
    Status: (agent.status || 'Active') as 'Active' | 'Suspended' | 'Terminated',
  };
}

/**
 * Get country flag filename
 */
function getCountryFlag(country: string): string {
  const flagMap: { [key: string]: string } = {
    'USA': 'us.svg',
    'United States': 'us.svg',
    'UAE': 'ae.svg',
    'United Arab Emirates': 'ae.svg',
    'Germany': 'de.svg',
    'France': 'fr.svg',
    'UK': 'gb.svg',
    'United Kingdom': 'gb.svg',
  };
  return flagMap[country] || 'us.svg';
}

/**
 * Transform Prisma Agent to Agent interface
 * Prisma already returns data in the correct format, but we can map if needed
 */
export function transformDbRowToAgent(prismaAgent: any): Agent {
  // Prisma already returns camelCase, but we'll ensure compatibility
  return {
    id: prismaAgent.id,
    firstName: prismaAgent.firstName,
    lastName: prismaAgent.lastName,
    jobTitle: prismaAgent.jobTitle || undefined,
    companyName: prismaAgent.companyName || undefined,
    email: prismaAgent.email,
    emailOptOut: prismaAgent.emailOptOut,
    phone1: prismaAgent.phone1 || undefined,
    phone2: prismaAgent.phone2 || undefined,
    fax: prismaAgent.fax || undefined,
    address: prismaAgent.address || undefined,
    city: prismaAgent.city || undefined,
    state: prismaAgent.state || undefined,
    country: prismaAgent.country || undefined,
    zipCode: prismaAgent.zipCode || undefined,
    deals: prismaAgent.deals || [],
    dateOfBirth: prismaAgent.dateOfBirth?.toISOString() || undefined,
    reviews: prismaAgent.reviews ? parseFloat(prismaAgent.reviews.toString()) : undefined,
    owner: prismaAgent.owner || undefined,
    tags: prismaAgent.tags || [],
    source: prismaAgent.source || undefined,
    industry: prismaAgent.industry || undefined,
    currency: prismaAgent.currency || undefined,
    language: prismaAgent.language || undefined,
    description: prismaAgent.description || undefined,
    status: prismaAgent.status as 'Active' | 'Suspended' | 'Terminated',
    rating: prismaAgent.rating ? parseFloat(prismaAgent.rating.toString()) : undefined,
    image: prismaAgent.image || undefined,
    // New Agent-Specific Fields
    licenseNumber: prismaAgent.licenseNumber || undefined,
    licenseExpiryDate: prismaAgent.licenseExpiryDate?.toISOString() || undefined,
    brokerageStartDate: prismaAgent.brokerageStartDate?.toISOString() || undefined,
    teamOffice: prismaAgent.teamOffice || undefined,
    commissionSplit: prismaAgent.commissionSplit || undefined,
    bankingInfo: prismaAgent.bankingInfo || undefined,
    emergencyContact: prismaAgent.emergencyContact || undefined,
    notes: prismaAgent.notes || undefined,
    createdAt: prismaAgent.createdAt?.toISOString() || undefined,
    updatedAt: prismaAgent.updatedAt?.toISOString() || undefined,
  };
}
