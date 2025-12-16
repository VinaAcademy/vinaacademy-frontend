'use client'

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react'

interface ChatbotContextType {
  courseId: string | null
  courseName: string | null
  lessonId: string | null
  lessonName: string | null
  customContext: Record<string, any> | null
  customContextName?: string | null
  isOpen: boolean
  isVisible: boolean
  setCourseContext: (id: string | null, name: string | null) => void
  setLessonContext: (id: string | null, name: string | null) => void
  setCustomContext: (
    context: Record<string, any> | null,
    name: string | null,
  ) => void
  setChatbotVisible: (visible: boolean) => void
  clearContext: () => void
  openChatbot: () => void
  closeChatbot: () => void
  toggleChatbot: () => void
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [courseId, setCourseId] = useState<string | null>(null)
  const [courseName, setCourseName] = useState<string | null>(null)
  const [lessonId, setLessonId] = useState<string | null>(null)
  const [lessonName, setLessonName] = useState<string | null>(null)
  const [customContext, setCustomContextState] = useState<Record<
    string,
    any
  > | null>(null)
  const [customContextName, setCustomContextName] = useState<string | null>(
    null,
  )
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const setCourseContext = useCallback(
    (id: string | null, name: string | null) => {
      setCourseId(id)
      setCourseName(name)
    },
    [],
  )

  const setLessonContext = useCallback(
    (id: string | null, name: string | null) => {
      setLessonId(id)
      setLessonName(name)
    },
    [],
  )

  const setCustomContext = useCallback(
    (context: Record<string, any> | null, name: string | null) => {
      setCustomContextState(context)
      setCustomContextName(name)
    },
    [],
  )

  const setChatbotVisible = useCallback((visible: boolean) => {
    setIsVisible(visible)
  }, [])

  const clearContext = useCallback(() => {
    console.log('Clearing chatbot context')
    setCourseId(null)
    setCourseName(null)
    setLessonId(null)
    setLessonName(null)
    setCustomContextState(null)
    setCustomContextName(null)
  }, [])

  const openChatbot = useCallback(() => setIsOpen(true), [])
  const closeChatbot = useCallback(() => setIsOpen(false), [])
  const toggleChatbot = useCallback(() => setIsOpen((prev) => !prev), [])

  const value = useMemo(
    () => ({
      courseId,
      courseName,
      lessonId,
      lessonName,
      customContext,
      customContextName,
      isOpen,
      isVisible,
      setCourseContext,
      setLessonContext,
      setCustomContext,
      setChatbotVisible,
      clearContext,
      openChatbot,
      closeChatbot,
      toggleChatbot,
    }),
    [
      courseId,
      courseName,
      lessonId,
      lessonName,
      customContext,
      customContextName,
      isOpen,
      isVisible,
      setCourseContext,
      setLessonContext,
      setCustomContext,
      setChatbotVisible,
      clearContext,
      openChatbot,
      closeChatbot,
      toggleChatbot,
    ],
  )

  return (
    <ChatbotContext.Provider value={value}>{children}</ChatbotContext.Provider>
  )
}

export function useChatbotContext() {
  const context = useContext(ChatbotContext)
  if (context === undefined) {
    throw new Error('useChatbotContext must be used within a ChatbotProvider')
  }
  return context
}
