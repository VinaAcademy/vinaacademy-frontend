import {useRef, useEffect} from 'react';
import {markLessonComplete} from '@/services/lessonService';
import {useQueryClient} from '@tanstack/react-query';
import {LESSON_KEYS} from "@/config/query-keys.config";

interface UseLessonCompletionReturn {
    checkCompletion: (currentTime: number, duration: number) => void;
}

export const useLessonCompletion = (
    lessonId: string,
    isCompleted: boolean = false,
    courseSlug?: string,
    onLessonCompleted?: () => void
): UseLessonCompletionReturn => {
    const queryClient = useQueryClient();
    const hasMarkedComplete = useRef(isCompleted || false);
    const markCompleteInProgress = useRef(false);

    // Reset completion state when lesson changes
    useEffect(() => {
        hasMarkedComplete.current = isCompleted || false;
        markCompleteInProgress.current = false;
    }, [lessonId, isCompleted]);

    // Function to check if video should be marked as completed
    const checkCompletion = (currentTime: number, duration: number) => {
        if (
            duration > 0 &&
            currentTime > 0 &&
            !isCompleted &&
            !hasMarkedComplete.current &&
            !markCompleteInProgress.current &&
            (currentTime / duration > 0.95) // 95% threshold for completion
        ) {
            markCompleteInProgress.current = true;

            markLessonComplete(lessonId)
                .then(async (success) => {
                    if (success) {
                        hasMarkedComplete.current = true;

                        // Invalidate React Query cache
                        if (courseSlug) {
                            await queryClient.invalidateQueries({
                                queryKey: LESSON_KEYS.listByCourse(courseSlug),
                            });
                        }

                        // Notify parent component
                        if (onLessonCompleted) {
                            onLessonCompleted();
                        }
                    }
                })
                .catch(error => {
                    console.error('Error marking lesson as complete:', error);
                })
                .finally(() => {
                    markCompleteInProgress.current = false;
                });
        }
    };

    return {checkCompletion};
};
