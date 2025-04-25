"use client";

import { CourseDto } from "@/types/course";
import CourseCard from "@/components/courses/search-course/ui/CourseCard";
import Pagination from "@/components/courses/search-course/ui/Pagination";
import { useSearchParams, useRouter } from "next/navigation";
import { PaginatedResponse } from "@/types/api-response";
import { useEffect, useState, Suspense } from "react";

interface SearchResultsProps {
    coursesData: PaginatedResponse<CourseDto>;
}

// Loading component for Suspense fallback
function SearchResultsLoading({ coursesData }: { coursesData: PaginatedResponse<CourseDto> }) {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="text-lg">
                    <span className="font-semibold">{coursesData.totalElements || 0}</span> khóa học tìm thấy
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm">Đang tải...</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-lg p-4 h-80 animate-pulse"></div>
                ))}
            </div>
        </div>
    );
}

// Component that uses useSearchParams
function SearchResultsContent({ coursesData }: SearchResultsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1");

    // Track current sort selection
    const [currentSort, setCurrentSort] = useState("relevance");

    // Use pagination data from API response
    const { content: courses, totalPages, totalElements } = coursesData;

    // Initialize sort value from URL on component mount
    useEffect(() => {
        const sortBy = searchParams.get("sortBy") || "name";
        const sortDirection = searchParams.get("sortDirection") || "asc";

        // Determine the current sort option based on URL parameters
        if (sortBy === "name" && sortDirection === "asc") {
            setCurrentSort("relevance");
        } else if (sortBy === "createdDate" && sortDirection === "desc") {
            setCurrentSort("newest");
        } else if (sortBy === "rating" && sortDirection === "desc") {
            setCurrentSort("highest-rated");
        } else if (sortBy === "price" && sortDirection === "asc") {
            setCurrentSort("lowest-price");
        } else if (sortBy === "price" && sortDirection === "desc") {
            setCurrentSort("highest-price");
        }
    }, [searchParams]);

    const handlePageChange = (newPage: number) => {
        // Create a new URLSearchParams object from the current query parameters
        const params = new URLSearchParams(searchParams.toString());

        // Update the page parameter
        params.set("page", newPage.toString());

        // Navigate to the new URL
        router.push(`/courses/search?${params.toString()}`);
    };

    // Handle sort change
    const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        const params = new URLSearchParams(searchParams.toString());

        // Update sort parameters based on selection
        switch (value) {
            case "relevance":
                params.set("sortBy", "name");
                params.set("sortDirection", "asc");
                break;
            case "newest":
                params.set("sortBy", "createdDate");
                params.set("sortDirection", "desc");
                break;
            case "highest-rated":
                params.set("sortBy", "rating");
                params.set("sortDirection", "desc");
                break;
            case "lowest-price":
                params.set("sortBy", "price");
                params.set("sortDirection", "asc");
                break;
            case "highest-price":
                params.set("sortBy", "price");
                params.set("sortDirection", "desc");
                break;
        }

        // Reset to page 1 when changing sort
        params.set("page", "1");

        // Navigate to the new URL
        router.push(`/courses/search?${params.toString()}`);
    };

    return (
        <div>
            {/* Results count and filter */}
            <div className="flex justify-between items-center mb-6">
                <div className="text-lg">
                    <span className="font-semibold">{totalElements}</span> khóa học tìm thấy
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-sm">Sắp xếp theo:</span>
                    <select
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-black bg-white"
                        value={currentSort}
                        onChange={handleSortChange}
                    >
                        <option value="relevance">Liên quan nhất</option>
                        <option value="newest">Mới nhất</option>
                        <option value="highest-rated">Đánh giá cao nhất</option>
                        <option value="lowest-price">Giá thấp nhất</option>
                        <option value="highest-price">Giá cao nhất</option>
                    </select>
                </div>
            </div>

            {/* Grid display of courses */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-10">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
}

// Export wrapped in Suspense
const SearchResults = ({ coursesData }: SearchResultsProps) => {
    return (
        <Suspense fallback={<SearchResultsLoading coursesData={coursesData} />}>
            <SearchResultsContent coursesData={coursesData} />
        </Suspense>
    );
};

export default SearchResults;