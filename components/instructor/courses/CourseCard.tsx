import Link from 'next/link'
import { MoreVertical } from 'lucide-react'
import { CourseType } from '@/types/instructor-course'
import CourseImage from '@/services/CourseImage'
import { CourseStatus } from '@/types/course'

interface CourseCardProps {
  course: CourseType
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg flex flex-col h-full">
      <div className="relative">
        <CourseImage
          className="h-48 w-full object-cover"
          src={course.thumbnail}
          alt={course.title}
        />
        <div className="absolute top-2 right-2">
          <button className="p-1 rounded-full bg-white shadow">
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        {/* Sử dụng hàm renderStatus với status từ API */}
        {renderStatus(course.status)}
      </div>
      <div className="px-4 py-4 flex-grow flex flex-col">
        <Link href={`/instructor/courses/${course.id}/edit`}>
          <div className="text-lg font-medium text-gray-900 hover:text-gray-600 line-clamp-2 mb-2 min-h-[3.5rem]">
            {course.title}
          </div>
        </Link>

        <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
          <div>{course.students} học viên</div>
          {course.rating > 0 && (
            <div className="flex items-center">
              <svg
                className="h-4 w-4 text-yellow-400 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {course.rating.toFixed(1)}
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 flex justify-between items-center">
          <div>Cập nhật: {formatDate(course.lastUpdated)}</div>
          {course.income > 0 && <div>{formatVND(course.income)}k đ</div>}
        </div>
      </div>
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 mt-auto">
        <div className="flex items-center justify-between gap-4">
          <Link href={`/instructor/courses/${course.id}/analytics`}>
            <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Thống kê
            </div>
          </Link>
          <Link href={`/instructor/courses/${course.id}/edit`}>
            <div className="text-sm font-medium text-black hover:text-gray-700">
              Chỉnh sửa
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Định dạng ngày tháng
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  } catch (e) {
    return dateString
  }
}

// Định dạng tiền VND
function formatVND(amount: number): string {
  return amount.toLocaleString('vi-VN')
}

function renderStatus(status: CourseStatus | string | undefined) {
  if (!status) return null

  switch (status.toUpperCase()) {
    case 'DRAFT':
      return (
        <div className="absolute top-2 left-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
          Bản nháp
        </div>
      )
    case 'PENDING':
      return (
        <div className="absolute top-2 left-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
          Chờ duyệt
        </div>
      )
    case 'REJECTED':
      return (
        <div className="absolute top-2 left-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
          Bị từ chối
        </div>
      )
    case 'PUBLISHED':
      return (
        <div className="absolute top-2 left-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
          Đã xuất bản
        </div>
      )
    default:
      return null
  }
}
