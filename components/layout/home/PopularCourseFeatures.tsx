'use client'

import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Settings,
  Users,
  Video,
  BookOpen,
  MonitorPlay,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import { useRouter } from 'next/navigation'

const features = [
  {
    icon: Settings,
    title: 'Phát triển bản thân',
    description:
      'Không chỉ là kiến thức chuyên môn, chúng tôi giúp bạn rèn luyện tư duy, kỹ năng mềm và xây dựng lộ trình sự nghiệp.',
  },
  {
    icon: Users,
    title: 'Cố vấn 1 kèm 1',
    description:
      'Kết nối trực tiếp với các chuyên gia đầu ngành. Được hướng dẫn, giải đáp thắc mắc và sửa lỗi chi tiết trong suốt quá trình.',
  },
  {
    icon: Video,
    title: 'Video chất lượng cao',
    description:
        'Bài giảng được ghi hình chuyên nghiệp với độ phân giải HD. Âm thanh rõ ràng, hình ảnh sắc nét mang lại trải nghiệm học tập tuyệt vời.',
  },
  {
    icon: BookOpen,
    title: 'Học mọi lúc mọi nơi',
    description:
      'Hệ thống bài giảng đa nền tảng. Bạn có thể học trên Laptop, Tablet hay Smartphone bất cứ khi nào bạn rảnh rỗi.',
  },
  {
    icon: MonitorPlay,
    title: 'Đào tạo từ xa',
    description:
      'Xóa bỏ khoảng cách địa lý. Tiếp cận nền giáo dục chất lượng cao chuẩn quốc tế ngay tại nhà với chi phí tối ưu.',
  },
  {
    icon: Clock,
    title: 'Truy cập trọn đời',
    description:
      'Đăng ký một lần, sở hữu mãi mãi. Xem lại bài giảng bất cứ lúc nào và được cập nhật nội dung mới miễn phí.',
  },
]

export default function PopularCourseFeatures() {
  const router = useRouter();
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out-cubic',
    })
  }, [])

  return (
    <section className="relative w-full py-24 bg-[#FEFDF9] overflow-hidden">
      <div className="absolute top-10 left-10 w-24 h-24 border-2 border-dashed border-slate-200 rounded-full opacity-50" />
      <div className="absolute bottom-20 right-10 w-32 h-32 border-2 border-slate-100 rotate-12 rounded-3xl opacity-50" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div
            data-aos="fade-down"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-6 border border-indigo-100"
          >
            <Sparkles className="w-4 h-4" />
            <span className="uppercase tracking-wide">Giá trị cốt lõi</span>
          </div>

          <h2
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-6"
          >
            Tại sao bạn nên <br />{' '}
            <span className="text-indigo-600 relative inline-block">
              đồng hành
              <svg
                className="absolute w-full h-3 -bottom-1 left-0 text-indigo-200"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5 Q 50 10 100 5"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            </span>{' '}
            cùng chúng tôi?
          </h2>

          <p
            data-aos="fade-up"
            data-aos-delay="300"
            className="text-slate-500 text-lg"
          >
            Phương pháp học tập hiện đại, tập trung vào thực hành và kết quả
            thực tế.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="group relative bg-white p-8 rounded-[2rem] border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 ease-in-out"
            >
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-50 rounded-full scale-125 group-hover:scale-150 transition-transform duration-500 ease-out opacity-60" />

                  <feature.icon
                    strokeWidth={1.25}
                    className="relative w-20 h-20 text-slate-800 group-hover:text-indigo-600 transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                  {feature.description}
                </p>
              </div>

              <div className="absolute top-6 right-6 w-2 h-2 rounded-full bg-slate-100 group-hover:bg-indigo-400 transition-colors" />
            </div>
          ))}
        </div>

        <div
          className="flex justify-center"
          data-aos="zoom-in"
          data-aos-delay="600"
        >
          <Button className="h-auto bg-slate-900 hover:bg-indigo-600 text-white rounded-full px-10 py-5 text-lg font-medium transition-all duration-300 shadow-xl shadow-slate-200 hover:shadow-indigo-200 hover:-translate-y-1" onClick={() => router.push('/courses')}>
            Khám Phá Tất Cả Khóa Học
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  )
}
