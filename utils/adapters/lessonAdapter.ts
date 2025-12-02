import { LessonDto, LessonRequest } from '@/types/lesson'
import { Lecture, LectureType } from '@/types/lecture'
import { LessonType } from '@/types/course'
import { VideoStatus } from '@/types/video'

/**
 * Converts LessonDto from API to Lecture type for UI
 */
export const lessonToLecture = (lesson: LessonDto): Lecture => {
  // Map API lesson type to frontend lecture type
  let lectureType: LectureType = 'video'
  switch (lesson.type) {
    case 'VIDEO':
      lectureType = 'video'
      break
    case 'READING':
      lectureType = 'reading'
      break
    case 'QUIZ':
      lectureType = 'quiz'
      break
    default:
      lectureType = 'video'
  }

  return {
    id: lesson.id,
    title: lesson.title,
    type: lectureType,
    description: lesson.description || '',
    duration: lesson.videoDuration ? String(lesson.videoDuration) : '0',
    textContent: lesson.content || '',
    resources: [], // Resources would need to be fetched separately
    attachments: lesson.attachments || [], // Map attachments from API
    free: lesson.free || false,
    status: lesson.status || VideoStatus.NO_VIDEO,
  }
}

/**
 * Converts Lecture from UI to LessonRequest for API
 */
export const lectureToLessonRequest = (
  lecture: Lecture,
  sectionId: string,
): LessonRequest => {
  const lessonRequest: LessonRequest = {
    title: lecture.title.trim(),
    sectionId,
    type: lecture.type.toUpperCase() as LessonType,
    description: lecture.description,
    free: lecture.free || false,
  }

  // Add attachment IDs if there are any attachments
  if (lecture.attachments && lecture.attachments.length > 0) {
    lessonRequest.attachmentIds = lecture.attachments.map((a) => a.id)
  }

  // Add type-specific fields
  if (lecture.type === 'video') {
    lessonRequest.videoDuration = parseInt(lecture.duration) || 0
  } else if (lecture.type === 'reading' || lecture.type === 'quiz') {
    lessonRequest.content = lecture.textContent
  }

  // Add quiz-specific fields if applicable
  if (lecture.type === 'quiz' && lecture.quiz) {
    lessonRequest.duration = lecture.quiz.settings?.timeLimit || 0
    lessonRequest.totalPoint = lecture.quiz.totalPoints || 0
    lessonRequest.passPoint = lecture.quiz.totalPoints || 0

    // Include quiz settings
    if (lecture.quiz.settings) {
      lessonRequest.settings = {
        randomizeQuestions: lecture.quiz.settings.randomizeQuestions,
        showCorrectAnswers: lecture.quiz.settings.showCorrectAnswers,
        allowRetake: lecture.quiz.settings.allowRetake,
        requirePassingScore: lecture.quiz.settings.requirePassingScore,
        passingScore: lecture.quiz.settings.passingScore,
        timeLimit: lecture.quiz.settings.timeLimit,
      }
    }

    // If we have questions, we would add them here
    // This is typically handled by the quiz-specific API endpoints
  }

  return lessonRequest
}
