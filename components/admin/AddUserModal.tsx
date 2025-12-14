'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCreateUser } from '@/hooks/useAdminUsers'
import type { CreateUserRequest } from '@/types/admin-user'

interface AddUserModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<CreateUserRequest>()
  const createUserMutation = useCreateUser()

  const onSubmit = async (data: CreateUserRequest) => {
    try {
      await createUserMutation.mutateAsync(data)
      reset()
      onClose()
    } catch (error: any) {
      // Parse error message and set field-specific errors
      const errorMessage =
        error?.response?.data?.message || error?.message || ''

      if (errorMessage.toLowerCase().includes('username already exists')) {
        setError('username', {
          type: 'manual',
          message: 'Tên đăng nhập đã tồn tại',
        })
      } else if (errorMessage.toLowerCase().includes('email already exists')) {
        setError('email', {
          type: 'manual',
          message: 'Email đã tồn tại',
        })
      } else if (
        errorMessage.toLowerCase().includes('phone') &&
        errorMessage.toLowerCase().includes('already exists')
      ) {
        setError('phone', {
          type: 'manual',
          message: 'Số điện thoại đã tồn tại',
        })
      }
      // Other errors will still be shown via toast in the hook
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Thêm người dùng mới</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('username', {
                required: 'Tên đăng nhập là bắt buộc',
                minLength: {
                  value: 3,
                  message: 'Tên đăng nhập phải có ít nhất 3 ký tự',
                },
                maxLength: {
                  value: 50,
                  message: 'Tên đăng nhập không được quá 50 ký tự',
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Nhập tên đăng nhập"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-500">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              {...register('email', {
                required: 'Email là bắt buộc',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email không hợp lệ',
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Nhập email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              {...register('password', {
                required: 'Mật khẩu là bắt buộc',
                minLength: {
                  value: 6,
                  message: 'Mật khẩu phải có ít nhất 6 ký tự',
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Nhập mật khẩu"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('fullName', {
                required: 'Họ và tên là bắt buộc',
                maxLength: {
                  value: 100,
                  message: 'Họ và tên không được quá 100 ký tự',
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Nhập họ và tên"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-500">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại
            </label>
            <input
              type="tel"
              {...register('phone', {
                maxLength: {
                  value: 20,
                  message: 'Số điện thoại không được quá 20 ký tự',
                },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Nhập số điện thoại"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Birthday */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ngày sinh
            </label>
            <input
              type="date"
              {...register('birthday')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Roles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="student"
                  {...register('roleCodes', {
                    required: 'Vui lòng chọn ít nhất một vai trò',
                  })}
                  className="mr-2"
                />
                <span>Học viên</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="instructor"
                  {...register('roleCodes')}
                  className="mr-2"
                />
                <span>Giảng viên</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="staff"
                  {...register('roleCodes')}
                  className="mr-2"
                />
                <span>Nhân viên</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  value="admin"
                  {...register('roleCodes')}
                  className="mr-2"
                />
                <span>Quản trị viên</span>
              </label>
            </div>
            {errors.roleCodes && (
              <p className="mt-1 text-sm text-red-500">
                {errors.roleCodes.message}
              </p>
            )}
          </div>

          {/* Is Enabled */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kích hoạt tài khoản
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('isEnabled')}
                defaultChecked
                className="mr-2"
              />
              <span className="text-sm text-gray-600">
                Kích hoạt ngay khi tạo
              </span>
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              {...register('description', {
                maxLength: {
                  value: 500,
                  message: 'Mô tả không được quá 500 ký tự',
                },
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Nhập mô tả về người dùng"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createUserMutation.isPending}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? 'Đang tạo...' : 'Tạo người dùng'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
