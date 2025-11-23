'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Lecture, LectureType } from '@/types/lecture'
import { toast } from 'react-toastify'
import { Loader2 } from 'lucide-react'
import { getLessonById, updateLesson } from '@/services/lessonService'
import {
  lessonToLecture,
  lectureToLessonRequest,
} from '@/utils/adapters/lessonAdapter'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { QUIZ_KEYS } from '@/hooks/instructor/useQuizInstructor'
import { LESSON_KEYS } from '@/config/query-keys.config'
import { LectureEditProvider } from '@/context/LectureEditContext'
import Header from '@/components/instructor/courses/edit-course-content/edit-lecture/LectureHeader'
import TabNavigation from '@/components/instructor/courses/edit-course-content/edit-lecture/TabNavigation'
import ContentTab from '@/components/instructor/courses/edit-course-content/edit-lecture/tabs/ContentTab'
import ResourcesTab from '@/components/instructor/courses/edit-course-content/edit-lecture/tabs/ResourcesTab'
import SubmissionsTab from '@/components/instructor/courses/edit-course-content/edit-lecture/tabs/SubmissionsTab'
import Footer from '@/components/instructor/courses/edit-course-content/edit-lecture/LectureFooter'

// Create a default lecture object to initialize the state
const createDefaultLecture = (): Lecture => ({
  id: '',
  title: 'Bài giảng mới',
  type: 'video' as LectureType,
  description: '',
  duration: '0',
  resources: [],
})

export default function LectureEditorPage() {
  return <LectureEditor />
}

function LectureEditor() {
  const router = useRouter()
  const params = useParams()
  const courseId = params.id as string
  const lectureId = params.lectureId as string

  const [activeTab, setActiveTab] = useState<
    'content' | 'resources' | 'settings' | 'submissions'
  >('content')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const queryClient = useQueryClient()

  // Use React Query to fetch and cache the lesson data
  const {
    data: lessonData,
    isLoading,
    error,
  } = useQuery({
    queryKey: LESSON_KEYS.byId(lectureId),
    queryFn: () => getLessonById(lectureId),
    enabled: !!lectureId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Convert lesson data to lecture format for the editor
  const [lecture, setLecture] = useState<Lecture>(createDefaultLecture())
  const [sectionId, setSectionId] = useState<string>('')

  // Update local state when query data changes
  useEffect(() => {
    if (lessonData) {
      const convertedLecture = lessonToLecture(lessonData)
      setLecture(convertedLecture)
      setSectionId(lessonData.sectionId)
    }
    if (error) {
      router.push(`/instructor/courses/${courseId}/content`)
    }
  }, [lessonData, error, courseId])

  const handleSave = async () => {
    try {
      setIsSaving(true)

      if (!sectionId) {
        toast.error('Không tìm thấy thông tin phần học')
        setIsSaving(false)
        return
      }

      // Convert Lecture to LessonRequest using the adapter
      const lessonRequest = lectureToLessonRequest(lecture, sectionId)

      // Update the lesson
      const updatedLesson = await updateLesson(lectureId, lessonRequest)

      if (updatedLesson) {
        // Success
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)

        // Invalidate and refetch the lesson query to ensure fresh data
        await queryClient.invalidateQueries({
          queryKey: LESSON_KEYS.byId(lectureId),
        })

        await queryClient.invalidateQueries({
          queryKey: QUIZ_KEYS.quiz(lectureId),
        })

        // Also invalidate the section lessons list query to update the UI when returning to the list
        if (sectionId) {
          await queryClient.invalidateQueries({
            queryKey: LESSON_KEYS.bySection(sectionId),
          })
        }

        toast.success('Đã lưu thay đổi thành công')

        // Convert back and update the local state to ensure it's in sync
        setLecture(lessonToLecture(updatedLesson))

        router.push(`/instructor/courses/${courseId}/content`)
      } else {
        toast.error('Lưu thay đổi thất bại')
      }
    } catch (error) {
      console.error('Error saving lecture:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
        <span className="ml-2 text-lg">Đang tải bài giảng...</span>
      </div>
    )
  }

  return (
    <LectureEditProvider value={{ lecture, setLecture, sectionId }}>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <Header
            isSaving={isSaving}
            handleSave={handleSave}
            courseId={courseId}
            saveSuccess={saveSuccess}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <TabNavigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              lectureType={lecture.type}
            />

            <div className="p-6">
              {activeTab === 'content' && <ContentTab />}

              {activeTab === 'resources' && lecture.type === 'reading' && (
                <ResourcesTab />
              )}

              {activeTab === 'submissions' && lecture.type === 'quiz' && (
                <SubmissionsTab />
              )}

              {/*{activeTab === 'settings' && <SettingsTab />}*/}
            </div>

            <Footer
              courseId={courseId}
              isSaving={isSaving}
              handleSave={handleSave}
            />
          </div>
        </div>
      </div>
    </LectureEditProvider>
  )
}
