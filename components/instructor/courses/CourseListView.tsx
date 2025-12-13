import Link from 'next/link'
import { CourseType } from '@/types/instructor-course'
import { CourseStatus } from '@/types/course'
import Image from 'next/image'
import { getImageUrl } from '@/utils/imageUtils'

interface CourseListViewProps {
  courses: CourseType[]
}

export default function CourseListView({ courses }: CourseListViewProps) {
  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
            >
              Khóa học
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Học viên
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Đánh giá
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Doanh thu
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Cập nhật
            </th>
            <th
              scope="col"
              className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
            >
              Trạng thái
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Tùy chọn</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {courses.map((course) => (
            <tr key={course.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                <div className="flex items-center">
                  <div className="h-16 w-24 flex-shrink-0 overflow-hidden rounded">
                    <Image
                      width={12}
                      height={12}
                      src={getImageUrl(course.thumbnail || '')}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900">
                      {course.title}
                    </div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {course.students}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {course.rating > 0 ? (
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
                ) : (
                  '-'
                )}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {course.income > 0
                  ? `${course.income.toLocaleString()}k đ`
                  : '-'}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {formatDate(course.lastUpdated)}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                {renderStatusBadge(course.status)}
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                <div className="flex items-center justify-end gap-4">
                  <Link href={`/instructor/courses/${course.id}/analytics`}>
                    <div className="text-blue-600 hover:text-blue-800">
                      Thống kê
                    </div>
                  </Link>
                  <Link href={`/instructor/courses/${course.id}/edit`}>
                    <div className="text-black hover:text-gray-600">
                      Chỉnh sửa
                    </div>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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

// Render trạng thái khóa học
function renderStatusBadge(status: CourseStatus | string | undefined) {
  if (!status) return null

  switch (status.toUpperCase()) {
    case 'DRAFT':
      return (
        <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs font-semibold leading-5 text-yellow-800">
          Bản nháp
        </span>
      )
    case 'PENDING':
      return (
        <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
          Chờ duyệt
        </span>
      )
    case 'REJECTED':
      return (
        <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
          Từ chối
        </span>
      )
    case 'PUBLISHED':
      return (
        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
          Đã xuất bản
        </span>
      )
    default:
      return (
        <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
          {status}
        </span>
      )
  }
}
