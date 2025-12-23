'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getCourseBySlug } from '@/services/courseService'

export default function AddToCartPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const router = useRouter()
  const { addToCart, isInitialized } = useCart()
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const { toast } = useToast()
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>(
    'loading',
  )
  const processedRef = useRef(false)

  useEffect(() => {
    if (isAuthLoading) return
    if (isAuthenticated && !isInitialized) return

    if (processedRef.current) return
    processedRef.current = true

    const processAddToCart = async () => {
      try {
        const { slug } = await params
        if (!slug) {
          setStatus('error')
          router.push('/cart')
          return
        }

        const course = await getCourseBySlug(slug)
        if (!course) {
          setStatus('error')
          router.push('/cart')
          return
        }

        const success = await addToCart({
          courseId: course.id,
          price: course.price,
        })

        if (success) {
          setStatus('success')
          toast({
            title: 'Thành công',
            description: 'Đã thêm khóa học vào giỏ hàng',
          })
          router.push('/cart')
        } else {
          setStatus('error')
          router.push(`/courses/${slug}`)
        }
      } catch (error) {
        console.error('Error adding to cart:', error)
        setStatus('error')
        router.push('/cart')
      }
    }

    processAddToCart()
  }, [
    params,
    addToCart,
    router,
    toast,
    isAuthLoading,
    isAuthenticated,
    isInitialized,
  ])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600">Đang thêm vào giỏ hàng...</p>
      </div>
    </div>
  )
}
