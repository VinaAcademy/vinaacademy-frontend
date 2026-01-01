'use client'

import LoginForm, { LoginFormValues } from '@/components/ui/loginform'
import React, { useEffect, useState, Suspense } from 'react'
import { LoginCredentials } from '@/types/auth'
import { useAuth } from '@/context/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'

// Loading component for Suspense fallback
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <div className="w-16 h-16 relative mb-4">
          <div className="animate-pulse rounded-full h-full w-full bg-gray-200"></div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Vina Academy</h1>
        <div className="flex justify-center mt-4">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-blue-600 border-gray-300"></div>
        </div>
      </div>
    </div>
  )
}

// Component that uses useSearchParams
function LoginContent() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()

  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectToTarget = React.useCallback(() => {
    const redirectUrl = searchParams.get('redirect')
    router.push('/')
  }, [router, searchParams])

  useEffect(() => {
    if (isAuthenticated) {
      redirectToTarget()
    }
  }, [isAuthenticated, redirectToTarget])

  const handleSubmit = async (data: LoginFormValues) => {
    setError(null)
    setIsLoading(true)

    try {
      const credentials: LoginCredentials = {
        email: data.email,
        password: data.password,
      }

      const success = await login(credentials)

      if (success) {
        redirectToTarget()
      } else {
        setError('Email hoặc mật khẩu không đúng')
      }
    } catch (err) {
      console.error(err)
      setError('Đã xảy ra lỗi trong quá trình đăng nhập')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left side - illustration for desktop */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 text-white p-12 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-6">Welcome to Vina Academy</h1>
          <p className="text-lg opacity-90 mb-8">
            Nền tảng học trực tuyến hàng đầu với hàng ngàn khoá học chất lượng
            cao
          </p>
        </div>

        <div className="relative h-96 w-full">
          <Image
            src="/images/login-illustration.svg"
            alt="Login Illustration"
            fill
            className="object-contain"
          />
        </div>

        <div>
          <p className="text-sm opacity-75">
            © 2025 Vina Academy. Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <LoginForm
            heading="Vina Academy"
            subheading="Đăng nhập để tiếp tục học tập"
            logo={{
              url: '/',
              src: '/logo.png', // Update with your actual logo path
              alt: 'Vina Academy Logo',
            }}
            onSubmit={handleSubmit}
            isSubmitting={isLoading}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}

// Export wrapped in Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  )
}
