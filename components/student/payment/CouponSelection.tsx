'use client';

import { useState } from 'react';
import { Button } from '../../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog';
import { Separator } from '../../ui/separator';
import { CouponDto } from '@/types/payment-type';

type CouponSelectDialogProps = {
  totalPrice: number;
  onCouponSelect: (coupon: CouponDto | null) => void;
  coupons: CouponDto[];
  isLoading?: boolean;
};

const CouponSelectDialog = ({
  totalPrice,
  onCouponSelect,
  coupons,
  isLoading = false,
}: CouponSelectDialogProps) => {
  const [open, setOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponDto | null>(null);

  const total = Number(totalPrice);

  const formatPrice = (price: number) => {
    const fixedPrice = Number(price.toFixed(2));
    
    const isInteger = fixedPrice % 1 === 0;
    
    const formatted = isInteger
      ? Math.floor(fixedPrice).toLocaleString('vi-VN')
      : fixedPrice.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    return `${formatted} đ`;
  };
  
  const formatPercentage = (value: number) => {
    const fixedValue = Number(value.toFixed(2));
    
    const isInteger = fixedValue % 1 === 0;
    
    return isInteger
      ? `${Math.floor(fixedValue)}%`
      : `${fixedValue}%`;
  };

  // Filter valid coupons based on minimum order value and valid status
  const validCoupons = coupons.filter(coupon =>
    total >= Number(coupon.minOrderValue) && coupon.valid
  );

  const handleApplyCoupon = () => {
    const coupon = validCoupons.find(c => c.id === selectedCouponId) || null;
    setAppliedCoupon(coupon);
    onCouponSelect(coupon);
    setOpen(false);
  };

  const handleRemoveCoupon = () => {
    setSelectedCouponId(null);
    setAppliedCoupon(null);
    onCouponSelect(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <div className="flex justify-between items-center my-4 py-3 border-y border-dashed border-gray-300">
        <div>
          <p className="font-medium text-gray-700">Mã giảm giá</p>
          {appliedCoupon && (
            <div className="flex items-center mt-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-sm font-medium bg-green-100 text-green-800 mr-2">
                {appliedCoupon.code}
              </span>
              <p className="text-sm text-green-600 font-medium">
                -{appliedCoupon.discountType === 'PERCENTAGE'
                  ? formatPercentage(Number(appliedCoupon.discountValue))
                  : formatPrice(Number(appliedCoupon.discountValue))}
              </p>
            </div>
          )}
        </div>
        {appliedCoupon ? (
          <Button
            variant="outline"
            className="text-red-500 border-red-500 hover:bg-red-50"
            onClick={handleRemoveCoupon}
            disabled={isLoading}
          >
            {isLoading ? 'Đang xử lý...' : 'Bỏ mã'}
          </Button>
        ) : (
          <DialogTrigger asChild>
            <Button variant="outline" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Chọn mã'}
            </Button>
          </DialogTrigger>
        )}
      </div>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chọn mã giảm giá</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-[61vh] overflow-y-auto">
          {coupons.length > 0 ? (
            coupons.map((coupon) => {
              const minOrder = Number(coupon.minOrderValue);
              const isValid = coupon.valid && total >= minOrder;
              return (
                <div
                  key={coupon.id}
                  className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                    selectedCouponId === coupon.id
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-gray-200'
                  } ${  
                    isValid 
                      ? 'cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => {
                    if (isValid) {
                      setSelectedCouponId(coupon.id);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {!coupon.valid && (
                        <p className="text-xs text-red-500 mt-1 font-medium">
                          Mã giảm giá không hợp lệ
                        </p>
                      )}
                      {coupon.valid && total < minOrder && (
                        <p className="text-xs text-red-500 mt-1">
                          Đơn hàng chưa đạt giá trị tối thiểu: {formatPrice(minOrder)}
                        </p>
                      )}
                      {coupon.valid && total >= minOrder && (
                        <div className="flex flex-col">
                          <p className="text-md text-green-600 font-medium">
                            Mã giảm: <span className='font-bold'>{coupon.discountType === 'PERCENTAGE'
                              ? formatPercentage(Number(coupon.discountValue))
                              : formatPrice(Number(coupon.discountValue))}</span>
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
                        {coupon.code}
                      </span>
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Đơn tối thiểu: {formatPrice(minOrder)}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600 justify-end">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>HSD: {new Date(coupon.expiredAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {coupon.discountType === 'PERCENTAGE' && (
                      <div className="flex items-center text-xs text-gray-600 col-span-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                        </svg>
                        <span>Giảm tối đa: {formatPrice(Number(coupon.maxDiscountAmount))}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6 text-gray-500">
              Không có mã giảm giá nào khả dụng cho đơn hàng này
            </div>
          )}
        </div>
        <div className="flex justify-end gap-4 mt-4">
          <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="px-4"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleApplyCoupon} 
            disabled={!selectedCouponId}
            className="bg-blue-600 hover:bg-blue-700 px-4"
          >
            Áp dụng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CouponSelectDialog;