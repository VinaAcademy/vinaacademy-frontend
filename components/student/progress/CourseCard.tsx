import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { LearningCourse } from '@/types/navbar'
import { getCourseSlugById } from '@/services/courseService'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface CourseCardProps {
  course: LearningCourse
}

const CourseCard = ({ course }: CourseCardProps) => {
  const router = useRouter()
  const isCompleted = course.progress === 100
  const title = course.name
  const [courseSlug, setCourseSlug] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Đảm bảo có slug hợp lệ
  useEffect(() => {
    const fetchCourseSlug = async () => {
      // Nếu đã có slug trong dữ liệu khóa học, sử dụng nó
      if (course.slug) {
        setCourseSlug(course.slug)
        return
      }

      // Nếu không có slug, nhưng có ID khóa học, lấy slug từ API
      if (course.id) {
        setIsLoading(true)
        try {
          const slug = await getCourseSlugById(String(course.id))
          if (slug) {
            setCourseSlug(slug)
          } else {
            // Fallback: Tạo slug từ tên nếu API không trả về slug
            setCourseSlug(generateSlugFromName(course.name))
          }
        } catch (error) {
          console.error('Error fetching course slug:', error)
          // Fallback to generating slug from name if API fails
          setCourseSlug(generateSlugFromName(course.name))
        } finally {
          setIsLoading(false)
        }
      } else {
        // Fallback nếu không có cả slug và id
        setCourseSlug(generateSlugFromName(course.name))
      }
    }

    fetchCourseSlug()
  }, [course.id, course.slug, course.name])

  // Function to generate slug from name if needed (fallback)
  function generateSlugFromName(name: string): string {
    if (!name) return ''

    return name
      .toLowerCase()
      .replace(/[àáảãạâầấẩẫậăằắẳẵặ]/g, 'a')
      .replace(/[èéẻẽẹêềếểễệ]/g, 'e')
      .replace(/[ìíỉĩị]/g, 'i')
      .replace(/[òóỏõọôồốổỗộơờớởỡợ]/g, 'o')
      .replace(/[ùúủũụưừứửữự]/g, 'u')
      .replace(/[ỳýỷỹỵ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <Image
          src={course.image}
          width={500}
          height={300}
          alt={title}
          className="w-full h-48 object-cover"
        />
        {course.category && (
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md text-sm font-medium text-gray-700">
            {course.category}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3
          className="font-bold text-lg mb-2 text-gray-900"
          onClick={() => router.push(`/learning/${courseSlug}`)}
        >
          {title}
        </h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            {course.instructor || ''}
          </span>
          <span
            className={`text-sm font-medium ${isCompleted ? 'text-gray-700' : 'text-black'}`}
          >
            {isCompleted ? 'Đã hoàn thành' : `${course.progress}% hoàn thành`}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              course.progress === 100
                ? 'bg-black'
                : course.progress >= 80
                  ? 'bg-gray-900'
                  : course.progress >= 60
                    ? 'bg-gray-700'
                    : course.progress >= 40
                      ? 'bg-gray-500'
                      : course.progress >= 20
                        ? 'bg-gray-400'
                        : 'bg-gray-300'
            }`}
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>

        {course.completedLessons !== undefined &&
          course.totalLessons !== undefined && (
            <div className="text-xs text-gray-500 mb-4">
              {course.completedLessons} / {course.totalLessons} bài học
            </div>
          )}

        <div className="mt-4 grid grid-cols-2 gap-2">
          {isLoading ? (
            // Loading state for buttons
            <>
              <button
                disabled
                className="text-center py-2 px-3 bg-gray-300 text-gray-500 font-medium rounded-md"
              >
                Đang tải...
              </button>
              <button
                disabled
                className="text-center py-2 px-3 bg-gray-100 border border-gray-300 text-gray-400 font-medium rounded-md"
              >
                Đang tải...
              </button>
            </>
          ) : (
            // Loaded state with correct slug
            <>
              {/* "Continue Learning" button - Use slug for navigation */}
              <Link
                href={`/learning/${courseSlug}`}
                className="text-center py-2 px-3 bg-black hover:bg-gray-900 text-white font-medium rounded-md transition-colors duration-300"
              >
                {isCompleted ? 'Xem lại' : 'Tiếp tục học'}
              </Link>

              {/* "Progress Details" button - Also use slug */}
              {/* <Link
                href={`/my-courses/${courseSlug}`}
                className="text-center py-2 px-3 bg-white border border-gray-900 text-gray-900 font-medium rounded-md hover:bg-gray-100 transition-colors duration-300"
              >
                Chi tiết tiến độ
              </Link> */}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseCard
