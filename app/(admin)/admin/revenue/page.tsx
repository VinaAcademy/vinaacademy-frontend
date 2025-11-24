'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  UserCheck, 
  RefreshCcw, 
  Settings 
} from 'lucide-react';
import AdminRevenueDashboard from '@/components/admin/revenue/AdminRevenueDashboard';
import AdminPayoutApproval from '@/components/admin/revenue/AdminPayoutApproval';
import AdminRefundForm from '@/components/admin/revenue/AdminRefundForm';

export default function AdminRevenuePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý doanh thu</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi tổng quan doanh thu, duyệt yêu cầu rút tiền và xử lý hoàn tiền
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Tổng quan</span>
            <span className="sm:hidden">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Duyệt rút tiền</span>
            <span className="sm:hidden">Duyệt</span>
          </TabsTrigger>
          <TabsTrigger value="refunds" className="flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Hoàn tiền</span>
            <span className="sm:hidden">Refund</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Cài đặt</span>
            <span className="sm:hidden">Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <AdminRevenueDashboard />
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <AdminPayoutApproval />
        </TabsContent>

        <TabsContent value="refunds" className="space-y-4">
          <AdminRefundForm />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          {/* Settings content - you can implement this later */}
          <div className="text-center py-12 text-gray-500">
            <Settings className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Cài đặt hệ thống</h3>
            <p>Chức năng này sẽ được phát triển trong phiên bản tiếp theo</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
