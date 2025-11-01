"use client";

import {FC, useState, useEffect} from 'react';
import {getLessonById, markLessonComplete} from '@/services/lessonService';
import {useQueryClient} from '@tanstack/react-query';
import {CheckCircle} from 'lucide-react';
import SafeHtml from '@/components/common/safe-html';
import {LESSON_KEYS} from "@/config/query-keys.config";

interface ReadingContentProps {
    lectureId: string;
    courseId: string;
    isCompleted?: boolean;
    onLessonCompleted?: () => void;
    courseSlug?: string;
}

interface ContentSection {
    heading: string;
    content: string;
}

interface ReadingContent {
    title: string;
    sections: ContentSection[];
}

const ReadingContent: FC<ReadingContentProps> = ({
                                                     lectureId,
                                                     isCompleted = false,
                                                     onLessonCompleted,
                                                     courseSlug
                                                 }) => {
    const queryClient = useQueryClient();
    const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
    const [isLoading, setIsLoading] = useState(true);
    const [readingContent, setReadingContent] = useState<ReadingContent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isMarkingComplete, setIsMarkingComplete] = useState(false);
    const [localCompleted, setLocalCompleted] = useState(isCompleted);

    // Fetch lesson data
    useEffect(() => {
        const fetchLessonData = async () => {
            setIsLoading(true);
            try {
                const data = await getLessonById(lectureId);
                if (data) {
                    // Parse the content if it exists
                    if (data.content) {
                        try {
                            // Try to parse as JSON first (in case content is stored as structured data)
                            const parsedContent = JSON.parse(data.content);
                            setReadingContent(parsedContent);
                        } catch (parseError) {
                            setReadingContent({
                                title: data.title,
                                sections: [
                                    {
                                        heading: data.title,
                                        content: data.content
                                    }
                                ]
                            });
                        }
                    } else {
                        setError('Nội dung bài đọc không có sẵn.');
                    }
                } else {
                    setError('Không thể tải nội dung bài học.');
                }
            } catch (err) {
                console.error('Error fetching lesson data:', err);
                setError('Đã xảy ra lỗi khi tải nội dung bài học.');
            } finally {
                setIsLoading(false);
            }
        };

        if (lectureId) {
            fetchLessonData().then();
        }
    }, [lectureId]);

    // Handle mark as complete
    const handleMarkComplete = async () => {
        if (isCompleted || localCompleted || isMarkingComplete) return;

        setIsMarkingComplete(true);
        try {
            const success = await markLessonComplete(lectureId);
            if (success) {
                setLocalCompleted(true);

                // Invalidate React Query cache to refresh course data
                if (courseSlug) {
                    await queryClient.invalidateQueries({
                        queryKey: LESSON_KEYS.listByCourse(courseSlug)
                    });
                }

                // Notify parent component
                if (onLessonCompleted) {
                    onLessonCompleted();
                }
            }
        } catch (error) {
            console.error("Failed to mark lesson as complete:", error);
        } finally {
            setIsMarkingComplete(false);
        }
    };

    // Update local state when prop changes
    useEffect(() => {
        setLocalCompleted(isCompleted);
    }, [isCompleted]);

    const getFontSizeClass = () => {
        switch (fontSize) {
            case 'sm':
                return 'text-sm';
            case 'md':
                return 'text-base';
            case 'lg':
                return 'text-lg';
            case 'xl':
                return 'text-xl';
            default:
                return 'text-base';
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !readingContent) {
        return (
            <div className="max-w-3xl mx-auto text-center py-10">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                    {error || "Không thể tải nội dung bài đọc"}
                </h2>
                <p className="text-gray-500">
                    Vui lòng thử lại sau hoặc liên hệ với hỗ trợ viên nếu vấn đề vẫn tiếp diễn.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full px-4 sm:px-6">
            {/* Điều khiển đọc */}
            <div
                className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 pt-4">
                <h1 className="text-xl sm:text-2xl font-bold">{readingContent.title}</h1>
                <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-end">
                    {localCompleted && (
                        <span className="px-3 py-1 rounded-md text-sm bg-green-50 text-green-700 flex items-center">
                        <CheckCircle size={14} className="mr-1"/>
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

            {/* Nội dung đọc */}
            <div
                className={`space-y-8 ${getFontSizeClass()} bg-white sm:border sm:border-gray-200 sm:rounded-lg sm:p-6 shadow-sm`}>
                {readingContent.sections.map((section, index) => (
                    <div key={index} className="reading-section">
                        {section.heading !== readingContent.title && (
                            <h2 className="text-xl font-bold mb-4 pb-2 border-b border-gray-100">{section.heading}</h2>
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
            <div
                className="mt-8 mb-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
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
                            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center w-full sm:w-auto justify-center ${isMarkingComplete
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                        >
                            {isMarkingComplete ? (
                                <>
                                    <span
                                        className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></span>
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} className="mr-1.5 text-green-600 animate-pulse"/>
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
    );
};

export default ReadingContent;