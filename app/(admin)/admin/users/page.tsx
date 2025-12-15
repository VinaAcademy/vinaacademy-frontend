'use client'

import { useState } from 'react'
import {
  ChevronDown,
  Download,
  Filter,
  Loader2,
  MoreHorizontal,
  Plus,
  Search,
  User,
  UserCheck,
  UserCog,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAdminUsers, useUserStatistics } from '@/hooks/useAdminUsers'
import { useDebounce } from '@/hooks/useDebounce'
import type { UserFilterParams } from '@/types/admin-user'
import {
  getRoleLabel,
  getRoleColor,
  getStatusLabel,
  getStatusColor,
} from '@/types/admin-user'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import AddUserModal from '@/components/admin/AddUserModal'
import { getImageUrl } from '@/utils/imageUtils'

export default function AdminUsersPage() {
  const [view, setView] = useState<
    'all' | 'students' | 'instructors' | 'admins'
  >('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [page, setPage] = useState(0)
  const [filterRole, setFilterRole] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterFromDate, setFilterFromDate] = useState<string>('')
  const [filterToDate, setFilterToDate] = useState<string>('')

  // Debounce search query
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Build filters based on view and search
  const filters: UserFilterParams = {
    page,
    size: 20,
    sortBy: 'createdDate',
    sortDirection: 'DESC',
  }

  if (debouncedSearch) filters.keyword = debouncedSearch

  // Apply view filter
  if (view === 'students') filters.role = 'student'
  else if (view === 'instructors') filters.role = 'instructor'
  else if (view === 'admins') filters.role = 'admin'

  // Apply manual filters
  if (filterRole) filters.role = filterRole
  if (filterStatus) filters.status = filterStatus as any
  if (filterFromDate) filters.fromDate = filterFromDate
  if (filterToDate) filters.toDate = filterToDate

  // Fetch data
  const { data: usersData, isLoading, error } = useAdminUsers(filters)
  const { data: statistics } = useUserStatistics()

  const users = usersData?.content || []
  const totalElements = usersData?.totalElements || 0
  const totalPages = usersData?.totalPages || 0

  // Get user counts from statistics
  const userCounts = {
    all: statistics?.totalUsers || 0,
    students: statistics?.totalStudents || 0,
    instructors: statistics?.totalInstructors || 0,
    admins: statistics?.totalAdmins || 0,
  }

  // Reset filters
  const handleResetFilters = () => {
    setFilterRole('')
    setFilterStatus('')
    setFilterFromDate('')
    setFilterToDate('')
    setSearchQuery('')
    setPage(0)
  }

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-'
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: vi })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Quản lý người dùng
          </h1>
          <p className="text-muted-foreground">
            Quản lý tất cả người dùng trên nền tảng
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Xuất
          </Button>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        <div className="relative w-full md:w-auto md:flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-2 text-sm focus:border-black focus:ring-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="md:w-auto"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Bộ lọc
        </Button>
      </div>

      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2">
              <div>
                <label className="text-sm font-medium">Vai trò</label>
                <div className="relative">
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
                  >
                    <option value="">Tất cả vai trò</option>
                    <option value="student">Học viên</option>
                    <option value="instructor">Giảng viên</option>
                    <option value="admin">Quản trị viên</option>
                    <option value="staff">Nhân viên</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Trạng thái</label>
                <div className="relative">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="ACTIVE">Đang hoạt động</option>
                    <option value="INACTIVE">Không hoạt động</option>
                    <option value="LOCKED">Đã khóa</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Đăng ký từ</label>
                <input
                  type="date"
                  value={filterFromDate}
                  onChange={(e) => setFilterFromDate(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Đăng ký đến</label>
                <input
                  type="date"
                  value={filterToDate}
                  onChange={(e) => setFilterToDate(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" onClick={handleResetFilters}>
                Đặt lại
              </Button>
              <Button onClick={() => setPage(0)}>Áp dụng</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex border-b">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            view === 'all'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setView('all')}
        >
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            Tất cả ({userCounts.all.toLocaleString()})
          </div>
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            view === 'students'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setView('students')}
        >
          <div className="flex items-center">
            <User className="h-4 w-4 mr-1" />
            Học viên ({userCounts.students.toLocaleString()})
          </div>
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            view === 'instructors'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setView('instructors')}
        >
          <div className="flex items-center">
            <UserCheck className="h-4 w-4 mr-1" />
            Giảng viên ({userCounts.instructors.toLocaleString()})
          </div>
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            view === 'admins'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setView('admins')}
        >
          <div className="flex items-center">
            <UserCog className="h-4 w-4 mr-1" />
            Quản trị viên ({userCounts.admins.toLocaleString()})
          </div>
        </button>
      </div>

      <div className="bg-white rounded-md shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Người dùng</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tham gia</TableHead>
              <TableHead>Khóa học</TableHead>
              <TableHead>Hoạt động gần đây</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">
                    Đang tải dữ liệu...
                  </p>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-red-600"
                >
                  Lỗi khi tải dữ liệu. Vui lòng thử lại.
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-gray-500"
                >
                  Không tìm thấy người dùng nào
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center">
                        {user.avatarUrl ? (
                          <img
                            src={getImageUrl(user.avatarUrl)}
                            alt={user.fullName || user.username}
                            className="h-9 w-9 rounded-full"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            {(user.fullName || user.username || '?')
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {user.fullName || user.username}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getRoleColor(user.primaryRole)}`}
                    >
                      {getRoleLabel(user.primaryRole)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user)}`}
                    >
                      {getStatusLabel(user)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(user.joinDate)}</TableCell>
                  <TableCell>{user.enrollmentCount}</TableCell>
                  <TableCell>{formatDate(user.lastActive)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Hiển thị {users.length > 0 ? page * 20 + 1 : 0}-
          {Math.min((page + 1) * 20, totalElements)} của{' '}
          {totalElements.toLocaleString()} người dùng
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0 || isLoading}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            Trước
          </Button>

          {/* Page numbers */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum =
              page < 3
                ? i
                : page > totalPages - 3
                  ? totalPages - 5 + i
                  : page - 2 + i
            if (pageNum < 0 || pageNum >= totalPages) return null

            return (
              <Button
                key={pageNum}
                variant="outline"
                size="sm"
                className={pageNum === page ? 'bg-black text-white' : ''}
                onClick={() => setPage(pageNum)}
              >
                {pageNum + 1}
              </Button>
            )
          })}

          {totalPages > 5 && page < totalPages - 3 && <span>...</span>}

          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1 || isLoading}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Sau
          </Button>
        </div>
      </div>

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  )
}
