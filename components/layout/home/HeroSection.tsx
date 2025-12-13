'use client'

import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { PlayCircle } from 'lucide-react'
import Image from 'next/image'

// 1. Import AOS và CSS
import AOS from 'aos'
import 'aos/dist/aos.css'

export default function HeroSection() {
  // 2. Khởi tạo AOS khi component mount
  useEffect(() => {
    AOS.init({
      duration: 1000, // Thời gian hiệu ứng (ms)
      once: true, // Chỉ chạy hiệu ứng 1 lần khi scroll xuống
    })
  }, [])

  return (
    <section className="relative w-full bg-transparent py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between relative">
        {/* Cột trái: Nội dung Text */}
        <div className="w-full md:w-1/2 space-y-8 z-10 text-center md:text-left">
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight"
            data-aos="fade-right" // Bay từ phải sang
          >
            Vina Academy: <br />
            <span className="text-indigo-500">Kỷ Nguyên Mới</span> Của Giáo Dục
            Số
          </h1>

          <p
            className="text-slate-500 text-lg md:text-xl max-w-xl mx-auto md:mx-0"
            data-aos="fade-right"
            data-aos-delay="200" // Trễ 200ms so với thẻ h1
          >
            Nền tảng học tập trực tuyến hàng đầu dành cho người Việt. Chúng tôi
            mang đến phương pháp học tập hiệu quả được hỗ trợ bởi công nghệ tiên
            tiến.
            <br />
            <span className="font-semibold text-indigo-500 italic mt-2 block">
              "Kiến tạo tri thức - Vững bước tương lai"
            </span>
          </p>

          <div
            className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start"
            data-aos="fade-up" // Bay từ dưới lên
            data-aos-delay="400"
          >
            {/* <Button className="bg-indigo-500 hover:bg-indigo-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-indigo-200 transition-transform hover:scale-105">
              Đăng ký ngay
            </Button> */}
            <button className="flex items-center gap-2 text-slate-700 font-medium hover:text-indigo-600 transition-colors group">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                <PlayCircle className="w-5 h-5 text-indigo-600" />
              </div>
              Tìm hiểu lộ trình
            </button>
          </div>
        </div>

        {/* Cột phải: Hình ảnh & Trang trí */}
        <div className="w-full md:w-1/2 relative flex justify-center md:justify-end mt-12 md:mt-0">
          {/* Background SVG Decoration */}
          <div
            className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 md:translate-x-0 pointer-events-none z-0"
            data-aos="fade-in"
            data-aos-duration="1500"
          >
            <svg
              width="600"
              height="600"
              viewBox="0 0 600 600"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-indigo-600/10"
            >
              <path
                d="M580 0H0V580C0 591.046 8.9543 600 20 600H580C591.046 600 600 591.046 600 580V20C600 8.95431 591.046 0 580 0Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="0.707107"
                y1="0.707107"
                x2="599.707"
                y2="599.707"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="150"
                y1="0"
                x2="600"
                y2="450"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Main Image Container */}
          <div
            className="relative z-10"
            data-aos="fade-left" // Ảnh chính bay từ trái sang
            data-aos-duration="1200"
          >
            <div className="rounded-full bg-indigo-50/50 absolute inset-4 z-0 animate-pulse"></div>
            <Image
              src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=600&auto=format&fit=crop"
              alt="Học viên Vina Academy"
              width={500}
              height={600}
              className="w-full max-w-md md:max-w-lg object-cover rounded-bl-[5rem] relative z-10 shadow-2xl"
            />
          </div>

          {/* Floating Icon 1 (Lightbulb - Top Right) */}
          <div
            className="absolute top-1/4 right-0 p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg z-20"
            data-aos="zoom-in" // Hiệu ứng phóng to
            data-aos-delay="600"
          >
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-indigo-600"
              >
                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 12 2a6 6 0 0 0-6 6c0 1 .5 2.5 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
                <path d="M9 18h6" />
                <path d="M10 22h4" />
              </svg>
            </div>
          </div>

          {/* Floating Icon 2 (Trophy - Bottom Left) */}
          <div
            className="absolute bottom-1/4 left-10 p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg z-20"
            data-aos="zoom-in"
            data-aos-delay="800"
          >
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-indigo-600"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            </div>
          </div>

          {/* Floating Icon 3 (File/Certificate - Bottom Right) */}
          <div
            className="absolute bottom-10 right-10 p-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg z-20"
            data-aos="zoom-in"
            data-aos-delay="1000"
          >
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-indigo-600"
              >
                <path d="M20 7h-3a2 2 0 0 1-2-2V2" />
                <path d="M9 18a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7l4 4v10a2 2 0 0 1-2 2Z" />
                <path d="M3 7.6v12.8A1.6 1.6 0 0 0 4.6 22h9.8" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Background Gradient */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-indigo-50/50 to-transparent -z-10"></div>
    </section>
  )
}
