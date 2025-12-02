import { FC, useState, useEffect } from 'react'
import {
  BookOpen,
  PenSquare,
  MessageSquare,
  Search,
  Users,
  Bell,
  Star,
  Settings,
  Wrench,
  FileText,
} from 'lucide-react'
import NotesArea from './learning-tab/NotesArea'
import QuestionsArea from './learning-tab/QuestionsArea'
import DiscussionArea from './learning-tab/DiscussionArea'
import ReviewsArea from './learning-tab/ReviewArea'
import LessonAttachments from '@/components/student/lesson/LessonAttachments'
import { Lecture } from '@/types/lecture'
import { useAuth } from '@/context/AuthContext'
import { getCourseIdBySlug } from '@/services/courseService'

interface LearningTabsProps {
  lecture: Lecture
  courseSlug: string
  currentTimestamp?: number
}

const LearningTabs: FC<LearningTabsProps> = ({
  lecture: lecture,
  courseSlug,
  currentTimestamp = 0,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'notes'
    | 'q&a'
    | 'discussion'
    | 'announcements'
    | 'reviews'
    | 'tools'
  >('overview')
  const { user } = useAuth()
  const [courseId, setCourseId] = useState<string>('')
  const [isLoadingCourseId, setIsLoadingCourseId] = useState(true)

  useEffect(() => {
    const fetchCourseId = async () => {
      setIsLoadingCourseId(true)
      try {
        const id = await getCourseIdBySlug(courseSlug)
        if (id) {
          setCourseId(id)
        } else {
          console.error(`Could not find ID for course slug: ${courseSlug}`)
        }
      } catch (error) {
        console.error('Error fetching course ID:', error)
      } finally {
        setIsLoadingCourseId(false)
      }
    }

    if (courseSlug) {
      fetchCourseId()
    }
  }, [courseSlug])

  // Xử lý mở tab transcript khi nó được yêu cầu
  const handleTranscriptTab = () => {
    // Trong một ứng dụng thực tế, bạn có thể thêm một tab riêng cho transcript
    // Ở đây, chúng ta sẽ mở tab overview và cuộn đến phần transcript
    setActiveTab('overview')
    setTimeout(() => {
      const transcriptElement = document.getElementById('transcript-section')
      if (transcriptElement) {
        transcriptElement.scrollIntoView({ behavior: 'smooth' })
      }
    }, 100)
  }

  // Xử lý khi nhấp vào thời gian trong transcript để điều chỉnh video
  const handleTranscriptTimeClick = (time: number) => {
    // Thông báo cho component cha (VideoPlayer) về việc thay đổi thời gian
    // Thực tế sẽ cần một callback từ component cha
    console.log('Seek to time:', time)
    // Ví dụ: onSeek(time);
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Tab điều hướng phía trên */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 flex items-center text-sm font-medium whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <Search size={16} className="mr-2" />
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab('q&a')}
            className={`px-4 py-3 flex items-center text-sm font-medium whitespace-nowrap ${
              activeTab === 'q&a'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <MessageSquare size={16} className="mr-2" />
            Hỏi đáp
          </button>
          <button
            onClick={() => setActiveTab('discussion')}
            className={`px-4 py-3 flex items-center text-sm font-medium whitespace-nowrap ${
              activeTab === 'discussion'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <Users size={16} className="mr-2" />
            Thảo luận
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-3 flex items-center text-sm font-medium whitespace-nowrap ${
              activeTab === 'notes'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <PenSquare size={16} className="mr-2" />
            Ghi chú
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-3 flex items-center text-sm font-medium whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <Bell size={16} className="mr-2" />
            Thông báo
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-3 flex items-center text-sm font-medium whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <Star size={16} className="mr-2" />
            Đánh giá
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-3 flex items-center text-sm font-medium whitespace-nowrap ${
              activeTab === 'tools'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-700 hover:text-gray-900'
            }`}
          >
            <Wrench size={16} className="mr-2" />
            Công cụ học tập
          </button>
        </div>
      </div>

      {/* Nội dung tab */}
      <div className="flex-1">
        {activeTab === 'overview' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{lecture.title}</h2>
            <p className="text-gray-700 mb-6">{lecture.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">Thời lượng</h3>
                <p className="text-gray-600">{lecture.duration}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">
                  Loại nội dung
                </h3>
                <p className="text-gray-600 capitalize">{lecture.type}</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-2">Ngày đăng</h3>
                <p className="text-gray-600">15/03/2025</p>
              </div>
            </div>

            {/* Transcript section - Chỉ hiển thị cho bài học video */}
            {lecture.type === 'video' && lecture.transcript && (
              <div id="transcript-section" className="mt-8">
                <h3 className="text-xl font-semibold mb-4">Transcript</h3>
                <div className="bg-gray-50 p-4 rounded-lg max-h-80 overflow-y-auto">
                  {lecture.transcript.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3 text-gray-700">
                      {paragraph.trim()}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Resources section */}
            <div className="mt-8">
              <LessonAttachments
                lessonId={lecture.id}
                attachments={lecture.attachments}
              />
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <NotesArea
            // courseId={courseSlug}
            lectureId={lecture.id}
            currentTimestamp={currentTimestamp}
          />
        )}

        {activeTab === 'q&a' && (
          <QuestionsArea courseId={courseSlug} lectureId={lecture.id} />
        )}

        {activeTab === 'discussion' && (
          <DiscussionArea courseId={courseSlug} lectureId={lecture.id} />
        )}

        {activeTab === 'announcements' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Thông Báo</h2>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
              <Bell className="w-16 h-16 text-blue-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                Không có thông báo mới
              </h3>
              <p className="text-blue-600">
                Các thông báo từ giảng viên sẽ xuất hiện ở đây.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <ReviewsArea
            courseId={courseId}
            currentUserId={user?.id} // Truyền ID người dùng từ context
            mainPage={false}
          />
        )}

        {activeTab === 'tools' && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Công Cụ Học Tập</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition text-center">
                <div className="mx-auto w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full mb-4">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-lg mb-2">Flashcards</h3>
                <p className="text-gray-600 mb-4">
                  Tạo thẻ ghi nhớ để học hiệu quả hơn.
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full">
                  Mở công cụ
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition text-center">
                <div className="mx-auto w-12 h-12 flex items-center justify-center bg-green-100 rounded-full mb-4">
                  <PenSquare className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-medium text-lg mb-2">Ghi chú nâng cao</h3>
                <p className="text-gray-600 mb-4">
                  Ghi chú với các tính năng phong phú.
                </p>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 w-full">
                  Mở công cụ
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition text-center">
                <div className="mx-auto w-12 h-12 flex items-center justify-center bg-purple-100 rounded-full mb-4">
                  <Wrench className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-lg mb-2">
                  Môi trường thực hành
                </h3>
                <p className="text-gray-600 mb-4">
                  Môi trường thực hành code trực tuyến.
                </p>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 w-full">
                  Mở công cụ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LearningTabs
