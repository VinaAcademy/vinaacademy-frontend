'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText, 
  CreditCard, 
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useRevenueDashboard } from '@/hooks/useRevenue';
import { formatCurrency } from '@/services/revenueService';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminRevenueDashboard() {
  const { data: dashboardData, isLoading, error } = useRevenueDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[120px]" />
                <Skeleton className="h-3 w-[80px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="text-sm">Không thể tải dữ liệu dashboard</p>
            <p className="text-xs mt-1">Vui lòng thử lại sau</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const cards = [
    {
      title: "Tổng doanh thu",
      value: dashboardData.totalRevenue,
      icon: TrendingUp,
      className: "text-green-600",
      bgClassName: "bg-green-50",
      description: "Tổng doanh thu từ tất cả khóa học"
    },
    {
      title: "Phí nền tảng",
      value: dashboardData.totalPlatformFee,
      icon: DollarSign,
      className: "text-blue-600",
      bgClassName: "bg-blue-50",
      description: "Tổng phí thu được từ nền tảng"
    },
    {
      title: "Thu nhập giảng viên",
      value: dashboardData.totalInstructorEarnings,
      icon: Users,
      className: "text-purple-600",
      bgClassName: "bg-purple-50",
      description: "Tổng thu nhập đã trả cho giảng viên"
    },
    {
      title: "Đang chờ rút",
      value: dashboardData.totalPendingPayouts,
      icon: Clock,
      className: "text-orange-600",
      bgClassName: "bg-orange-50",
      description: "Số tiền đang chờ xử lý rút"
    },
    {
      title: "Đã thanh toán",
      value: dashboardData.totalCompletedPayouts,
      icon: CheckCircle2,
      className: "text-emerald-600",
      bgClassName: "bg-emerald-50",
      description: "Tổng số tiền đã rút thành công"
    },
    {
      title: "YC chờ duyệt",
      value: dashboardData.pendingPayoutRequests,
      icon: FileText,
      className: "text-yellow-600",
      bgClassName: "bg-yellow-50",
      description: "Số yêu cầu rút tiền chờ duyệt",
      isCount: true
    },
    {
      title: "Tổng giảng viên",
      value: dashboardData.totalInstructors,
      icon: Users,
      className: "text-indigo-600",
      bgClassName: "bg-indigo-50",
      description: "Số lượng giảng viên hoạt động",
      isCount: true
    },
    {
      title: "Tổng giao dịch",
      value: dashboardData.totalTransactions,
      icon: CreditCard,
      className: "text-gray-600",
      bgClassName: "bg-gray-50",
      description: "Tổng số giao dịch trong hệ thống",
      isCount: true
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Statistics Cards */}
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
                  {card.isCount 
                    ? card.value.toLocaleString('vi-VN')
                    : formatCurrency(card.value)
                  }
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Phân tích doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-green-700 font-medium">Tỷ lệ phí nền tảng:</span>
                <span className="text-sm font-bold text-green-800">
                  {dashboardData.totalRevenue > 0 
                    ? ((dashboardData.totalPlatformFee / dashboardData.totalRevenue) * 100).toFixed(1)
                    : 0
                  }%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-700 font-medium">Thu nhập trung bình/GV:</span>
                <span className="text-sm font-bold text-blue-800">
                  {dashboardData.totalInstructors > 0
                    ? formatCurrency(dashboardData.totalInstructorEarnings / dashboardData.totalInstructors)
                    : formatCurrency(0)
                  }
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-purple-700 font-medium">Giao dịch trung bình:</span>
                <span className="text-sm font-bold text-purple-800">
                  {dashboardData.totalTransactions > 0
                    ? formatCurrency(dashboardData.totalRevenue / dashboardData.totalTransactions)
                    : formatCurrency(0)
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trạng thái thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                <span className="text-sm text-orange-700 font-medium">Chờ xử lý:</span>
                <div className="text-right">
                  <div className="text-sm font-bold text-orange-800">
                    {formatCurrency(dashboardData.totalPendingPayouts)}
                  </div>
                  <div className="text-xs text-orange-600">
                    {dashboardData.pendingPayoutRequests} yêu cầu
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                <span className="text-sm text-emerald-700 font-medium">Đã hoàn tất:</span>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-800">
                    {formatCurrency(dashboardData.totalCompletedPayouts)}
                  </div>
                  <div className="text-xs text-emerald-600">
                    Tỷ lệ: {
                      (dashboardData.totalPendingPayouts + dashboardData.totalCompletedPayouts) > 0
                        ? ((dashboardData.totalCompletedPayouts / (dashboardData.totalPendingPayouts + dashboardData.totalCompletedPayouts)) * 100).toFixed(1)
                        : 0
                    }%
                  </div>
                </div>
              </div>
              {dashboardData.pendingPayoutRequests > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700 font-medium">
                      Cần xử lý {dashboardData.pendingPayoutRequests} yêu cầu rút tiền
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
