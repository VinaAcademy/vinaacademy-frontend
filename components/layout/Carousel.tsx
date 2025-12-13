"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star, Eye } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { mockCourses } from '@/data/mockCourses';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface CarouselProps {
    title?: string;
    category?: string;
    subCategory?: string;
    featured?: boolean;
    bestSeller?: boolean;
    limit?: number;
    customCourses?: any[];
}

const Carousel = ({
    title,
    category,
    subCategory,
    featured,
    bestSeller,
    limit = 8,
    customCourses,
}: CarouselProps) => {
    const router = useRouter();

    // Use either custom courses or filter mock courses
    const filteredCourses = customCourses || mockCourses.filter(course => {
        if (category && course.category !== category) return false;
        if (subCategory && course.subCategory !== subCategory) return false;
        if (featured === true && !course.featured) return false;
        if (bestSeller === true && !course.bestSeller) return false;
        return true;
    }).slice(0, limit);

    // State to track the current index of the carousel
    const [currentIndex, setCurrentIndex] = useState(0);
    // Number of cards shown at once
    const itemsToShow = 4;

    // Function to move to the next slide
    const nextSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex + itemsToShow >= filteredCourses.length ? 0 : prevIndex + 1
        );
    };

    // Function to move to the previous slide
    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? Math.max(0, filteredCourses.length - itemsToShow) : prevIndex - 1
        );
    };

    // Handle view details button click
    const handleViewDetails = (e: React.MouseEvent, course: any) => {
        e.preventDefault();
        router.push(`/courses/${course.slug || course.id}`);
    };

    return (
        <div className="w-full max-w-[1200px] mx-auto px-4 py-6">
            {title && (
                <h3 className="text-xl font-semibold mb-4">{title}</h3>
            )}

            <div className="relative flex items-center">
                {/* Left navigation button */}
                <button
                    onClick={prevSlide}
                    className="absolute left-[-45px] z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100"
                    disabled={currentIndex === 0}
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Course cards display area */}
                <div className="flex gap-4 overflow-hidden py-4 w-full">
                    {filteredCourses
                        .slice(currentIndex, currentIndex + itemsToShow)
                        .map((course) => (
                            <Link
                                href={`/courses/${course.slug || course.id}`}
                                key={course.id}
                                className="mr-3"
                            >
                                <Card className="flex flex-col h-full w-[280px] hover:shadow-md transition-shadow">
                                    {/* Card header with image */}
                                    <CardHeader className="p-0 relative">
                                        <div className="relative w-full h-40">
                                            <Image
                                                src={course.image}
                                                alt={course.title}
                                                fill
                                                className="object-cover rounded-t-lg"
                                            />
                                            {course.discount > 0 && (
                                                <div
                                                    className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                    -{course.discount}%
                                                </div>
                                            )}
                                            {course.bestSeller && (
                                                <div
                                                    className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                    Bán chạy
                                                </div>
                                            )}
                                        </div>
                                    </CardHeader>

                                    {/* Card content */}
                                    <CardContent className="p-4 flex-grow">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                {course.category}
                                            </span>
                                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                                                {course.level}
                                            </span>
                                        </div>
                                        <CardTitle className="text-lg mb-2 line-clamp-2 h-15">{course.title}</CardTitle>
                                        <p className="text-gray-600 text-sm mb-2">{course.instructor}</p>
                                        <div className="flex items-center gap-1 mb-2">
                                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-medium">{course.rating}</span>
                                            <span className="text-xs text-gray-500">({course.students})</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold">
                                                {course.price === 0 || parseInt(course.price) === 0
                                                    ? "Miễn phí"
                                                    : `${parseInt(course.price).toLocaleString("vi-VN")}đ`}
                                            </span>
                                            {course.originalPrice && course.price !== 0 && parseInt(course.price) !== 0 && (
                                                <span className="text-sm text-gray-500 line-through">
                                                    {parseInt(course.originalPrice).toLocaleString("vi-VN")}đ
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>

                                    {/* Card footer with single "Xem chi tiết" button */}
                                    <CardFooter className="p-4 pt-0 mt-auto">
                                        <button
                                            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                            onClick={(e) => handleViewDetails(e, course)}
                                        >
                                            <Eye className="w-4 h-4" />
                                            Xem chi tiết
                                        </button>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                </div>

                {/* Right navigation button */}
                <button
                    onClick={nextSlide}
                    className="absolute right-[-45px] z-10 p-2 rounded-full bg-white shadow-lg hover:bg-gray-100"
                    disabled={currentIndex + itemsToShow >= filteredCourses.length}
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default Carousel;