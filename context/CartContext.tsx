'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import * as cartService from '@/services/cartService';
import { CartDto, CartItemDto, CartItemRequest } from '@/services/cartService';
import { getCourseWithInstructor } from '@/services/courseService';

// Interface cho data hiển thị
export interface CartItemDisplay {
    id: number;
    courseId: string;
    price: number;
    originalPrice: number;
    name: string;
    instructor: string;
    rating: number;
    totalStudents: number;
    totalHours: number;
    lectures: number;
    level: string;
    image: string;
    addedAt: string;
}

interface CartContextType {
    cartItems: CartItemDisplay[];
    isLoading: boolean;
    error: Error | null;
    addToCart: (cartItemRequest: { courseId: string, price: number }) => Promise<boolean>;
    removeFromCart: (itemId: number) => Promise<boolean>;
    updateCartItem: (itemId: number, courseId: string, price: number) => Promise<boolean>;
    applyCoupon: (couponId: string) => Promise<boolean>;
    clearCart: () => void;
    refreshCart: () => Promise<void>;
    totalPrice: number;
    totalOriginalPrice: number;
    cartId: number | null;
}

const CartContext = createContext<CartContextType>({
    cartItems: [],
    isLoading: false,
    error: null,
    addToCart: async () => false,
    removeFromCart: async () => false,
    updateCartItem: async () => false,
    applyCoupon: async () => false,
    clearCart: () => { },
    refreshCart: async () => { },
    totalPrice: 0,
    totalOriginalPrice: 0,
    cartId: null
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItemDisplay[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [cartId, setCartId] = useState<number | null>(null);
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();

    // Use these refs to strictly control API calls
    const isInitializedRef = useRef(false);
    const isRefreshingRef = useRef(false);
    const apiCallInProgressRef = useRef(false);

    // Thêm ref để theo dõi lần chạy cuối
    const lastUserIdRef = useRef<string | null>(null);

    // Tính tổng giá tiền
    const totalPrice = cartItems.reduce((sum, item) => sum + Number(item.price), 0);
    const totalOriginalPrice = cartItems.reduce((sum, item) => sum + Number(item.originalPrice), 0);
    // Hàm chuyển đổi từ CartItemDto và CourseDto sang CartItemDisplay
    const enrichCartItem = async (item: CartItemDto): Promise<CartItemDisplay | null> => {
        try {
            // Sử dụng service để lấy thông tin khóa học kèm instructor
            const courseData = await getCourseWithInstructor(item.courseId);
            if (!courseData) return null;

            // Chuyển đổi dữ liệu
            return {
                id: item.id,
                courseId: item.courseId,
                price: item.price,
                originalPrice: courseData.price * 1.5, // Giả sử giá gốc cao hơn giá hiện tại
                name: courseData.name,
                instructor: courseData.instructorName || 'Chưa có thông tin',
                rating: courseData.rating || 0,
                totalStudents: courseData.totalStudent || 0,
                totalHours: calculateTotalHours(courseData),
                lectures: courseData.totalLesson || 0,
                level: getCourseLevel(courseData.level),
                image: courseData.image || '/images/course-placeholder.jpg', //Chưa xử lý ảnh http và uuid
                addedAt: item.addedAt
            };
        } catch (error) {
            console.error('Error enriching cart item:', error);
            return null;
        }
    };

    // Hàm tính tổng số giờ của khóa học dựa trên thông tin bài học
    const calculateTotalHours = (course: any): number => {
        // Nếu không có thông tin chi tiết về sections và lessons
        // Trả về giá trị ước tính
        if (!course.sections || course.sections.length === 0) {
            return course.totalLesson * 0.25; // Ước tính mỗi bài học 15 phút
        }

        // Tính tổng thời lượng từ các bài học video
        let totalSeconds = 0;
        course.sections.forEach((section: any) => {
            if (section.lessons) {
                section.lessons.forEach((lesson: any) => {
                    if (lesson.videoDuration) {
                        totalSeconds += lesson.videoDuration;
                    } else {
                        totalSeconds += lesson.duration || 3;
                    }
                });
            }
        });

        // Chuyển đổi từ giây sang giờ
        return totalSeconds / 3600;
    };

    // Hàm chuyển đổi CourseLevel sang chuỗi tiếng Việt
    const getCourseLevel = (level?: string): string => {
        if (!level) return 'Cơ bản';

        switch (level) {
            case 'BEGINNER':
                return 'Cơ bản';
            case 'INTERMEDIATE':
                return 'Trung cấp';
            case 'ADVANCED':
                return 'Nâng cao';
            default:
                return 'Cơ bản';
        }
    };

    // Lấy thông tin giỏ hàng
    const fetchCart = async (forceRefresh = false) => {
        // Kiểm tra xem có đang gọi API không và có cần thiết phải gọi không
        if (apiCallInProgressRef.current && !forceRefresh) {
            return;
        }

        // Kiểm tra điều kiện
        if (!isAuthenticated || !user || !user.id) {
            setCartItems([]);
            setCartId(null);
            return;
        }

        // Kiểm tra nếu đã khởi tạo và userId không thay đổi, và không phải force refresh
        if (isInitializedRef.current && user.id === lastUserIdRef.current && !forceRefresh) {
            return;
        }

        // Đánh dấu đang gọi API
        apiCallInProgressRef.current = true;
        setIsLoading(true);
        setError(null);

        try {
            // Thêm timeout để tránh chờ đợi quá lâu
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const cartData = await cartService.getCart(user.id);
            clearTimeout(timeoutId);

            if (!cartData) {
                // Nếu không có giỏ hàng, tạo mới
                // try {
                //     const newCart = await cartService.createCart(user.id);
                //     if (newCart) {
                //         setCartId(newCart.id);
                //     }
                // } catch (createError) {
                //     console.error('Error creating cart:', createError);
                // }
                // setCartItems([]);
                // // Lưu lại userId hiện tại và đánh dấu đã khởi tạo
                // lastUserIdRef.current = user.id;
                // isInitializedRef.current = true;
                console.error('No cart data found! Check again when create new account');
                return;
            }

            setCartId(cartData.id);

            // Lấy thông tin chi tiết cho từng mục trong giỏ hàng
            if (cartData.cartItems && cartData.cartItems.length > 0) {
                const enrichedItems: CartItemDisplay[] = [];

                // Xử lý tuần tự để tránh quá nhiều request đồng thời
                for (const item of cartData.cartItems) {
                    try {
                        const enrichedItem = await enrichCartItem(item);
                        if (enrichedItem) {
                            enrichedItems.push(enrichedItem);
                        }
                    } catch (itemError) {
                        console.error(`Error processing item ${item.id}:`, itemError);
                    }
                }

                setCartItems(enrichedItems);
            } else {
                setCartItems([]);
            }

            // Lưu lại userId hiện tại và đánh dấu đã khởi tạo
            lastUserIdRef.current = user.id;
            isInitializedRef.current = true;
        } catch (err) {
            console.error('Error fetching cart:', err);
            setError(err instanceof Error ? err : new Error('Lỗi khi tải giỏ hàng'));

            // Hiển thị toast khi có lỗi
            toast({
                title: 'Không thể tải giỏ hàng',
                description: 'Vui lòng thử lại sau.',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
            apiCallInProgressRef.current = false;
        }
    };

    // Initial load - strict control to prevent multiple calls
    useEffect(() => {
        if (isAuthenticated && user && !apiCallInProgressRef.current) {
            // Kiểm tra nếu userId đã thay đổi hoặc chưa khởi tạo
            if (!isInitializedRef.current || user.id !== lastUserIdRef.current) {
                fetchCart();
            }
        } else if (!isAuthenticated) {
            // Reset state when logged out
            setCartItems([]);
            setCartId(null);
            isInitializedRef.current = false;
            lastUserIdRef.current = null;
        }

        // Cleanup function to cancel any pending operations when unmounting
        return () => {
            // Không reset apiCallInProgressRef ở đây nữa
        };
    }, [isAuthenticated, user?.id]); // Only depend on authentication state and user ID

    // Hàm refresh giỏ hàng (gọi từ bên ngoài) - with strict control
    const refreshCart = async (): Promise<void> => {
        if (isRefreshingRef.current) return;

        isRefreshingRef.current = true;
        try {
            await fetchCart(true);
        } finally {
            isRefreshingRef.current = false;
        }
    };

    // Thêm sản phẩm vào giỏ hàng
    const addToCart = async (cartItemRequest: { courseId: string, price: number }): Promise<boolean> => {
        if (!isAuthenticated || !user) {
            toast({
                title: 'Bạn cần đăng nhập',
                description: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng',
                variant: 'destructive'
            });
            return false;
        }

        if (!cartId) {
            toast({
                title: 'Lỗi giỏ hàng',
                description: 'Không tìm thấy giỏ hàng của bạn',
                variant: 'destructive'
            });
            return false;
        }

        setIsLoading(true);
        try {
            // Kiểm tra xem khóa học đã có trong giỏ hàng chưa
            const existingItem = cartItems.find(item => item.courseId === cartItemRequest.courseId);
            if (existingItem) {
                toast({
                    title: 'Đã có trong giỏ hàng',
                    description: 'Khóa học này đã có trong giỏ hàng của bạn',
                });
                return true;
            }

            const request: CartItemRequest = {
                cart_id: cartId,
                course_id: cartItemRequest.courseId,
                price: cartItemRequest.price
            };

            const result = await cartService.addToCart(request);
            if (result) {
                // Get course info separately instead of refreshing entire cart
                const courseInfo = await getCourseWithInstructor(cartItemRequest.courseId);

                if (courseInfo) {
                    const newCartItem: CartItemDisplay = {
                        id: result.id,
                        courseId: result.courseId,
                        price: result.price,
                        originalPrice: courseInfo.price * 1.5,
                        name: courseInfo.name,
                        instructor: courseInfo.instructorName || 'Chưa có thông tin',
                        rating: courseInfo.rating || 0,
                        totalStudents: courseInfo.totalStudent || 0,
                        totalHours: calculateTotalHours(courseInfo),
                        lectures: courseInfo.totalLesson || 0,
                        level: getCourseLevel(courseInfo.level),
                        image: courseInfo.image || '/images/course-placeholder.jpg',
                        addedAt: result.addedAt
                    };

                    // Update local state without API call
                    setCartItems(prev => [...prev, newCartItem]);
                }

                toast({
                    title: 'Đã thêm vào giỏ hàng',
                    description: 'Khóa học đã được thêm vào giỏ hàng của bạn',
                });
                return true;
            }

            toast({
                title: 'Không thể thêm vào giỏ hàng',
                description: 'Đã xảy ra lỗi khi thêm khóa học vào giỏ hàng.',
                variant: 'destructive'
            });
            return false;
        } catch (err) {
            console.error('Error adding to cart:', err);
            setError(err instanceof Error ? err : new Error('Lỗi khi thêm vào giỏ hàng'));
            toast({
                title: 'Không thể thêm vào giỏ hàng',
                description: 'Đã xảy ra lỗi khi thêm khóa học vào giỏ hàng.',
                variant: 'destructive'
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Xóa sản phẩm khỏi giỏ hàng
    const removeFromCart = async (itemId: number): Promise<boolean> => {
        if (!isAuthenticated) {
            toast({
                title: 'Bạn cần đăng nhập',
                description: 'Vui lòng đăng nhập để thực hiện thao tác này',
                variant: 'destructive'
            });
            return false;
        }

        setIsLoading(true);
        try {
            // Gọi service xóa từ cartService
            const success = await cartService.removeFromCart(itemId);

            if (success) {
                // Cập nhật state local nếu xóa thành công
                setCartItems(prev => prev.filter(item => item.id !== itemId));
                toast({
                    title: 'Đã xóa khỏi giỏ hàng',
                    description: 'Khóa học đã được xóa khỏi giỏ hàng của bạn',
                });
                return true;
            }

            toast({
                title: 'Không thể xóa khóa học',
                description: 'Đã xảy ra lỗi khi xóa khóa học khỏi giỏ hàng.',
                variant: 'destructive'
            });
            return false;
        } catch (err) {
            console.error('Error removing from cart:', err);
            setError(err instanceof Error ? err : new Error('Lỗi khi xóa khỏi giỏ hàng'));
            toast({
                title: 'Không thể xóa khóa học',
                description: 'Đã xảy ra lỗi khi xóa khóa học khỏi giỏ hàng.',
                variant: 'destructive'
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Cập nhật thông tin sản phẩm trong giỏ hàng
    const updateCartItem = async (itemId: number, courseId: string, price: number): Promise<boolean> => {
        if (!isAuthenticated || !cartId) {
            toast({
                title: 'Bạn cần đăng nhập',
                description: 'Vui lòng đăng nhập để thực hiện thao tác này',
                variant: 'destructive'
            });
            return false;
        }

        setIsLoading(true);
        try {
            const cartItemRequest: CartItemRequest = {
                id: itemId,
                cart_id: cartId,
                course_id: courseId,
                price: price
            };

            const result = await cartService.updateCartItem(cartItemRequest);
            if (result) {
                // Update local state
                setCartItems(prev =>
                    prev.map(item =>
                        item.id === itemId
                            ? { ...item, price: result.price }
                            : item
                    )
                );
                toast({
                    title: 'Đã cập nhật giỏ hàng',
                    description: 'Thông tin khóa học đã được cập nhật',
                });
                return true;
            }

            toast({
                title: 'Không thể cập nhật',
                description: 'Đã xảy ra lỗi khi cập nhật thông tin khóa học.',
                variant: 'destructive'
            });
            return false;
        } catch (err) {
            console.error('Error updating cart item:', err);
            setError(err instanceof Error ? err : new Error('Lỗi khi cập nhật giỏ hàng'));
            toast({
                title: 'Không thể cập nhật',
                description: 'Đã xảy ra lỗi khi cập nhật thông tin khóa học.',
                variant: 'destructive'
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Áp dụng mã giảm giá
    const applyCoupon = async (couponId: string): Promise<boolean> => {
        if (!isAuthenticated || !user || !cartId) {
            toast({
                title: 'Bạn cần đăng nhập',
                description: 'Vui lòng đăng nhập để thực hiện thao tác này',
                variant: 'destructive'
            });
            return false;
        }

        setIsLoading(true);
        try {
            const cartRequest = {
                id: cartId,
                user_id: user.id,
                coupon_id: couponId
            };

            const result = await cartService.updateCart(cartRequest);
            if (result) {
                // We need to refresh to get updated prices
                await refreshCart();
                toast({
                    title: 'Đã áp dụng mã giảm giá',
                    description: 'Mã giảm giá đã được áp dụng thành công',
                });
                return true;
            }

            toast({
                title: 'Không thể áp dụng mã giảm giá',
                description: 'Đã xảy ra lỗi khi áp dụng mã giảm giá.',
                variant: 'destructive'
            });
            return false;
        } catch (err) {
            console.error('Error applying coupon:', err);
            setError(err instanceof Error ? err : new Error('Lỗi khi áp dụng mã giảm giá'));
            toast({
                title: 'Không thể áp dụng mã giảm giá',
                description: 'Đã xảy ra lỗi khi áp dụng mã giảm giá.',
                variant: 'destructive'
            });
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // Xóa toàn bộ giỏ hàng (chỉ xóa state local)
    const clearCart = () => {
        if (!isAuthenticated) {
            toast({
                title: 'Bạn cần đăng nhập',
                description: 'Vui lòng đăng nhập để thực hiện thao tác này',
                variant: 'destructive'
            });
            return;
        }

        setCartItems([]);
        toast({
            title: 'Đã xóa giỏ hàng',
            description: 'Giỏ hàng của bạn đã được xóa',
        });
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                isLoading,
                error,
                addToCart,
                removeFromCart,
                updateCartItem,
                applyCoupon,
                clearCart,
                refreshCart,
                totalPrice,
                totalOriginalPrice,
                cartId
            }}
        >
            {children}
        </CartContext.Provider>
    );
};