import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCourseLearning } from '@/services/courseService';
import { getLessonById } from '@/services/lessonService';
import { getAllLessonProgressByCourse } from '@/services/progressService';
import {
  convertToLearningCourseWithLecture,
  createProgressMap,
  getLectureFromLesson
} from '@/utils/adapters/learningCourseAdapter';
import {LESSON_KEYS} from "@/config/query-keys.config";

/**
 * Custom hook for fetching and transforming lecture data
 * @param slug The course slug
 * @param lectureId The lecture ID to fetch
 * @returns Object containing course data, lecture data, loading state, and error state
 */
export const useLecture = (slug: string, lectureId: string) => {
  const [showQuizContent, setShowQuizContent] = useState<boolean>(false);

  // Use React Query for data fetching with caching
  const { 
    data: result,
    isLoading: loading, 
    error,
    refetch
  } = useQuery({
    queryKey: LESSON_KEYS.byCourse(slug, lectureId),
    queryFn: async () => {
      try {
        // Fetch course data
        const courseResponse = await getCourseLearning(slug);
        
        if (!courseResponse) {
          throw new Error('Failed to fetch course data');
        }
        
        // Fetch lesson progress data for the course
        const lessonProgressData = await getAllLessonProgressByCourse(courseResponse.id);
        
        // Use the adapter to convert API response to LearningCourse format with the current lecture
        const { course: transformedCourse, currentLecture: foundLecture } = 
          await convertToLearningCourseWithLecture(courseResponse, lessonProgressData, lectureId);
        
        // If lecture is not found in the course data, fetch it directly
        if (!foundLecture) {
          const lessonResponse = await getLessonById(lectureId);
          const progressMap = createProgressMap(lessonProgressData);
          const lectureFromLesson = await getLectureFromLesson(lessonResponse, progressMap);
          
          if (lectureFromLesson) {
            transformedCourse.currentLecture = lectureFromLesson;
            return { 
              courseData: transformedCourse,
              currentLecture: lectureFromLesson
            };
          } else {
            throw new Error('Lecture not found');
          }
        } else {
          return { 
            courseData: transformedCourse,
            currentLecture: foundLecture
          };
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
      }
    },
    enabled: !!slug && !!lectureId,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });

  // Extract course and lecture data from query result
  const courseData = result?.courseData || null;
  const currentLecture = result?.currentLecture || null;

  const handleStartQuiz = () => setShowQuizContent(true);

  return { 
    courseData, 
    currentLecture, 
    loading, 
    error: error as Error | null,
    showQuizContent,
    handleStartQuiz,
    setShowQuizContent,
    refetchLectureData: refetch // Expose the refetch function
  };
};
