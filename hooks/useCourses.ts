import { useQuery } from "@tanstack/react-query";
import { CourseDto, CourseSearchRequest } from "@/types/course";
import { searchCourses } from "@/services/courseService";

interface UseCoursesProps {
  keyword?: string;
  categorySlug?: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  language?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  status?: "PUBLISHED" | "PENDING" | "DRAFT" | "REJECTED";
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export const useCourses = ({
  keyword,
  categorySlug,
  level,
  language,
  minPrice,
  maxPrice,
  minRating,
  status = "PUBLISHED", // Default: only published courses
  page = 0,
  size = 8,
  sortBy = "createdDate",
  sortDirection = "desc",
}: UseCoursesProps = {}) => {
  const searchRequest: CourseSearchRequest = {
    keyword,
    categorySlug,
    level,
    language,
    minPrice,
    maxPrice,
    minRating,
    status,
  };

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: [
      'courses',
      keyword,
      categorySlug,
      level,
      language,
      minPrice,
      maxPrice,
      minRating,
      status,
      page,
      size,
      sortBy,
      sortDirection
    ],
    queryFn: () => searchCourses(
      searchRequest,
      page,
      size,
      sortBy,
      sortDirection
    ),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    courses: data?.content || [],
    loading: isLoading,
    error: isError ? (error instanceof Error ? error.message : "Đã xảy ra lỗi khi tải dữ liệu khóa học.") : null,
    totalItems: data?.totalElements || 0,
    totalPages: data?.totalPages || 0,
    refetch
  };
};
