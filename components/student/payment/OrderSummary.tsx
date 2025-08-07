'use client';

import Image from 'next/image';
import { Separator } from '../../ui/separator';
import CouponSelectDialog from './CouponSelection';
import { useState } from 'react';
import { CouponDto, OrderCouponRequest, OrderDto, OrderItemDto, DiscountType } from '@/types/payment-type';
import { applyCouponToOrder } from '@/services/paymentService';
import { getImageUrl } from '@/utils/imageUtils';
import { createErrorToast } from '@/components/ui/toast-cus';

type OrderSummaryProps = {
  orderItems: OrderItemDto[] | null;
  coupons: CouponDto[];
  orderDto: OrderDto;
};

const OrderSummary = ({ orderItems, coupons, orderDto }: OrderSummaryProps) => {
  const [selectedCoupon, setSelectedCoupon] = useState<CouponDto | null>(null);
  const [orderData, setOrderData] = useState<OrderDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Improved price formatting function to handle decimal values better
  const formatPrice = (price: number) => {
    // Convert to a fixed number to handle any potential floating point issues
    const fixedPrice = Number(Number(price).toFixed(2));
    
    // Check if the number is an integer (no decimal part)
    const isInteger = fixedPrice % 1 === 0;
    
    // Format based on whether it's an integer or has significant decimal digits
    const formatted = isInteger
      ? Math.floor(fixedPrice).toLocaleString('vi-VN')
      : fixedPrice.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    return `${formatted} đ`;
  };
  
  // Format percentage values properly
  const formatPercentage = (value: number) => {
    // Convert to a fixed number to handle any potential floating point issues
    const fixedValue = Number(Number(value).toFixed(2));
    
    // Check if the number is an integer (no decimal part)
    const isInteger = fixedValue % 1 === 0;
    
    // Format based on whether it's an integer or has significant decimal digits
    return isInteger
      ? `${Math.floor(fixedValue)}%`
      : `${fixedValue}%`;
  };

  // Use orderDto properties instead of calculating
  const currentOrder = orderData || orderDto;
  
  // Calculate total original price for display (assuming 20% higher than subTotal)
  const totalOriginalPrice = currentOrder.subTotal * 1.2;
  
  // Get number of courses from orderItems
  const numberOfCourses = orderItems?.length || 0;

  // Handle coupon selection
  const handleCouponSelect = async (coupon: CouponDto | null) => {
    setIsLoading(true);
    
    try {
      const request: OrderCouponRequest = {
        orderId: orderDto.id,
        couponId: coupon?.id || "",
      };
      
      const result = await applyCouponToOrder(request);
      
      if (result) {
        setOrderData(result);
        setSelectedCoupon(coupon);
      } else {
        createErrorToast("Không thể áp dụng mã giảm giá, vui lòng thử lại");
        setSelectedCoupon(null);
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate savings percentage
  const calculateSavings = () => {
    const originalTotal = totalOriginalPrice;
    const discountedTotal = currentOrder.totalAmount;
    const savingsPercent = ((originalTotal - discountedTotal) / originalTotal) * 100;
    return Math.round(savingsPercent);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100 h-fit">
      {/* Header with savings highlight */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-gray-800">Tổng quan đơn hàng</h2>
        {calculateSavings() > 0 && (
          <div className="mt-2 inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
            Tiết kiệm {formatPercentage(calculateSavings())}
          </div>
        )}
      </div>

      {/* Scrollable Product List */}
      <div className="max-h-[280px] overflow-y-auto pr-2 mb-6 space-y-3">
        {orderItems?.map((item) => (
            
          <div
            key={item.course_id}
            className="flex items-center mb-2 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0 last:mb-0 group hover:bg-gray-50 rounded-md p-2 transition-all"
          >
            {/* Course thumbnail placeholder */}
            <Image 
                src={getImageUrl(item.url_image)}
                alt={item.course_id}
                width={60}
                height={60}
                objectFit='cover'
                className='rounded'
                />
            {/* <div className="w-12 h-12 bg-blue-50 rounded-md mr-4 flex items-center justify-center flex-shrink-0 text-blue-500 border border-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12.5a10 10 0 0 1 20 0c0 2.5-2.5 2.5-5 2.5s-5 0-5-2.5a10 10 0 0 1 20 0c0 2.5-2.5 2.5-5 2.5s-5 0-5-2.5a10 10 0 0 1 20 0"></path>
              </svg>
            </div> */}
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors ps-3">
                {item.course_name}
              </h3>
              <div className="flex justify-between items-center mt-1 ps-3">
                <span className="line-through text-xs text-gray-400">
                  {formatPrice(totalOriginalPrice)}
                </span>
                <span className="font-semibold text-gray-900">
                  {formatPrice(item.price)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coupon Selection */}
      <CouponSelectDialog
        totalPrice={currentOrder.subTotal}
        onCouponSelect={handleCouponSelect}
        coupons={coupons}
        isLoading={isLoading}
      />

      <Separator className="my-4 bg-gray-200"/>

      {/* Order Summary Details */}
      <div className="space-y-3 text-gray-700">
        <div className="flex justify-between items-center text-sm">
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Tổng số khóa học:
          </span>
          <span className="font-medium bg-blue-50 px-2 py-0.5 rounded text-blue-700">
            {numberOfCourses} khóa học
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span>Giá:</span>
          <div className="flex items-end gap-2">
            <span className="text-xs text-gray-400 line-through">{formatPrice(totalOriginalPrice)}</span>
            <span className="font-medium">{formatPrice(currentOrder.subTotal)}</span>
          </div>
        </div>

        {/* Coupon Discount Display */}
        {currentOrder.discountAmount > 0 && (
          <div className="flex justify-between text-green-600 items-center">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              Voucher:
            </span>
            <span className="font-medium">
              {`-${formatPrice(currentOrder.discountAmount)}`}
              {selectedCoupon?.discountType === 'PERCENTAGE' && (
                <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                  {formatPercentage(Number(selectedCoupon.discountValue))}
                </span>
              )}
            </span>
          </div>
        )}
        
        <Separator className="bg-gray-200 my-2"/>

        {/* Total amount with highlight */}
        <div className="flex justify-between text-lg font-bold py-2 bg-blue-50 px-3 rounded-lg text-blue-900 mt-2">
          <span>Tổng cộng:</span>
          <span>{formatPrice(currentOrder.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;