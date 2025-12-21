'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Book, Award } from 'lucide-react'

interface CourseType {
  id: number
  name: string
  instructor: string
  category?: string
  image: string
  slug: string
  courseStatus?: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED'
  progress: number
  lastAccessed?: string
  completedLessons: number
  totalLessons: number
}

interface CourseCardProps {
  course: CourseType
}

const CourseCard = ({ course }: CourseCardProps) => {
  // Hàm lấy màu thanh tiến độ dựa vào phần trăm hoàn thành
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-emerald-500'
    if (progress >= 80) return 'bg-blue-500'
    if (progress >= 40) return 'bg-indigo-500'
    if (progress >= 20) return 'bg-amber-500'
    return 'bg-gray-400'
  }

  // Format last accessed date if available
  const formatLastAccessed = (dateStr?: string) => {
    if (!dateStr) return 'Chưa truy cập'

    // Handle different date formats
    try {
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/')
        const date = new Date(`${year}-${month}-${day}`)
        return `${day}/${month}/${year}`
      } else {
        const date = new Date(dateStr)
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
      }
    } catch (e) {
      return dateStr
    }
  }

  // Check if the course is completed
  const isCompleted = course.progress >= 100

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group flex flex-col h-full">
      <div className="relative">
        {/* Image container with hover effect */}
        <div className="relative w-full h-40 overflow-hidden">
          {course.image ? (
            <>
              <Image
                src={course.image}
                alt={course.name}
                fill
                className="object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70"></div>
            </>
          ) : (
            <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">No image</span>
            </div>
          )}

          {/* Category badge */}
          {course.category && (
            <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-md text-gray-800">
              {course.category}
            </span>
          )}

          {/* Progress badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
            <div className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-md flex items-center gap-1">
              {isCompleted ? (
                <>
                  <Award className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Hoàn thành</span>
                </>
              ) : (
                <>
                  <span className="text-gray-800">{course.progress}%</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content section */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Course title - Fixed height with line clamping */}
        <Link href={`/learning/${course.slug}`} className="block mb-auto">
          <h3 className="font-semibold text-base md:text-lg text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[2.5rem]">
            {course.name}
          </h3>
        </Link>

        {/* Instructor name */}
        {/* <p className="text-gray-600 text-sm mt-1 flex items-center gap-1.5">
                    <span className="inline-block h-4 w-4 rounded-full bg-gray-200 overflow-hidden flex-shrink-0"></span>
                    <span className="truncate">{course.instructor}</span>
                </p> */}

        {/* Course stats */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600 h-4">
            <div className="flex items-center gap-1">
              <Book className="h-3.5 w-3.5" />
              <span>
                {course.completedLessons}/{course.totalLessons} bài học
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatLastAccessed(course.lastAccessed)}</span>
            </div>
          </div>

          {/* Progress bar - Consistent height */}
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full ${getProgressColor(course.progress)} transition-all duration-500 ease-in-out`}
              style={{ width: `${course.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Action button - Consistent height and padding */}
      <div className="px-4 pb-4 pt-2">
        {course.courseStatus !== 'PUBLISHED' ? (
          <span className="w-full py-2 flex justify-center items-center rounded-lg border border-gray-400 text-gray-400 cursor-not-allowed text-sm font-medium h-10">
            Khóa học đang chờ kiểm duyệt
          </span>
        ) : (
          <Link
            href={`/learning/${course.slug}`}
            className="w-full py-2 flex justify-center items-center rounded-lg border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors text-sm font-medium h-10"
          >
            {isCompleted ? 'Xem lại' : 'Tiếp tục học'}
          </Link>
        )}
      </div>
    </div>
  )
}

export default CourseCard
