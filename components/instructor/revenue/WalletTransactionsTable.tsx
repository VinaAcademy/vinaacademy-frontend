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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, History, Filter, RefreshCw } from 'lucide-react';
import { useWalletTransactions } from '@/hooks/useRevenue';
import { formatCurrency, formatDate } from '@/services/revenueService';
import { 
  WalletTransactionType, 
  WalletTransactionTypeLabels 
} from '@/types/revenue';
import { Skeleton } from '@/components/ui/skeleton';

export default function WalletTransactionsTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [filterType, setFilterType] = useState<WalletTransactionType | 'all'>('all');

  const {
    data: transactionData,
    isLoading,
    error,
    refetch
  } = useWalletTransactions(
    currentPage,
    pageSize,
    filterType === 'all' ? undefined : filterType
  );

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value as WalletTransactionType | 'all');
    setCurrentPage(0); // Reset to first page when filtering
  };

  const getTransactionBadgeVariant = (type: WalletTransactionType) => {
    switch (type) {
      case WalletTransactionType.EARNING:
        return 'default' as const;
      case WalletTransactionType.PAYOUT:
        return 'secondary' as const;
      case WalletTransactionType.REFUND:
        return 'outline' as const;
      case WalletTransactionType.ADJUSTMENT:
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  const getAmountColor = (type: WalletTransactionType) => {
    switch (type) {
      case WalletTransactionType.EARNING:
      case WalletTransactionType.REFUND:
        return 'text-green-600';
      case WalletTransactionType.PAYOUT:
        return 'text-red-600';
      case WalletTransactionType.ADJUSTMENT:
        return 'text-orange-600';
      default:
        return 'text-gray-600';
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
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !transactionData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="text-sm">Không thể tải lịch sử giao dịch</p>
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

  const transactions = transactionData?.content || [];
  const totalPages = transactionData?.totalPages || 0;
  const isFirstPage = transactionData?.first ?? true;
  const isLastPage = transactionData?.last ?? true;
  const totalElements = transactionData?.totalElements || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Lịch sử giao dịch ví
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={filterType} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Lọc theo loại" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {Object.values(WalletTransactionType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {WalletTransactionTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Không có giao dịch nào</p>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Loại giao dịch</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead className="text-right">Số dư sau</TableHead>
                    <TableHead>Mô tả</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">
                        {formatDate(transaction.createdDate)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTransactionBadgeVariant(transaction.type)}>
                          {WalletTransactionTypeLabels[transaction.type]}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${getAmountColor(transaction.type)}`}>
                        {transaction.type === WalletTransactionType.PAYOUT ? '-' : '+'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(transaction.balanceAfter)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                        {transaction.description || 'Không có mô tả'}
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
                  ({totalElements} giao dịch)
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
