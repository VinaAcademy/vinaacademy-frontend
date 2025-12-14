'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { getImageUrl } from '@/utils/imageUtils'

interface CourseCardProps {
  course: {
    id: string
    title: string
    instructor: string
    image: string
    rating: number
    students: string
    category: string
    level: string
    price: string
    originalPrice?: string
    discount?: number
  }
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow ">
        <div className="flex flex-col md:flex-row">
          <div className="relative h-48 md:h-auto md:w-2/5">
            <Image
              src={getImageUrl(course.image)}
              alt={course.title}
              fill
              className="object-cover"
            />
            {course.discount && course.discount > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                -{course.discount}%
              </div>
            )}
          </div>
          <div className="p-4 md:w-3/5">
            <h3 className="text-lg font-semibold mb-1 line-clamp-2 min-h-[48px]">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{course.instructor}</p>
            <div className="flex items-center gap-1 mb-2">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium">{course.rating}</span>
              <span className="text-xs text-gray-500 ml-1">
                ({course.students})
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {course.category}
              </span>
              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                {course.level}
              </span>
            </div>
            <div className="mt-auto">
              <span className="font-bold text-lg">
                {parseInt(course.price).toLocaleString()}đ
              </span>
              {course.originalPrice && (
                <span className="text-sm text-gray-500 line-through ml-2">
                  {parseInt(course.originalPrice).toLocaleString()}đ
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
