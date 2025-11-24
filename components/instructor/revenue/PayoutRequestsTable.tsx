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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  X, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { usePayoutRequests, useCancelPayoutRequest } from '@/hooks/useRevenue';
import { formatCurrency, formatDate } from '@/services/revenueService';
import { PayoutStatus, PayoutStatusLabels } from '@/types/revenue';
import { Skeleton } from '@/components/ui/skeleton';
import { createSuccessToast, createErrorToast } from '@/components/ui/toast-cus';
import PayoutRequestModal from './PayoutRequestModal';

export default function PayoutRequestsTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const {
    data: payoutData,
    isLoading,
    error,
    refetch
  } = usePayoutRequests(currentPage, pageSize);

  const cancelMutation = useCancelPayoutRequest();

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      const success = await cancelMutation.mutateAsync(requestId);
      if (success) {
        createSuccessToast("Yêu cầu rút tiền đã được hủy thành công");
      } else {
        createErrorToast("Không thể hủy yêu cầu. Vui lòng thử lại sau.");
      }
    } catch (error) {
      createErrorToast("Có lỗi xảy ra khi hủy yêu cầu rút tiền");
    }
  };

  const getStatusBadgeVariant = (status: PayoutStatus) => {
    switch (status) {
      case PayoutStatus.PENDING:
        return 'secondary' as const;
      case PayoutStatus.REVIEWING:
        return 'default' as const;
      case PayoutStatus.APPROVED:
        return 'outline' as const;
      case PayoutStatus.PROCESSING:
        return 'outline' as const;
      case PayoutStatus.PAID:
        return 'default' as const;
      case PayoutStatus.REJECTED:
        return 'destructive' as const;
      case PayoutStatus.CANCELLED:
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getStatusColor = (status: PayoutStatus) => {
    switch (status) {
      case PayoutStatus.PENDING:
        return 'text-yellow-600';
      case PayoutStatus.REVIEWING:
        return 'text-blue-600';
      case PayoutStatus.APPROVED:
        return 'text-green-600';
      case PayoutStatus.PROCESSING:
        return 'text-blue-600';
      case PayoutStatus.PAID:
        return 'text-green-600';
      case PayoutStatus.REJECTED:
        return 'text-red-600';
      case PayoutStatus.CANCELLED:
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const canCancelRequest = (status: PayoutStatus) => {
    return status === PayoutStatus.PENDING || status === PayoutStatus.REVIEWING;
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
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
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
            <p className="text-sm">Không thể tải danh sách yêu cầu rút tiền</p>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Yêu cầu rút tiền
          </CardTitle>
          <div className="flex items-center gap-2">
            <PayoutRequestModal />
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="mb-4">Bạn chưa có yêu cầu rút tiền nào</p>
            <PayoutRequestModal trigger={
              <Button variant="outline">
                Tạo yêu cầu rút tiền đầu tiên
              </Button>
            } />
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Ngân hàng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Xử lý lúc</TableHead>
                    <TableHead className="text-center">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="text-sm">
                        {formatDate(request.createdDate)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(request.amount)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="max-w-xs">
                          <div className="font-medium">{request.bankName}</div>
                          <div className="text-gray-500 text-xs">
                            {request.bankAccount.replace(/(.{4})/g, '$1 ')}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {request.accountHolder}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={getStatusBadgeVariant(request.status)}
                          className={getStatusColor(request.status)}
                        >
                          {PayoutStatusLabels[request.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {request.processedAt ? formatDate(request.processedAt) : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {canCancelRequest(request.status) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                disabled={cancelMutation.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                  <AlertCircle className="h-5 w-5 text-red-500" />
                                  Xác nhận hủy yêu cầu
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bạn có chắc chắn muốn hủy yêu cầu rút tiền{' '}
                                  <strong>{formatCurrency(request.amount)}</strong> không?
                                  <br />
                                  Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Không</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleCancelRequest(request.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Xác nhận hủy
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {request.status === PayoutStatus.REJECTED && request.rejectionReason && (
                          <div className="mt-1">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-xs">
                                  Xem lý do
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Lý do từ chối</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {request.rejectionReason}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Đóng</AlertDialogCancel>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
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
  );
}
