'use client';

import apiClient from "@/lib/apiClient";
import { ApiResponse, PaginatedResponse } from "@/types/api-response";
import {
    CourseDetailsResponse,
    CourseDto,
    CourseRequest,
    CourseSearchRequest,
    CourseStatusCountDto,
} from "@/types/course";
import { CourseData, CourseLevel, CourseStatus } from "@/types/new-course";
import { AxiosResponse } from "axios";
import { UserDto } from "@/types/course";
import { uploadImage } from "./imageService";
import { CourseInstructorDto, CourseInstructorDtoRequest } from "@/types/instructor-course";

/** Helper to build Spring-style sort param */
const buildSort = (sortBy: string, sortDirection: 'asc' | 'desc') => `${sortBy},${sortDirection}`;

/* =========================
   PUBLISHED COURSE QUERIES
   ========================= */

// GET /api/v1/courses  (public search with pagination)
export async function getCoursesPaginated(
    page = 0,
    size = 5,
    sortBy = 'name',
    sortDirection: 'asc' | 'desc' = 'asc',
    categorySlug?: string,
    minRating = 0
): Promise<PaginatedResponse<CourseDto> | null> {
    try {
        const response: AxiosResponse = await apiClient.get('/courses', {
            params: {
                page,
                size,
                sort: buildSort(sortBy, sortDirection),
                categorySlug,
                minRating
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("getCoursesPaginated error:", error);
        return null;
    }
}

// GET /api/v1/courses/by-slug/{slug}
export async function getCourseBySlug(slug: string): Promise<CourseDetailsResponse | null> {
    try {
        const response: AxiosResponse = await apiClient.get(`/courses/by-slug/${slug}`);
        return response.data.data;
    } catch (error) {
        console.error(`getCourseBySlug error for slug ${slug}:`, error);
        return null;
    }
}

/** Existence check by trying details-by-slug (spec doesn't expose a dedicated /check) */
export async function existCourseBySlug(slug: string): Promise<boolean> {
    try {
        const res: AxiosResponse = await apiClient.get(`/courses/by-slug/${slug}`);
        return !!res?.data?.data?.id;
    } catch {
        return false;
    }
}

// GET /api/v1/courses (public search) — generic search wrapper
export async function searchCourses(
    search: CourseSearchRequest,
    page = 0,
    size = 10,
    sortBy = 'name',
    sortDirection: 'asc' | 'desc' = 'asc'
): Promise<PaginatedResponse<CourseDto> | null> {
    try {
        const response: AxiosResponse = await apiClient.get('/courses', {
            params: {
                ...search,
                page,
                size,
                sort: buildSort(sortBy, sortDirection)
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("searchCourses error:", error);
        return null;
    }
}

// GET /api/v1/courses/details (admin/staff)
export async function searchCoursesDetail(
    search: CourseSearchRequest,
    page = 0,
    size = 10,
    sortBy = 'name',
    sortDirection: 'asc' | 'desc' = 'asc'
): Promise<PaginatedResponse<CourseDetailsResponse> | null> {
    try {
        const response: AxiosResponse = await apiClient.get('/courses/details', {
            params: {
                ...search,
                page,
                size,
                sort: buildSort(sortBy, sortDirection)
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("searchCoursesDetail error:", error);
        return null;
    }
}

/* =========================
   COURSE CRUD
   ========================= */

// POST /api/v1/courses
export async function createCourse(course: CourseRequest): Promise<CourseDto | null> {
    try {
        const response: AxiosResponse = await apiClient.post('/courses', course);
        return response.data.data;
    } catch (error) {
        console.error("createCourse error:", error);
        return null;
    }
}

// PUT /api/v1/courses/by-id/{id}
export async function updateCourse(id: string, course: CourseRequest): Promise<CourseDto | null> {
    try {
        const response: AxiosResponse = await apiClient.put(`/courses/by-id/${id}`, course);
        return response.data.data;
    } catch (error) {
        console.error("updateCourse error:", error);
        return null;
    }
}

// DELETE /api/v1/courses/by-id/{id}
export async function deleteCourse(id: string): Promise<boolean> {
    try {
        await apiClient.delete(`/courses/by-id/${id}`);
        return true;
    } catch (error) {
        console.error("deleteCourse error:", error);
        return false;
    }
}

/* =========================
   LEARNING CONTEXT
   ========================= */

// GET /api/v1/courses/by-slug/{slug}/learning
export const getCourseLearning = async (slug: string): Promise<CourseDto | null> => {
    try {
        const response: AxiosResponse<ApiResponse<CourseDto>> = await apiClient.get(
            `/courses/by-slug/${slug}/learning`
        );
        return response.data.data;
    } catch (error) {
        console.error("getCourseLearning error:", error);
        return null;
    }
};

/* =========================
   LOOKUPS BY ID
   ========================= */

// GET /api/v1/courses/by-id/{id}  (basic CourseDto)
export const getCourseById = async (id: string): Promise<CourseDto | null> => {
    try {
        const response: AxiosResponse = await apiClient.get(`/courses/by-id/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching course by ID ${id}:`, error);
        return null;
    }
};

// GET /api/v1/courses/details/by-id/{id} (full details)
export const getCourseDetailsById = async (id: string): Promise<CourseDetailsResponse | null> => {
    try {
        const response: AxiosResponse = await apiClient.get(`/courses/details/by-id/${id}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching course details by ID ${id}:`, error);
        return null;
    }
};

// derive slug from /by-id/{id}
export const getCourseSlugById = async (id: string): Promise<string | null> => {
    try {
        const dto = await getCourseById(id);
        return dto?.slug ?? null;
    } catch (error) {
        console.error(`Error fetching course slug for ID ${id}:`, error);
        return null;
    }
};

// derive id from /by-slug/{slug}
export const getCourseIdBySlug = async (slug: string): Promise<string | null> => {
    try {
        const details = await getCourseBySlug(slug);
        return details?.id ?? null;
    } catch (error) {
        console.error('Error getting course ID by slug:', error);
        return null;
    }
};

/* =========================
   INSTRUCTOR HELPERS
   ========================= */

// Prefer getting owner instructor from details
export interface CourseWithInstructorDto extends CourseDto {
    instructorName?: string;
    instructorId?: string;
    instructorAvatar?: string;
}

export const getCourseWithInstructor = async (courseId: string): Promise<CourseWithInstructorDto | null> => {
    try {
        const courseBasicInfo = await getCourseById(courseId);
        if (!courseBasicInfo) return null;

        const courseDetailInfo = await getCourseDetailsById(courseId);
        if (courseDetailInfo) {
            return {
                ...courseBasicInfo,
                instructorName: courseDetailInfo.ownerInstructor?.fullName,
                instructorId: courseDetailInfo.ownerInstructor?.id,
                instructorAvatar: courseDetailInfo.ownerInstructor?.avatarUrl
            };
        }

        // Fallback (spec doesn’t list a dedicated instructors endpoint)
        return courseBasicInfo;
    } catch (error) {
        console.error(`Error fetching course with instructor for ID ${courseId}:`, error);
        return null;
    }
};

// Get instructors (via details since it includes instructors[])
export const getCourseInstructors = async (courseId: string): Promise<UserDto[] | null> => {
    try {
        const details = await getCourseDetailsById(courseId);
        return details?.instructors ?? [];
    } catch (error) {
        console.error(`Error fetching instructors for course ID ${courseId}:`, error);
        return null;
    }
};

/* =========================
   CREATE + UPLOAD
   ========================= */

export const uploadImageAndCreateCourse = async (courseData: CourseData): Promise<CourseDto | null> => {
    if (!courseData.thumbnail) return null;

    const uploadedImage = await uploadImage(courseData.thumbnail);
    if (!uploadedImage) return null;

    const courseRequest: CourseRequest = {
        name: courseData.title,
        description: courseData.description,
        slug: courseData.slug || courseData.slug,
        price: courseData.price,
        level: courseData.level as CourseLevel,
        language: courseData.language,
        categorySlug: courseData.category,
        image: uploadedImage.id,
        status: CourseStatus.DRAFT,
    };

    const createdCourse = await createCourse(courseRequest);
    return createdCourse;
};

/* =========================
   INSTRUCTOR OPERATIONS
   ========================= */

// GET /api/v1/courses/instructor/courses
export async function getInstructorCourses(
    page = 0,
    size = 10,
    sortBy = 'createdDate',
    sortDirection: 'asc' | 'desc' = 'desc'
): Promise<PaginatedResponse<CourseDto> | null> {
    try {
        const response: AxiosResponse = await apiClient.get('/courses/instructor/courses', {
            params: {
                page,
                size,
                sort: buildSort(sortBy, sortDirection)
            }
        });
        return response.data.data;
    } catch (error) {
        console.error("getInstructorCourses error:", error);
        return null;
    }
}

// (Unchanged - external service, not part of Course API v2.0)
export async function createInstructorCourse(course: CourseInstructorDtoRequest): Promise<CourseInstructorDto | null> {
    try {
        const response: AxiosResponse = await apiClient.post('/courseinstructor', course);
        return response.data.data;
    } catch (error) {
        console.error("createCourseInstructor error:", error);
        return null;
    }
}

/* =========================
   STATUS & WORKFLOW
   ========================= */

// POST /api/v1/courses/by-id/{id}/submit-for-review
export async function submitCourseForReview(courseId: string): Promise<boolean> {
    try {
        const response: AxiosResponse<ApiResponse<boolean>> = await apiClient.post(
            `/courses/by-id/${courseId}/submit-for-review`
        );
        return response.data.data;
    } catch (error) {
        console.error("Lỗi khi gửi khóa học đi duyệt:", error);
        return false;
    }
}

// PATCH /api/v1/courses/by-id/{id}/status
export async function updateStatusCourse(id: string, status: CourseStatus): Promise<boolean> {
    try {
        const response: AxiosResponse<ApiResponse<boolean>> = await apiClient.patch(
            `/courses/by-id/${id}/status`,
            { status }
        );
        // Some backends return {data:true}, others return updated object; normalize to boolean
        return !!response.data?.data || response.status === 200;
    } catch (error) {
        console.error("updateStatusCourse error:", error);
        return false;
    }
}

/* =========================
   STATS / COUNTS
   ========================= */

// TODO: Your spec doesn’t list a status-count endpoint. Keep if your backend exposes it.
// If not, remove or replace with an admin stats endpoint.
export async function getStatusCourse(): Promise<CourseStatusCountDto | null> {
    try {
        const response: AxiosResponse = await apiClient.get('/courses/statuscount');
        return response.data.data;
    } catch (error) {
        console.error("getCountStatus of course error:", error);
        return null;
    }
}
