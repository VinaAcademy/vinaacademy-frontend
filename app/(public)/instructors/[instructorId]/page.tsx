'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Star,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Mail,
  Users,
  Award,
  Calendar,
  Globe,
} from 'lucide-react'
import { InstructorInfoDto } from '@/types/instructor'
import { getInstructorById } from '@/services/instructorService'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/common/spinner'
import { getImageUrl } from '@/utils/imageUtils'
import { useCourses } from '@/hooks/useCourses'
import { formatCurrency } from '@/utils/commonUtils'

export default function PublicInstructorPage() {
  const { instructorId } = useParams()

  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(6) // Số khóa học trên mỗi trang

  const [instructor, setInstructor] = useState<InstructorInfoDto | null>(null)
  const [loading, setLoading] = useState(true)

  // Use useCourses hook to fetch courses
  const {
    courses,
    loading: loadingCourses,
    totalPages,
    totalItems: totalCourses,
  } = useCourses({
    instructorId: instructorId as string,
    page: currentPage,
    size: pageSize,
    sortBy: 'createdDate',
    sortDirection: 'desc',
    status: 'PUBLISHED',
  })

  useEffect(() => {
    async function fetchInstructorData() {
      setLoading(true)
      try {
        // Fetch instructor data
        const instructorData = await getInstructorById(instructorId as string)
        setInstructor(instructorData)
      } catch (error) {
        console.error('Error fetching instructor data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (instructorId) fetchInstructorData().then((r) => r)
  }, [instructorId])

  // Xử lý chuyển trang
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    // Scroll lên đầu phần danh sách khóa học
    const courseListElement = document.getElementById('course-list')
    if (courseListElement) {
      courseListElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!instructor) {
    return (
      <div className="text-center text-gray-500 py-16 text-lg">
        Không tìm thấy thông tin giảng viên.
      </div>
    )
  }

  return (
    <>
      {/* Hero Banner - Điều chỉnh padding top nếu header là fixed */}
      <div className="relative w-full bg-black overflow-hidden pt-16 before:absolute before:inset-0 before:bg-gradient-to-r before:from-gray-900/90 before:via-gray-900/80 before:to-black/70 before:z-10">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-[url('/images/instructor-bg.jpg')] bg-cover bg-center bg-no-repeat blur-sm scale-105"></div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-20">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar with glowing effect */}
            <div className="group relative mb-4 md:mb-0">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-50 group-hover:opacity-70 blur-md transition duration-300"></div>
              <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-white shadow-xl flex-shrink-0">
                <Image
                  src={getImageUrl(
                    instructor.avatarUrl || '/images/default-avatar.png',
                  )}
                  alt={instructor.fullName || ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 160px, 208px"
                  priority
                />
              </div>
            </div>

            {/* Instructor Info and Social Links - With more interactive elements */}
            <div className="text-white flex-1 text-center md:text-left">
              <div className="space-y-3 md:space-y-4">
                <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs text-white/90 font-medium tracking-wider mb-1">
                  Giảng viên Chuyên nghiệp
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-bold mb-1 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                    {instructor.fullName}
                  </h1>
                  <p className="text-gray-300 text-lg mb-1">
                    @{instructor.username}
                  </p>
                  {/* Email display */}
                  <p className="text-gray-300 text-sm mb-3 flex items-center justify-center md:justify-start gap-2">
                    <Mail className="h-3.5 w-3.5" />
                    <span>
                      {instructor.email || 'email@vinaacademy.edu.vn'}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
                    <BookOpen className="h-4 w-4 text-gray-300" />
                    <span className="font-medium text-gray-100">
                      {totalCourses} khóa học
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-xl px-4 py-2 border border-white/10">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span className="font-medium text-gray-100">
                      4.8 Đánh giá
                    </span>
                  </div>
                </div>

                {/* Social Media Links - Now with hover effects and contact button */}
                <div className="flex gap-3 mt-4 justify-center md:justify-start items-center">
                  <Link
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-white/10 hover:-translate-y-1"
                    aria-label="Facebook"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </Link>
                  <Link
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-white/10 hover:-translate-y-1"
                    aria-label="Twitter"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
                  </Link>
                  <Link
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white/10 hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-white/10 hover:-translate-y-1"
                    aria-label="LinkedIn"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  </Link>

                  {/* Contact button moved here */}
                  <Button className="bg-white hover:bg-gray-100 text-black font-medium rounded-full flex items-center gap-2 shadow-lg shadow-gray-900/20 hover:scale-105 transition-all duration-200 ml-2">
                    <Mail className="h-4 w-4" />
                    <span>Liên hệ</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Info Cards - Now with better visual appeal */}
        <div className="grid grid-cols-1 gap-6 mb-12 -mt-8 md:-mt-12 relative z-30">
          {/* About Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 transform hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col md:flex-row">
              <div className="md:flex-[3] p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Users className="h-6 w-6 text-gray-700" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Giới thiệu
                  </h2>
                </div>
                <div className="text-gray-700 prose max-w-none">
                  {instructor.description ? (
                    <div className="space-y-4">
                      <p className="leading-relaxed text-gray-700">
                        {instructor.description}
                      </p>
                      <div className="pt-4 flex flex-wrap gap-3">
                        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                          Chuyên ngành CNTT
                        </span>
                        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                          Front-end Developer
                        </span>
                        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                          UI/UX Design
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">
                      Chưa có thông tin giới thiệu.
                    </p>
                  )}
                </div>
              </div>

              {/* Stats Section - Right Side with visual enhancements */}
              <div className="md:flex-[1.2] bg-gray-50 p-6 md:p-8 border-t md:border-t-0 md:border-l border-gray-100 flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gray-100 p-2 rounded-lg">
                    <Award className="h-6 w-6 text-gray-700" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Thống kê</h2>
                </div>

                <div className="space-y-5 flex-1">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600 flex items-center gap-2.5">
                      <div className="bg-gray-100 p-1.5 rounded-md">
                        <BookOpen className="h-4 w-4 text-gray-700" />
                      </div>
                      <span>Tổng khóa học</span>
                    </span>
                    <span className="font-bold text-gray-900 text-lg">
                      {totalCourses}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600 flex items-center gap-2.5">
                      <div className="bg-gray-100 p-1.5 rounded-md">
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                      <span>Đánh giá</span>
                    </span>
                    <div className="flex items-center gap-1 font-bold text-gray-900 text-lg">
                      4.8
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3.5 w-3.5 ${star <= 4 ? 'text-yellow-400 fill-yellow-400' : star <= 4.8 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
                    <span className="text-gray-600 flex items-center gap-2.5">
                      <div className="bg-gray-100 p-1.5 rounded-md">
                        <Calendar className="h-4 w-4 text-gray-700" />
                      </div>
                      <span>Tham gia</span>
                    </span>
                    <span className="font-bold text-gray-900 text-lg">
                      10/2023
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-gray-600 flex items-center gap-2.5">
                      <div className="bg-gray-100 p-1.5 rounded-md">
                        <Globe className="h-4 w-4 text-gray-700" />
                      </div>
                      <span>Ngôn ngữ</span>
                    </span>
                    <span className="font-bold text-gray-900 text-lg">
                      Tiếng Việt
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses List Header with enhanced styling */}
        <section id="course-list" className="mb-16">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gray-900 text-white p-2.5 rounded-xl">
                <BookOpen className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Các khóa học của giảng viên
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-gray-500 text-sm">
                Tổng cộng:{' '}
                <span className="font-bold text-black">
                  {totalCourses} khóa học
                </span>
              </span>
              <span className="bg-gray-900 text-white px-4 py-1.5 rounded-full font-medium text-sm">
                Trang {currentPage + 1} / {totalPages || 1}
              </span>
            </div>
          </div>

          {loadingCourses ? (
            <div className="flex justify-center items-center min-h-[250px] bg-white rounded-xl shadow-sm border border-gray-100 py-8">
              <Spinner size="md" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-gray-500 text-center py-16 bg-white rounded-xl shadow-md">
              <div className="flex flex-col items-center">
                <BookOpen className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-lg font-medium">Chưa có khóa học nào</p>
                <p className="text-sm mt-2">
                  Giảng viên này chưa tạo khóa học nào.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.slug}`}
                  className="group block bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden transform hover:-translate-y-1"
                >
                  <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                    <Image
                      src={
                        getImageUrl(course.image) ||
                        '/images/course-default.jpg'
                      }
                      alt={course.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    {Number(course.price ?? 0) === 0 && (
                      <div className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        MIỄN PHÍ
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col h-[140px]">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                      {course.name}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 mb-2">
                      <span className="flex items-center mr-3">
                        <BookOpen className="h-3 w-3 mr-1" />
                        {course.level}
                      </span>
                      {course.rating > 0 && (
                        <span className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          {course.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-end mt-auto">
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                        {course.level}
                      </span>
                      <span className="font-bold text-gray-900 text-base">
                        {formatCurrency(course.price)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center mt-10 gap-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="flex items-center gap-1 rounded-full border-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Trước</span>
              </Button>
              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageToShow
                  if (totalPages <= 5) {
                    pageToShow = i
                  } else if (currentPage < 2) {
                    pageToShow = i
                  } else if (currentPage > totalPages - 3) {
                    pageToShow = totalPages - 5 + i
                  } else {
                    pageToShow = currentPage - 2 + i
                  }

                  if (pageToShow >= 0 && pageToShow < totalPages) {
                    return (
                      <Button
                        key={pageToShow}
                        variant={
                          currentPage === pageToShow ? 'default' : 'outline'
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageToShow)}
                        className={`w-8 h-8 p-0 font-semibold rounded-full border-2 ${currentPage === pageToShow ? 'bg-black text-white hover:bg-gray-800' : ''}`}
                      >
                        {pageToShow + 1}
                      </Button>
                    )
                  }
                  return null
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handlePageChange(Math.min(totalPages - 1, currentPage + 1))
                }
                disabled={currentPage >= totalPages - 1}
                className="flex items-center gap-1 rounded-full border-2"
              >
                <span className="hidden sm:inline">Tiếp</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
