import React, { useState, useRef } from 'react'
import { Video, AlertTriangle } from 'lucide-react'
import { VideoStatus } from '@/types/video'
import { useQueryClient } from '@tanstack/react-query'
import { getLessonById } from '@/services/lessonService'
import { createErrorToast, createSuccessToast } from '@/components/ui/toast-cus'
import VideoPreviewModal from './video/VideoPreviewModal'
import UploadedVideoCard from './video/UploadedVideoCard'
import { UploadSessionDto } from '@/services/chunkUploadService'
import ChunkUploadDropZone from './video/ChunkDropZone'
import { processVideo } from '@/services/videoService'
import { LESSON_KEYS } from '@/config/query-keys.config'
import { useLectureEdit } from '@/context/LectureEditContext'

export default function VideoUploader() {
  const { lecture, setLecture } = useLectureEdit()
  const [showVideoPreview, setShowVideoPreview] = useState(false)
  const [processingStatus, setProcessingStatus] = useState<VideoStatus | null>(
    lecture.status || null,
  )

  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsVideoRef = useRef<HTMLVideoElement>(
    null,
  ) as React.MutableRefObject<HTMLVideoElement>

  const queryClient = useQueryClient()

  const handleUploadComplete = async (session: UploadSessionDto) => {
    try {
      createSuccessToast('Video uploaded successfully and processing started')

      // Process Video
      const process = await processVideo({
        mediaFileId: session.sessionId,
        videoId: lecture?.id,
      })
      if (!process.success) {
        createErrorToast(`Failed to start video processing: ${process.error}`)
        setProcessingStatus(VideoStatus.ERROR)
        return
      }
      setProcessingStatus(VideoStatus.PROCESSING)
      setLecture((prev) => ({
        ...prev,
        status: VideoStatus.PROCESSING,
      }))

      // Start polling for processing status
      let interval = 2000
      const maxInterval = 30000
      let timeoutId: NodeJS.Timeout

      const pollProcessingStatus = async () => {
        try {
          const lesson = await getLessonById(lecture.id)
          if (lesson) {
            setProcessingStatus(lesson.status as VideoStatus)

            if (lesson.status === VideoStatus.READY) {
              clearTimeout(timeoutId)
              await queryClient.invalidateQueries({
                queryKey: LESSON_KEYS.byId(lecture.id),
              })
              createSuccessToast(
                'Video processed successfully and ready to play',
              )

              setLecture((prev) => ({
                ...prev,
                duration: lesson.duration
                  ? String(lesson.duration)
                  : prev.duration,
                status: lesson.status as VideoStatus,
              }))
              return
            }

            if (lesson.status === VideoStatus.ERROR) {
              clearTimeout(timeoutId)
              createErrorToast(
                'Video processing failed. Please check the format and try again.',
              )
              setLecture((prev) => ({
                ...prev,
                status: VideoStatus.ERROR,
              }))
              return
            }

            // Continue polling with exponential backoff
            interval = Math.min(interval * 1.5, maxInterval)
            timeoutId = setTimeout(pollProcessingStatus, interval)
          }
        } catch (error) {
          console.error('Error checking processing status:', error)
          clearTimeout(timeoutId)
          createErrorToast('Failed to check processing status')
        }
      }

      // Start polling
      timeoutId = setTimeout(pollProcessingStatus, interval)
    } catch (error) {
      console.error('Error handling upload completion:', error)
      createErrorToast('Upload completed but failed to start processing')
    }
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
    setProcessingStatus(VideoStatus.ERROR)
    createErrorToast(`Upload failed: ${error}`)
  }

  const canPlayVideo =
    Number(lecture.duration) > 0 && lecture.status === VideoStatus.READY

  return (
    <div className="mt-6">
      <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        <Video className="h-4 w-4" /> Video bài giảng
      </label>

      {lecture.status !== VideoStatus.NO_VIDEO ? (
        <div className="mb-4">
          <UploadedVideoCard
            lecture={lecture}
            processingStatus={processingStatus}
            canPlayVideo={canPlayVideo}
            onPreviewClick={() => setShowVideoPreview(true)}
            onReplaceClick={() => {
              // Reset to allow new upload
              setLecture((prev) => ({ ...prev, status: VideoStatus.NO_VIDEO }))
              setProcessingStatus(VideoStatus.NO_VIDEO)
            }}
            uploading={false}
          />

          {showVideoPreview && (
            <VideoPreviewModal
              videoRef={videoRef}
              hlsVideoRef={hlsVideoRef}
              lectureId={lecture.id || ''}
              lectureTitle={lecture.title}
              duration={Number(lecture.duration)}
              onClose={() => setShowVideoPreview(false)}
            />
          )}
        </div>
      ) : (
        <ChunkUploadDropZone
          accept="video/mp4,video/quicktime,video/webm,video/x-msvideo"
          maxSize={2 * 1024 * 1024 * 1024} // 2GB
          lessonId={lecture.id}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          className="mb-4"
        />
      )}

      {lecture.type === 'video' && lecture.status === VideoStatus.NO_VIDEO && (
        <div className="mt-3 text-sm flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-amber-700">
            <span className="font-medium">Lưu ý:</span> Bạn cần tải lên video để
            hoàn tất bài giảng.
          </p>
        </div>
      )}
    </div>
  )
}
