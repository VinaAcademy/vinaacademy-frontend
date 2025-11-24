'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlusCircle, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';
import { useCreatePayoutRequest, useWalletBalance } from '@/hooks/useRevenue';
import { formatCurrency, validatePayoutAmount } from '@/services/revenueService';
import { PayoutRequestFormData } from '@/types/revenue';
import { createSuccessToast, createErrorToast } from '@/components/ui/toast-cus';

interface PayoutRequestModalProps {
  trigger?: React.ReactNode;
}

export default function PayoutRequestModal({ trigger }: PayoutRequestModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<PayoutRequestFormData>({
    amount: '',
    bankName: '',
    bankAccount: '',
    accountHolder: '',
    note: ''
  });
  const [errors, setErrors] = useState<Partial<PayoutRequestFormData>>({});

  const { data: walletData } = useWalletBalance();
  const createPayoutMutation = useCreatePayoutRequest();

  const handleInputChange = (field: keyof PayoutRequestFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PayoutRequestFormData> = {};

    // Validate amount
    const amountNumber = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amountNumber)) {
      newErrors.amount = 'Vui lòng nhập số tiền hợp lệ';
    } else if (walletData) {
      const validation = validatePayoutAmount(amountNumber, walletData.availableBalance);
      if (!validation.isValid) {
        newErrors.amount = validation.error;
      }
    }

    // Validate required fields
    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Vui lòng nhập tên ngân hàng';
    }

    if (!formData.bankAccount.trim()) {
      newErrors.bankAccount = 'Vui lòng nhập số tài khoản';
    } else if (!/^\d{8,20}$/.test(formData.bankAccount.replace(/\s/g, ''))) {
      newErrors.bankAccount = 'Số tài khoản phải từ 8-20 chữ số';
    }

    if (!formData.accountHolder.trim()) {
      newErrors.accountHolder = 'Vui lòng nhập tên chủ tài khoản';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const payoutData = {
        amount: parseFloat(formData.amount),
        bankName: formData.bankName.trim(),
        bankAccount: formData.bankAccount.replace(/\s/g, ''), // Remove spaces
        accountHolder: formData.accountHolder.trim(),
        note: formData.note.trim() || undefined
      };

      const result = await createPayoutMutation.mutateAsync(payoutData);

      if (result) {
        createSuccessToast("Yêu cầu rút tiền đã được gửi. Chúng tôi sẽ xem xét và xử lý yêu cầu của bạn trong 1-3 ngày làm việc.");

        // Reset form and close modal
        setFormData({
          amount: '',
          bankName: '',
          bankAccount: '',
          accountHolder: '',
          note: ''
        });
        setErrors({});
        setIsOpen(false);
      } else {
        throw new Error('Không thể tạo yêu cầu rút tiền');
      }
    } catch (error) {
      createErrorToast("Không thể gửi yêu cầu rút tiền. Vui lòng thử lại sau.");
    }
  };

  const formatAmountInput = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, '');
    return numericValue;
  };

  const availableBalance = walletData?.availableBalance || 0;
  const minAmount = 100000; // 100,000 VND

  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      <PlusCircle className="h-4 w-4" />
      Yêu cầu rút tiền
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Yêu cầu rút tiền
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Available Balance Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Số dư có thể rút: <strong>{formatCurrency(availableBalance)}</strong>
              <br />
              Số tiền rút tối thiểu: <strong>{formatCurrency(minAmount)}</strong>
            </AlertDescription>
          </Alert>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền muốn rút *</Label>
            <Input
              id="amount"
              type="text"
              placeholder="Ví dụ: 500000"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', formatAmountInput(e.target.value))}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
            {formData.amount && !errors.amount && (
              <p className="text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4 inline mr-1" />
                {formatCurrency(parseFloat(formData.amount) || 0)}
              </p>
            )}
          </div>

          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bankName">Tên ngân hàng *</Label>
            <Input
              id="bankName"
              type="text"
              placeholder="Ví dụ: Vietcombank"
              value={formData.bankName}
              onChange={(e) => handleInputChange('bankName', e.target.value)}
              className={errors.bankName ? 'border-red-500' : ''}
            />
            {errors.bankName && (
              <p className="text-sm text-red-500">{errors.bankName}</p>
            )}
          </div>

          {/* Bank Account */}
          <div className="space-y-2">
            <Label htmlFor="bankAccount">Số tài khoản *</Label>
            <Input
              id="bankAccount"
              type="text"
              placeholder="Ví dụ: 1234567890"
              value={formData.bankAccount}
              onChange={(e) => handleInputChange('bankAccount', e.target.value)}
              className={errors.bankAccount ? 'border-red-500' : ''}
            />
            {errors.bankAccount && (
              <p className="text-sm text-red-500">{errors.bankAccount}</p>
            )}
          </div>

          {/* Account Holder */}
          <div className="space-y-2">
            <Label htmlFor="accountHolder">Tên chủ tài khoản *</Label>
            <Input
              id="accountHolder"
              type="text"
              placeholder="Họ và tên chủ tài khoản"
              value={formData.accountHolder}
              onChange={(e) => handleInputChange('accountHolder', e.target.value)}
              className={errors.accountHolder ? 'border-red-500' : ''}
            />
            {errors.accountHolder && (
              <p className="text-sm text-red-500">{errors.accountHolder}</p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
            <Textarea
              id="note"
              placeholder="Ghi chú thêm (nếu có)"
              value={formData.note}
              onChange={(e) => handleInputChange('note', e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={createPayoutMutation.isPending}
            >
              {createPayoutMutation.isPending ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
