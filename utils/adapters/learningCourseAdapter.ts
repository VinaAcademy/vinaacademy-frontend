import { CourseDto, LessonDto, LessonType } from '@/types/course'
import { LearningCourse, Section, Lecture, LectureType } from '@/types/lecture'
import { getLessonsBySectionId } from '@/services/lessonService'
import { LessonProgressDto } from '@/types/lesson'

/**
 * Maps backend lesson type to frontend lecture type
 */
export const mapLessonTypeToLectureType = (
  lessonType: LessonType,
): LectureType => {
  switch (lessonType) {
    case 'VIDEO':
      return 'video'
    case 'READING':
      return 'reading'
    case 'QUIZ':
      return 'quiz'
    default:
      return 'video'
  }
}

/**
 * Formats duration from seconds to MM:SS format
 */
export const formatDuration = (seconds?: number): string => {
  if (!seconds) {
    return ''
  }
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Converts a LessonDto to a Lecture object
 */
export const convertLessonToLecture = (
  lesson: LessonDto,
  isCompleted: boolean = false,
  isCurrent: boolean = false,
): Lecture => {
  return {
    id: lesson.id,
    title: lesson.title,
    type: mapLessonTypeToLectureType(lesson.type),
    description: '',
    duration: formatDuration(lesson.videoDuration),
    isCompleted: isCompleted,
    isCurrent,
    textContent: lesson.content,
    attachments: (lesson as any).attachments || [], // Map attachments from backend
  }
}

/**
 * Creates a progress map for quick lesson completion status lookup
 */
export const createProgressMap = (
  progressData: LessonProgressDto[],
): Map<string, boolean> => {
  const progressMap = new Map<string, boolean>()
  progressData.forEach((progress) => {
    progressMap.set(progress.lessonId, progress.completed)
  })
  return progressMap
}

/**
 * Convert sections with lessons using the progress information
 */
export const convertSectionsWithLessons = async (
  courseResponse: CourseDto,
  progressMap: Map<string, boolean>,
  currentLectureId?: string,
): Promise<Section[]> => {
  const sections = courseResponse.sections || []

  return Promise.all(
    sections.map(async (section) => {
      const lessons =
        section.lessons || (await getLessonsBySectionId(section.id))

      return {
        id: section.id,
        title: section.title,
        lectures: lessons.map((lesson) => {
          // Use the progress map to determine completion status
          const isCompleted = progressMap.has(lesson.id)
            ? progressMap.get(lesson.id)!
            : lesson.currentUserProgress?.completed || false

          const isCurrent = lesson.id === currentLectureId

          return convertLessonToLecture(lesson, isCompleted, isCurrent)
        }),
      }
    }),
  )
}

/**
 * Converts API course data to LearningCourse format
 */
export const convertToLearningCourse = async (
  apiResponse: CourseDto,
): Promise<LearningCourse> => {
  // Initialize the transformed course structure
  const transformedCourse: LearningCourse = {
    id: apiResponse.id,
    slug: apiResponse.slug,
    title: apiResponse.name,
    progress: Number(apiResponse.progress?.progressPercentage.toFixed(0)) || 0,
    sections: [],
    currentLecture: null,
  }

  // Process sections and lessons
  const sectionsWithLessons = await Promise.all(
    (apiResponse.sections || []).map(async (section) => {
      // Fetch lessons for each section if not already included
      const lessons =
        section.lessons || (await getLessonsBySectionId(section.id))

      const mappedSection: Section = {
        id: section.id,
        title: section.title,
        lectures: lessons.map((lesson) => convertLessonToLecture(lesson)),
      }

      return mappedSection
    }),
  )

  transformedCourse.sections = sectionsWithLessons

  // Set current lecture to the first one if there are any lectures
  if (
    sectionsWithLessons.length > 0 &&
    sectionsWithLessons[0].lectures.length > 0
  ) {
    const firstLecture = {
      ...sectionsWithLessons[0].lectures[0],
      isCurrent: true,
    }
    transformedCourse.currentLecture = firstLecture
  }

  return transformedCourse
}

/**
 * Converts API course data to LearningCourse format for lecture page
 */
export const convertToLearningCourseWithLecture = async (
  courseResponse: CourseDto,
  progressData: LessonProgressDto[],
  lectureId: string,
): Promise<{
  course: LearningCourse
  currentLecture: Lecture | null
}> => {
  // Create the progress map for quick lookup
  const progressMap = createProgressMap(progressData)

  // Transform the course structure
  const transformedCourse: LearningCourse = {
    id: courseResponse.id,
    slug: courseResponse.slug,
    title: courseResponse.name,
    progress:
      Number(courseResponse.progress?.progressPercentage?.toFixed(0)) || 0,
    sections: [],
    currentLecture: null,
  }

  // Convert sections with lessons
  const sectionsWithLessons = await convertSectionsWithLessons(
    courseResponse,
    progressMap,
    lectureId,
  )
  transformedCourse.sections = sectionsWithLessons

  // Find the current lecture
  let foundLecture: Lecture | null = null

  // Look for the lecture in all sections
  for (const section of sectionsWithLessons) {
    const lecture = section.lectures.find((l) => l.id === lectureId)
    if (lecture) {
      foundLecture = { ...lecture, isCurrent: true }
      break
    }
  }

  transformedCourse.currentLecture = foundLecture

  return {
    course: transformedCourse,
    currentLecture: foundLecture,
  }
}

/**
 * Get lecture information directly from lesson data if not found in course
 */
export const getLectureFromLesson = async (
  lessonDto: LessonDto | null,
  progressMap: Map<string, boolean>,
): Promise<Lecture | null> => {
  if (!lessonDto) return null

  // Check if we have progress information for this lesson
  const isCompleted = progressMap.has(lessonDto.id)
    ? progressMap.get(lessonDto.id)
    : lessonDto.currentUserProgress?.completed || false

  return convertLessonToLecture(lessonDto, isCompleted, true)
}
