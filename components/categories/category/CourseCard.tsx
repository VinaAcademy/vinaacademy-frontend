// components/CourseCard.tsx
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { CourseDto } from "@/types/course";

interface CourseCardProps {
    course: CourseDto;
}

export function CourseCard({ course }: CourseCardProps) {
    return (
        <Link href={`/courses/${course.slug}`}>
            <div className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="relative aspect-video">
                    <Image
                        src={course.image}
                        alt={course.name}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="p-3">
                    <h3 className="font-bold text-base mb-1 line-clamp-2">{course.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{course.categoryName}</p>
                    <div className="flex items-center gap-1 mb-1">
                        <span className="text-amber-700 font-bold">{course.rating.toFixed(1)}</span>
                        <div className="flex">
                            {Array(5).fill(0).map((_, i) => (
                                <Star
                                    key={i}
                                    size={14}
                                    className={i < Math.floor(course.rating) ? "text-amber-500 fill-amber-500" : "text-gray-300 fill-gray-300"}
                                />
                            ))}
                        </div>
                        <span className="text-xs text-gray-600">({course.totalStudent})</span>
                    </div>
                    <div className="font-bold">
                        {course.price.toLocaleString()}₫
                    </div>
                    {course.totalStudent > 1000 && (
                        <span className="inline-block bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 mt-1">
                            Bán chạy nhất
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}