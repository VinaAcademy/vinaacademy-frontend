import apiClient from '@/lib/apiClient';

export interface EnrollmentRequest {
    courseId: string;
    paymentMethodId?: string;
    couponCode?: string;
}

export interface EnrollmentResponse {
    id: number;
    userId: string;
    courseId: string;
    courseName: string;
    courseImage?: string;
    courseSlug?: string;
    startAt: string;
    completedAt?: string;
    progressPercentage: number;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';
    enrollmentDate: string;
    lastAccessedAt?: string;
    instructor?: string;
    instructorName?: string;
    completedLessons?: number;
    totalLessons?: number;
    category?: string;
}

/**
 * Enrolls a user in a course
 * @param enrollmentData The enrollment request data
 * @returns A promise with the enrollment response
 */
export const enrollInCourse = async (enrollmentData: EnrollmentRequest): Promise<EnrollmentResponse> => {
    try {
        const response = await apiClient.post('/enrollments', enrollmentData);
        return response.data.data;
    } catch (error) {
        console.error('Error enrolling in course:', error);
        throw error;
    }
};

/**
 * Checks if the current user is enrolled in a course
 * @param courseId The course ID to check
 * @returns A promise with a boolean indicating if the user is enrolled
 */
export const checkEnrollment = async (courseId: string): Promise<boolean> => {
    try {
        const response = await apiClient.get(`/enrollments/check?courseId=${courseId}`);
        return response.data.data;
    } catch (error) {
        console.error('Error checking enrollment:', error);
        return false;
    }
};

/**
 * Gets all enrollments for the current user
 * @param page The page number
 * @param size The page size
 * @param status Optional status filter
 * @returns A promise with the paginated enrollment responses
 */
export const getUserEnrollments = async (
    page = 0,
    size = 10,
    status?: 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED'
) => {
    try {
        const url = status
            ? `/enrollments?page=${page}&size=${size}&status=${status}`
            : `/enrollments?page=${page}&size=${size}`;

        const response = await apiClient.get(url);

        // Thêm dữ liệu slug vào mỗi enrollment nếu chưa có
        const data = response.data.data;
        return data;
    } catch (error) {
        console.error('Error getting user enrollments:', error);
        throw error;
    }
};

/**
 * Cancels a course enrollment
 * @param enrollmentId The enrollment ID to cancel
 * @returns A promise that resolves when the enrollment is cancelled
 */
export const cancelEnrollment = async (enrollmentId: number): Promise<void> => {
    try {
        await apiClient.delete(`/enrollments/${enrollmentId}`);
    } catch (error) {
        console.error('Error cancelling enrollment:', error);
        throw error;
    }
};

/**
 * Lấy thông tin chi tiết về một enrollment
 * @param enrollmentId ID của enrollment
 * @returns Chi tiết về enrollment và thông tin khóa học
 */
export const getEnrollmentDetail = async (enrollmentId: number): Promise<EnrollmentResponse> => {
    try {
        const response = await apiClient.get(`/enrollments/${enrollmentId}`);
        return response.data.data;
    } catch (error) {
        console.error('Error getting enrollment detail:', error);
        throw error;
    }
};