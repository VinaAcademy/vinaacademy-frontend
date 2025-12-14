import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import * as adminUserService from '@/services/adminUserService'
import type {
  AdminUserListItem,
  UserStatistics,
  UserFilterParams,
  UpdateUserStatusRequest,
  UpdateUserRoleRequest,
  CreateUserRequest,
} from '@/types/admin-user'

/**
 * React Query hooks for Admin User Management
 */

// Query Keys
export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (filters: UserFilterParams) =>
    [...adminUserKeys.lists(), filters] as const,
  statistics: () => [...adminUserKeys.all, 'statistics'] as const,
  detail: (userId: string) => [...adminUserKeys.all, 'detail', userId] as const,
}

/**
 * Hook to fetch users list with filters and pagination
 */
export const useAdminUsers = (filters: UserFilterParams = {}) => {
  return useQuery({
    queryKey: adminUserKeys.list(filters),
    queryFn: () => adminUserService.getAllUsers(filters),
    staleTime: 30000, // 30 seconds
  })
}

/**
 * Hook to fetch user statistics
 */
export const useUserStatistics = () => {
  return useQuery({
    queryKey: adminUserKeys.statistics(),
    queryFn: () => adminUserService.getUserStatistics(),
    staleTime: 60000, // 1 minute
  })
}

/**
 * Hook to fetch single user details
 */
export const useAdminUser = (userId: string) => {
  return useQuery({
    queryKey: adminUserKeys.detail(userId),
    queryFn: () => adminUserService.getUserById(userId),
    enabled: !!userId,
  })
}

/**
 * Hook to create a new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (request: CreateUserRequest) =>
      adminUserService.createUser(request),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() })
      queryClient.invalidateQueries({ queryKey: adminUserKeys.statistics() })

      toast({
        title: 'Thành công',
        description: 'Người dùng mới đã được tạo thành công',
      })
    },
    // Error handling is done in the form component with setError
  })
}

/**
 * Hook to update user status
 */
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      userId,
      request,
    }: {
      userId: string
      request: UpdateUserStatusRequest
    }) => adminUserService.updateUserStatus(userId, request),
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() })
      queryClient.invalidateQueries({ queryKey: adminUserKeys.statistics() })
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(data.id) })

      toast({
        title: 'Thành công',
        description: `Trạng thái người dùng đã được cập nhật`,
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description:
          error?.message || 'Không thể cập nhật trạng thái người dùng',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook to update user roles
 */
export const useUpdateUserRoles = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      userId,
      request,
    }: {
      userId: string
      request: UpdateUserRoleRequest
    }) => adminUserService.updateUserRoles(userId, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() })
      queryClient.invalidateQueries({ queryKey: adminUserKeys.statistics() })
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(data.id) })

      toast({
        title: 'Thành công',
        description: 'Vai trò người dùng đã được cập nhật',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể cập nhật vai trò người dùng',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook to update collaborator status
 */
export const useUpdateCollaboratorStatus = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({
      userId,
      isCollaborator,
    }: {
      userId: string
      isCollaborator: boolean
    }) => adminUserService.updateCollaboratorStatus(userId, isCollaborator),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() })
      queryClient.invalidateQueries({ queryKey: adminUserKeys.statistics() })
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(data.id) })

      toast({
        title: 'Thành công',
        description: 'Trạng thái cộng tác viên đã được cập nhật',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description:
          error?.message || 'Không thể cập nhật trạng thái cộng tác viên',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook to delete user
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (userId: string) => adminUserService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() })
      queryClient.invalidateQueries({ queryKey: adminUserKeys.statistics() })

      toast({
        title: 'Thành công',
        description: 'Người dùng đã được xóa',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể xóa người dùng',
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook to unlock user account
 */
export const useUnlockUser = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: (userId: string) => adminUserService.unlockUser(userId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() })
      queryClient.invalidateQueries({ queryKey: adminUserKeys.statistics() })
      queryClient.invalidateQueries({ queryKey: adminUserKeys.detail(data.id) })

      toast({
        title: 'Thành công',
        description: 'Tài khoản đã được mở khóa',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể mở khóa tài khoản',
        variant: 'destructive',
      })
    },
  })
}
