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
import { ChevronLeft, ChevronRight, TrendingUp, RefreshCw } from 'lucide-react';
import { useRevenueHistory } from '@/hooks/useRevenue';
import { formatCurrency, formatDate } from '@/services/revenueService';
import { RevenueStatus, RevenueStatusLabels } from '@/types/revenue';
import { Skeleton } from '@/components/ui/skeleton';

export default function RevenueHistoryTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const {
    data: revenueData,
    isLoading,
    error,
    refetch
  } = useRevenueHistory(currentPage, pageSize);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const getStatusBadgeVariant = (status: RevenueStatus) => {
    switch (status) {
      case RevenueStatus.ACTIVE:
        return 'default' as const;
      case RevenueStatus.REFUNDED:
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
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
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !revenueData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="text-sm">Không thể tải lịch sử doanh thu</p>
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

  const revenues = revenueData?.content || [];
  const totalPages = revenueData?.totalPages || 0;
  const isFirstPage = revenueData?.first ?? true;
  const isLastPage = revenueData?.last ?? true;
  const totalElements = revenueData?.totalElements || 0;

  // Calculate totals for current page
  const pageTotal = revenues.reduce((sum, record) => sum + (Number(record?.totalAmount) || 0), 0);
  const pageInstructorEarnings = revenues.reduce((sum, record) => sum + (Number(record?.instructorEarning) || 0), 0);
  const pagePlatformFees = revenues.reduce((sum, record) => sum + (Number(record?.platformFee) || 0), 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lịch sử doanh thu khóa học
          </CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {revenues.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Chưa có doanh thu từ khóa học nào</p>
          </div>
        ) : (
          <>
            {/* Summary for current page */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 font-medium">Tổng doanh thu trang</div>
                <div className="text-xl font-bold text-blue-700">
                  {formatCurrency(pageTotal)}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 font-medium">Thu nhập của bạn</div>
                <div className="text-xl font-bold text-green-700">
                  {formatCurrency(pageInstructorEarnings)}
                </div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm text-orange-600 font-medium">Phí nền tảng</div>
                <div className="text-xl font-bold text-orange-700">
                  {formatCurrency(pagePlatformFees)}
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Khóa học</TableHead>
                    <TableHead className="text-right">Tổng tiền</TableHead>
                    <TableHead className="text-right">Thu nhập</TableHead>
                    <TableHead className="text-right">Phí nền tảng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revenues.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-sm">
                        {formatDate(record.createdDate)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="max-w-xs truncate" title={record.courseId}>
                          ID: {record.courseId.slice(0, 8)}...
                        </div>
                        <div className="text-xs text-gray-500">
                          Enrollment: {record.enrollmentId}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(record.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(record.instructorEarning)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-orange-600">
                        {formatCurrency(record.platformFee)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(record.status)}>
                          {RevenueStatusLabels[record.status]}
                        </Badge>
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
                  ({totalElements} bản ghi)
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
