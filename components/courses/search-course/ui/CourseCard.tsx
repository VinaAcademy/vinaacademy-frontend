'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaClock,
  FaSignal,
} from 'react-icons/fa'
import { CourseDto } from '@/types/course'
import { getImageUrl } from '@/utils/imageUtils'
import { formatCurrency } from '@/services/revenueService'

interface CourseCardProps {
  course: CourseDto
}

const CourseCard = ({ course }: CourseCardProps) => {
  // Generate star rating with full, half and empty stars
  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-yellow-400" />)
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />)
      } else {
        stars.push(<FaRegStar key={i} className="text-yellow-400" />)
      }
    }

    return stars
  }

  // Map the level to a Vietnamese string
  const getLevelText = (level: string): string => {
    const levelMap: Record<string, string> = {
      BEGINNER: 'Cơ bản',
      INTERMEDIATE: 'Trung cấp',
      ADVANCED: 'Nâng cao',
    }
    return levelMap[level] || level
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/courses/${course.slug}`} className="block">
        <div className="relative h-40 w-full">
          <Image
            src={getImageUrl(course.image) || '/images/course-placeholder.jpg'}
            alt={course.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 line-clamp-2 min-h-[48px]">
            {course.name}
          </h3>

          <div className="flex items-center text-sm text-gray-600 mb-2">
            <FaSignal className="mr-1" />
            <span>{getLevelText(course.level)}</span>
            <span className="mx-2">•</span>
            <FaClock className="mr-1" />
            <span>{course.totalLesson || 0} bài học</span>
          </div>

          <div className="flex items-center mb-3">
            <div className="flex mr-2">{renderStars(course.rating)}</div>
            <span className="text-sm text-gray-600">
              ({course.totalRating || 0} đánh giá)
            </span>
          </div>

          {/* <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        <SafeHtml html= {course.description || "Không có mô tả"}/>
                    </p> */}

          <div className="flex justify-between items-center">
            <div className="font-bold text-lg">
              {formatCurrency(course.price)}
            </div>
            <div className="text-sm text-gray-600">
              {course.totalStudent || 0} học viên
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default CourseCard
