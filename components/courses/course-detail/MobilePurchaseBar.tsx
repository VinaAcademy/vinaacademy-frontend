'use client'

import { Button } from '@/components/ui/button'
import { CourseDetailsResponse } from '@/types/course'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { enrollInCourse, EnrollmentRequest } from '@/services/enrollmentService'
import { useToast } from '@/hooks/use-toast'
import { useCart } from '@/context/CartContext'

interface MobilePurchaseBarProps {
  course: CourseDetailsResponse
}

export default function MobilePurchaseBar({ course }: MobilePurchaseBarProps) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isEnrolling, setIsEnrolling] = useState(false)

  // Handle enrollment - same logic as in PurchaseCard
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Bạn cần đăng nhập',
        description: 'Vui lòng đăng nhập để đăng ký khóa học',
        variant: 'destructive',
      })
      router.push(
        '/login?redirect=' + encodeURIComponent(window.location.pathname),
      )
      return
    }

    // For paid courses, redirect to checkout
    if (course.price > 0) {
      router.push(`/checkout?course=${course.id}`)
      return
    }

    // Process free course enrollment
    setIsEnrolling(true)
    try {
      const enrollmentData: EnrollmentRequest = {
        courseId: course.id.toString(),
      }

      await enrollInCourse(enrollmentData)
      toast({
        title: 'Đăng ký thành công!',
        description: 'Bạn đã đăng ký khóa học thành công.',
      })

      // Redirect to the course learning page
      router.push(`/learning/${course.slug}`)
    } catch (error) {
      console.error('Error enrolling:', error)
      toast({
        title: 'Đăng ký thất bại',
        description:
          'Có lỗi xảy ra khi đăng ký khóa học. Vui lòng thử lại sau.',
        variant: 'destructive',
      })
    } finally {
      setIsEnrolling(false)
    }
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t p-4 z-50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-bold">
            {Number(course.price ?? 0) === 0
              ? 'Miễn phí'
              : `${course.price.toLocaleString('vi-VN')}₫`}
          </p>
        </div>
        <Button
          onClick={handleEnroll}
          disabled={isEnrolling}
          className="bg-[#a435f0] hover:bg-[#8710d8] text-white py-3 px-6 rounded font-medium"
        >
          {isEnrolling
            ? 'Đang xử lý...'
            : course.price > 0
              ? 'Thanh toán ngay'
              : 'Đăng ký học ngay'}
        </Button>
      </div>
    </div>
  )
}
