"use client";

import Link from "next/link";
import { useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Clock } from "lucide-react";
import { useInView } from "framer-motion";
import { useContinueLearning } from "@/hooks/course/useContinueLearning";
import { LearningCourse } from "@/types/navbar";
import Image from "next/image";
import { getImageUrl } from "@/utils/imageUtils";

const RecentCoursesSection = () => {
    const { isAuthenticated } = useAuth();
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

    // Sử dụng hook đã cập nhật - luôn lấy 3 khóa học truy cập gần nhất
    const { courses, isLoading } = useContinueLearning({
        limit: 5,
        enabled: isAuthenticated
    });

    if (!isAuthenticated || (!isLoading && courses.length === 0)) {
        return null;
    }

    return (
        <div
            ref={sectionRef}
            className="transform transition-all duration-500 ease-out"
            style={{
                opacity: isInView ? 1 : 0,
                transform: isInView ? "translateY(0)" : "translateY(15px)"
            }}
        >
            <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="flex items-center gap-2 px-1 sm:px-2">
                    <div className="bg-green-100 p-1.5 rounded-md shadow-sm">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800">Tiếp tục học</h2>
                </div>
                <Link
                    href="/my-courses"
                    className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium flex items-center gap-1 pr-2 transition-colors duration-200"
                >
                    <span>Xem tất cả</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 px-1 sm:px-2">
                {isLoading ? (
                    // Loading skeleton
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-md p-3 animate-pulse">
                            <div className="flex gap-3">
                                <div className="w-24 h-24 bg-gray-200 rounded-md shrink-0"></div>
                                <div className="flex-1">
                                    <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded mb-2 w-1/2"></div>
                                    <div className="h-2 bg-gray-200 rounded w-full mt-3"></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    courses.length > 0 ? (
                        courses.map((course: LearningCourse) => (
                            <Link
                                key={course.slug}
                                href={`/learning/${course.slug}`}
                                className="block bg-white rounded-lg shadow-md p-3 transition-all hover:shadow-lg hover:-translate-y-1"
                            >
                                <div className="flex gap-3">
                                    <div className="w-24 h-24 rounded-md shrink-0 overflow-hidden">
                                        <Image
                                            src={getImageUrl(course.image)}
                                            alt={course.name}
                                            width={150}
                                            height={150}
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-800 line-clamp-1">{course.name}</h3>
                                        <p className="text-sm text-gray-500 mb-1">
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3 text-gray-400" />
                                                {course.instructor} {/* Hiển thị thời gian truy cập đã được định dạng */}
                                            </span>
                                        </p>
                                        <div className="mt-1">
                                            <div className="w-full h-2 bg-gray-200 rounded-full">
                                                <div
                                                    className="h-full bg-blue-600 rounded-full"
                                                    style={{ width: `${Number(course.progress)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between mt-1">
                                                <span className="text-xs text-gray-500">{course.completedLessons} / {course.totalLessons} bài học</span>
                                                <span className="text-xs text-blue-600">{Number(course.progress).toFixed(0)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-3 text-center py-10">
                            <p className="text-gray-500">Bạn chưa có khóa học nào đang học.</p>
                            <Link href="/courses" className="mt-4 inline-block text-blue-600 hover:underline">
                                Khám phá khóa học mới
                            </Link>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default RecentCoursesSection;