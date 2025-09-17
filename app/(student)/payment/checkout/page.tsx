'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import PaymentSelection from '@/components/student/payment/PaymentSelection';
import OrderSummary from '@/components/student/payment/OrderSummary';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { createPayment, getValidCoupons } from '@/services/paymentService';
import { createOrder } from '@/services/paymentService';
import { CouponDto, OrderDto, PaymentMethod } from '@/types/payment-type';
import { createErrorToast, createSuccessToast } from '@/components/ui/toast-cus';
import { Loader2, ShoppingCart, AlertCircle } from 'lucide-react';

const CheckoutPage = () => {
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vnpay');
    const [selectedCard, setSelectedCard] = useState<string | null>(null);
    const [availableCoupons, setAvailableCoupons] = useState<CouponDto[]>([]);
    const { refreshCart } = useCart();
    // Specific loading states
    const [isLoadingOrder, setIsLoadingOrder] = useState(false);
    const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    
    const [order, setOrder] = useState<OrderDto | null>(null);
    
    // Add a ref to track if initialization has happened
    const isInitialized = useRef(false);

    // Fetch available coupons and create order on page load
    useEffect(() => {
        // Prevent multiple initializations
        if (isInitialized.current) return;
        isInitialized.current = true;
        
        const initializeLoad = async () => {
            try {
                // Fetch coupons
                setIsLoadingCoupons(true);
                const coupons = await getValidCoupons();
                setAvailableCoupons(coupons);
            } catch (error) {
                console.error('Error fetching coupons:', error);
                createErrorToast("Không thể tải mã giảm giá, vui lòng thử lại sau");
            } finally {
                setIsLoadingCoupons(false);
            }
            
            try {
                // Create order
                setIsLoadingOrder(true);
                const newOrder = await createOrder();
                setOrder(newOrder);
                refreshCart();
                console.log("Tao order "+newOrder)
                if (!newOrder) {
                    createErrorToast("Không thể tạo đơn thanh toán, Vui lòng kiểm tra lại giỏ hàng");
                }
            } catch (error) {
                console.error('Error creating order:', error);
                createErrorToast("Không thể tạo đơn hàng, vui lòng thử lại sau");
            } finally {
                setIsLoadingOrder(false);
            }
        };
        
        initializeLoad();
    }, []);

    const handlePaymentMethodChange = (method: PaymentMethod) => {
        setPaymentMethod(method);
        if (method !== 'vnpay') {
            setSelectedCard(null);
        }
    };

    const handlePaymentInitiate = async () => {
        if (!order) {
            createErrorToast('Vui lòng kiểm tra lại giỏ hàng');
            return;
        }
        
        setIsProcessingPayment(true);
        
        try {
            const result = await createPayment(order.id, );
            
            if (result && result.urlPayment) {
                createSuccessToast("Đang chuyển hướng đến trang thanh toán, vui lòng đợi...");
                // Redirect to payment gateway
                window.location.href = result.urlPayment;
            } else {
                createErrorToast("Đã xảy ra lỗi trong quá trình điều hướng url, vui lòng thử lại");
            }
        } catch (error) {
            console.error('Payment error:', error);
            createErrorToast("Đã xảy ra lỗi trong quá trình thanh toán, vui lòng thử lại");
        } finally {
            setIsProcessingPayment(false);
        }
    };

    // Function to handle returning to cart
    const handleReturnToCart = () => {
        router.push('/cart');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-8 pt-4 mt-[-20px]">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">Thanh toán</h1>
                
                {isLoadingOrder || isLoadingCoupons ? (
                    <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow p-6">
                        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                        <p className="text-lg font-medium text-gray-700">Đang tải thông tin đơn hàng...</p>
                        <p className="text-sm text-gray-500 mt-2">Vui lòng đợi trong giây lát</p>
                    </div>
                ) : !order || !order.orderItemsDto ? (
                    <div className="flex flex-col justify-center items-center h-64 bg-white rounded-lg shadow p-6">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <p className="text-lg font-medium text-gray-700">Không tìm thấy thông tin đơn hàng</p>
                        <p className="text-sm text-gray-500 mt-2 mb-4">Vui lòng kiểm tra lại giỏ hàng của bạn</p>
                        <button 
                            onClick={handleReturnToCart}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all"
                        >
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Quay lại giỏ hàng
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        {/* Payment Method Section */}
                        <div className="md:col-span-3">
                            <PaymentSelection
                                onPaymentMethodChange={handlePaymentMethodChange}
                                onPaymentInitiate={handlePaymentInitiate}
                                isProccessing={isProcessingPayment}
                            />
                        </div>
                        {/* Order Summary */}
                        <div className="md:col-span-2">
                            <OrderSummary 
                                orderItems={order.orderItemsDto}
                                coupons={availableCoupons}
                                orderDto={order}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;