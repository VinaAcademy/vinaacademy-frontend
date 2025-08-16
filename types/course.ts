import { BaseDto } from "./api-response";
import { EnrollmentProgressDto, LessonProgress } from "./learning";
import { VideoStatus } from "./video";
export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type CourseStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
export type LessonType = 'VIDEO' | 'READING' | 'QUIZ';

export interface CourseStatusCountDto {
    totalPublished: number;
    totalPending: number;
    totalRejected: number;
}

/**
 * Backend PATCH /api/v1/courses/by-id/{id}/status
 * Path carries the ID, body carries only the status.
 */
export interface CourseStatusRequest {
    status: CourseStatus;
}

export interface CourseDto extends BaseDto {
    id: string;               // UUID as string
    image: string;
    name: string;
    description: string;
    slug: string;
    price: number;
    level: CourseLevel;
    status: CourseStatus;
    language: string;
    categoryName: string;
    rating: number;
    totalRating: number;
    totalStudent: number;
    totalSection: number;
    totalLesson: number;
    sections?: SectionDto[];                 // only in some contexts
    progress?: EnrollmentProgressDto;        // only for current user
}

export interface Role {
    id: number;
    name: string;
    code: string;
}

export interface UserDto extends BaseDto {
    id: string;
    fullName: string;
    email: string;
    username: string;
    phone?: string;
    avatarUrl?: string;
    description?: string;
    isCollaborator: boolean;
    birthday?: string;
    roles: Role[];
    isActive: boolean;
}

export interface LessonDto extends BaseDto {
    id: string;
    title: string;
    type: LessonType;
    free: boolean;
    orderIndex: number;
    sectionId: string;
    sectionTitle: string;
    authorId: string;
    authorName: string;
    courseId: string;
    courseName: string;

    // current user
    currentUserProgress?: LessonProgress;

    // video
    thumbnailUrl?: string;
    status?: VideoStatus;
    videoUrl?: string;
    videoDuration?: number;

    // reading
    content?: string;

    // quiz
    passPoint?: number;
    totalPoint?: number;
    duration?: number;
}

export interface SectionDto {
    id: string;
    title: string;
    orderIndex: number;
    lessonCount: number;
    courseId: string;
    courseName: string;
    lessons?: LessonDto[];
}

export interface CourseReviewDto {
    id: number;
    courseId: string;
    courseName: string;
    rating: number;
    review: string;
    userId: string;
    userFullName: string;
    createdDate: string;
    updatedDate: string;
}

/**
 * Backend CourseDetailsResponse merges CourseDto fields + extras.
 * Note: backend includes categorySlug explicitly.
 */
export interface CourseDetailsResponse extends BaseDto {
    id: string;
    image: string;
    name: string;
    description: string;
    slug: string;
    price: number;
    level: CourseLevel;
    status: CourseStatus;
    language: string;
    categorySlug: string;      // ensure present
    categoryName: string;
    rating: number;
    totalRating: number;
    totalStudent: number;
    totalSection: number;
    totalLesson: number;

    instructors: UserDto[];
    ownerInstructor: UserDto;
    sections: SectionDto[];
    reviews: CourseReviewDto[];
}

/**
 * Split create vs update to match backend rules.
 * - Create: required fields per spec
 * - Update: partial, same shape but all optional
 */
export interface CreateCourseRequest {
    name: string;               // required
    description?: string;
    slug?: string;              // auto-generated if omitted
    price: number;              // required
    level: CourseLevel;         // required
    language: string;           // required
    categorySlug: string;       // required
    image?: string;
    status?: CourseStatus;      // admin/staff only
}

export interface UpdateCourseRequest {
    name?: string;
    description?: string;
    slug?: string;
    price?: number;
    level?: CourseLevel;
    language?: string;
    categorySlug?: string;
    image?: string;
    status?: CourseStatus;      // admin/staff only
}

/**
 * If you prefer a single type:
 * export type CourseRequest = CreateCourseRequest | UpdateCourseRequest;
 * But keeping both makes intent clearer.
 */
export type CourseRequest = CreateCourseRequest | UpdateCourseRequest;

export interface CourseSearchRequest {
    keyword?: string;
    categorySlug?: string;
    instructorId?: string;      // added to match backend filter
    level?: CourseLevel;
    language?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    status?: CourseStatus;      // admin/staff-only use
}
