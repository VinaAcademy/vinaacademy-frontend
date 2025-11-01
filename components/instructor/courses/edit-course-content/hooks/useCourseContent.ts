// components/instructor/courses/edit-course-content/hooks/useCourseContent.ts
import { useState } from 'react';
import { toast } from 'react-toastify';
import {
    useQuery,
    useMutation,
    useQueryClient
} from '@tanstack/react-query';
import { LessonDto, SectionDto, LessonType } from '@/types/course';
import {
    getLessonsBySectionId,
    createLesson,
    updateLesson,
    deleteLesson,
    reorderLessons
} from '@/services/lessonService';
import {
    getSectionsByCourse,
    createSection,
    updateSection,
    deleteSection as deleteSectionApi,
    reorderSections,
} from '@/services/sectionService';
import { submitCourseForReview } from '@/services/courseService';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import {SECTION_KEYS} from "@/config/query-keys.config";

// Định nghĩa lại type phù hợp với backend nhưng vẫn đáp ứng yêu cầu frontend
export interface SectionDisplay {
    id: string;
    title: string;
    order: number;
    lectures: LectureDisplay[];
}

export interface LectureDisplay {
    id: string;
    title: string;
    type: string;
    duration?: number;
    content?: string;
    order: number;
    isPublished?: boolean;
    free?: boolean;
    description?: string;
}

// Type mapping từ backend sang frontend
const mapLessonToLectureDisplay = (lesson: LessonDto): LectureDisplay => ({
    id: lesson.id,
    title: lesson.title,
    type: lesson.type.toLowerCase(),
    duration: lesson.type === 'VIDEO' ? lesson.videoDuration : lesson.duration,
    content: lesson.content || '',
    order: lesson.orderIndex
});

// Map SectionDto sang SectionDisplay
const mapSectionToDisplay = (section: SectionDto, lessons: LessonDto[] = []): SectionDisplay => ({
    id: section.id,
    title: section.title,
    order: section.orderIndex,
    lectures: lessons.map(mapLessonToLectureDisplay)
});

export const useCourseContent = (courseId?: string) => {
    const queryClient = useQueryClient();
    const [expandedSections, setExpandedSections] = useState<string[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Query key definitions
    const sectionsQueryKey: readonly ["sections", string] | [] = courseId ? SECTION_KEYS.byCourse(courseId) : [];

    // Fetch sections and their lectures
    const {
        data: sections = [],
        isLoading,
        error,
        refetch: fetchSections
    } = useQuery({
        queryKey: sectionsQueryKey,
        queryFn: async () => {
            if (!courseId) {
              return [];
            }

            const fetchedSections = await getSectionsByCourse(courseId);

            // Nếu không có sections hoặc API lỗi
            if (!fetchedSections || fetchedSections.length === 0) {
                return [];
            }

            // Lấy tất cả các bài giảng cho mỗi section
            const sectionsWithLectures = await Promise.all(
                fetchedSections.map(async (section: SectionDto) => {
                    try {
                        const lessons = await getLessonsBySectionId(section.id);
                        return mapSectionToDisplay(section, lessons);
                    } catch (error) {
                        console.error(`Lỗi khi tải bài giảng cho section ${section.id}:`, error);
                        return mapSectionToDisplay(section, []);
                    }
                })
            );

            // Auto-expand the first section if no sections are expanded
            if (sectionsWithLectures.length > 0 && expandedSections.length === 0) {
                setExpandedSections([sectionsWithLectures[0].id]);
            }

            return sectionsWithLectures;
        },
        enabled: !!courseId
    });

    // Add section mutation
    const addSectionMutation = useMutation({
        mutationFn: async () => {
            if (!courseId) {
              throw new Error('Không có ID khóa học');
            }

            const newSectionData = {
                title: `Phần học mới`,
                courseId: courseId,
                orderIndex: sections.length
            };

            return await createSection(newSectionData);
        },
        onSuccess: (createdSection) => {
            if (!createdSection) {
                toast.error('Không thể tạo phần học mới. Vui lòng thử lại sau.');
                return;
            }

            const newSection: SectionDisplay = {
                id: createdSection.id,
                title: createdSection.title,
                order: createdSection.orderIndex,
                lectures: []
            };

            queryClient.setQueryData(sectionsQueryKey, (oldData: SectionDisplay[] | undefined) => {
                return oldData ? [...oldData, newSection] : [newSection];
            });

            setExpandedSections(prev => [...prev, newSection.id]);
            toast.success('Đã thêm phần học mới thành công');
        },
        onError: (error) => {
            console.error('Lỗi khi thêm phần học:', error);
        }
    });

    // Edit section mutation
    useMutation({
        mutationFn: async ({ sectionId, newTitle }: { sectionId: string, newTitle: string }) => {
            if (!courseId) {
                throw new Error('Không có ID khóa học');
            }

            const section = sections.find(s => s.id === sectionId);
            if (!section) {
                throw new Error('Không tìm thấy phần học');
            }

            const updatedSectionData = {
                title: newTitle,
                courseId: courseId,
                orderIndex: section.order
            };

            return await updateSection(sectionId, updatedSectionData);
        },
        onSuccess: (updatedSection, { sectionId, newTitle }) => {
            if (!updatedSection) {
                toast.error('Không thể cập nhật phần học. Vui lòng thử lại sau.');
                return;
            }

            queryClient.setQueryData(sectionsQueryKey, (oldData: SectionDisplay[] | undefined) => {
                return oldData ? oldData.map(section =>
                    section.id === sectionId
                        ? { ...section, title: newTitle }
                        : section
                ) : [];
            });

            toast.success('Đã cập nhật phần học thành công');
        },
        onError: (error) => {
            console.error('Lỗi khi cập nhật phần học:', error);
        }
    });
// Delete section mutation
    const deleteSectionMutation = useMutation({
        mutationFn: async (sectionId: string) => {
            if (!window.confirm('Bạn có chắc chắn muốn xóa phần học này không?')) {
                throw new Error('User cancelled');
            }
            return await deleteSectionApi(sectionId);
        },
        onSuccess: (success, sectionId) => {
            if (success === false) {
                toast.error('Không thể xóa phần học. Vui lòng thử lại sau.');
                return;
            }

            queryClient.setQueryData(sectionsQueryKey, (oldData: SectionDisplay[] | undefined) => {
                return oldData ? oldData.filter(section => section.id !== sectionId) : [];
            });

            setExpandedSections(prev => prev.filter(id => id !== sectionId));
            toast.success('Đã xóa phần học thành công');

            // Cập nhật lại thứ tự các phần học còn lại
            if (sections.length > 0) {
                const sectionIds = sections.map(section => section.id);
                updateSectionOrdersMutation.mutate(sectionIds);
            }
        },
        onError: (error) => {
            if ((error as Error).message === 'User cancelled') {
              return;
            }
            console.error('Lỗi khi xóa phần học:', error);
        }
    });

    // Add lecture mutation
    const addLectureMutation = useMutation({
        mutationFn: async (sectionId: string) => {
            if (!courseId) {
              throw new Error('Không có ID khóa học');
            }

            const newLectureData = {
                title: `Bài giảng mới`,
                type: 'VIDEO' as LessonType,
                content: '',
                sectionId: sectionId,
            };

            const createdLesson = await createLesson(newLectureData);

            if (createdLesson) {
                // Gửi khóa học đi duyệt khi thêm bài giảng mới
                await submitCourseForReview(courseId);
            }

            return { createdLesson, sectionId };
        },
        onSuccess: ({ createdLesson, sectionId }) => {
            if (!createdLesson) {
                toast.error('Không thể thêm bài giảng. Vui lòng thử lại sau.');
                return;
            }

            const newLecture: LectureDisplay = mapLessonToLectureDisplay(createdLesson);

            queryClient.setQueryData(sectionsQueryKey, (oldData: SectionDisplay[] | undefined) => {
                return oldData ? oldData.map(section => {
                    if (section.id === sectionId) {
                        return {
                            ...section,
                            lectures: [...section.lectures, newLecture]
                        };
                    }
                    return section;
                }) : [];
            });

            toast.success('Đã thêm bài giảng mới thành công và gửi khóa học đi duyệt');
        },
        onError: (error) => {
            console.error('Lỗi khi thêm bài giảng:', error);
        }
    });

    // Edit lecture mutation
    useMutation({
        mutationFn: async ({ sectionId, lectureId, lectureData }: {
            sectionId: string,
            lectureId: string,
            lectureData: Partial<LectureDisplay>
        }) => {
            const section = sections.find(s => s.id === sectionId);
            const lecture = section?.lectures.find(l => l.id === lectureId);

            if (!section || !lecture) {
                throw new Error('Không tìm thấy bài giảng');
            }

            const updateData = {
                title: lectureData.title || lecture.title,
                type: (lectureData.type?.toUpperCase() || lecture.type.toUpperCase()) as LessonType,
                content: lectureData.content !== undefined ? lectureData.content : lecture.content || '',
                sectionId: sectionId,
                orderIndex: lectureData.order !== undefined ? lectureData.order : lecture.order,
                duration: lectureData.duration !== undefined ? lectureData.duration : lecture.duration
            };

            return {
                updatedLesson: await updateLesson(lectureId, updateData),
                sectionId,
                lectureId,
                lectureData
            };
        },
        onSuccess: ({ updatedLesson, sectionId, lectureId, lectureData }) => {
            if (!updatedLesson) {
                toast.error('Không thể cập nhật bài giảng. Vui lòng thử lại sau.');
                return;
            }

            queryClient.setQueryData(sectionsQueryKey, (oldData: SectionDisplay[] | undefined) => {
                return oldData ? oldData.map(section => {
                    if (section.id === sectionId) {
                        return {
                            ...section,
                            lectures: section.lectures.map(lecture =>
                                lecture.id === lectureId ? { ...lecture, ...lectureData } : lecture
                            )
                        };
                    }
                    return section;
                }) : [];
            });

            toast.success('Đã cập nhật bài giảng thành công');
        },
        onError: (error) => {
            console.error('Lỗi khi cập nhật bài giảng:', error);
        }
    });
// Delete lecture mutation
    const deleteLectureMutation = useMutation({
        mutationFn: async ({ sectionId, lectureId }: { sectionId: string, lectureId: string }) => {
            if (!window.confirm('Bạn có chắc chắn muốn xóa bài giảng này không?')) {
                throw new Error('User cancelled');
            }
            return { success: await deleteLesson(lectureId), sectionId, lectureId };
        },
        onSuccess: ({ success, sectionId, lectureId }) => {
            if (success === false) {
                toast.error('Không thể xóa bài giảng. Vui lòng thử lại sau.');
                return;
            }

            queryClient.setQueryData(sectionsQueryKey, (oldData: SectionDisplay[] | undefined) => {
                return oldData ? oldData.map(section => {
                    if (section.id === sectionId) {
                        return {
                            ...section,
                            lectures: section.lectures.filter(lecture => lecture.id !== lectureId)
                        };
                    }
                    return section;
                }) : [];
            });

            toast.success('Đã xóa bài giảng thành công');

            // Cập nhật lại thứ tự các bài giảng trong phần học đó
            updateLectureOrdersMutation.mutate({ sectionId });
        },
        onError: (error) => {
            if ((error as Error).message === 'User cancelled') {
              return;
            }
            console.error('Lỗi khi xóa bài giảng:', error);
        }
    });

    // Update section orders mutation
    const updateSectionOrdersMutation = useMutation({
        mutationFn: async (sectionIds?: string[]) => {
            if (!courseId || sections.length === 0) {
              return false;
            }

            // Use provided sectionIds or get from current sections
            const ids = sectionIds || sections.map(section => section.id);
            return await reorderSections(courseId, ids);
        },
        onSuccess: async (success, sectionIds) => {
            if (!success) {
                console.error('Error reordering sections');
                if (courseId) {
                    if (sectionsQueryKey.length > 0) {
                        await queryClient.invalidateQueries({ queryKey: sectionsQueryKey });
                    }
                }
                return;
            }

            if (sectionIds) {
                queryClient.setQueryData(sectionsQueryKey, (oldData: SectionDisplay[] | undefined) => {
                    if (!oldData) {
                      return [];
                    }

                    // Create a map for quick lookup
                    const sectionMap = new Map(oldData.map(section => [section.id, section]));

                    // Create new array with updated order
                    return sectionIds.map((id, index) => {
                        const section = sectionMap.get(id);
                        if (section) {
                            return { ...section, order: index };
                        }
                        return null;
                    }).filter(Boolean) as SectionDisplay[];
                });
            }
        },
        onError: (error) => {
            console.error('Lỗi khi cập nhật thứ tự phần học:', error);
            toast.error('Không thể cập nhật thứ tự phần học. Vui lòng thử lại sau.');
        }
    });

    // Update lecture orders mutation
    const updateLectureOrdersMutation = useMutation({
        mutationFn: async (params: { sectionId: string, lectureIds?: string[] }) => {
            const { sectionId, lectureIds } = params;
            const section = sections.find(s => s.id === sectionId);
            if (!section) {
              return;
            }

            // Use provided lectureIds or get from current lectures
            const ids = lectureIds || section.lectures.map(lecture => lecture.id);
            return { success: await reorderLessons(sectionId, ids), sectionId, lectureIds: ids };
        },
        onSuccess: (data) => {
            if (!data) {
                console.error('Error: Missing data in onSuccess callback');
                return;
            }
            const { success, sectionId, lectureIds } = data;
            if (!success || !lectureIds) {
                console.error('Error reordering lectures');
                return;
            }

            queryClient.setQueryData(sectionsQueryKey, (oldData: SectionDisplay[] | undefined) => {
                return oldData ? oldData.map(s => {
                    if (s.id === sectionId) {
                        // Create a map for quick lookup
                        const lectureMap = new Map(s.lectures.map(lecture => [lecture.id, lecture]));

                        // Create new array with updated order
                        const updatedLectures = lectureIds.map((id, index) => {
                            const lecture = lectureMap.get(id);
                            if (lecture) {
                                return { ...lecture, order: index };
                            }
                            return null;
                        }).filter(Boolean) as LectureDisplay[];

                        return {
                            ...s,
                            lectures: updatedLectures
                        };
                    }
                    return s;
                }) : [];
            });
        },
        onError: (error) => {
            console.error('Lỗi khi cập nhật thứ tự bài giảng:', error);
            toast.error('Không thể cập nhật thứ tự bài giảng. Vui lòng thử lại sau.');
        }
    });

    // Save all changes mutation
    const saveAllChangesMutation = useMutation({
        mutationFn: async () => {
            // First update section orders
            if (courseId) {
                await updateSectionOrdersMutation.mutateAsync(sections.map(section => section.id));
            }

            // Then update lecture orders for each section
            for (const section of sections) {
                await updateLectureOrdersMutation.mutateAsync({ sectionId: section.id });
            }

            return true;
        },
        onSuccess: () => {
            toast.success('Đã lưu tất cả thay đổi thành công');
        },
        onError: (error) => {
            console.error('Lỗi khi lưu thay đổi:', error);
        }
    });

    // Toggle section expansion
    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => {
            if (prev.includes(sectionId)) {
                return prev.filter(id => id !== sectionId);
            } else {
                return [...prev, sectionId];
            }
        });
    };

    // Handle DnD reordering
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            setIsDragging(false);
            return;
        }

        // Parse IDs to determine if we're dealing with sections or lectures
        const activeId = active.id.toString();
        const overId = over.id.toString();

        console.log('Active ID:', activeId);
        console.log('Over ID:', overId);

        // Handle section reordering
        if (activeId.startsWith('section-') && overId.startsWith('section-')) {
            const activeSectionId = activeId.replace('section-', '');
            const overSectionId = overId.replace('section-', '');

            const oldIndex = sections.findIndex(section => section.id === activeSectionId);
            const newIndex = sections.findIndex(section => section.id === overSectionId);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newSections = arrayMove(sections, oldIndex, newIndex);
                const sectionIds = newSections.map(section => section.id);

                // Update UI optimistically
                queryClient.setQueryData(sectionsQueryKey,
                    newSections.map((section, index) => ({
                        ...section,
                        order: index
                    }))
                );

                // Call API to persist changes
                await updateSectionOrdersMutation.mutateAsync(sectionIds);
                toast.success('Thứ tự phần học đã được cập nhật');
            }
        }

        // Handle lecture reordering
        else if (activeId.startsWith('lecture:') && overId.startsWith('lecture:')) {
            const activeParts = activeId.split(':');
            const overParts = overId.split(':');

            // Format: lecture:sectionId:lectureId
            if (activeParts.length === 3 && overParts.length === 3) {
                const activeSectionId = activeParts[1];
                const overSectionId = overParts[1];

                // For now, only allow reordering within the same section
                if (activeSectionId === overSectionId) {
                    const section = sections.find(s => s.id === activeSectionId);
                    if (section) {
                        const activeLectureId = activeParts[2];
                        const overLectureId = overParts[2];

                        const oldIndex = section.lectures.findIndex(lecture => lecture.id === activeLectureId);
                        const newIndex = section.lectures.findIndex(lecture => lecture.id === overLectureId);

                        if (oldIndex !== -1 && newIndex !== -1) {
                            const newLectures = arrayMove(section.lectures, oldIndex, newIndex);
                            const lectureIds = newLectures.map(lecture => lecture.id);

                            // Update UI optimistically
                            queryClient.setQueryData(sectionsQueryKey, (oldData: SectionDisplay[] | undefined) => {
                                return oldData ? oldData.map(s => {
                                    if (s.id === activeSectionId) {
                                        return {
                                            ...s,
                                            lectures: newLectures.map((lecture, index) => ({
                                                ...lecture,
                                                order: index
                                            }))
                                        };
                                    }
                                    return s;
                                }) : [];
                            });

                            // Call API to persist changes
                            await updateLectureOrdersMutation.mutateAsync({
                                sectionId: activeSectionId,
                                lectureIds
                            });

                            toast.success('Thứ tự bài giảng đã được cập nhật');
                        }
                    }
                }
            }
        }

        setIsDragging(false);
    };

    return {
        sections,
        expandedSections,
        isDragging,
        isLoading,
        error,
        setIsDragging,
        toggleSection,
        addSection: () => addSectionMutation.mutate(),
        deleteSection: (sectionId: string) => deleteSectionMutation.mutate(sectionId),
        addLecture: (sectionId: string) => addLectureMutation.mutate(sectionId),
        deleteLecture: (sectionId: string, lectureId: string) =>
            deleteLectureMutation.mutate({ sectionId, lectureId }),
        saveAllChanges: () => saveAllChangesMutation.mutateAsync(),
        handleDragEnd,
        fetchSections
    };
};