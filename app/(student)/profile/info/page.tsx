'use client'

import React, { useState, useRef, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Upload, KeyRound, Eye } from 'lucide-react'
import { profileFormSchema } from '@/lib/profile-schema'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar-shadcn'
import { Toaster } from '@/components/ui/sonner'
import { toast } from 'sonner'
import { PasswordChange } from '@/components/student/profile/PasswordChange'
import { uploadImage } from '@/services/imageService'
import { getImageUrl } from '@/utils/imageUtils'
import { updateUserInfo } from '@/services/profileService'
import { UpdateUserInfoRequest } from '@/types/profile-type'
import { UserDto } from '@/types/course'
import { User } from '@/types/auth'
import { createErrorToast, createSuccessToast } from '@/components/ui/toast-cus'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { Dropdown } from 'react-day-picker'

type ProfileFormValues = z.infer<typeof profileFormSchema>

export default function Home() {
  const {
    isAuthenticated,
    user,
    refreshAuth,
    isLoading: isAuthLoading,
  } = useAuth()
  const router = useRouter()
  // Default form values
  const defaultValues: Partial<ProfileFormValues> = {
    avatar: undefined,
    fullName: '',
    email: '',
    phone: '',
    description: '',
    dateOfBirth: undefined,
  }

  // Move all hooks to the top level
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  useEffect(() => {
    if (user) {
      // Populate form with user data
      form.reset({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        description: user.description || '',
        dateOfBirth: user.birthday ? new Date(user.birthday) : undefined,
      })

      // Set avatar preview if exists
      if (user.avatarUrl) {
        setAvatarPreview(getImageUrl(user.avatarUrl))
      }
    }
  }, [user, form])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create a preview URL for the selected file
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)

      // Update the form value
      form.setValue('avatar', file)
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  async function onSubmit(data: ProfileFormValues) {
    try {
      setIsSubmitting(true)

      let avatarId = null

      // Handle avatar upload if there's a new file
      if (data.avatar && data.avatar instanceof File) {
        const uploadedImage = await uploadImage(data.avatar)
        if (uploadedImage) {
          avatarId = uploadedImage.id // Store the image ID
          console.log('Ảnh đã được tải lên thành công: ', avatarId)
        } else {
          console.error('Không thể tải ảnh lên:')
        }
      }

      const requestData: UpdateUserInfoRequest = {
        fullName: data.fullName,
        phone: data.phone || null,
        avatarUrl: avatarId,
        birthday: data.dateOfBirth || null,
        description: data.description || null,
      }
      requestData.birthday?.setHours(16, 0, 0, 0)

      // Send update request using the provided function
      const updatedUser = await updateUserInfo(requestData)

      if (!updatedUser) {
        throw new Error('Không thể cập nhật thông tin người dùng')
      }

      // Update global auth state
      await refreshAuth()

      createSuccessToast('Hồ sơ của bạn đã được cập nhật thành công!')
    } catch (error) {
      console.error('Error updating profile:', error)
      createErrorToast('Không thể cập nhật hồ sơ. Vui lòng thử lại. ')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Early return for non-authenticated users
  if (!isAuthLoading && !isAuthenticated) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-center mb-4">
          Vui lòng đăng nhập để truy cập trang này.
        </div>
        <div className="text-center">
          Bạn không có quyền truy cập vào trang này.
        </div>
      </div>
    )
  }

  console.log('ava url', avatarPreview)

  return (
    <div className="w-full p-6 bg-gray-100 flex justify-center items-center overflow-hidden">
      <Card className="w-full max-w-4xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Chỉnh sửa hồ sơ cá nhân</CardTitle>
            <CardDescription>Cập nhật thông tin của bạn</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isAuthLoading && !user ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center">Đang tải thông tin...</div>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 w-full h-full"
                id="profile-form"
              >
                {/* Layout container - use grid instead of flex with w-1/2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left column - form fields */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Họ và tên</FormLabel>
                          <FormControl>
                            <Input placeholder="Nhập họ và tên" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Nhập địa chỉ email"
                              disabled
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Email không thể thay đổi
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Phone */}
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Số điện thoại</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="Nhập số điện thoại"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date of Birth */}
                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Ngày sinh</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={'outline'}
                                  className={cn(
                                    'w-full pl-3 text-left font-normal',
                                    !field.value && 'text-muted-foreground',
                                  )}
                                  type="button"
                                >
                                  {field.value
                                    ? format(field.value, 'dd/MM/yyyy')
                                    : 'Chọn ngày sinh'}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 overflow-hidden"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() ||
                                  date < new Date('1900-01-01')
                                }
                                captionLayout="dropdown"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="pt-2">
                      <div className="password-change-container">
                        <PasswordChange />
                      </div>
                    </div>
                  </div>

                  {/* Right column - avatar and description */}
                  <div className="space-y-4">
                    {/* Avatar Upload */}
                    <FormField
                      control={form.control}
                      name="avatar"
                      render={({ field: { value, onChange, ...field } }) => (
                        <FormItem className="flex flex-col items-center space-y-4">
                          <div
                            onClick={handleAvatarClick}
                            className="relative cursor-pointer group"
                          >
                            <Avatar className="w-48 h-48">
                              {avatarPreview ? (
                                <AvatarImage
                                  src={avatarPreview}
                                  alt="Avatar"
                                  className="object-cover"
                                />
                              ) : (
                                <AvatarFallback>
                                  {user?.fullName?.charAt(0) || 'U'}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Upload className="h-8 w-8 text-white" />
                            </div>
                          </div>

                          <FormControl>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileChange}
                              {...field}
                              ref={fileInputRef}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô tả</FormLabel>
                          <FormControl className="h-40">
                            <Textarea
                              placeholder="Viết một vài dòng giới thiệu về bạn"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Buttons row */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật Hồ sơ'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => router.push('/user/' + user?.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Xem hồ sơ
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
