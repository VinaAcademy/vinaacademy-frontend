'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, TrendingDown, Clock, DollarSign } from 'lucide-react';
import { useWalletBalance } from '@/hooks/useRevenue';
import { formatCurrency } from '@/services/revenueService';
import { Skeleton } from '@/components/ui/skeleton';

export default function WalletBalanceCard() {
  const { data: walletData, isLoading, error } = useWalletBalance();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !walletData) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="text-sm">Không thể tải thông tin ví</p>
            <p className="text-xs mt-1">Vui lòng thử lại sau</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const cards = [
    {
      title: "Số dư hiện tại",
      value: walletData.balance,
      icon: Wallet,
      className: "text-blue-600",
      bgClassName: "bg-blue-50",
      description: "Tổng số dư trong ví"
    },
    {
      title: "Có thể rút",
      value: walletData.availableBalance,
      icon: DollarSign,
      className: "text-green-600",
      bgClassName: "bg-green-50",
      description: "Số tiền có thể rút ngay"
    },
    {
      title: "Tổng thu nhập",
      value: walletData.totalEarnings,
      icon: TrendingUp,
      className: "text-emerald-600",
      bgClassName: "bg-emerald-50",
      description: "Tổng thu nhập từ khóa học"
    },
    {
      title: "Chờ rút",
      value: walletData.pendingWithdraw,
      icon: Clock,
      className: "text-orange-600",
      bgClassName: "bg-orange-50",
      description: "Số tiền đang chờ xử lý rút"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgClassName}`}>
                <IconComponent className={`h-4 w-4 ${card.className}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(card.value)}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Additional summary component for detailed breakdown
export function WalletSummary() {
  const { data: walletData, isLoading } = useWalletBalance();

  if (isLoading || !walletData) return null;

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Tổng quan tài chính
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Tổng thu nhập:</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(walletData.totalEarnings)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Đã rút:</span>
            <span className="font-semibold text-gray-700">
              {formatCurrency(walletData.totalWithdrawn)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-600">Đang chờ rút:</span>
            <span className="font-semibold text-orange-600">
              {formatCurrency(walletData.pendingWithdraw)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 pt-3">
            <span className="text-sm font-medium text-gray-700">Số dư hiện tại:</span>
            <span className="text-lg font-bold text-blue-600">
              {formatCurrency(walletData.balance)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
