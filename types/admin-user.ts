import { BaseDto } from './api-response'

/**
 * Admin User Management Types
 */

export interface AdminUserListItem extends BaseDto {
  id: string
  fullName: string
  email: string
  username: string
  phone?: string
  avatarUrl?: string
  description?: string
  isCollaborator: boolean
  birthday?: string

  // Role information
  roles: string[]
  primaryRole: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN' | 'STAFF' | 'USER'

  // Status information
  isActive: boolean
  isEnabled: boolean
  lockTime?: string
  failedAttempts: number

  // Statistics
  enrollmentCount: number
  createdCourseCount: number
  completedCourseCount: number

  // Activity tracking
  lastActive?: string
  joinDate: string
}

export interface UserStatistics {
  totalUsers: number
  totalStudents: number
  totalInstructors: number
  totalAdmins: number
  totalStaff: number

  activeUsers: number
  inactiveUsers: number
  lockedUsers: number

  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number

  collaborators: number
}

export interface UserFilterParams {
  keyword?: string
  role?: string // ROLE_STUDENT, ROLE_INSTRUCTOR, ROLE_ADMIN, ROLE_STAFF
  status?: 'ACTIVE' | 'INACTIVE' | 'LOCKED'
  fromDate?: string
  toDate?: string
  isCollaborator?: boolean
  isEnabled?: boolean
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
}

export interface UpdateUserStatusRequest {
  enabled: boolean
  reason?: string
}

export interface UpdateUserRoleRequest {
  roleCodes: string[]
  reason?: string
}

export interface UpdateCollaboratorRequest {
  isCollaborator: boolean
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  fullName: string
  phone?: string
  avatarUrl?: string
  description?: string
  birthday?: string
  roleCodes: string[]
  isEnabled?: boolean
}

// Display helpers
export const getRoleLabel = (role: string): string => {
  const roleMap: Record<string, string> = {
    ROLE_ADMIN: 'Quản trị viên',
    ROLE_STAFF: 'Nhân viên',
    ROLE_INSTRUCTOR: 'Giảng viên',
    ROLE_STUDENT: 'Học viên',
    ADMIN: 'Quản trị viên',
    STAFF: 'Nhân viên',
    INSTRUCTOR: 'Giảng viên',
    STUDENT: 'Học viên',
    USER: 'Người dùng',
  }
  return roleMap[role] || role
}

export const getStatusLabel = (user: AdminUserListItem): string => {
  if (user.lockTime) return 'Đã khóa'
  if (!user.isEnabled) return 'Không hoạt động'
  return 'Đang hoạt động'
}

export const getStatusColor = (user: AdminUserListItem): string => {
  if (user.lockTime) return 'bg-red-100 text-red-800'
  if (!user.isEnabled) return 'bg-gray-100 text-gray-800'
  return 'bg-green-100 text-green-800'
}

export const getRoleColor = (primaryRole: string): string => {
  const colorMap: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-800',
    STAFF: 'bg-indigo-100 text-indigo-800',
    INSTRUCTOR: 'bg-blue-100 text-blue-800',
    STUDENT: 'bg-gray-100 text-gray-800',
    USER: 'bg-gray-100 text-gray-800',
  }
  return colorMap[primaryRole] || 'bg-gray-100 text-gray-800'
}
