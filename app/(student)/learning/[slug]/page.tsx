'use client';

import {FC, useState} from 'react';
import {use} from 'react';
import Link from 'next/link';
import {BookOpen, Video, FileText, PenSquare, Clock, Users, ChevronRight, CheckCircle} from 'lucide-react';
import LearningHeader from '@/components/student/learning/LearningHeader';
import StatusToast from '@/components/student/learning/shared/StatusToast';
import {LearningCourse, Section, Lecture, LectureType} from '@/types/lecture';
import { useRouter } from 'next/navigation';
import { useLearningCourse } from '@/hooks/useLearningCourse';

interface CoursePageProps {
    params: Promise<{
        slug: string;
    }>;
}

const formatUpdatedDate = (
    updatedDate?: string | number[],
) => {
    if (!updatedDate) return ''

    try {
        let date: Date
        if (Array.isArray(updatedDate)) {
            // Spring Boot array format: [year, month, day, hour, minute, second]
            date = new Date(
                updatedDate[0],
                updatedDate[1] - 1,
                updatedDate[2],
                updatedDate[3] || 0,
                updatedDate[4] || 0,
            )
        } else {
            // ISO string format
            date = new Date(updatedDate)
        }

        return date.toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    } catch (error) {
        return ''
    }
}

const CoursePage: FC<CoursePageProps> = ({params}) => {
    // Unwrap the params Promise
    const unwrappedParams = use(params);
    const slug = unwrappedParams.slug;
    const router = useRouter();

    // Use our custom hook to fetch course data
    const { course, loading, error, apiResponse } = useLearningCourse(slug);
    
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Helper function to format total duration from sections
    const formatTotalDuration = (sections: Section[]) => {
        const totalSeconds = sections.reduce((total, section) => {
            return total + section.lectures.reduce((sectionTotal, lecture) => {
                // Extract minutes and seconds from duration string (e.g., "5:30")
                const [minutes, seconds] = lecture.duration.split(':').map(Number);
                const totalTime = (minutes * 60) + (seconds || 0);
                return sectionTotal + (totalTime || 3 * 60);
            }, 0);
        }, 0);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        
        return hours > 0 ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
    };

    // Helper function to format last updated date
    const formatLastUpdated = (dateString?: string) => {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        const month = date.getMonth() + 1; // getMonth() returns 0-11
        const year = date.getFullYear();
        
        return `T${month}/${year}`;
    };

    const handleContinueLearning = () => {
        setToastMessage('Tiếp tục học tập từ bài học cuối cùng');
        setShowToast(true);
    };

    if (loading) {
        return (
            <div className="flex flex-col h-screen bg-white text-black">
                <LearningHeader
                    courseTitle="Loading..."
                    progress={0}
                    courseSlug={slug}
                />
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex flex-col h-screen bg-white text-black">
                <LearningHeader
                    courseTitle="Course Not Found"
                    progress={0}
                    courseSlug={slug}
                />
                <div className="flex flex-col items-center justify-center h-full">
                    <h1 className="text-2xl font-bold mb-4">Không tìm thấy khóa học</h1>
                    <p className="mb-6">Khóa học bạn đang tìm kiếm có thể đã bị xóa hoặc không tồn tại.</p>
                    <Link href="/my-courses" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Quay lại khóa học của tôi
                    </Link>
                </div>
            </div>
        );
    }

    // Tính tổng số bài học
    const totalLectures = course.sections.reduce(
        (acc, section) => acc + section.lectures.length,
        0
    );

    // Đếm số bài học theo loại
    const countLecturesByType = (type: string) => {
        return course.sections
            .flatMap(section => section.lectures)
            .filter(lecture => lecture.type === type)
            .length;
    };

    // Icon cho loại bài học
    const getLectureTypeIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <Video className="w-4 h-4 text-blue-500"/>;
            case 'reading':
                return <BookOpen className="w-4 h-4 text-green-500"/>;
            case 'quiz':
                return <FileText className="w-4 h-4 text-orange-500"/>;
            case 'assignment':
                return <PenSquare className="w-4 h-4 text-purple-500"/>;
            default:
                return <Video className="w-4 h-4 text-gray-500"/>;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <LearningHeader
                courseTitle={course.title}
                progress={course.progress}
                courseSlug={slug}
            />

            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 flex-1">
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                    {/* Header của khóa học */}
                    <div className="p-4 sm:p-6 md:p-8 border-b border-gray-200">
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 break-words">{course.title}</h1>
                        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
                            <div className="flex items-center text-gray-600 text-sm sm:text-base">
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0"/>
                                <span className="truncate">{formatTotalDuration(course.sections)}</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm sm:text-base">
                                <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0"/>
                                <span>{totalLectures} bài học</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm sm:text-base">
                                <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0"/>
                                <span>{apiResponse?.totalStudent || 0} học viên</span>
                            </div>
                            <div className="flex items-center text-gray-600 text-sm sm:text-base">
                                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1 sm:mr-2 flex-shrink-0"></span>
                                <span>Cập nhật: {formatLastUpdated(apiResponse?.updatedDate)}</span>
                            </div>
                        </div>

                        {/* Thanh tiến độ */}
                        <div className="mt-5 sm:mt-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs sm:text-sm font-medium text-gray-700">Tiến độ học tập</span>
                                <span className="text-xs sm:text-sm font-medium text-blue-600">{course.progress}% hoàn thành</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                                <div
                                    className="bg-blue-600 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                                    style={{width: `${course.progress}%`}}
                                ></div>
                            </div>
                        </div>

                        {/* Tiếp tục học */}
                        {course.currentLecture && (
                            <div className="mt-5 sm:mt-6">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Tiếp tục học</h2>
                                <Link
                                    href={`/learning/${slug}/lecture/${course.currentLecture.id}`}
                                    className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                    onClick={handleContinueLearning}
                                >
                                    <div className="flex items-center min-w-0">
                                        <div className="flex-shrink-0">
                                            {getLectureTypeIcon(course.currentLecture.type)}
                                        </div>
                                        <div className="ml-2 sm:ml-3 min-w-0">
                                            <p className="font-medium text-gray-800 text-sm sm:text-base truncate">{course.currentLecture.title}</p>
                                            <p className="text-xs sm:text-sm text-gray-500">{course.currentLecture.duration}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 ml-2"/>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Nội dung khóa học */}
                    <div className="p-4 sm:p-6 md:p-8">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Nội dung khóa học</h2>

                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-4 sm:gap-4 mb-4 sm:mb-6">
                            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-blue-700">Video</p>
                                    <p className="text-lg sm:text-xl font-bold text-blue-900">{countLecturesByType('video')}</p>
                                </div>
                                <Video className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500"/>
                            </div>
                            <div className="p-3 sm:p-4 bg-green-50 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-green-700">Bài đọc</p>
                                    <p className="text-lg sm:text-xl font-bold text-green-900">{countLecturesByType('reading')}</p>
                                </div>
                                <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-green-500"/>
                            </div>
                            <div className="p-3 sm:p-4 bg-orange-50 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-orange-700">Bài kiểm tra</p>
                                    <p className="text-lg sm:text-xl font-bold text-orange-900">{countLecturesByType('quiz')}</p>
                                </div>
                                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500"/>
                            </div>
                            {/* <div className="p-3 sm:p-4 bg-purple-50 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm text-purple-700">Bài tập</p>
                                    <p className="text-lg sm:text-xl font-bold text-purple-900">{countLecturesByType('assignment')}</p>
                                </div>
                                <PenSquare className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500"/>
                            </div> */}
                        </div>

                        {/* Danh sách các phần */}
                        <div className="space-y-3 sm:space-y-4">
                            {course.sections.map((section, sectionIndex) => (
                                <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="p-3 sm:p-4 bg-gray-50 border-b border-gray-200">
                                        <h3 className="text-sm sm:text-base font-medium text-gray-800">
                                            Phần {sectionIndex + 1}: {section.title}
                                        </h3>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{section.lectures.length} bài học</p>
                                    </div>
                                    <div className="divide-y divide-gray-200">
                                        {section.lectures.map((lecture, lectureIndex) => (
                                            <Link
                                                key={lecture.id}
                                                href={`/learning/${slug}/lecture/${lecture.id}`}
                                                className="flex items-center p-3 sm:p-4 hover:bg-gray-50 transition"
                                            >
                                                
                                                <div className="w-6 sm:w-8 text-center text-gray-500 mr-1 sm:mr-2 flex-shrink-0">
                                                    {lecture.isCompleted ? (
                                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto"/>
                                                    ) : (
                                                        <span className="text-xs sm:text-sm">{sectionIndex + 1}.{lectureIndex + 1}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center flex-wrap gap-1 sm:gap-2">
                                                        <div className="flex-shrink-0">
                                                            {getLectureTypeIcon(lecture.type || 'video')}
                                                        </div>
                                                        <span className="font-medium text-gray-800 text-sm sm:text-base truncate">{lecture.title}</span>
                                                        {lecture.isCurrent && (
                                                            <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full flex-shrink-0">
                                                                Đang học
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">
                                                        {lecture.duration}
                                                    </p>
                                                    {lecture.updatedDate && (
                                                        <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">
                                                            Cập nhật: {formatUpdatedDate(lecture.updatedDate)}
                                                        </p>
                                                    )}
                                                </div>
                                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 ml-1 sm:ml-2"/>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Thông báo trạng thái */}
            {showToast && (
                <StatusToast
                    message={toastMessage}
                    type="success"
                    show={showToast}
                    onClose={() => setShowToast(false)}
                />
            )}
        </div>
    );
};

export default CoursePage;