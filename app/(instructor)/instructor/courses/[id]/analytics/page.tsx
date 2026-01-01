'use client'

import { useParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import InstructorSentimentDashboard from '@/components/instructor/sentiment/InstructorSentimentDashboard'
import InstructorStatsTab from '@/components/instructor/sentiment/InstructorStatsTab'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, BarChart3, MessageSquare } from 'lucide-react'
import DiscussionArea from '@/components/student/learning/learning-tab/DiscussionArea'
import { getSectionsByCourse } from '@/services/sectionService'
import { getLessonsBySectionId } from '@/services/lessonService'

/**
 * Instructor Course Analytics Page
 * Hiển thị sentiment analysis dashboard cho giảng viên
 */
export default function CourseAnalyticsPage() {
  const params = useParams()
  const courseId = params.id as string
  const [activeTab, setActiveTab] = useState('sentiment')
  const [lessons, setLessons] = useState<
    { id: string; title: string; sectionTitle: string }[]
  >([])
  const [selectedLessonId, setSelectedLessonId] = useState<string>('')
  const [loadingLessons, setLoadingLessons] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)

  const loadLessons = useCallback(async () => {
    if (!courseId) return
    setLoadingLessons(true)
    try {
      const sections = await getSectionsByCourse(courseId)

      const lessonPairs: { id: string; title: string; sectionTitle: string }[] =
        []

      for (const section of sections) {
        const sectionLessons = await getLessonsBySectionId(section.id)
        sectionLessons.forEach((lesson) => {
          lessonPairs.push({
            id: lesson.id,
            title: lesson.title,
            sectionTitle: section.title,
          })
        })
      }

      setLessons(lessonPairs)
      if (lessonPairs.length && !selectedLessonId) {
        setSelectedLessonId(lessonPairs[0].id)
      }
    } catch (error) {
      console.error('Error loading lessons for course analytics:', error)
    } finally {
      setLoadingLessons(false)
    }
  }, [courseId, selectedLessonId])

  useEffect(() => {
    loadLessons()
  }, [loadLessons])

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId),
    [lessons, selectedLessonId],
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Phân tích khóa học</h1>
        <p className="text-gray-600 mt-2">
          Theo dõi hiệu suất và phản hồi của học viên về khóa học
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="sentiment" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Sentiment
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Thống kê
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Phản hồi
          </TabsTrigger>
        </TabsList>

        {/* Sentiment Analysis Tab */}
        <TabsContent value="sentiment" className="mt-6">
          <InstructorSentimentDashboard
            courseId={courseId}
            onDataLoaded={setDashboardData}
          />
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="mt-6">
          {dashboardData ? (
            <InstructorStatsTab data={dashboardData} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Thống kê chi tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Vui lòng chuyển qua tab Sentiment để tải dữ liệu</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Feedback Tab - Placeholder */}
        <TabsContent value="feedback" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Phản hồi từ học viên</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      Chọn bài học để xem thảo luận của học viên
                    </p>
                    {selectedLesson && (
                      <p className="text-xs text-gray-500">
                        Thuộc mục: {selectedLesson.sectionTitle}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Bài học</label>
                    <select
                      value={selectedLessonId}
                      onChange={(e) => setSelectedLessonId(e.target.value)}
                      className="min-w-[240px] rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      disabled={loadingLessons || lessons.length === 0}
                    >
                      {lessons.map((lesson) => (
                        <option key={lesson.id} value={lesson.id}>
                          {lesson.sectionTitle} · {lesson.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {loadingLessons ? (
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <MessageSquare className="mr-2 h-5 w-5 animate-pulse" />
                    Đang tải danh sách bài học...
                  </div>
                ) : !selectedLessonId ? (
                  <div className="text-center py-10 text-gray-500">
                    <MessageSquare className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                    <p>Không tìm thấy bài học để hiển thị thảo luận.</p>
                  </div>
                ) : (
                  <DiscussionArea
                    courseId={courseId}
                    lectureId={selectedLessonId}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
