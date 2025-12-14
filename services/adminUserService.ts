import apiClient from '@/lib/apiClient'
import { API_ENDPOINTS, buildQueryParams } from '@/config/api.endpoint'
import type {
  AdminUserListItem,
  UserStatistics,
  UserFilterParams,
  UpdateUserStatusRequest,
  UpdateUserRoleRequest,
  UpdateCollaboratorRequest,
  CreateUserRequest,
} from '@/types/admin-user'
import type { PaginatedResponse, ApiResponse } from '@/types/api-response'

/**
 * Admin User Management Service
 * Handles all API calls for admin user management
 */

/**
 * Get all users with filtering and pagination
 */
export const getAllUsers = async (
  filters: UserFilterParams = {},
): Promise<PaginatedResponse<AdminUserListItem>> => {
  try {
    const params: Record<string, any> = {
      page: filters.page ?? 0,
      size: filters.size ?? 20,
      sortBy: filters.sortBy ?? 'createdAt',
      sortDirection: filters.sortDirection ?? 'DESC',
    }

    if (filters.keyword) params.keyword = filters.keyword
    if (filters.role) params.role = filters.role
    if (filters.status) params.status = filters.status
    if (filters.fromDate) params.fromDate = filters.fromDate
    if (filters.toDate) params.toDate = filters.toDate
    if (filters.isCollaborator !== undefined)
      params.isCollaborator = filters.isCollaborator
    if (filters.isEnabled !== undefined) params.isEnabled = filters.isEnabled

    const queryString = buildQueryParams(params)
    const url = `${API_ENDPOINTS.ADMIN.USERS.LIST}?${queryString}`

    const response =
      await apiClient.get<ApiResponse<PaginatedResponse<AdminUserListItem>>>(
        url,
      )
    return response.data.data
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

/**
 * Get user statistics for admin dashboard
 */
export const getUserStatistics = async (): Promise<UserStatistics> => {
  try {
    const response = await apiClient.get<ApiResponse<UserStatistics>>(
      API_ENDPOINTS.ADMIN.USERS.STATISTICS,
    )
    return response.data.data
  } catch (error) {
    console.error('Error fetching user statistics:', error)
    throw error
  }
}

/**
 * Get single user details
 */
export const getUserById = async (
  userId: string,
): Promise<AdminUserListItem> => {
  try {
    const response = await apiClient.get<ApiResponse<AdminUserListItem>>(
      API_ENDPOINTS.ADMIN.USERS.BY_ID(userId),
    )
    return response.data.data
  } catch (error) {
    console.error('Error fetching user details:', error)
    throw error
  }
}

/**
 * Create a new user
 */
export const createUser = async (
  request: CreateUserRequest,
): Promise<AdminUserListItem> => {
  try {
    const response = await apiClient.post<ApiResponse<AdminUserListItem>>(
      API_ENDPOINTS.ADMIN.USERS.CREATE,
      request,
    )
    return response.data.data
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

/**
 * Update user status (enable/disable)
 */
export const updateUserStatus = async (
  userId: string,
  request: UpdateUserStatusRequest,
): Promise<AdminUserListItem> => {
  try {
    const response = await apiClient.put<ApiResponse<AdminUserListItem>>(
      API_ENDPOINTS.ADMIN.USERS.UPDATE_STATUS(userId),
      request,
    )
    return response.data.data
  } catch (error) {
    console.error('Error updating user status:', error)
    throw error
  }
}

/**
 * Update user roles
 */
export const updateUserRoles = async (
  userId: string,
  request: UpdateUserRoleRequest,
): Promise<AdminUserListItem> => {
  try {
    const response = await apiClient.put<ApiResponse<AdminUserListItem>>(
      API_ENDPOINTS.ADMIN.USERS.UPDATE_ROLES(userId),
      request,
    )
    return response.data.data
  } catch (error) {
    console.error('Error updating user roles:', error)
    throw error
  }
}

/**
 * Update collaborator status
 */
export const updateCollaboratorStatus = async (
  userId: string,
  isCollaborator: boolean,
): Promise<AdminUserListItem> => {
  try {
    const response = await apiClient.put<ApiResponse<AdminUserListItem>>(
      `${API_ENDPOINTS.ADMIN.USERS.UPDATE_COLLABORATOR(userId)}?isCollaborator=${isCollaborator}`,
    )
    return response.data.data
  } catch (error) {
    console.error('Error updating collaborator status:', error)
    throw error
  }
}

/**
 * Delete user (soft delete)
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await apiClient.delete(API_ENDPOINTS.ADMIN.USERS.DELETE(userId))
  } catch (error) {
    console.error('Error deleting user:', error)
    throw error
  }
}

/**
 * Unlock user account
 */
export const unlockUser = async (
  userId: string,
): Promise<AdminUserListItem> => {
  try {
    const response = await apiClient.post<ApiResponse<AdminUserListItem>>(
      API_ENDPOINTS.ADMIN.USERS.UNLOCK(userId),
    )
    return response.data.data
  } catch (error) {
    console.error('Error unlocking user:', error)
    throw error
  }
}
