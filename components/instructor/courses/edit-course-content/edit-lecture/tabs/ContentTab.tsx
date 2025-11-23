// components/lecture/tabs/ContentTab.tsx
import VideoUploader from '../content/VideoUploader'
import TextEditor from '../content/TextEditor'
import QuizEditor from '../content/quiz/QuizEditor'
import AssignmentEditor from '../content/AssignmentEditor'
import {
  Video,
  FileText,
  MessageSquare,
  Monitor,
  Sparkles,
  Info,
  AlertCircle,
} from 'lucide-react'
import React from 'react'
import { useLectureEdit } from '@/context/LectureEditContext'

export default function ContentTab() {
  const { lecture, setLecture } = useLectureEdit()

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target

    // For other fields, simply update the value
    setLecture({
      ...lecture,
      [name]: value,
    })
  }
  // Get appropriate type label and icon for the current lecture type
  const getTypeInfo = () => {
    switch (lecture.type) {
      case 'video':
        return {
          label: 'Video',
          icon: <Video className="h-5 w-5" />,
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          textColor: 'text-blue-800',
          ringColor: 'focus:ring-blue-500',
        }
      case 'reading':
        return {
          label: 'Bài đọc',
          icon: <FileText className="h-5 w-5" />,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          textColor: 'text-emerald-800',
          ringColor: 'focus:ring-emerald-500',
        }
      case 'quiz':
        return {
          label: 'Bài kiểm tra',
          icon: <Monitor className="h-5 w-5" />,
          color: 'bg-purple-50 text-purple-700 border-purple-200',
          textColor: 'text-purple-800',
          ringColor: 'focus:ring-purple-500',
        }
      case 'assignment':
        return {
          label: 'Bài tập',
          icon: <MessageSquare className="h-5 w-5" />,
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          textColor: 'text-amber-800',
          ringColor: 'focus:ring-amber-500',
        }
      default:
        return {
          label: 'Không xác định',
          icon: <FileText className="h-5 w-5" />,
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          textColor: 'text-gray-800',
          ringColor: 'focus:ring-gray-500',
        }
    }
  }

  const {
    label: typeLabel,
    icon: typeIcon,
    color: typeColor,
    textColor,
    ringColor,
  } = getTypeInfo()

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="border-b border-gray-200 pb-5">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          Nội dung bài giảng
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Thiết kế nội dung bài giảng hấp dẫn để thu hút học viên.
        </p>
      </div>

      {/* Main content section */}
      <div className="grid grid-cols-1 gap-8">
        {/* Basic info card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">
              Thông tin cơ bản
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Tiêu đề bài giảng */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Tiêu đề bài giảng <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  className={`block w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none ${ringColor} focus:border-transparent focus:ring-2 transition duration-200 bg-white text-gray-900`}
                  value={lecture.title}
                  onChange={handleInputChange}
                  placeholder="Nhập tiêu đề bài giảng"
                />
              </div>
            </div>

            {/* Mô tả bài giảng */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mô tả bài giảng
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className={`shadow-sm block w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none ${ringColor} focus:border-transparent focus:ring-2 transition duration-200 bg-white text-gray-900`}
                  value={lecture.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả ngắn gọn về bài giảng này"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500 flex items-center">
                <Info className="h-4 w-4 mr-1" />
                Mô tả ngắn gọn nội dung của bài giảng này
              </p>
            </div>
          </div>
        </div>

        {/* Content type card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">Loại nội dung</h3>
          </div>
          <div className="p-6">
            <div
              className={`p-5 rounded-lg border ${typeColor} transition-all duration-200 flex items-center`}
            >
              <div
                className={`flex-shrink-0 p-3 rounded-full ${typeColor} mr-4`}
              >
                {typeIcon}
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className={`text-base font-medium ${textColor}`}>
                    {typeLabel}
                  </h3>
                  <span
                    className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColor}`}
                  >
                    Đã chọn
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-600 flex items-start">
                  <AlertCircle className="h-4 w-4 mr-1 text-gray-400 mt-0.5" />
                  Loại nội dung không thể thay đổi sau khi đã tạo. Để sử dụng
                  loại nội dung khác, vui lòng xóa bài giảng này và tạo bài
                  giảng mới.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content editor card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 transition hover:shadow-md overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">
              Nội dung bài giảng
            </h3>
          </div>
          <div className="p-6">
            {/* Content based on type */}
            {lecture.type === 'video' && <VideoUploader />}

            {lecture.type === 'reading' && <TextEditor />}

            {lecture.type === 'quiz' && <QuizEditor />}

            {lecture.type === 'assignment' && <AssignmentEditor />}
          </div>
        </div>
      </div>
    </div>
  )
}
