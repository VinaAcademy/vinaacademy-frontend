'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, History, TrendingUp, FileText } from 'lucide-react';
import WalletBalanceCard, { WalletSummary } from '@/components/instructor/revenue/WalletBalanceCard';
import WalletTransactionsTable from '@/components/instructor/revenue/WalletTransactionsTable';
import RevenueHistoryTable from '@/components/instructor/revenue/RevenueHistoryTable';
import PayoutRequestsTable from '@/components/instructor/revenue/PayoutRequestsTable';

export default function InstructorRevenuePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý doanh thu</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi thu nhập và quản lý việc rút tiền từ các khóa học của bạn
          </p>
        </div>
      </div>

      {/* Wallet Balance Overview */}
      <WalletBalanceCard />

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Lịch sử giao dịch</span>
            <span className="sm:hidden">Giao dịch</span>
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Doanh thu khóa học</span>
            <span className="sm:hidden">Doanh thu</span>
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Yêu cầu rút tiền</span>
            <span className="sm:hidden">Rút tiền</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Tổng quan ví</span>
            <span className="sm:hidden">Tổng quan</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <WalletTransactionsTable />
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <RevenueHistoryTable />
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <PayoutRequestsTable />
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-1">
            <WalletSummary />
            
            {/* Additional Summary Cards */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Thông tin quan trọng</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Số tiền rút tối thiểu:</strong> 100,000 VNĐ
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Thời gian xử lý:</strong> 1-3 ngày làm việc cho các yêu cầu rút tiền
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Phí nền tảng:</strong> Được tự động tính từ doanh thu khóa học
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <strong>Hỗ trợ:</strong> Liên hệ admin nếu có vấn đề với việc rút tiền
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
