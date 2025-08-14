'use client';
import React, { useState, useEffect, use } from 'react';
import dynamic from 'next/dynamic';
import { Star, Edit2, Trash2, Plus } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CourseReviewDto } from '@/types/course';
import { toast } from 'react-toastify';
import {
    createOrUpdateReview,
    getUserReviewForCourse,
    getCourseReviews,
    getCourseReviewStatistics,
    hasUserReviewedCourse,
    deleteReview,
    canUserReviewCourse,
    ReviewStatistics
} from '@/services/courseReviewService';
import { checkEnrollment } from '@/services/enrollmentService';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Lazy load components that aren't needed on initial render
const Dialog = dynamic(() => import("@/components/ui/dialog").then(mod => mod.Dialog));
const DialogContent = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogContent));
const DialogHeader = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogHeader));
const DialogTitle = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogTitle));
const DialogFooter = dynamic(() => import("@/components/ui/dialog").then(mod => mod.DialogFooter));

// Lazy load spinner with a simple fallback
const BeautifulSpinner = dynamic(
    () => import('@/components/ui/spinner'),
    { ssr: false, loading: () => <div className="flex justify-center p-8">Loading...</div> }
);

interface ReviewsAreaProps {
    courseId: string;
    currentUserId?: string;
    mainPage?: boolean;
}

const ReviewsArea: React.FC<ReviewsAreaProps> = ({
    courseId,
    mainPage = false,
    currentUserId = '1',
}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [allReviews, setAllReviews] = useState<CourseReviewDto[]>([]);
    const [displayedReviews, setDisplayedReviews] = useState<CourseReviewDto[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<CourseReviewDto | null>(null);
    const [newReview, setNewReview] = useState({
        rating: 5,
        review: '',
    });
    const [canReview, setCanReview] = useState(false);
    const [ratingDistribution, setRatingDistribution] = useState({
        counts: [0, 0, 0, 0, 0], // 5, 4, 3, 2, 1 stars
        percentages: [0, 0, 0, 0, 0]
    });

    // Pagination settings
    const reviewsPerPage = 3;
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreReviews, setHasMoreReviews] = useState(false);
    const [totalPages, setTotalPages] = useState(1);

    const { isAuthenticated } = useAuth();

    // Kiểm tra khả năng đánh giá của người dùng
    // Thêm vào useEffect kiểm tra canReview
    useEffect(() => {
        const checkReviewEligibility = async () => {
            console.log("Checking review eligibility, currentUserId:", currentUserId);

            if (!currentUserId) {
                setCanReview(false);
                return;
            }

            // check enrollment status
            try {
                // Kiểm tra khả năng đánh giá
                const canReview = await canUserReviewCourse(courseId);
                console.log("Can user review course:", canReview);

                setCanReview(canReview);
            } catch (error) {
                console.error('Error checking enrollment:', error);
                setCanReview(false);
            }
        };

        if (isAuthenticated) {
            checkReviewEligibility();
        } else {
            setCanReview(false); // Nếu không đăng nhập, không cho phép đánh giá
        }
    }, [courseId, currentUserId, isAuthenticated]);

    // Load reviews data
    useEffect(() => {
        // Use an immediately-invoked async function to avoid "top-level await"
        (async () => {
            if (!isLoading) return; // Prevent duplicate loading
            if (!courseId) return; // Ensure courseId is valid

            try {
                // Lấy thống kê đánh giá
                const reviewStats = await getCourseReviewStatistics(courseId);

                if (reviewStats) {
                    setAverageRating(reviewStats.averageRating);
                    setTotalReviews(reviewStats.totalReviews);

                    // Chuyển đổi dữ liệu phân phối đánh giá từ API
                    const counts = [
                        reviewStats.ratingDistribution[5] || 0,
                        reviewStats.ratingDistribution[4] || 0,
                        reviewStats.ratingDistribution[3] || 0,
                        reviewStats.ratingDistribution[2] || 0,
                        reviewStats.ratingDistribution[1] || 0
                    ];

                    const percentages = counts.map(count =>
                        reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0
                    );

                    setRatingDistribution({ counts, percentages });

                    // Tính tổng số trang
                    setTotalPages(Math.ceil(reviewStats.totalReviews / reviewsPerPage));
                }

                // Lấy danh sách đánh giá trang đầu tiên
                const reviewsPage = await getCourseReviews(courseId, 0, reviewsPerPage);

                if (reviewsPage && reviewsPage.content) {
                    // Cập nhật danh sách đánh giá
                    setAllReviews(reviewsPage.content);
                    setDisplayedReviews(reviewsPage.content);

                    // Cập nhật thông tin phân trang
                    setHasMoreReviews(reviewsPage.totalPages > 1);
                    setTotalPages(reviewsPage.totalPages);
                }

                if (!isAuthenticated) {
                    setCanReview(false); // Nếu không đăng nhập, không cho phép đánh giá
                    return;
                }
                // Lấy đánh giá của người dùng hiện tại nếu đã đánh giá
                const hasReviewed = await hasUserReviewedCourse(courseId);
                if (hasReviewed) {
                    const userReview: CourseReviewDto | null = await getUserReviewForCourse(courseId);
                    if (userReview) {
                        // Đánh dấu review của người dùng
                        setAllReviews(prev => {
                            // Nếu danh sách rỗng, tạo mới với review của user
                            if (prev.length === 0) return [userReview];

                            // Nếu đã có trong danh sách, cập nhật
                            const exists = prev.some(r => r.id === userReview.id);
                            if (exists) {
                                return prev.map(r => r.id === userReview.id ? userReview : r);
                            } else {
                                return [userReview, ...prev];
                            }
                        });
                    }
                }

            } catch (error) {
                console.error('Error loading reviews:', error);
            } finally {
                setIsLoading(false);
            }
        })();
    }, [courseId, currentUserId, isLoading, isAuthenticated, reviewsPerPage]);

    // Update displayed reviews when loading more pages
    useEffect(() => {
        const fetchPageData = async () => {
            if (currentPage === 1) {
                // Trang đầu tiên đã được tải trong useEffect trước
                return;
            }

            try {
                // Tải trang mới từ API
                const reviewsPage = await getCourseReviews(courseId, currentPage - 1, reviewsPerPage);

                if (reviewsPage && reviewsPage.content) {
                    // Cập nhật danh sách hiển thị
                    setDisplayedReviews(prev => [...prev, ...reviewsPage.content]);

                    // Cập nhật trạng thái "có thêm đánh giá"
                    setHasMoreReviews(currentPage < reviewsPage.totalPages);
                }
            } catch (error) {
                console.error('Error loading more reviews:', error);
            }
        };

        if (currentPage > 1) {
            fetchPageData();
        }
    }, [currentPage, courseId, reviewsPerPage]);

    // Handle load more reviews
    const handleLoadMoreReviews = () => {
        setCurrentPage(prev => prev + 1);
    };

    // Format date - memoize this function for better performance
    const formatDate = React.useCallback((dateString: string) => {
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('vi-VN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        } catch (error) {
            return dateString;
        }
    }, []);

    // Add or update review
    const handleSaveReview = async () => {
        setIsSaving(true);
        try {
            const reviewData = {
                courseId: courseId,
                rating: newReview.rating,
                review: newReview.review
            };

            // Gọi API để tạo/cập nhật đánh giá
            const savedReview = await createOrUpdateReview(reviewData);

            // Cập nhật UI dựa trên kết quả
            if (editingReview) {
                // Cập nhật đánh giá trong danh sách
                setAllReviews(prev =>
                    prev.map(review =>
                        review.id === editingReview.id ? savedReview : review
                    )
                );
                setDisplayedReviews(prev =>
                    prev.map(review =>
                        review.id === editingReview.id ? savedReview : review
                    )
                );
                toast.success('Đánh giá đã được cập nhật');
            } else {
                // Thêm đánh giá mới vào đầu danh sách
                setAllReviews(prev => [savedReview, ...prev]);
                setDisplayedReviews(prev => [savedReview, ...prev]);
                setCanReview(false);
                toast.success('Đánh giá đã được đăng');
            }

            // Cập nhật thống kê sau khi đánh giá
            const newStats = await getCourseReviewStatistics(courseId);
            if (newStats) {
                setAverageRating(newStats.averageRating);
                setTotalReviews(newStats.totalReviews);

                // Cập nhật phân phối đánh giá
                const counts = [
                    newStats.ratingDistribution[5] || 0,
                    newStats.ratingDistribution[4] || 0,
                    newStats.ratingDistribution[3] || 0,
                    newStats.ratingDistribution[2] || 0,
                    newStats.ratingDistribution[1] || 0
                ];

                const percentages = counts.map(count =>
                    newStats.totalReviews > 0 ? (count / newStats.totalReviews) * 100 : 0
                );

                setRatingDistribution({ counts, percentages });
            }

            // Đóng dialog và reset form
            setEditingReview(null);
            setNewReview({ rating: 5, review: '' });
            setDialogOpen(false);
        } catch (error) {
            console.error('Error saving review:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Delete review
    const handleDeleteReview = async (id: number) => {
        if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
            return;
        }

        setIsDeleting(id);
        try {
            // Gọi API để xóa đánh giá
            const success = await deleteReview(id);

            if (success) {
                // Cập nhật UI sau khi xóa
                setAllReviews(prev => prev.filter(review => review.id !== id));
                setDisplayedReviews(prev => prev.filter(review => review.id !== id));

                // Cập nhật thống kê sau khi xóa
                const newStats = await getCourseReviewStatistics(courseId);
                if (newStats) {
                    setAverageRating(newStats.averageRating);
                    setTotalReviews(newStats.totalReviews);

                    // Cập nhật phân phối đánh giá
                    const counts = [
                        newStats.ratingDistribution[5] || 0,
                        newStats.ratingDistribution[4] || 0,
                        newStats.ratingDistribution[3] || 0,
                        newStats.ratingDistribution[2] || 0,
                        newStats.ratingDistribution[1] || 0
                    ];

                    const percentages = counts.map(count =>
                        newStats.totalReviews > 0 ? (count / newStats.totalReviews) * 100 : 0
                    );

                    setRatingDistribution({ counts, percentages });
                }

                // Sau khi xóa, người dùng có thể đánh giá lại
                setCanReview(true);

                toast.success('Đánh giá đã được xóa');
            } else {
                toast.error('Không thể xóa đánh giá');
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        } finally {
            setIsDeleting(null);
        }
    };

    // Start editing a review
    const handleEditReview = (review: CourseReviewDto) => {
        setEditingReview(review);
        setNewReview({
            rating: review.rating,
            review: review.review
        });
        setDialogOpen(true);
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="p-6 flex justify-center items-center h-64">
                <BeautifulSpinner name='Đang tải đánh giá...' />
            </div>
        );
    }

    // Pre-render star icons for reuse
    const renderStarRating = (rating: number, size: number = 20) => (
        <div className="flex text-[#f69c08]">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    size={size}
                    fill={i < rating ? "#f69c08" : "none"}
                    className={i < rating ? "" : "opacity-50"}
                />
            ))}
        </div>
    );

    // Only render dialog when open to improve performance
    const renderDialog = dialogOpen && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{editingReview ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Đánh giá của bạn</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setNewReview({ ...newReview, rating: star })}
                                    className="text-2xl"
                                    aria-label={`Đánh giá ${star} sao`}
                                >
                                    <Star
                                        size={24}
                                        className="text-[#f69c08]"
                                        fill={star <= newReview.rating ? "#f69c08" : "none"}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="review-comment"
                            className="block text-sm font-medium mb-1"
                        >
                            Nhận xét của bạn
                        </label>
                        <Textarea
                            id="review-comment"
                            value={newReview.review}
                            onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                            placeholder="Chia sẻ trải nghiệm học tập của bạn..."
                            rows={4}
                            className="w-full"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        disabled={isSaving}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleSaveReview}
                        disabled={newReview.review.trim() === '' || isSaving}
                    >
                        {isSaving ? (
                            <span className="flex items-center gap-2">
                                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                {editingReview ? 'Đang cập nhật...' : 'Đang đăng...'}
                            </span>
                        ) : (
                            editingReview ? 'Cập nhật' : 'Đăng'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
    return (
        <div className={`${mainPage ? 'p-0' : 'p-6'}`}>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Đánh giá từ học viên</h2>

                {canReview && (
                    <Button
                        onClick={() => {
                            setEditingReview(null);
                            setNewReview({ rating: 5, review: '' });
                            setDialogOpen(true);
                        }}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Plus size={16} />
                        Viết đánh giá
                    </Button>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Rating summary */}
                <div className="md:w-1/3">
                    <div className="flex flex-col items-center">
                        <div className="text-5xl font-bold text-[#b4690e]" aria-label={`Đánh giá trung bình ${averageRating.toFixed(1)} trên 5 sao`}>
                            {averageRating.toFixed(1)}
                        </div>
                        <div className="flex text-[#f69c08] my-2" aria-hidden="true">
                            {renderStarRating(Math.floor(averageRating))}
                        </div>
                        <div className="text-sm text-gray-600">{totalReviews} đánh giá</div>
                    </div>

                    {/* Rating breakdown */}
                    <div className="mt-6 space-y-2" aria-label="Phân bố đánh giá">
                        {[5, 4, 3, 2, 1].map((stars, index) => (
                            <div key={stars} className="flex items-center gap-2">
                                <div className="w-8 text-sm text-right">{stars}</div>
                                <Star size={14} className="text-[#f69c08]" fill="#f69c08" aria-hidden="true" />
                                <Progress
                                    value={ratingDistribution.percentages[index]}
                                    className="h-2 flex-1"
                                    aria-label={`${stars} sao: ${Math.round(ratingDistribution.percentages[index])}%`}
                                />
                                <span className="text-xs text-gray-600 w-10">
                                    {ratingDistribution.counts[index]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reviews list */}
                <div className="md:w-2/3 space-y-6">
                    <h3 className="sr-only">Danh sách đánh giá</h3>
                    {displayedReviews.length > 0 ? (
                        <>
                            {displayedReviews.map((review) => (
                                <article key={review.id} className="border-b pb-6 last:border-b-0">
                                    <header className="flex items-center gap-4 mb-2">
                                        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200"
                                            onClick={() => {
                                                router.push(`/user/${review.userId}`);
                                            }}>
                                            {/* Using first letter of name as avatar placeholder */}
                                            <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-xl font-bold">
                                                {review.userFullName?.charAt(0) || '?'}
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium"
                                                onClick={() => {
                                                    router.push(`/user/${review.userId}`);
                                                }}>
                                                {review.userFullName || 'Người dùng ẩn danh'} {review.userId === currentUserId ? "(Bạn)" : ""}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex text-[#f69c08]" aria-label={`Đánh giá ${review.rating} sao`}>
                                                    {renderStarRating(review.rating, 14)}
                                                </div>
                                                <time className="text-xs text-gray-600" dateTime={review.updatedDate || review.createdDate}>
                                                    {formatDate(review.updatedDate || review.createdDate)}
                                                </time>
                                            </div>
                                        </div>

                                        {/* Review actions (only show for current user) */}
                                        {isAuthenticated && review.userId === currentUserId && !mainPage && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditReview(review)}
                                                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                                    aria-label="Chỉnh sửa đánh giá"
                                                    disabled={isDeleting === review.id}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                                    aria-label="Xóa đánh giá"
                                                    disabled={isDeleting === review.id}
                                                >
                                                    {isDeleting === review.id ? (
                                                        <div className="h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </header>
                                    <p className="text-gray-700">{review.review}</p>
                                </article>
                            ))}

                            {/* Load more button */}
                            {hasMoreReviews && (
                                <div className="text-center pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={handleLoadMoreReviews}
                                        className="w-full md:w-auto"
                                    >
                                        Xem thêm đánh giá
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
                        </div>
                    )}
                </div>
            </div>

            {/* Only render dialog when open */}
            {isAuthenticated && renderDialog}
        </div>
    );
};

export default ReviewsArea;