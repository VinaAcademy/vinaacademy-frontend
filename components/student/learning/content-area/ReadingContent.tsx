'use client'

import { FC, useState, useEffect } from 'react'
import { getLessonById, markLessonComplete } from '@/services/lessonService'
import { useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle,
  Volume2,
  Loader2,
  Sparkles,
  ChevronDown,
} from 'lucide-react'
import SafeHtml from '@/components/common/safe-html'
import AudioPlayer from '@/components/common/AudioPlayer'
import { LESSON_KEYS } from '@/config/query-keys.config'
import { toast } from 'sonner'

interface ReadingContentProps {
  lectureId: string
  courseId: string
  isCompleted?: boolean
  onLessonCompleted?: () => void
  courseSlug?: string
}

interface ContentSection {
  heading: string
  content: string
}

interface ReadingContent {
  title: string
  sections: ContentSection[]
}

const ReadingContent: FC<ReadingContentProps> = ({
  lectureId,
  isCompleted = false,
  onLessonCompleted,
  courseSlug,
}) => {
  const queryClient = useQueryClient()
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md')
  const [isLoading, setIsLoading] = useState(true)
  const [readingContent, setReadingContent] = useState<ReadingContent | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)
  const [isMarkingComplete, setIsMarkingComplete] = useState(false)
  const [localCompleted, setLocalCompleted] = useState(isCompleted)

  // TTS State
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)
  const [audioData, setAudioData] = useState<string | null>(null)
  const [ttsError, setTtsError] = useState<string | null>(null)
  const [selectedVoice, setSelectedVoice] = useState('vi-VN-HoaiMyNeural')
  const [showVoiceOptions, setShowVoiceOptions] = useState(false)

  // Available voice options
  const voiceOptions = [
    {
      value: 'vi-VN-HoaiMyNeural',
      label: 'Hoài My (Nữ)',
      gender: 'female',
      language: 'Tiếng Việt',
    },
    {
      value: 'vi-VN-NamMinhNeural',
      label: 'Nam Minh (Nam)',
      gender: 'male',
      language: 'Tiếng Việt',
    },
    {
      value: 'en-US-JennyNeural',
      label: 'Jenny (Nữ)',
      gender: 'female',
      language: 'English',
    },
    {
      value: 'en-US-GuyNeural',
      label: 'Guy (Nam)',
      gender: 'male',
      language: 'English',
    },
  ]

  // Fetch lesson data
  useEffect(() => {
    const fetchLessonData = async () => {
      setIsLoading(true)
      try {
        const data = await getLessonById(lectureId)
        if (data) {
          // Parse the content if it exists
          if (data.content) {
            try {
              // Try to parse as JSON first (in case content is stored as structured data)
              const parsedContent = JSON.parse(data.content)
              setReadingContent(parsedContent)
            } catch (parseError) {
              setReadingContent({
                title: data.title,
                sections: [
                  {
                    heading: data.title,
                    content: data.content,
                  },
                ],
              })
            }
          } else {
            setError('Nội dung bài đọc không có sẵn.')
          }
        } else {
          setError('Không thể tải nội dung bài học.')
        }
      } catch (err) {
        console.error('Error fetching lesson data:', err)
        setError('Đã xảy ra lỗi khi tải nội dung bài học.')
      } finally {
        setIsLoading(false)
      }
    }

    if (lectureId) {
      fetchLessonData().then()
    }
  }, [lectureId])

  // Handle mark as complete
  const handleMarkComplete = async () => {
    if (isCompleted || localCompleted || isMarkingComplete) return

    setIsMarkingComplete(true)
    try {
      const success = await markLessonComplete(lectureId)
      if (success) {
        setLocalCompleted(true)

        // Invalidate React Query cache to refresh course data
        if (courseSlug) {
          await queryClient.invalidateQueries({
            queryKey: LESSON_KEYS.listByCourse(courseSlug),
          })
        }

        // Notify parent component
        if (onLessonCompleted) {
          onLessonCompleted()
        }
      }
    } catch (error) {
      console.error('Failed to mark lesson as complete:', error)
    } finally {
      setIsMarkingComplete(false)
    }
  }

  // Update local state when prop changes
  useEffect(() => {
    setLocalCompleted(isCompleted)
  }, [isCompleted])

  // Handle Text-to-Speech generation
  const handleGenerateAudio = async () => {
    if (audioData) {
      // If audio already exists, just show it
      return
    }

    setIsGeneratingAudio(true)
    setTtsError(null)

    try {
      // Dynamic import to avoid SSR issues
      const { generateLessonAudio } = await import('@/services/lessonService')

      const response = await generateLessonAudio(lectureId, {
        voice: selectedVoice,
        speed: '1.0',
        format: 'base64',
      })

      if (response && response.status === 'success' && response.audioBase64) {
        // Convert base64 to data URI
        const audioDataUri = `data:audio/mpeg;base64,${response.audioBase64}`
        setAudioData(audioDataUri)
        toast.success('Audio đã sẵn sàng! Bạn có thể nghe bài đọc.')
      } else {
        const errorMsg = response?.message || 'Không thể tạo audio'
        setTtsError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (err: any) {
      console.error('Error generating audio:', err)
      const errorMsg = err.message || 'Đã xảy ra lỗi khi tạo audio'
      setTtsError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setIsGeneratingAudio(false)
    }
  }

  // Clear audio data
  const handleClearAudio = () => {
    setAudioData(null)
    setTtsError(null)
  }

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm':
        return 'text-sm'
      case 'md':
        return 'text-base'
      case 'lg':
        return 'text-lg'
      case 'xl':
        return 'text-xl'
      default:
        return 'text-base'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error || !readingContent) {
    return (
      <div className="max-w-3xl mx-auto text-center py-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">
          {error || 'Không thể tải nội dung bài đọc'}
        </h2>
        <p className="text-gray-500">
          Vui lòng thử lại sau hoặc liên hệ với hỗ trợ viên nếu vấn đề vẫn tiếp
          diễn.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full px-4 sm:px-6">
      {/* Điều khiển đọc */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 pt-4">
        <h1 className="text-xl sm:text-2xl font-bold">
          {readingContent.title}
        </h1>
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
          {localCompleted && (
            <span className="px-3 py-1 rounded-md text-sm bg-green-50 text-green-700 flex items-center">
              <CheckCircle size={14} className="mr-1" />
              Đã hoàn thành
            </span>
          )}
          {/* Font size controls */}
          <div className="flex space-x-2 border rounded-lg p-1 bg-gray-50">
            <button
              onClick={() => setFontSize('sm')}
              className={`p-1.5 rounded-md ${fontSize === 'sm' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-white'}`}
              title="Cỡ chữ nhỏ"
            >
              <span className="text-xs">A</span>
            </button>
            <button
              onClick={() => setFontSize('md')}
              className={`p-1.5 rounded-md ${fontSize === 'md' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-white'}`}
              title="Cỡ chữ vừa"
            >
              <span className="text-sm">A</span>
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`p-1.5 rounded-md ${fontSize === 'lg' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-white'}`}
              title="Cỡ chữ lớn"
            >
              <span className="text-base">A</span>
            </button>
            <button
              onClick={() => setFontSize('xl')}
              className={`p-1.5 rounded-md ${fontSize === 'xl' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:bg-white'}`}
              title="Cỡ chữ rất lớn"
            >
              <span className="text-lg">A</span>
            </button>
          </div>
        </div>
      </div>

      {/* Text-to-Speech Section */}
      <div className="mb-6">
        {!audioData ? (
          <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="absolute top-3 right-3">
              <Sparkles className="text-blue-400" size={20} />
            </div>

            <div className="flex flex-col space-y-4">
              {/* Header */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Volume2 className="text-white" size={24} />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    🎧 Nghe bài đọc
                  </h3>
                  <p className="text-sm text-gray-600">
                    Chuyển nội dung thành giọng nói để bạn có thể nghe bất cứ
                    lúc nào
                  </p>
                </div>
              </div>

              {/* Voice Selector */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-grow">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Chọn giọng đọc
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowVoiceOptions(!showVoiceOptions)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-left flex items-center justify-between hover:border-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {
                          voiceOptions.find((v) => v.value === selectedVoice)
                            ?.label
                        }
                      </span>
                      <ChevronDown
                        size={16}
                        className={`text-gray-500 transition-transform ${showVoiceOptions ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {showVoiceOptions && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        {voiceOptions.map((voice) => (
                          <button
                            key={voice.value}
                            onClick={() => {
                              setSelectedVoice(voice.value)
                              setShowVoiceOptions(false)
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors ${
                              selectedVoice === voice.value
                                ? 'bg-blue-50 border-l-4 border-blue-600'
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-800">
                                  {voice.label}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {voice.language}
                                </p>
                              </div>
                              {selectedVoice === voice.value && (
                                <CheckCircle
                                  size={16}
                                  className="text-blue-600"
                                />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
                  className={`sm:mt-6 px-6 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2 shadow-md transition-all ${
                    isGeneratingAudio
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  {isGeneratingAudio ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      <span>Tạo Audio</span>
                    </>
                  )}
                </button>
              </div>

              {/* Error Display */}
              {ttsError && (
                <div className="flex items-start space-x-2 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
                  <span className="text-red-500 font-bold">⚠️</span>
                  <p>{ttsError}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Volume2 className="text-white" size={16} />
                </div>
                <h3 className="text-base font-bold text-gray-800">
                  🎵 Audio đã sẵn sàng
                </h3>
              </div>
              <button
                onClick={handleClearAudio}
                className="text-xs font-medium text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                🗑️ Xóa audio
              </button>
            </div>
            <AudioPlayer
              audioSrc={audioData}
              onEnded={() => {
                console.log('Audio finished')
                toast.success('Hoàn thành nghe bài đọc!')
              }}
            />
          </div>
        )}
      </div>

      {/* Nội dung đọc */}
      <div
        className={`space-y-8 ${getFontSizeClass()} bg-white sm:border sm:border-gray-200 sm:rounded-lg sm:p-6 shadow-sm`}
      >
        {readingContent.sections.map((section, index) => (
          <div key={index} className="reading-section">
            {section.heading !== readingContent.title && (
              <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-100">
                {section.heading}
              </h2>
            )}
            <div className="prose prose-slate max-w-none">
              <SafeHtml
                html={section.content}
                className={`text-gray-700 ${getFontSizeClass()}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Điều hướng */}
      <div className="mt-8 mb-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* <button className="flex items-center text-blue-600 hover:text-blue-800 order-2 sm:order-1">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd" />
                    </svg>
                    Bài học trước
                </button> */}

        {/* Mark as complete button - moved to bottom */}
        <div className="flex-grow flex justify-center order-1 sm:order-2 w-full sm:w-auto">
          {!localCompleted && (
            <button
              onClick={handleMarkComplete}
              disabled={isMarkingComplete}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center w-full sm:w-auto justify-center ${
                isMarkingComplete
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isMarkingComplete ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle
                    size={16}
                    className="mr-1.5 text-green-600 animate-pulse"
                  />
                  <span className="font-medium">Đánh dấu hoàn thành</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* <button className="flex items-center text-blue-600 hover:text-blue-800 order-3">
                    Bài học tiếp theo
                    <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd" />
                    </svg>
                </button> */}
      </div>
    </div>
  )
}

export default ReadingContent
