'use client'

import React, { useEffect } from 'react'
import {
  Monitor,
  Building2,
  BrainCircuit,
  Briefcase,
  BookOpen,
  Activity,
  ArrowLeft,
  ArrowRight,
  UserCheck,
  Lightbulb,
  Award,
  FileCheck,
  MoveRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

import AOS from 'aos'
import 'aos/dist/aos.css'
import { useCategories } from '@/providers'
import { ca } from 'date-fns/locale'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const initCategories = {
  'lap-trinh': {
    icon: <Monitor className="w-8 h-8" />,
    color: 'text-orange-400',
    bg: 'bg-orange-50',
  },
  'kinh-doanh': {
    icon: <Building2 className="w-8 h-8" />,
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  'tai-chinh-ke-toan': {
    icon: <BrainCircuit className="w-8 h-8" />,
    color: 'text-white',
    bg: 'bg-teal-700',
  },
  'cntt-phan-mem': {
    icon: <Briefcase className="w-8 h-8" />,
    color: 'text-pink-500',
    bg: 'bg-pink-50',
  },
  'nang-suat-van-phong': {
    icon: <BookOpen className="w-8 h-8" />,
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
  },
  'phat-trien-ca-nhan': {
    icon: <Activity className="w-8 h-8" />,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
}

const features = [
  {
    icon: <UserCheck className="w-6 h-6 text-teal-600" />,
    title: 'Học hỏi từ các chuyên gia hàng đầu.',
  },
  {
    icon: <Lightbulb className="w-6 h-6 text-yellow-500" />,
    title: 'Nâng cao kỹ năng của bạn ngay bây giờ.',
  },
  {
    icon: <Award className="w-6 h-6 text-green-500" />,
    title: 'Tham gia các khóa học chuyên nghiệp.',
  },
  {
    icon: <FileCheck className="w-6 h-6 text-purple-500" />,
    title: 'Nhận chứng chỉ đã được xác minh.',
  },
]

export default function TestSection() {
  const router = useRouter()
  const { categories, isLoading } = useCategories()
  const mergeCate = categories.length
    ? categories.slice(0, 6).map((cat) => ({
        ...cat,
        ...initCategories[cat.slug as keyof typeof initCategories],
      }))
    : []
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
    })
  }, [])

  return (
    <section className="w-full bg-slate-50 py-20 overflow-hidden rounded-sm mt-4">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-24">
          <div className="flex justify-between items-end mb-10">
            <div data-aos="fade-right">
              <p className="text-indigo-500 font-medium mb-2">
                Danh mục phổ biến
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                Các Chủ Đề Học Tập Hàng Đầu
              </h2>
            </div>
            <div className="flex gap-3" data-aos="fade-left">
              <Link
                href="categories"
                className="font-medium hover:text-indigo-500"
              >
                <div className="flex flex-row space-x-2">
                  <p>Xem tất cả</p> <MoveRight />
                </div>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {mergeCate.slice(0.6).map((cat, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="
                  group relative flex flex-col items-center justify-center p-6 rounded-3xl cursor-pointer transition-all duration-300 bg-white text-slate-600 hover:shadow-lg hover:-translate-y-1"
                onClick={() => router.push(`/categories/${cat.slug}`)}
              >
                <div className={`mb-4 p-3 rounded-full ${cat.bg}`}>
                  <div className={cat.color}>{cat.icon}</div>
                </div>

                <h3 className="font-bold text-center mb-1 text-slate-800">
                  {cat.name}
                </h3>
                <p className="text-sm text-slate-400">
                  {cat.coursesCount} Khóa học
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            className="space-y-8"
            data-aos="fade-right"
            data-aos-duration="1000"
          >
            <div>
              <p className="text-indigo-500 font-medium mb-2">
                Giới thiệu về công ty
              </p>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Bắt đầu hành trình học tập cùng Vina Academy.
              </h2>
              <p className="text-slate-500 leading-relaxed max-w-lg">
                Chúng tôi cung cấp đa dạng các khóa học chất lượng cao, được
                thiết kế bởi những chuyên gia đầu ngành. Nội dung luôn được cập
                nhật để đảm bảo bạn tiếp cận được những kiến thức mới nhất và
                thực tế nhất.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="mt-1 bg-white p-1 rounded-full shadow-sm">
                    {feature.icon}
                  </div>
                  <span className="text-slate-600 font-medium text-sm leading-tight">
                    {feature.title}
                  </span>
                </div>
              ))}
            </div>

            <Button
              className="bg-indigo-500 hover:bg-blue-600 text-white px-8 py-6 rounded-lg text-lg shadow-lg shadow-blue-200 transition-transform hover:scale-105"
              onClick={() => router.push('/courses')}
            >
              Xem Tất Cả Khóa Học
            </Button>
          </div>

          <div
            className="relative mt-10 lg:mt-0 flex justify-center lg:justify-end"
            data-aos="fade-left"
            data-aos-duration="1000"
          >
            <div className="absolute top-0 right-0 w-[80%] h-[90%] border border-orange-200 rounded-[3rem] -z-10 translate-x-4 -translate-y-4 hidden md:block"></div>

            <div className="absolute bottom-0 right-10 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>

            <div className="relative">
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white max-w-md">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=600&auto=format&fit=crop"
                  alt="Học viên đang học"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div
                className="absolute -bottom-12 -left-12 w-48 h-48 md:w-56 md:h-56 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-white hidden sm:block"
                data-aos="zoom-in"
                data-aos-delay="400"
              >
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=400&auto=format&fit=crop"
                  alt="Giảng viên hướng dẫn"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-pink-500/10 pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
