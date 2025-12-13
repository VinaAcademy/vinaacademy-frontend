'use client'

import React, { useEffect } from 'react'
import Image from 'next/image'
import {
  Quote,
  GraduationCap,
  Briefcase,
  Linkedin,
  Star,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import AOS from 'aos'
import 'aos/dist/aos.css'

const instructors = [
  {
    id: 1,
    name: 'TS. Nguyễn Lan Anh',
    role: 'Chuyên gia Tâm lý Giáo dục',
    image: '/images/instructor/sabrinacarpenter.jpg',
    quote:
      'Giáo dục không phải là đổ đầy một chiếc bình, mà là thắp lên một ngọn lửa.',
    education: 'Tiến sĩ Tâm lý học - ĐH Sư Phạm HN',
    experience: '15+ năm giảng dạy & tư vấn',
    color: 'bg-indigo-100',
    accent: 'text-indigo-600',
  },
  {
    id: 2,
    name: 'ThS. Trần Minh Khoa',
    role: 'Cố vấn Chiến lược & Soft Skills',
    image: '/images/instructor/billgate.jpg',
    quote:
      'Kỹ năng mềm quyết định 75% sự thành công của bạn trong kỷ nguyên số.',
    education: 'Thạc sĩ MBA - RMIT University',
    experience: 'Cựu HR Manager tại Top Corp',
    color: 'bg-amber-100',
    accent: 'text-amber-600',
  },
  {
    id: 3,
    name: 'Thầy Mark Zuckerberg',
    role: 'Giảng viên Tiếng Anh & Ielts',
    image: '/images/instructor/mark.jpg',
    quote: 'Ngôn ngữ là chìa khóa mở ra cánh cửa tri thức của nhân loại.',
    education: 'TESOL Certified - 8.5 IELTS',
    experience: 'Đào tạo 1000+ học viên đạt chuẩn',
    color: 'bg-rose-100',
    accent: 'text-rose-600',
  },
]

const InstructorSection = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
    })
  }, [])

  return (
    <section className="relative w-full py-24 bg-[#FEFDF9] overflow-hidden">
      <div
        className="absolute top-10 right-10 opacity-30"
        data-aos="fade-in"
        data-aos-duration="2000"
      >
        <svg
          width="100"
          height="100"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 10 C 30 40, 70 10, 90 40"
            stroke="#CBD5E1"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
          <circle cx="20" cy="80" r="5" fill="#CBD5E1" />
          <circle cx="80" cy="20" r="8" fill="#CBD5E1" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div
            data-aos="fade-down"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-6"
          >
            <Sparkles className="w-3 h-3" />
            <span>Education Revolution</span>
          </div>

          <h2
            data-aos="fade-up"
            data-aos-delay="200"
            className="text-3xl md:text-5xl font-bold text-slate-900 mb-6"
          >
            Học Từ Những <br />
            <span className="relative inline-block text-indigo-600 px-2 mt-3">
              Người Dẫn Đường
              <svg
                className="absolute -inset-1 w-[110%] h-[120%] text-indigo-200 -z-10"
                viewBox="0 0 200 60"
                preserveAspectRatio="none"
              >
                <path
                  d="M10,10 Q100,0 190,10 T190,50 Q100,60 10,50 T10,10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="10 5"
                />
              </svg>
            </span>
            Tâm Huyết Nhất
          </h2>
          <p
            data-aos="fade-up"
            data-aos-delay="300"
            className="text-slate-500 text-lg"
          >
            Đội ngũ giảng viên tại Vina Academy không chỉ có kiến thức chuyên
            môn sâu rộng mà còn có bề dày kinh nghiệm thực chiến.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {instructors.map((instructor, index) => (
            <div
              key={instructor.id}
              data-aos="fade-up"
              data-aos-delay={index * 150}
              className="group bg-white rounded-[2.5rem] p-6 border border-slate-200 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500 relative flex flex-col"
            >
              <div className="relative w-full aspect-square mb-6 flex items-center justify-center overflow-hidden rounded-[2rem]">
                <div
                  className={`absolute inset-0 w-full h-full ${instructor.color} opacity-60 rounded-[2rem] transform rotate-3 group-hover:rotate-0 transition-transform duration-500`}
                />

                <div className="relative w-[90%] h-[90%] overflow-hidden rounded-[1.5rem] bg-slate-200">
                  <Image
                    src={instructor.image}
                    alt={instructor.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col text-center md:text-left">
                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {instructor.name}
                </h3>
                <p className="text-slate-500 font-medium text-sm mb-4 uppercase tracking-wide">
                  {instructor.role}
                </p>

                <div className="relative bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                  <Quote
                    className={`absolute top-2 left-2 w-4 h-4 ${instructor.accent} opacity-40`}
                  />
                  <p className="text-slate-600 italic text-sm leading-relaxed pt-2 pl-1 relative z-10">
                    "{instructor.quote}"
                  </p>
                </div>

                <div className="space-y-3 mt-auto">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4 text-slate-500" />
                    </div>
                    <span className="font-medium">{instructor.education}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Briefcase className="w-4 h-4 text-slate-500" />
                    </div>
                    <span>{instructor.experience}</span>
                  </div>
                </div>
              </div>

              <div className="absolute top-6 right-6">
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full bg-white/80 backdrop-blur-sm border border-slate-100 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-16 text-center"
          data-aos="fade-up"
          data-aos-delay="600"
        >
          {/* <p className="text-slate-400 text-sm mb-4">
            Và hơn 20+ chuyên gia khác đang đồng hành cùng chúng tôi
          </p>
          <Button
            variant="outline"
            className="rounded-full px-8 border-slate-300 text-slate-600 hover:text-indigo-600 hover:border-indigo-600 transition-colors"
          >
            Xem Toàn Bộ Đội Ngũ
          </Button> */}
        </div>
      </div>
    </section>
  )
}

export default InstructorSection
