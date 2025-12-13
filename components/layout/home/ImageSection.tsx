'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, BookOpen, Trophy, Lightbulb } from 'lucide-react'
import AOS from 'aos'
import 'aos/dist/aos.css'

const ImageSection = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
    })
  }, [])

  return (
    <section className="relative w-full py-20 bg-[#FEFDF9] overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 right-10 w-32 h-32 border-2 border-dashed border-indigo-200 rounded-full opacity-60 animate-spin-slow -z-10" />

      <div className="container mx-auto px-4 text-center z-10">
        <div className="max-w-3xl mx-auto mb-12">
          <div
            data-aos="fade-down"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Sparkles className="w-3 h-3" />
            <span>Education Revolution</span>
          </div>

          <h1
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6"
          >
            Nền Tảng Tri Thức Việt <br />
            <span className="relative inline-block text-indigo-600 mt-3">
              Khởi Nguồn Thành Công
              <svg
                className="absolute w-full h-3 -bottom-2 left-0 text-indigo-300"
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
            </span>
          </h1>

          <p
            data-aos="fade-up"
            data-aos-delay="300"
            className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
          >
            "Tri thức là sức mạnh, học thức là tương lai." <br />
            Chúng tôi giúp bạn cân bằng kiến thức và tối ưu hóa lộ trình học
            tập.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div
            data-aos="fade-in"
            data-aos-delay="800"
            className="absolute -top-8 -left-8 md:left-10 p-3 bg-white shadow-lg rounded-2xl border border-slate-100 animate-bounce delay-700 hidden md:block"
          >
            <BookOpen className="w-6 h-6 text-indigo-500" />
          </div>
          <div
            data-aos="fade-in"
            data-aos-delay="1000"
            className="absolute top-1/2 -right-12 md:-right-6 p-3 bg-white shadow-lg rounded-2xl border border-slate-100 animate-bounce delay-1000 hidden md:block"
          >
            <Trophy className="w-6 h-6 text-amber-500" />
          </div>
          <div
            data-aos="fade-in"
            data-aos-delay="1200"
            className="absolute -bottom-6 left-1/3 p-3 bg-white shadow-lg rounded-2xl border border-slate-100 animate-bounce delay-500 hidden md:block"
          >
            <Lightbulb className="w-6 h-6 text-yellow-500" />
          </div>

          <div
            data-aos="zoom-in"
            data-aos-delay="400"
            className="bg-white p-2 md:p-4 rounded-[2rem] shadow-2xl shadow-indigo-100/50 border border-slate-200"
          >
            <div className="relative rounded-[1.5rem] overflow-hidden bg-indigo-50/30">
              <Image
                src="/images/vina-slogan-weight.jpg"
                alt="Vina Academy Scale Comparison"
                width={1280}
                height={720}
                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-700 ease-in-out"
                priority
              />
            </div>
          </div>

          <div
            data-aos="fade-in"
            data-aos-delay="600"
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-indigo-900/5 blur-3xl rounded-[100%]"
          />
        </div>

        <div
          data-aos="fade-up"
          data-aos-delay="500"
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {/* <Button className="h-12 px-8 rounded-full bg-slate-900 text-white font-medium hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 transition-all text-base group">
            Đăng Ký Ngay
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            className="h-12 px-8 rounded-full border-2 border-slate-200 text-slate-600 font-medium hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all text-base"
          >
            Tìm Hiểu Thêm
          </Button> */}
        </div>
      </div>
    </section>
  )
}

export default ImageSection
