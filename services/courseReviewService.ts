import apiClient from '@/lib/apiClient';
import { checkEnrollment } from './enrollmentService';

export interface CourseReviewRequest {
    courseId: string;
    rating: number;
    review: string;
}

export interface CourseReviewResponse {
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

export interface ReviewStatistics {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: Record<number, number>;
}

/**
 * Tạo đánh giá mới hoặc cập nhật đánh giá hiện có
 * @param reviewData Dữ liệu đánh giá
 * @returns Thông tin đánh giá đã lưu
 */
export const createOrUpdateReview = async (reviewData: CourseReviewRequest): Promise<CourseReviewResponse> => {
    try {
        const response = await apiClient.post('/course-reviews', reviewData);
        return response.data.data;
    } catch (error) {
        console.error('Error creating/updating review:', error);
        throw error;
    }
};

/**
 * Lấy đánh giá của người dùng hiện tại cho khóa học
 * @param courseId ID khóa học
 * @returns Thông tin đánh giá hoặc null nếu chưa có
 */
export const getUserReviewForCourse = async (courseId: string): Promise<CourseReviewResponse | null> => {
    try {
        const response = await apiClient.get(`/course-reviews/user/course/${courseId}`);
        return response.data.data;
    } catch (error) {
        console.error('Error getting user review:', error);
        return null;
    }
};

/**
 * Lấy danh sách đánh giá của khóa học
 * @param courseId ID khóa học
 * @param page Số trang (bắt đầu từ 0)
 * @param size Số lượng đánh giá mỗi trang
 * @returns Danh sách đánh giá theo trang
 */
export const getCourseReviews = async (courseId: string, page = 0, size = 3) => {
    try {
        const response = await apiClient.get(`/course-reviews/course/${courseId}?page=${page}&size=${size}`);
        return response.data.data;
    } catch (error) {
        console.error('Error getting course reviews:', error);
        throw error;
    }
};

/**
 * Lấy thống kê đánh giá của khóa học
 * @param courseId ID khóa học
 * @returns Thống kê đánh giá
 */
export const getCourseReviewStatistics = async (courseId: string): Promise<ReviewStatistics | null> => {
    try {
        const response = await apiClient.get(`/course-reviews/statistics/course/${courseId}`);
        return response.data.data;
    } catch (error) {
        console.error('Error getting review statistics:', error);
        return null;
    }
};

/**
 * Kiểm tra người dùng đã đánh giá khóa học chưa
 * @param courseId ID khóa học
 * @returns true nếu đã đánh giá, false nếu chưa
 */
export const hasUserReviewedCourse = async (courseId: string): Promise<boolean> => {
    try {
        const response = await apiClient.get(`/course-reviews/check/course/${courseId}`);
        return response.data;
    } catch (error) {
        console.error('Error checking if user reviewed course:', error);
        return false;
    }
};

/**
 * Xóa đánh giá
 * @param reviewId ID đánh giá cần xóa
 * @returns true nếu xóa thành công
 */
export const deleteReview = async (reviewId: number): Promise<boolean> => {
    try {
        await apiClient.delete(`/course-reviews/${reviewId}`);
        return true;
    } catch (error) {
        console.error('Error deleting review:', error);
        return false;
    }
};

/**
 * Kiểm tra xem người dùng có quyền đánh giá khóa học không
 * @param courseId ID khóa học
 * @returns true nếu có quyền đánh giá
 */
export const canUserReviewCourse = async (courseId: string): Promise<boolean> => {
    try {
        // Kiểm tra người dùng đã đăng ký khóa học chưa
        const isEnrolled = await checkEnrollment(courseId);
        if (!isEnrolled) return false;

        // Kiểm tra người dùng đã đánh giá khóa học chưa
        const hasReviewed = await hasUserReviewedCourse(courseId);
        if (hasReviewed) return true; // Chỉ có thể đánh giá nếu chưa đánh giá trước đó

        return false; // Người dùng có thể đánh giá khóa học
    } catch (error) {
        console.error('Error checking if user can review course:', error);
        return false;
    }
};