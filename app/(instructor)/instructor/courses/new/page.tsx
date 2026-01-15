'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { CourseData, CourseSection } from '@/types/new-course'

// Import custom components
import CourseFormHeader from '@/components/instructor/courses/new-course/CourseFormHeader'
import CourseFormNavigation from '@/components/instructor/courses/new-course/CourseFormNavigation'
import BasicInfoSection from '@/components/instructor/courses/new-course/sections/BasicInfoSection'
import MediaSection from '@/components/instructor/courses/new-course/sections/MediaSection'
import PricingSection from '@/components/instructor/courses/new-course/sections/PricingSection'
import FormFooter from '@/components/instructor/courses/new-course/FormFooter'
import { InputNumberValueChangeEvent } from 'primereact/inputnumber'
import { EditorTextChangeEvent } from 'primereact/editor'
import { toast } from '@/hooks/use-toast'
import {
  createInstructorCourse,
  uploadImageAndCreateCourse,
} from '@/services/courseService'
import { getCurrentUser } from '@/services/authService'
import { NotificationType } from '@/types/notification-type'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { CourseInstructorDtoRequest } from '@/types/instructor-course'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export default function CreateCoursePage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<CourseSection>('basic')
  const [courseData, setCourseData] = useState<CourseData>({
    title: '',
    subtitle: '',
    description: '',
    category: '',
    level: '',
    language: 'Tiếng việt',
    slug: '',
    price: 0,
    thumbnail: null,
    estimatedTime: 0,
  })
  const { isAuthenticated, user } = useAuth()

  const [progress, setProgress] = useState(33)
  const [previewThumbnail, setPreviewThumbnail] = useState<string | null>(null)
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSaving, setFormSaving] = useState(false)
  const [basicErrors, setBasicErrors] = useState({})

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target
    setCourseData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Auto-save indicator
    setFormSaving(true)
    setTimeout(() => setFormSaving(false), 1000)
  }

  const onEditorChange = (e: EditorTextChangeEvent) => {
    const htmlValue = e.htmlValue
    setCourseData((prev) => ({
      ...prev,
      description: htmlValue || '',
    }))

    // Show auto-save indicator
    setFormSaving(true)
    setTimeout(() => setFormSaving(false), 1000)
  }

  const handleNumberChange = (e: InputNumberValueChangeEvent) => {
    const { name, value } = e.target
    setCourseData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Auto-save indicator
    setFormSaving(true)
    setTimeout(() => setFormSaving(false), 1000)
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setCourseData((prev) => ({
      ...prev,
      [name]: checked,
    }))

    // Auto-save indicator
    setFormSaving(true)
    setTimeout(() => setFormSaving(false), 1000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files && files.length > 0) {
      setCourseData((prev) => ({
        ...prev,
        [name]: files[0],
      }))

      // Create preview URL
      if (name === 'thumbnail') {
        const url = URL.createObjectURL(files[0])
        setPreviewThumbnail(url)
      } else if (name === 'promo_video') {
        const url = URL.createObjectURL(files[0])
        setPreviewVideo(url)
      }

      // Auto-save indicator
      setFormSaving(true)
      setTimeout(() => setFormSaving(false), 1000)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all sections
    if (!isBasicSectionComplete()) {
      updateSection('basic')
      toast({
        title: 'Thông tin chưa đầy đủ hoặc không đúng',
        description:
          'Vui lòng điền đầy đủ thông tin trong phần thông tin cơ bản',
        variant: 'destructive',
      })
      return
    }

    if (!isMediaSectionComplete()) {
      updateSection('media')
      toast({
        title: 'Thông tin chưa đầy đủ',
        description: 'Vui lòng upload ảnh thumbnail cho khóa học',
        variant: 'destructive',
      })
      return
    }

    if (!isPriceSectionComplete()) {
      updateSection('pricing')
      toast({
        title: 'Thông tin chưa đầy đủ',
        description: 'Vui lòng chọn giá cho khóa học đúng quy định',
        variant: 'destructive',
      })
      return
    }

    // Submit the form
    setIsSubmitting(true)
    try {
      await createCourse()
    } catch (error) {
      console.error('Error creating course:', error)
      toast({
        title: 'Đã xảy ra lỗi',
        description: 'Không thể tạo khóa học. Vui lòng thử lại sau.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const createCourseInstructorFunc = async (idc: string, uid: string) => {
    if (isAuthenticated) {
      const ci: CourseInstructorDtoRequest = {
        userId: uid,
        courseId: idc,
        isOwner: true,
      }
      const data = await createInstructorCourse(ci)
      if (!data) {
        toast({
          title: 'Lỗi',
          description:
            'Có lỗi xảy ra trong quá trình tạo instructor cho khóa học. Vui lòng thử lại sau.',
          variant: 'destructive',
        })
        console.error('Lỗi khi tạo instructor cho khóa học:', data)
        return false
      }
      return true
    }
    return false
  }

  const createCourse = async () => {
    const data = await uploadImageAndCreateCourse(courseData)
    if (!data) {
      toast({
        title: 'Lỗi',
        description:
          'Có lỗi xảy ra trong quá trình tạo khóa học. Vui lòng thử lại sau.',
        variant: 'destructive',
      })
      return
    }

    // Store in session storage and redirect to course edit page
    sessionStorage.setItem(
      'createdCourse',
      JSON.stringify({
        title: courseData.title,
        id: data.id,
      }),
    )

    const user = await getCurrentUser()
    const userId = user?.id || ''
    await createCourseInstructorFunc(data.id, user?.id || '')

    toast({
      title: 'Thành công!',
      description:
        'Khóa học đã được tạo. Bạn sẽ được chuyển hướng đến trang quản lý khóa học.',
      variant: 'default',
    })

    router.push(`/instructor/courses`)
  }

  const updateSection = (section: CourseSection) => {
    setActiveSection(section)

    // Update progress based on section
    if (section === 'basic') setProgress(33)
    if (section === 'media') setProgress(66)
    if (section === 'pricing') setProgress(100)
  }

  // Navigation logic for form footer
  const handleBackClick = () => {
    if (activeSection === 'media') updateSection('basic')
    if (activeSection === 'pricing') updateSection('media')
  }

  const handleContinueClick = () => {
    if (activeSection === 'basic') {
      if (isBasicSectionComplete()) {
        updateSection('media')
      } else {
        toast({
          title: 'Thông tin chưa đầy đủ',
          description:
            'Vui lòng điền đầy đủ thông tin trong phần thông tin cơ bản',
          variant: 'destructive',
        })
      }
    }

    if (activeSection === 'media') {
      if (isMediaSectionComplete()) {
        updateSection('pricing')
      } else {
        toast({
          title: 'Thông tin chưa đầy đủ',
          description: 'Vui lòng upload ảnh thumbnail cho khóa học',
          variant: 'destructive',
        })
      }
    }
  }

  // Section validation
  const isBasicSectionComplete = () => {
    return (
      courseData.title != '' &&
      courseData.description != '' &&
      courseData.category != '' &&
      courseData.level != '' &&
      courseData.estimatedTime > 0 &&
      Object.keys(basicErrors).length === 0
    )
  }

  const isPriceSectionComplete = () => {
    return courseData.price >= 0 && courseData.price <= 5000000
  }

  const isMediaSectionComplete = () => {
    return courseData.thumbnail !== null
  }

  const handleThumbnailRemove = () => {
    setPreviewThumbnail(null)
    setCourseData({ ...courseData, thumbnail: null })
  }

  const handleVideoRemove = () => {
    setPreviewVideo(null)
    setCourseData({ ...courseData })
  }

  return (
    <div className="py-6 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <CourseFormHeader progress={progress} />

        <Card className="overflow-hidden mb-6 border-0 shadow-lg rounded-xl">
          <CourseFormNavigation
            activeSection={activeSection}
            onSectionChange={updateSection}
            isBasicSectionComplete={isBasicSectionComplete()}
            isMediaSectionComplete={isMediaSectionComplete()}
            isPriceSectionComplete={isPriceSectionComplete()}
          />

          {/* Auto-save indicator */}
          <div className="px-6 py-2 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-end text-sm text-gray-500">
              {formSaving ? (
                <div className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span>Đang lưu...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span>Đã lưu tự động</span>
                </div>
              )}
            </div>
          </div>

          <CardContent className="p-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {activeSection === 'basic' && (
                  <BasicInfoSection
                    courseData={courseData}
                    onChange={handleInputChange}
                    onEditorChange={onEditorChange}
                    onErrorsChange={setBasicErrors}
                  />
                )}

                {activeSection === 'media' && (
                  <MediaSection
                    courseData={courseData}
                    previewThumbnail={previewThumbnail}
                    previewVideo={previewVideo}
                    onFileChange={handleFileChange}
                    onThumbnailRemove={handleThumbnailRemove}
                    onVideoRemove={handleVideoRemove}
                  />
                )}

                {activeSection === 'pricing' && (
                  <PricingSection
                    courseData={courseData}
                    onNumberChange={handleNumberChange}
                    onInputChange={handleInputChange}
                    onCheckboxChange={handleCheckboxChange}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>

          <FormFooter
            activeSection={activeSection}
            onBack={handleBackClick}
            onContinue={handleContinueClick}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </Card>

        <div className="flex justify-center">
          <div className="text-center text-sm text-gray-500 mt-6 bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-100">
            <p>
              Bạn cần trợ giúp?{' '}
              <a
                href="#"
                className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                Truy cập trung tâm hỗ trợ
              </a>{' '}
              hoặc{' '}
              <a
                href="#"
                className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                liên hệ với chúng tôi
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
