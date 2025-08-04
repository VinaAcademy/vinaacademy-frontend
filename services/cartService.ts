import apiClient from '@/lib/apiClient';
import { ApiResponse } from '@/types/api-response';
import { AxiosResponse } from 'axios';

// Định nghĩa các interface cho Cart API
export interface CartDto {
    id: number;
    couponId?: string;
    userId: string;
    cartItems: CartItemDto[];
}

export interface CartItemDto {
    id: number;
    courseId: string;
    price: number;
    addedAt: string;
}

export interface CartRequest {
    id?: number;
    coupon_id?: string;
    user_id: string;
}

export interface CartItemRequest {
    id?: number;
    cart_id: number;
    course_id: string;
    price: number;
}

/**
 * Lấy thông tin giỏ hàng của người dùng hiện tại
 * @returns Thông tin giỏ hàng
 */
// export const getCurrentCart = async (): Promise<CartDto | null> => {
//     try {
//         // Sử dụng thông tin người dùng từ authContext
//         const response: AxiosResponse<ApiResponse<CartDto>> = await apiClient.get('/cart/current');
//         return response.data.data;
//     } catch (error) {
//         console.error('Error fetching current cart:', error);
//         return null;
//     }
// };

/**
 * Lấy thông tin giỏ hàng theo userId
 * @param userId ID của người dùng
 * @returns Thông tin giỏ hàng
 */
export const getCart = async (userId: string): Promise<CartDto | null> => {
    try {
        const response: AxiosResponse<ApiResponse<CartDto>> = await apiClient.get(`/cart`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching cart for user ${userId}:`, error);
        return null;
    }
};

/**
 * Tạo giỏ hàng mới cho người dùng
 * @param userId ID của người dùng
 * @returns Thông tin giỏ hàng mới tạo
 */
// export const createCart = async (userId: string): Promise<CartDto | null> => {
//     try {
//         const request: CartRequest = {
//             user_id: userId
//         };
//         const response: AxiosResponse<ApiResponse<CartDto>> = await apiClient.post('/cart', request);
//         return response.data.data;
//     } catch (error) {
//         console.error('Error creating cart:', error);
//         return null;
//     }
// };

/**
 * Cập nhật thông tin giỏ hàng (ví dụ: áp dụng mã giảm giá)
 * @param cartRequest Thông tin cập nhật giỏ hàng
 * @returns Thông tin giỏ hàng đã cập nhật
 */
export const updateCart = async (cartRequest: CartRequest): Promise<CartDto | null> => {
    try {
        const response: AxiosResponse<ApiResponse<CartDto>> = await apiClient.put('/cart', cartRequest);
        return response.data.data;
    } catch (error) {
        console.error('Error updating cart:', error);
        return null;
    }
};

/**
 * Thêm một khóa học vào giỏ hàng
 * @param cartItemRequest Thông tin khóa học cần thêm vào giỏ hàng
 * @returns Thông tin mục giỏ hàng mới
 */
export const addToCart = async (cartItemRequest: CartItemRequest): Promise<CartItemDto | null> => {
    try {
        const response: AxiosResponse<ApiResponse<CartItemDto>> = await apiClient.post('/cart/items', cartItemRequest);
        return response.data.data;
    } catch (error) {
        console.error('Error adding item to cart:', error);
        return null;
    }
};

/**
 * Cập nhật thông tin mục trong giỏ hàng
 * @param cartItemRequest Thông tin cập nhật mục giỏ hàng
 * @returns Thông tin mục giỏ hàng đã cập nhật
 */
export const updateCartItem = async (cartItemRequest: CartItemRequest): Promise<CartItemDto | null> => {
    try {
        const response: AxiosResponse<ApiResponse<CartItemDto>> = await apiClient.put('/cart/items', cartItemRequest);
        return response.data.data;
    } catch (error) {
        console.error('Error updating cart item:', error);
        return null;
    }
};

/**
 * Xóa một mục khỏi giỏ hàng
 * @param itemId ID của mục cần xóa
 * @returns true nếu xóa thành công, false nếu có lỗi
 */
export const removeFromCart = async (itemId: number): Promise<boolean> => {
    try {
        await apiClient.delete(`/cart/items/${itemId}`);
        return true;
    } catch (error) {
        console.error(`Error removing item ${itemId} from cart:`, error);
        return false;
    }
};

/**
 * Lấy thông tin một mục trong giỏ hàng
 * @param itemId ID của mục cần lấy thông tin
 * @returns Thông tin mục giỏ hàng
 */
export const getCartItem = async (itemId: number): Promise<CartItemDto | null> => {
    try {
        const response: AxiosResponse<ApiResponse<CartItemDto>> = await apiClient.get(`/cart/items/${itemId}`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching cart item ${itemId}:`, error);
        return null;
    }
};

/**
 * Lấy danh sách các mục trong giỏ hàng
 * @param userId ID của người dùng
 * @returns Danh sách các mục trong giỏ hàng
 */
export const getCartItems = async (userId: string): Promise<CartItemDto[] | null> => {
    try {
        const response: AxiosResponse<ApiResponse<CartItemDto[]>> = await apiClient.get(`/cart/${userId}/items`);
        return response.data.data;
    } catch (error) {
        console.error(`Error fetching cart items for user ${userId}:`, error);
        return null;
    }
};