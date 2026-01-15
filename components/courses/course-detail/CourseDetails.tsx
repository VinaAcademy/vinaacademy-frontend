'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Disclosure } from '@headlessui/react'
import { ChevronDown, Clock, FileText, Play } from 'lucide-react'
import { CourseDetailsResponse, LessonType } from '@/types/course'
import Image from 'next/image'
import SafeHtml from '@/components/common/safe-html'
import { getImageUrl } from '@/utils/imageUtils'

interface CourseDetailsProps {
  course: CourseDetailsResponse
}

export default function CourseDetails({ course }: CourseDetailsProps) {
  const [tab, setTab] = useState('description')

  // Calculate total content - number of lessons and total duration
  const totalLessons = course.totalLesson
  const totalSections = course.totalSection

  // Calculate total duration in seconds
  const totalDuration = course.sections.reduce((total, section) => {
    return (
      total +
      (section.lessons?.reduce((sectionTotal, lesson) => {
        return sectionTotal + (lesson.videoDuration || 0)
      }, 0) ?? 0)
    )
  }, 0)

  // Format duration to hours and minutes
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours > 0 ? `${hours} giờ ` : ''}${minutes} phút`
  }

  // Format lesson type to Vietnamese
  const formatLessonType = (type?: LessonType) => {
    switch (type) {
      case 'VIDEO':
        return 'Video'
      case 'READING':
        return 'Bài đọc'
      case 'QUIZ':
        return 'Bài kiểm tra'
      default:
        return 'Bài học'
    }
  }

  // Format lesson duration
  const formatLessonDuration = (seconds?: number) => {
    if (!seconds) return ''
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white border rounded-lg overflow-hidden mb-8">
      <Tabs defaultValue={tab} onValueChange={setTab} className="w-full">
        <div className="border-b">
          <TabsList className="bg-transparent h-auto p-0">
            <TabsTrigger
              value="description"
              className={`px-6 py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#a435f0] data-[state=active]:shadow-none transition-none`}
            >
              Giới thiệu khóa học
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className={`px-6 py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#a435f0] data-[state=active]:shadow-none transition-none`}
            >
              Nội dung khóa học
            </TabsTrigger>
            <TabsTrigger
              value="instructor"
              className={`px-6 py-4 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-[#a435f0] data-[state=active]:shadow-none transition-none`}
            >
              Giảng viên
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="description" className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Giới thiệu về khóa học</h2>
            <div className="text-sm text-gray-500 flex flex-wrap gap-4"></div>
          </div>
          <div className="space-y-2">
            <SafeHtml html={course.description} />
          </div>
        </TabsContent>

        <TabsContent value="content" className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Nội dung khóa học</h2>
            <div className="text-sm text-gray-500 flex flex-wrap gap-4">
              <span>{totalSections} phần •</span>
              <span>{totalLessons} bài học •</span>
              <span>Thời lượng video {formatDuration(totalDuration)} •</span>
              <span>Tổng thời lượng {course.estimatedTime} giờ</span>
            </div>
          </div>

          <div className="space-y-2">
            {course.sections.map((section) => (
              <Disclosure key={section.id}>
                {({ open }) => (
                  <div>
                    <Disclosure.Button className="flex justify-between items-center w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-left">
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-sm text-gray-500">
                          {section.lessons?.length || 0} bài học
                        </div>
                      </div>
                      <ChevronDown
                        className={`${
                          open ? 'transform rotate-180' : ''
                        } w-5 h-5 text-gray-500`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="px-4 pt-2 pb-4">
                      <div className="space-y-2">
                        {section.lessons
                          ?.filter((l) => l.lessonStatus !== 'REJECTED')
                          .map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex justify-between items-center p-3 border-b"
                            >
                              <div className="flex items-center gap-3">
                                {lesson.type === 'VIDEO' ? (
                                  <Play className="w-4 h-4 text-gray-500" />
                                ) : lesson.type === 'READING' ? (
                                  <FileText className="w-4 h-4 text-gray-500" />
                                ) : (
                                  <Clock className="w-4 h-4 text-gray-500" />
                                )}
                                <span>
                                  <div className="text-sm">{lesson.title}</div>
                                  <div className="text-xs text-gray-500">
                                    {lesson.lessonStatus === 'PENDING'
                                      ? 'Đang cập nhật...'
                                      : formatLessonType(lesson.type)}
                                  </div>
                                </span>
                              </div>
                              {lesson.lessonStatus !== 'PENDING' &&
                                lesson.videoDuration && (
                                  <div className="text-xs text-gray-500">
                                    {formatLessonDuration(lesson.videoDuration)}
                                  </div>
                                )}
                            </div>
                          ))}
                      </div>
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="instructor" className="p-6">
          {course.instructors.map((instructor) => (
            <div key={instructor.id} className="mb-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden">
                  <Image
                    src={getImageUrl(
                      instructor.avatarUrl || '/images/default-avatar.png',
                    )}
                    alt={instructor.fullName}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{instructor.fullName}</h3>
                  {instructor.id === course.ownerInstructor?.id && (
                    <span className="text-sm text-blue-600">
                      Giảng viên chính
                    </span>
                  )}
                </div>
              </div>
              {instructor.description && (
                <div className="text-gray-700 text-sm">
                  <p>{instructor.description}</p>
                </div>
              )}
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
