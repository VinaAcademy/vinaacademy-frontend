// context/LectureEditContext.tsx
import React, { createContext, useContext, ReactNode } from 'react'
import { Lecture } from '@/types/lecture'

/**
 * Context to eliminate props drilling in the lecture editor component hierarchy:
 * LectureEditor → ContentTab → QuizEditor/TextEditor/VideoUploader
 *
 * This context provides lecture state and setter to all child components
 * without passing them through every component layer.
 */

interface LectureEditContextValue {
  lecture: Lecture
  setLecture: React.Dispatch<React.SetStateAction<Lecture>>
  sectionId: string
}

const LectureEditContext = createContext<LectureEditContextValue | undefined>(
  undefined,
)

interface LectureEditProviderProps {
  children: ReactNode
  value: LectureEditContextValue
}

export function LectureEditProvider({
  children,
  value,
}: LectureEditProviderProps) {
  return (
    <LectureEditContext.Provider value={value}>
      {children}
    </LectureEditContext.Provider>
  )
}

/**
 * Hook to access lecture editing state and functions from any component in the hierarchy.
 * Eliminates the need to pass lecture/setLecture props through multiple levels.
 *
 * @throws Error if used outside of LectureEditProvider
 */
export function useLectureEdit() {
  const context = useContext(LectureEditContext)
  if (context === undefined) {
    throw new Error('useLectureEdit must be used within a LectureEditProvider')
  }
  return context
}
