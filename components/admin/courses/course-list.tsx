'use client'

import { useState } from 'react'
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  AlertTriangle,
  Pencil,
  DollarSign,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { formatCurrency } from '@/utils/commonUtils'

// Mock data
const courseData = [
  {
    id: '1',
    title: 'JavaScript Advanced: ES6 và các tính năng hiện đại',
    instructor: 'Nguyễn Văn A',
    category: 'Web Development',
    price: 349000,
    rating: 4.7,
    students: 1245,
    published: true,
    status: 'published',
    lastUpdated: '2025-02-15',
    thumbnail: '/api/placeholder/400/220',
  },
  {
    id: '2',
    title: 'React và Redux: Xây dựng ứng dụng thời gian thực',
    instructor: 'Trần Thị B',
    category: 'Web Development',
    price: 399000,
    rating: 4.5,
    students: 986,
    published: true,
    status: 'published',
    lastUpdated: '2025-02-20',
    thumbnail: '/api/placeholder/400/220',
  },
  {
    id: '3',
    title: 'NodeJS và ExpressJS: Xây dựng RESTful API',
    instructor: 'Lê Văn C',
    category: 'Web Development',
    price: 329000,
    rating: 4.2,
    students: 542,
    published: true,
    status: 'published',
    lastUpdated: '2025-02-10',
    thumbnail: '/api/placeholder/400/220',
  },
  {
    id: '4',
    title: 'UI/UX Design: Nguyên tắc thiết kế và công cụ',
    instructor: 'Phạm Thị D',
    category: 'Design',
    price: 289000,
    rating: 4.8,
    students: 823,
    published: true,
    status: 'published',
    lastUpdated: '2025-02-25',
    thumbnail: '/api/placeholder/400/220',
  },
  {
    id: '5',
    title: 'Python for Data Science: Từ cơ bản đến nâng cao',
    instructor: 'Vũ Văn E',
    category: 'Data Science',
    price: 599000,
    rating: 4.9,
    students: 1876,
    published: true,
    status: 'published',
    lastUpdated: '2025-02-18',
    thumbnail: '/api/placeholder/400/220',
  },
  {
    id: '6',
    title: 'Marketing số: Chiến lược và thực hành',
    instructor: 'Hoàng Thị F',
    category: 'Marketing',
    price: 249000,
    rating: 4.3,
    students: 654,
    published: true,
    status: 'published',
    lastUpdated: '2025-02-12',
    thumbnail: '/api/placeholder/400/220',
  },
  {
    id: '7',
    title: 'Flutter: Phát triển ứng dụng đa nền tảng',
    instructor: 'Nguyễn Thị G',
    category: 'Mobile Development',
    price: 429000,
    rating: 4.6,
    students: 742,
    published: false,
    status: 'draft',
    lastUpdated: '2025-03-01',
    thumbnail: '/api/placeholder/400/220',
  },
  {
    id: '8',
    title: 'Machine Learning cơ bản và ứng dụng',
    instructor: 'Trần Văn H',
    category: 'Data Science',
    price: 549000,
    rating: 0,
    students: 0,
    published: false,
    status: 'pending',
    lastUpdated: '2025-03-05',
    thumbnail: '/api/placeholder/400/220',
  },
  {
    id: '9',
    title: 'Docker và Kubernetes cho DevOps',
    instructor: 'Lê Thị I',
    category: 'DevOps',
    price: 499000,
    rating: 0,
    students: 0,
    published: false,
    status: 'pending',
    lastUpdated: '2025-03-08',
    thumbnail: '/api/placeholder/400/220',
  },
  {
    id: '10',
    title: 'Blockchain và Smart Contracts',
    instructor: 'Phạm Văn J',
    category: 'Blockchain',
    price: 699000,
    rating: 0,
    students: 0,
    published: false,
    status: 'rejected',
    lastUpdated: '2025-03-02',
    thumbnail: '/api/placeholder/400/220',
  },
]

interface CourseListProps {
  view: 'all' | 'published' | 'draft' | 'pending' | 'rejected'
  searchQuery: string
}

export default function CourseList({ view, searchQuery }: CourseListProps) {
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])

  // Filter courses based on view and search query
  const filteredCourses = courseData.filter((course) => {
    // Filter by status
    if (view !== 'all' && course.status !== view) {
      return false
    }

    // Filter by search query
    return !(
      searchQuery &&
      !course.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const toggleSelectAll = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([])
    } else {
      setSelectedCourses(filteredCourses.map((course) => course.id))
    }
  }

  const toggleSelectCourse = (courseId: string) => {
    if (selectedCourses.includes(courseId)) {
      setSelectedCourses(selectedCourses.filter((id) => id !== courseId))
    } else {
      setSelectedCourses([...selectedCourses, courseId])
    }
  }

  // Status renderer
  const renderStatus = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Đã xuất bản
          </span>
        )
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Pencil className="w-3 h-3 mr-1" />
            Bản nháp
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Chờ duyệt
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Từ chối
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-md">
      {selectedCourses.length > 0 && (
        <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
          <span className="text-sm font-medium">
            Đã chọn {selectedCourses.length} khóa học
          </span>
          <div className="space-x-2">
            <Button variant="outline" size="sm">
              <X className="w-4 h-4 mr-1" />
              Bỏ chọn
            </Button>
            {view === 'pending' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-500 text-white hover:bg-green-600"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Phê duyệt
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-500 text-white hover:bg-red-600"
                >
                  <X className="w-4 h-4 mr-1" />
                  Từ chối
                </Button>
              </>
            )}
            {view === 'published' && (
              <Button
                variant="outline"
                size="sm"
                className="bg-red-500 text-white hover:bg-red-600"
              >
                <X className="w-4 h-4 mr-1" />
                Ẩn khóa học
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="bg-red-500 text-white hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Xóa
            </Button>
          </div>
        </div>
      )}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              <input
                type="checkbox"
                className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                checked={
                  selectedCourses.length === filteredCourses.length &&
                  filteredCourses.length > 0
                }
                onChange={toggleSelectAll}
              />
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Khóa học
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Giảng viên
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Danh mục
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Giá
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Đánh giá
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Học viên
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Trạng thái
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredCourses.map((course) => (
            <tr key={course.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"
                  checked={selectedCourses.includes(course.id)}
                  onChange={() => toggleSelectCourse(course.id)}
                />
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <Image
                      className="h-10 w-10 rounded object-cover"
                      src={course.thumbnail}
                      alt={course.title}
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2">
                      {course.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      Cập nhật:{' '}
                      {new Date(course.lastUpdated).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{course.instructor}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{course.category}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatCurrency(course.price)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {course.rating > 0 ? (
                    <div className="flex items-center">
                      <span>{course.rating}</span>
                      <svg
                        className="h-4 w-4 text-yellow-400 ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {course.students.toLocaleString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {renderStatus(course.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Mở menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Xem</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Chỉnh sửa</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <DollarSign className="mr-2 h-4 w-4" />
                      <span>Chỉnh sửa giá</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {course.status === 'pending' && (
                      <>
                        <DropdownMenuItem>
                          <Check className="mr-2 h-4 w-4" />
                          <span>Phê duyệt</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <X className="mr-2 h-4 w-4" />
                          <span>Từ chối</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Xóa</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
          {filteredCourses.length === 0 && (
            <tr>
              <td
                colSpan={9}
                className="px-6 py-10 text-center text-sm text-gray-500"
              >
                Không tìm thấy khóa học nào phù hợp với điều kiện tìm kiếm
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
