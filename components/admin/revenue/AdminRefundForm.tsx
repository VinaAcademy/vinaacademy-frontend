'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCcw, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  CreditCard
} from 'lucide-react';
import { useProcessRefund } from '@/hooks/useRevenue';
import { RefundFormData } from '@/types/revenue';
import { createSuccessToast, createErrorToast } from '@/components/ui/toast-cus';

export default function AdminRefundForm() {
  const [formData, setFormData] = useState<RefundFormData>({
    vnpayTxnRef: '',
    reason: ''
  });
  const [errors, setErrors] = useState<Partial<RefundFormData>>({});

  const refundMutation = useProcessRefund();

  const handleInputChange = (field: keyof RefundFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RefundFormData> = {};

    // Validate VNPay transaction reference
    if (!formData.vnpayTxnRef.trim()) {
      newErrors.vnpayTxnRef = 'Vui lòng nhập mã giao dịch VNPay';
    } else if (formData.vnpayTxnRef.trim().length < 8) {
      newErrors.vnpayTxnRef = 'Mã giao dịch phải có ít nhất 8 ký tự';
    }

    // Validate reason
    if (!formData.reason.trim()) {
      newErrors.reason = 'Vui lòng nhập lý do hoàn tiền';
    } else if (formData.reason.trim().length < 10) {
      newErrors.reason = 'Lý do hoàn tiền phải có ít nhất 10 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const refundData = {
        vnpayTxnRef: formData.vnpayTxnRef.trim(),
        reason: formData.reason.trim()
      };

      const success = await refundMutation.mutateAsync(refundData);

      if (success) {
        createSuccessToast("Hoàn tiền đã được xử lý thành công");
        
        // Reset form
        setFormData({
          vnpayTxnRef: '',
          reason: ''
        });
        setErrors({});
      } else {
        createErrorToast("Không thể xử lý hoàn tiền. Vui lòng kiểm tra lại mã giao dịch.");
      }
    } catch (error) {
      createErrorToast("Có lỗi xảy ra khi xử lý hoàn tiền. Vui lòng thử lại sau.");
    }
  };

  const handleReset = () => {
    setFormData({
      vnpayTxnRef: '',
      reason: ''
    });
    setErrors({});
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-blue-600" />
            Xử lý hoàn tiền
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Information Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Chức năng này được sử dụng để hoàn tiền cho các giao dịch đã thanh toán qua VNPay.
                Vui lòng kiểm tra kỹ thông tin trước khi thực hiện hoàn tiền.
              </AlertDescription>
            </Alert>

            {/* VNPay Transaction Reference */}
            <div className="space-y-2">
              <Label htmlFor="vnpayTxnRef" className="text-sm font-medium">
                Mã giao dịch VNPay *
              </Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="vnpayTxnRef"
                  type="text"
                  placeholder="Nhập mã giao dịch VNPay cần hoàn tiền"
                  value={formData.vnpayTxnRef}
                  onChange={(e) => handleInputChange('vnpayTxnRef', e.target.value)}
                  className={`pl-10 ${errors.vnpayTxnRef ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.vnpayTxnRef && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.vnpayTxnRef}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Mã giao dịch này có thể tìm thấy trong lịch sử thanh toán hoặc từ VNPay
              </p>
            </div>

            {/* Refund Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Lý do hoàn tiền *
              </Label>
              <Textarea
                id="reason"
                placeholder="Nhập lý do chi tiết cho việc hoàn tiền (ví dụ: Học viên yêu cầu hoàn tiền do không hài lòng với khóa học, Lỗi kỹ thuật trong quá trình thanh toán, ...)"
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                rows={4}
                className={errors.reason ? 'border-red-500' : ''}
              />
              {errors.reason && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.reason}
                </p>
              )}
              <div className="flex justify-between text-xs text-gray-500">
                <span>Mô tả chi tiết lý do hoàn tiền để thuận tiện cho việc theo dõi</span>
                <span>{formData.reason.length} ký tự</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Làm mới
              </Button>
              
              <Button
                type="submit"
                disabled={refundMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                {refundMutation.isPending ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Xử lý hoàn tiền
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Additional Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lưu ý quan trọng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Không thể hoàn tác:</strong> Sau khi hoàn tiền thành công, 
                giao dịch không thể được hoàn tác.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Thời gian xử lý:</strong> Hoàn tiền qua VNPay thường mất 1-3 ngày làm việc
                để được xử lý hoàn tất.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Kiểm tra kỹ:</strong> Vui lòng đảm bảo mã giao dịch chính xác và 
                lý do hoàn tiền rõ ràng trước khi thực hiện.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div>
                <strong>Báo cáo:</strong> Tất cả giao dịch hoàn tiền sẽ được ghi lại và 
                báo cáo trong hệ thống quản lý doanh thu.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
