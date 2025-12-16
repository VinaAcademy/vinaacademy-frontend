'use client'

import { useEffect } from 'react'
import { useChatbotContext } from '@/context/ChatbotContext'

interface ChatbotContextUpdaterProps {
  courseId?: string
  courseName?: string
  lessonId?: string
  lessonName?: string
  customContext?: Record<string, any>
  customContextName?: string
}

export function ChatbotContextUpdater({
  courseId,
  courseName,
  lessonId,
  lessonName,
  customContext,
  customContextName,
}: ChatbotContextUpdaterProps) {
  const { setCourseContext, setLessonContext, setCustomContext, clearContext } =
    useChatbotContext()

  useEffect(() => {
    if (courseId) {
      setCourseContext(courseId, courseName || null)
      console.log('Set course context:', courseId, courseName)
    }
    if (lessonId) {
      setLessonContext(lessonId, lessonName || null)
    }
    if (customContext) {
      setCustomContext(customContext, customContextName || null)
      console.log('Set custom context:', customContextName, customContext)
    }

    return () => {
      clearContext()
    }
  }, [
    courseId,
    courseName,
    lessonId,
    lessonName,
    customContext,
    customContextName,
    setCourseContext,
    setLessonContext,
    setCustomContext,
    clearContext,
  ])

  return null
}
