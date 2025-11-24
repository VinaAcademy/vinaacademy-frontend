'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Eye,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { usePendingPayouts, useApprovePayoutRequest } from '@/hooks/useRevenue';
import { formatCurrency, formatDate } from '@/services/revenueService';
import { PayoutApprovalFormData, PayoutRequestResponseDto } from '@/types/revenue';
import { Skeleton } from '@/components/ui/skeleton';
import { createSuccessToast, createErrorToast } from '@/components/ui/toast-cus';

interface PayoutApprovalModalProps {
  request: PayoutRequestResponseDto;
  onClose: () => void;
}

function PayoutApprovalModal({ request, onClose }: PayoutApprovalModalProps) {
  const [formData, setFormData] = useState<PayoutApprovalFormData>({
    approved: false,
    rejectionReason: '',
    note: ''
  });

  const approveMutation = useApprovePayoutRequest();

  const handleApprove = () => {
    setFormData(prev => ({ ...prev, approved: true, rejectionReason: '' }));
  };

  const handleReject = () => {
    setFormData(prev => ({ ...prev, approved: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate rejection reason if rejecting
    if (!formData.approved && !formData.rejectionReason.trim()) {
      createErrorToast("Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      const approvalData = {
        payoutRequestId: request.id,
        approved: formData.approved,
        rejectionReason: formData.approved ? undefined : formData.rejectionReason.trim(),
        note: formData.note.trim() || undefined
      };

      const success = await approveMutation.mutateAsync(approvalData);
      
      if (success) {
        createSuccessToast(
          formData.approved 
            ? "Yêu cầu rút tiền đã được duyệt thành công" 
            : "Yêu cầu rút tiền đã được từ chối"
        );
        onClose();
      } else {
        createErrorToast("Không thể xử lý yêu cầu. Vui lòng thử lại.");
      }
    } catch (error) {
      createErrorToast("Có lỗi xảy ra khi xử lý yêu cầu");
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Xử lý yêu cầu rút tiền
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Request Details */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Số tiền:</span>
            <span className="font-semibold">{formatCurrency(request.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Ngân hàng:</span>
            <span className="font-medium">{request.bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Số TK:</span>
            <span className="font-mono">{request.bankAccount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Chủ TK:</span>
            <span className="font-medium">{request.accountHolder}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Thời gian:</span>
            <span className="text-sm">{formatDate(request.createdDate)}</span>
          </div>
          {request.note && (
            <div className="pt-2 border-t">
              <span className="text-sm text-gray-600">Ghi chú:</span>
              <p className="text-sm mt-1">{request.note}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={handleApprove}
            className={`flex-1 ${
              formData.approved 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-green-50 hover:text-green-700'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Duyệt
          </Button>
          <Button
            type="button"
            onClick={handleReject}
            className={`flex-1 ${
              !formData.approved 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-700'
            }`}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Từ chối
          </Button>
        </div>

        {/* Rejection Reason (only shown when rejecting) */}
        {!formData.approved && (
          <div className="space-y-2">
            <Label htmlFor="rejectionReason" className="text-red-600">
              Lý do từ chối *
            </Label>
            <Textarea
              id="rejectionReason"
              placeholder="Nhập lý do từ chối yêu cầu rút tiền..."
              value={formData.rejectionReason}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                rejectionReason: e.target.value
              }))}
              rows={3}
              className="border-red-200 focus:border-red-500"
            />
          </div>
        )}

        {/* Admin Note */}
        <div className="space-y-2">
          <Label htmlFor="note">Ghi chú quản trị (tùy chọn)</Label>
          <Textarea
            id="note"
            placeholder="Ghi chú nội bộ..."
            value={formData.note}
            onChange={(e) => setFormData(prev => ({
              ...prev,
              note: e.target.value
            }))}
            rows={2}
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={approveMutation.isPending}
            className={formData.approved ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {approveMutation.isPending ? 'Đang xử lý...' : (formData.approved ? 'Duyệt yêu cầu' : 'Từ chối yêu cầu')}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

export default function AdminPayoutApproval() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [selectedRequest, setSelectedRequest] = useState<PayoutRequestResponseDto | null>(null);

  const {
    data: payoutData,
    isLoading,
    error,
    refetch
  } = usePendingPayouts(currentPage, pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !payoutData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="text-sm">Không thể tải danh sách yêu cầu chờ duyệt</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const requests = payoutData?.content || [];
  const totalPages = payoutData?.totalPages || 0;
  const isFirstPage = payoutData?.first ?? true;
  const isLastPage = payoutData?.last ?? true;
  const totalElements = payoutData?.totalElements || 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Yêu cầu rút tiền chờ duyệt ({totalElements})
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-300" />
              <p>Không có yêu cầu rút tiền nào chờ duyệt</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Thời gian</TableHead>
                      <TableHead>Giảng viên</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                      <TableHead>Ngân hàng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-center">Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="text-sm">
                          {formatDate(request.createdDate)}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="max-w-xs">
                            <div className="text-xs text-gray-500">
                              ID: {request.instructorId.slice(0, 8)}...
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(request.amount)}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="max-w-xs">
                            <div className="font-medium">{request.bankName}</div>
                            <div className="text-gray-500 text-xs">
                              {request.bankAccount}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {request.accountHolder}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-orange-600">
                            Chờ duyệt
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex gap-1 justify-center">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              {selectedRequest && selectedRequest.id === request.id && (
                                <PayoutApprovalModal 
                                  request={selectedRequest}
                                  onClose={() => setSelectedRequest(null)}
                                />
                              )}
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Trang {currentPage + 1} / {totalPages} 
                    ({totalElements} yêu cầu)
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={isFirstPage}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={isLastPage}
                    >
                      Sau
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
