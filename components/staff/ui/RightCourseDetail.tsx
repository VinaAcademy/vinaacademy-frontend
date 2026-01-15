'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Eye,
  BookOpen,
  DollarSign,
  User,
  Calendar,
  Tag,
  BarChart3,
  Layers,
  FileText,
  Globe,
  Clock,
} from 'lucide-react'
import { format } from 'date-fns'
import { CourseDetailsResponse } from '@/types/course'
import Image from 'next/image'
import { getImageUrl } from '@/utils/imageUtils'
import SafeHtml from '@/components/common/safe-html'

interface CourseDetailProps {
  selectedCourseId: string | null
  courseRequests: CourseDetailsResponse[]
  onPreview: (id: string) => void
  onApprove: (slug: string) => void
  onReject: (slug: string, nameg: string, id: string, recipid: string) => void
}

const RightCourseDetail = ({
  selectedCourseId,
  courseRequests,
  onPreview,
  onApprove,
  onReject,
}: CourseDetailProps) => {
  const selectedCourse = courseRequests.find(
    (item) => item.id === selectedCourseId,
  )

  if (!selectedCourseId || !selectedCourse) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-accent/5 h-full">
        <div className="mb-4 rounded-full bg-accent p-3">
          <Eye className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-lg">Chưa chọn khóa học</h3>
        <p className="text-center text-muted-foreground mt-2">
          Chọn một yêu cầu khóa học từ danh sách để xem chi tiết
        </p>
      </div>
    )
  }

  const courseDto = selectedCourse
  const instructor = courseDto.ownerInstructor?.fullName || 'Không xác định'
  const category = courseDto.categoryName
  const statusColor: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    PUBLISHED: 'bg-green-100 text-green-800 border-green-200',
    REJECTED: 'bg-red-100 text-red-800 border-red-200',
  }
  const statusText: Record<string, string> = {
    DRAFT: 'Bản nháp',
    PENDING: 'Đang chờ',
    PUBLISHED: 'Đã duyệt',
    REJECTED: 'Từ chối',
  }
  const levelText: Record<string, string> = {
    BEGINNER: 'Mới bắt đầu',
    INTERMEDIATE: 'Trung cấp',
    ADVANCED: 'Cao cấp',
  }

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(courseDto.price)
  const reformatImageUrl = getImageUrl(courseDto.image)

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex-1 overflow-auto p-6 border rounded-lg bg-accent/5">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-medium text-xl">Chi tiết khóa học</h3>
          {courseDto.status === 'PENDING' && (
            <div className="flex items-center gap-2">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white w-fit"
                onClick={() => onApprove(courseDto.slug)}
              >
                Phê duyệt
              </Button>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 w-fit"
                onClick={() =>
                  onReject(
                    courseDto.slug,
                    courseDto.name,
                    courseDto.id,
                    courseDto.ownerInstructor?.id || '',
                  )
                }
              >
                Từ chối
              </Button>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onPreview(selectedCourseId)}
            >
              <BookOpen className="h-4 w-4" />
              Xem chi tiết bài học
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {courseDto.image && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <Image
                fill
                src={reformatImageUrl}
                alt={courseDto.name}
                className="object-cover w-full h-full"
              />
              <div className="absolute top-3 right-3">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    statusColor[courseDto.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusText[courseDto.status] || courseDto.status}
                </span>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-semibold mb-2">{courseDto.name}</h2>
            <div className="flex items-center text-muted-foreground text-sm gap-2 mb-4">
              <Calendar className="h-4 w-4" />
              <span>
                Đã tạo: {format(new Date(courseDto.createdDate), 'dd/MM/yyyy')}
              </span>
            </div>
          </div>

          <div className="p-4 bg-white rounded-md border shadow-sm">
            <h4 className="font-medium text-base mb-3 pb-2 border-b">
              Thông tin cơ bản
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Giảng viên</p>
                  <p className="text-muted-foreground">{instructor}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Tag className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Danh mục</p>
                  <p className="text-muted-foreground">{category}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Giá khóa học</p>
                  <p className="text-muted-foreground">{formattedPrice}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BarChart3 className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Cấp độ</p>
                  <p className="text-muted-foreground">
                    {levelText[courseDto.level] || courseDto.level}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BookOpen className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Slug</p>
                  <p className="text-muted-foreground">{courseDto.slug}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Layers className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Số phần học</p>
                  <p className="text-muted-foreground">
                    {courseDto.totalSection} phần
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Số bài học</p>
                  <p className="text-muted-foreground">
                    {courseDto.totalLesson} bài
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Ngôn ngữ</p>
                  <p className="text-muted-foreground">{courseDto.language}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Tổng thời lượng</p>
                  <p className="text-muted-foreground">
                    {courseDto.estimatedTime || 0} giờ
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-md border shadow-sm">
            <h4 className="font-medium text-base mb-3">Mô tả khóa học</h4>
            <SafeHtml
              html={courseDto.description}
              className="text-sm text-muted-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RightCourseDetail
