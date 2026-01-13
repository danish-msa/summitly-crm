/**
 * User Management Interfaces
 * 
 * This file defines the structure of Users, Roles, and Permissions in the CRM system.
 */

// ============================================
// User Interfaces
// ============================================

export interface User {
  id: string;
  username: string;
  email: string;
  emailOptOut?: boolean;
  firstName: string;
  lastName?: string;
  phone1?: string;
  phone2?: string;
  location?: string;
  image?: string;
  status: "Active" | "Inactive" | "Suspended";
  roleId?: string;
  role?: Role;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  emailOptOut?: boolean;
  firstName: string;
  lastName?: string;
  password: string;
  confirmPassword: string;
  phone1?: string;
  phone2?: string;
  location?: string;
  image?: string;
  status?: "Active" | "Inactive" | "Suspended";
  roleId?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  emailOptOut?: boolean;
  firstName?: string;
  lastName?: string;
  password?: string;
  confirmPassword?: string;
  phone1?: string;
  phone2?: string;
  location?: string;
  image?: string;
  status?: "Active" | "Inactive" | "Suspended";
  roleId?: string;
}

export interface UserResponse {
  success: boolean;
  data?: User;
  error?: string;
  message?: string;
}

export interface UsersResponse {
  success: boolean;
  data?: User[];
  total?: number;
  limit?: number;
  offset?: number;
  error?: string;
}

// ============================================
// Role Interfaces
// ============================================

export interface Role {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
  userCount?: number;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
  permissionIds?: string[];
}

export interface RoleResponse {
  success: boolean;
  data?: Role;
  error?: string;
  message?: string;
}

export interface RolesResponse {
  success: boolean;
  data?: Role[];
  total?: number;
  limit?: number;
  offset?: number;
  error?: string;
}

// ============================================
// Permission Interfaces
// ============================================

export interface Permission {
  id: string;
  name: string;
  description?: string;
  category?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePermissionRequest {
  name: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

export interface PermissionResponse {
  success: boolean;
  data?: Permission;
  error?: string;
  message?: string;
}

export interface PermissionsResponse {
  success: boolean;
  data?: Permission[];
  total?: number;
  limit?: number;
  offset?: number;
  error?: string;
}

// ============================================
// Role Permission Assignment
// ============================================

export interface AssignPermissionsToRoleRequest {
  permissionIds: string[];
}

export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  role?: Role;
  permission?: Permission;
  grantedBy?: string;
  createdAt: string;
}
