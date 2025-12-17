'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from '@/components/ui/form'

//icon
import { FaUserShield } from 'react-icons/fa'
import { IoMdLock } from 'react-icons/io'

import DialogForgotPassword from './otp-dialog'
import Image from 'next/image'
import Link from 'next/link'

const formSchema = z.object({
  email: z
    .string()
    .nonempty('Email là bắt buộc')
    .email('Định dạng email không hợp lệ'),
  password: z
    .string()
    .nonempty('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  remember: z.boolean().optional(),
})

export type LoginFormValues = z.infer<typeof formSchema>

interface LoginFormProps {
  heading?: string
  subheading?: string
  logo?: {
    url: string
    src: string
    alt: string
  }
  loginText?: string
  googleText?: string
  signupText?: string
  signupUrl?: string
  onSubmit?: (data: LoginFormValues) => Promise<void>
  isSubmitting?: boolean
  error?: string | null
}

export default function LoginForm({
  heading = 'VN Academy',
  subheading = 'Đăng nhập ngay để trải nghiệm',
  logo = {
    url: '/',
    src: '/logo.svg',
    alt: 'Vina Academy Logo',
  },
  loginText = 'Đăng nhập',
  signupText = 'Chưa có tài khoản?',
  signupUrl = '/register',
  onSubmit,
  isSubmitting = false,
  error = null,
}: LoginFormProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  async function handleFormSubmit(data: LoginFormValues) {
    if (onSubmit) {
      await onSubmit(data)
    }
  }

  return (
    <section className="w-full py-6 md:py-12">
      <div className="container px-4 md:px-6">
        <div className="mx-auto grid w-full max-w-md gap-6">
          <div className="flex flex-col rounded-xl border bg-white shadow-sm transition-all p-6 md:p-8">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <Link href={logo.url} className="inline-flex items-center">
                <div className="relative h-14 w-14 md:h-16 md:w-16">
                  <Image
                    fill
                    src={logo.src}
                    alt={logo.alt}
                    className="object-contain"
                  />
                </div>
              </Link>
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {heading}
                </h1>
                <p className="text-sm md:text-base text-gray-500 mt-1">
                  {subheading}
                </p>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="grid gap-4"
              >
                {error && (
                  <div
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative text-sm"
                    role="alert"
                  >
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-sm font-medium">Email</Label>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <FaUserShield className="h-4 w-4" />
                          </span>
                          <Input
                            type="email"
                            placeholder="Nhập email của bạn"
                            className="pl-10 h-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-sm font-medium">Mật khẩu</Label>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            <IoMdLock className="h-4 w-4" />
                          </span>
                          <Input
                            type="password"
                            placeholder="Nhập mật khẩu của bạn"
                            className="pl-10 h-10"
                            passwordEye
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition"
                    onClick={() => setDialogOpen(true)}
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 mt-2 text-sm font-medium"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Đang đăng nhập...
                    </div>
                  ) : (
                    loginText
                  )}
                </Button>

                {/* <div className="relative mt-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white px-2 text-gray-500">hoặc</span>
                                    </div>
                                </div> */}

                {/* <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="w-full h-10 mt-2 border-gray-300 text-sm font-medium"
                                    disabled={isSubmitting}
                                >
                                    <FcGoogle className="mr-2 h-5 w-5" />
                                    {googleText}
                                </Button> */}
              </form>
            </Form>

            <DialogForgotPassword
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
            />

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-500">{signupText}</span>{' '}
              <Link
                href={signupUrl}
                className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
              >
                Đăng ký ngay
              </Link>
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              Bằng cách đăng nhập, bạn đồng ý với{' '}
              <a href="#" className="underline hover:text-blue-600">
                Điều khoản dịch vụ
              </a>{' '}
              và{' '}
              <a href="#" className="underline hover:text-blue-600">
                Chính sách riêng tư
              </a>{' '}
              của chúng tôi.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
