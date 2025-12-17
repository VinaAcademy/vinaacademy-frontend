import { LearningCourse } from '@/types/navbar'
import Link from 'next/link'
import Image from 'next/image'
import { getImageUrl } from '@/utils/imageUtils'

interface CourseListProps {
  courses: LearningCourse[]
}

export const CourseList = ({ courses }: CourseListProps) => {
  // Hàm lấy màu thanh tiến độ dựa vào phần trăm hoàn thành
  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-black' // 100%: Màu đen
    if (progress >= 80) return 'bg-gray-800' // 80-99%: Màu xám đậm
    if (progress >= 40) return 'bg-gray-600' // 40-79%: Màu xám trung bình
    if (progress >= 20) return 'bg-gray-400' // 20-39%: Màu xám nhạt
    return 'bg-gray-300' // 0-19%: Màu xám rất nhạt
  }

  if (courses.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500">
        <p>Bạn chưa đăng ký khóa học nào</p>
        <p className="text-sm mt-2">Khám phá các khóa học ngay!</p>
      </div>
    )
  }

  // Hiển thị tối đa 3 khóa học
  const displayCourses = courses.slice(0, 3)
  const hasMoreCourses = courses.length > 3

  return (
    <div>
      <ul className="space-y-3 max-h-[300px] overflow-y-auto">
        {displayCourses.map((course) => (
          <li key={course.id} className="group">
            <Link
              className="flex items-start space-x-3 p-2 hover:bg-gray-100 rounded-md transition"
              href={`/learning/${course.slug}`}
            >
              <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                {course.image ? (
                  <Image
                    src={getImageUrl(course.image)}
                    alt={course.image}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-xs text-gray-500">No image</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium line-clamp-2 mb-1 hover:text-gray-800 transition-colors">
                  {course.name}
                </h4>
                <div className="w-full bg-gray-100 h-1.5 rounded-full">
                  <div
                    className={`h-1.5 rounded-full ${getProgressColor(course.progress)}`}
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-gray-500">
                    {course.progress.toFixed(0)}% hoàn thành
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {hasMoreCourses && (
        <div className="mt-2 text-right text-xs text-gray-500">
          ... còn {courses.length - 3} khóa học khác
        </div>
      )}
    </div>
  )
}
