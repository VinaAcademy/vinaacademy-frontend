'use client'

import React, { FC, useEffect, useState } from 'react'
import { CheckCircle, Circle, Play } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Lecture, Section } from '@/types/lecture'
import { LessonType } from '@/types/course'
import {
  mapLessonTypeToDisplay,
  markLessonComplete,
} from '@/services/lessonService'
import { getAllLessonProgressByCourse } from '@/services/progressService'
import { useQueryClient } from '@tanstack/react-query'
import { LESSON_KEYS } from '@/config/query-keys.config'

interface CourseContentProps {
  title: string
  sections: Section[]
  courseSlug: string
  courseId?: string
  onProgressUpdate?: () => void
}

const CourseContent: FC<CourseContentProps> = ({
  sections: initialSections,
  courseSlug,
  courseId,
  onProgressUpdate,
}) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [expandedSections, setExpandedSections] = useState<string[]>(
    // Mặc định, mở rộng tất cả các phần hoặc chỉ phần có bài học hiện tại
    initialSections.map((section) => section.id),
  )

  // Xử lý khi người dùng chọn một bài học
  const handleLectureSelect = (lectureId: string) => {
    // Điều hướng đến bài học đã chọn
    router.push(`/learning/${courseSlug}/lecture/${lectureId}`)
  }

  // Cập nhật trạng thái hoàn thành từ API khi khởi tạo
  useEffect(() => {
    // Cập nhật sections state khi initialSections thay đổi
    setSections(initialSections)

    // Nếu có courseId, chúng ta có thể refresh trạng thái hoàn thành từ API
    if (courseId) {
      const refreshProgressStatus = async () => {
        try {
          const progressData = await getAllLessonProgressByCourse(courseId)
          if (progressData && progressData.length > 0) {
            // Tạo map từ lessonId đến completion status để tìm kiếm nhanh
            const progressMap = new Map()
            progressData.forEach((item) => {
              progressMap.set(item.lessonId, item.completed)
            })

            // Cập nhật trạng thái hoàn thành cho các bài học
            const updatedSections = initialSections.map((section) => ({
              ...section,
              lectures: section.lectures.map((lecture) => {
                if (progressMap.has(lecture.id)) {
                  return {
                    ...lecture,
                    isCompleted: progressMap.get(lecture.id),
                  }
                }
                return lecture
              }),
            }))

            setSections(updatedSections)
          }
        } catch (error) {
          console.error('Failed to refresh progress status:', error)
        }
      }

      refreshProgressStatus().then((r) => r)
    }
  }, [initialSections, courseId])

  const toggleSection = (sectionId: string) => {
    setExpandedSections((prevExpanded) =>
      prevExpanded.includes(sectionId)
        ? prevExpanded.filter((id) => id !== sectionId)
        : [...prevExpanded, sectionId],
    )
  }

  const markLectureCompletion = async (
    e: React.MouseEvent,
    lectureId: string,
    isCompleted: boolean,
  ) => {
    // Ngăn chặn sự kiện lan tỏa để không kích hoạt handleLectureSelect
    e.stopPropagation()

    if (isCompleted) {
      // Nếu bài học đã hoàn thành, không cần làm gì thêm
      return
    }

    // Optimistic update trước khi gọi API
    const updatedSections = sections.map((section) => ({
      ...section,
      lectures: section.lectures.map((lecture) =>
        lecture.id === lectureId ? { ...lecture, isCompleted: true } : lecture,
      ),
    }))

    setSections(updatedSections)

    // Gọi API để cập nhật server
    try {
      const success = await markLessonComplete(lectureId)
      if (success) {
        // If marking complete was successful:

        // 1. Invalidate the course progress data in the cache
        if (courseId) {
          // Invalidate the specific query for this course's progress
          await queryClient.invalidateQueries({
            queryKey: LESSON_KEYS.listByCourse(courseSlug),
          })

          // Also refresh the data locally
          const refreshData = await getAllLessonProgressByCourse(courseId)
          if (refreshData) {
            // Update progress map with fresh data
            const progressMap = new Map()
            refreshData.forEach((item) => {
              progressMap.set(item.lessonId, item.completed)
            })

            // Update sections with fresh data
            const refreshedSections = sections.map((section) => ({
              ...section,
              lectures: section.lectures.map((lecture) => {
                if (progressMap.has(lecture.id)) {
                  return {
                    ...lecture,
                    isCompleted: progressMap.get(lecture.id),
                  }
                }
                return lecture
              }),
            }))

            setSections(refreshedSections)
          }
        }

        // Call the onProgressUpdate callback if provided
        if (onProgressUpdate) {
          onProgressUpdate()
        }
      } else {
        // Nếu API thất bại, hoàn tác thay đổi UI
        setSections(sections) // Revert to original state
      }
    } catch (error) {
      setSections(sections) // Revert to original state on error
    }
  }

  // Tính tổng thời lượng và số bài học
  const totalLectures = sections.reduce(
    (acc, section) => acc + section.lectures.length,
    0,
  )
  const totalDuration = sections
    .flatMap((section) => section.lectures)
    .reduce((acc, lecture) => {
      const durationMatch = lecture.duration.match(/(\d+)/)
      return acc + (durationMatch ? parseInt(durationMatch[1]) : 0)
    }, 0)

  // Tính phần trăm tiến độ
  const completedLectures = sections
    .flatMap((section) => section.lectures)
    .filter((lecture) => lecture.isCompleted).length

  const progressPercentage =
    totalLectures > 0
      ? Math.round((completedLectures / totalLectures) * 100)
      : 0

  const formatTotalDuration = () => {
    const hours = Math.floor(totalDuration / 60)
    const minutes = totalDuration % 60
    return hours > 0 ? `${hours} giờ ${minutes} phút` : `${minutes} phút`
  }

  // Lấy icon tương ứng với loại bài học
  const getLectureTypeIcon = (lecture: Lecture) => {
    if (lecture.isCurrent) {
      return <Play className="w-5 h-5 text-blue-500 fill-current" />
    }
    return null
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-bold">Nội dung khóa học</h2>
        <button className="text-gray-500 hover:text-gray-700" title="Close">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="p-4 border-b border-gray-200">
        <p className="text-sm text-gray-500">
          {totalLectures} bài học • {formatTotalDuration()} tổng thời lượng
        </p>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${
              progressPercentage === 100
                ? 'bg-green-500'
                : progressPercentage >= 80
                  ? 'bg-blue-500'
                  : progressPercentage >= 60
                    ? 'bg-blue-400'
                    : progressPercentage >= 40
                      ? 'bg-blue-300'
                      : progressPercentage >= 20
                        ? 'bg-gray-400'
                        : 'bg-gray-300'
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {progressPercentage}% hoàn thành
        </p>
      </div>

      <div className="overflow-y-auto flex-1">
        {sections.map((section) => (
          <div key={section.id} className="border-b border-gray-200">
            <button
              onClick={() => toggleSection(section.id)}
              className="flex justify-between items-center w-full p-4 text-left font-medium hover:bg-gray-50"
            >
              <span>{section.title}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transform transition-transform ${expandedSections.includes(section.id) ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {expandedSections.includes(section.id) && (
              <div className="bg-gray-50">
                {section.lectures
                  .filter((l) => l.lessonStatus !== 'REJECTED')
                  .map((lecture) => {
                    const isPending = lecture.lessonStatus === 'PENDING'

                    if (isPending) {
                      return (
                        <div
                          key={lecture.id}
                          className="flex items-center opacity-75 cursor-not-allowed bg-gray-50"
                        >
                          <button
                            className="flex-none ml-4 mr-1 focus:outline-none cursor-not-allowed"
                            disabled
                            aria-label={'Đang cập nhật'}
                          >
                            <Circle className="w-5 h-5 text-gray-300" />
                          </button>

                          <div className="flex-1">
                            <div className="flex items-start py-4 pr-4 border-t border-gray-200">
                              <div className="mr-3 mt-1">
                                <div className="w-5 h-5"></div>
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-500">
                                  {lecture.title}
                                </p>
                                <div className="flex items-center mt-1">
                                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                                    Đang cập nhật...
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <div key={lecture.id} className="flex items-center">
                        {/* Ô đánh dấu trạng thái hoàn thành */}
                        <button
                          className="flex-none ml-4 mr-1 focus:outline-none"
                          onClick={(e) =>
                            markLectureCompletion(
                              e,
                              lecture.id,
                              !!lecture.isCompleted,
                            )
                          }
                          aria-label={'Đánh dấu đã hoàn thành'}
                        >
                          {lecture.isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-400" />
                          )}
                        </button>

                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => handleLectureSelect(lecture.id)}
                        >
                          <div
                            className={`flex items-start py-4 pr-4 border-t border-gray-200 hover:bg-gray-100 ${lecture.isCurrent ? 'bg-gray-100' : ''}`}
                          >
                            <div className="mr-3 mt-1">
                              {getLectureTypeIcon(lecture)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">{lecture.title}</p>
                              <div className="flex items-center mt-1">
                                <svg
                                  className="w-4 h-4 text-gray-400 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span className="text-xs text-gray-500">
                                  {lecture.duration}
                                </span>
                                {lecture.type && (
                                  <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700">
                                    {mapLessonTypeToDisplay(
                                      lecture.type.toUpperCase() as LessonType,
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CourseContent
