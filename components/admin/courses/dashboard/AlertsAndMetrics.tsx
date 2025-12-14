'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

interface AlertsAndMetricsProps {
  metrics: {
    approvalRate: number
    avgApprovalTime: number
    rejectionRate: number
  }
  alerts: Array<{
    id: string
    type: 'warning' | 'error' | 'info'
    message: string
    count: number
    action?: string
    link?: string
  }>
}

export default function AlertsAndMetrics({
  metrics,
  alerts,
}: AlertsAndMetricsProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-blue-500" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Chỉ số hiệu suất</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Tỷ lệ phê duyệt</p>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.approvalRate}%
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Thời gian duyệt TB</p>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.avgApprovalTime} ngày
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Tỷ lệ từ chối</p>
                <p className="text-2xl font-bold text-red-600">
                  {metrics.rejectionRate}%
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Cần chú ý</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getAlertColor(alert.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.message}
                      </p>
                      {alert.count > 0 && (
                        <Badge variant="secondary" className="mt-2">
                          {alert.count} mục
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* {alert.link && (
                                        <Link href={alert.link}>
                                            <Button size="sm" variant="ghost">
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                    )} */}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
