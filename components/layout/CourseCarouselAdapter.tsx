'use client'

import React from 'react'
import Carousel from '@/components/layout/Carousel'
import { CourseDto } from '@/types/course'
import { getImageUrl } from '@/utils/imageUtils'

interface CourseCarouselAdapterProps {
  courses: CourseDto[]
  loading?: boolean
  error?: string | null
  title?: string
  limit?: number
}

const CourseCarouselAdapter: React.FC<CourseCarouselAdapterProps> = ({
  courses,
  loading,
  error,
  title,
  limit = 8,
}) => {
  if (loading) {
    // Return loading placeholder while waiting for API
    return (
      <div className="w-full flex space-x-4 overflow-hidden py-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 w-[280px] h-[350px] bg-gray-200 animate-pulse rounded-lg"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>
  }

  // If no courses, return early
  if (!courses || courses.length === 0) {
    return (
      <div className="text-gray-500 py-4 text-center">
        Không có khóa học nào.
      </div>
    )
  }

  return <Carousel title={title} limit={limit} customCourses={courses} />
}

export default CourseCarouselAdapter
