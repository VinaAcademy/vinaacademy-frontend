'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import {
  ChevronDown,
  CheckCircle2,
  Users,
  BookOpen,
  Globe,
  DollarSign,
  Trophy,
  Clock,
  ChevronRight,
  Star,
  ArrowLeft,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { registerAsInstructor } from '@/services/instructorService'

const FAQ_ITEMS = [
  {
    question: 'Ai có thể trở thành giảng viên trên VinaAcademy?',
    answer:
      'Bất kỳ ai có chuyên môn trong lĩnh vực của mình và mong muốn chia sẻ kiến thức đều có thể trở thành giảng viên. Chúng tôi đánh giá đơn đăng ký dựa trên kinh nghiệm chuyên môn, kỹ năng giảng dạy và chất lượng nội dung khóa học mẫu.',
  },
  {
    question: 'Tôi cần chuẩn bị những gì để tạo khóa học?',
    answer:
      'Bạn cần chuẩn bị nội dung bài giảng, tài liệu hỗ trợ, bài tập thực hành và bài kiểm tra (nếu có). VinaAcademy cung cấp các công cụ để tạo và quản lý nội dung khóa học một cách dễ dàng.',
  },
  {
    question: 'Tôi được nhận bao nhiêu phần trăm từ doanh thu khóa học?',
    answer:
      'Giảng viên nhận được 80% doanh thu từ các khóa học của mình sau khi trừ phí giao dịch. Tỷ lệ này có thể tăng lên dựa trên hiệu suất và thâm niên của bạn trên nền tảng.',
  },
  {
    question: 'Tôi có thể sử dụng nội dung khóa học ở nơi khác không?',
    answer:
      'Bạn vẫn giữ bản quyền nội dung khóa học của mình. Tuy nhiên, khi đăng tải trên VinaAcademy, bạn cấp cho chúng tôi quyền phân phối nội dung đó thông qua nền tảng của chúng tôi.',
  },
  {
    question:
      'VinaAcademy có hỗ trợ giảng viên trong việc tiếp thị khóa học không?',
    answer:
      'Có, chúng tôi cung cấp các công cụ tiếp thị và quảng bá khóa học. Khóa học của bạn sẽ được giới thiệu đến những học viên phù hợp thông qua thuật toán gợi ý và các chiến dịch tiếp thị của chúng tôi.',
  },
]

export default function InstructorsPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading, user, refreshAuth } = useAuth()
  const { toast } = useToast()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  useEffect(() => {
    if (isAuthenticated && user) {
      const isInstructor = user.roles.some((role) => role.code === 'instructor')
      if (isInstructor) {
        router.push('/instructor/dashboard')
      }
    }
  }, [isAuthenticated, user])

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  const handleBecomeInstructor = async () => {
    // Kiểm tra đăng nhập
    if (!isAuthenticated) {
      toast({
        title: 'Bạn cần đăng nhập',
        description: 'Vui lòng đăng nhập để đăng ký làm giảng viên',
        variant: 'destructive',
      })
      router.push('/login?redirect=/instructors')
      return
    }

    // Kiểm tra xem người dùng đã là giảng viên chưa
    if (user && user.roles.some((role) => role.code === 'instructor')) {
      toast({
        title: 'Bạn đã là giảng viên',
        description: 'Đang chuyển đến trang quản lý khóa học của bạn',
      })
      router.push('/instructor/dashboard')
      return
    }

    // Hiển thị thông báo đang xử lý
    toast({
      title: 'Đang xử lý',
      description: 'Đang đăng ký làm giảng viên...',
    })

    try {
      // Gọi API đăng ký làm giảng viên
      await registerAsInstructor()
      // Cập nhật lại thông tin người dùng
      await refreshAuth()

      // Hiển thị thông báo thành công
      toast({
        title: 'Đăng ký thành công',
        description: 'Bạn đã trở thành giảng viên trên VinaAcademy',
      })

      // Chuyển hướng đến trang dashboard sau khi đã tạo thông báo
      router.push('/instructor/dashboard')
    } catch (error) {
      // Xử lý lỗi
      const err = error as any

      toast({
        title: 'Đăng ký thất bại',
        description:
          err?.response?.data?.message ||
          'Đã xảy ra lỗi khi đăng ký làm giảng viên',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="bg-white text-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="/images/instructor/hero_instructor.jpg"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center text-gray-300 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Trở về trang chủ
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Chia sẻ kiến thức, truyền cảm hứng và kiếm thu nhập
            </h1>
            <p className="text-xl mb-8">
              Tạo khóa học trực tuyến, tiếp cận hàng nghìn học viên và xây dựng
              sự nghiệp giảng dạy của bạn trên nền tảng học tập hàng đầu Việt
              Nam.
            </p>
            <button
              onClick={handleBecomeInstructor}
              className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-md font-medium text-lg transition-colors"
            >
              Bắt đầu giảng dạy ngay
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Tại sao nên trở thành giảng viên trên VinaAcademy?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-gray-800" />
              </div>
              <h3 className="text-2xl font-bold mb-2">50,000+</h3>
              <p className="text-gray-600">
                Học viên tích cực đang tìm kiếm khóa học mới
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="flex justify-center mb-4">
                <DollarSign className="h-12 w-12 text-gray-800" />
              </div>
              <h3 className="text-2xl font-bold mb-2">80%</h3>
              <p className="text-gray-600">
                Tỷ lệ doanh thu cho giảng viên từ mỗi khóa học
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
              <div className="flex justify-center mb-4">
                <BookOpen className="h-12 w-12 text-gray-800" />
              </div>
              <h3 className="text-2xl font-bold mb-2">500+</h3>
              <p className="text-gray-600">
                Khóa học đa dạng đang được giảng dạy trên nền tảng
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Quyền lợi khi trở thành giảng viên
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Globe className="h-8 w-8 text-gray-800" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Tiếp cận toàn cầu
                </h3>
                <p className="text-gray-600">
                  Khóa học của bạn sẽ được tiếp cận bởi học viên từ khắp nơi,
                  giúp mở rộng ảnh hưởng và xây dựng thương hiệu cá nhân.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-gray-800" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Thu nhập bền vững
                </h3>
                <p className="text-gray-600">
                  Nhận 80% doanh thu từ mỗi khóa học bán được. Một lần tạo nội
                  dung, thu nhập nhiều lần.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Trophy className="h-8 w-8 text-gray-800" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Xây dựng uy tín</h3>
                <p className="text-gray-600">
                  Được công nhận là chuyên gia trong lĩnh vực của bạn, tạo cơ
                  hội cho các hợp tác và dự án trong tương lai.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-gray-800" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Tự do thời gian</h3>
                <p className="text-gray-600">
                  Tự quyết định lịch trình giảng dạy, tạo và quản lý khóa học
                  theo tốc độ của riêng bạn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            Quy trình trở thành giảng viên
          </h2>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute top-0 left-6 bottom-0 w-1 bg-gray-200 md:left-1/2 md:-ml-0.5"></div>

              {/* Timeline items */}
              <div className="space-y-12">
                {/* Step 1 */}
                <div className="relative">
                  <div className="relative flex items-center md:justify-between">
                    <div className="flex items-center md:w-1/2 md:pr-8 md:justify-end">
                      <div className="hidden md:block md:pr-8">
                        <span className="text-5xl font-bold text-gray-300">
                          01
                        </span>
                        <h3 className="text-xl font-semibold mt-2">
                          Đăng ký trở thành giảng viên
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Nhấn nút đăng ký và trở thành một phần của đội ngũ
                          giảng viên VinaAcademy.
                        </p>
                      </div>
                      <div className="z-10 flex items-center justify-center w-12 h-12 bg-white rounded-full border-4 border-gray-200 md:mx-0">
                        <span className="text-xl font-bold md:hidden">1</span>
                        <CheckCircle2 className="h-6 w-6 text-gray-800 hidden md:block" />
                      </div>
                    </div>
                    <div className="pl-16 md:w-1/2 md:pl-8 md:flex md:flex-col md:items-start">
                      <span className="text-5xl font-bold text-gray-300 hidden md:block">
                        01
                      </span>
                      <div className="md:hidden">
                        <h3 className="text-xl font-semibold">
                          Đăng ký trở thành giảng viên
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Nhấn nút đăng ký và trở thành một phần của đội ngũ
                          giảng viên VinaAcademy.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="relative flex items-center md:justify-between">
                    <div className="flex items-center md:w-1/2 md:pr-8 md:justify-end">
                      <div className="hidden md:block md:pr-8 md:text-right">
                        <span className="text-5xl font-bold text-gray-300">
                          02
                        </span>
                        <h3 className="text-xl font-semibold mt-2">
                          Trở thành giảng viên
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Ngay lập tức bạn sẽ được cấp quyền truy cập vào hệ
                          thống quản lý khóa học của chúng tôi.
                        </p>
                      </div>
                      <div className="z-10 flex items-center justify-center w-12 h-12 bg-white rounded-full border-4 border-gray-200 md:mx-0">
                        <span className="text-xl font-bold md:hidden">2</span>
                        <CheckCircle2 className="h-6 w-6 text-gray-800 hidden md:block" />
                      </div>
                    </div>
                    <div className="pl-16 md:w-1/2 md:pl-8 md:flex md:flex-col">
                      <span className="text-5xl font-bold text-gray-300 hidden md:block">
                        02
                      </span>
                      <div className="md:hidden">
                        <h3 className="text-xl font-semibold">
                          Trở thành giảng viên
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Ngay lập tức bạn sẽ được cấp quyền truy cập vào hệ
                          thống quản lý khóa học của chúng tôi.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="relative flex items-center md:justify-between">
                    <div className="flex items-center md:w-1/2 md:pr-8 md:justify-end">
                      <div className="hidden md:block md:pr-8">
                        <span className="text-5xl font-bold text-gray-300">
                          03
                        </span>
                        <h3 className="text-xl font-semibold mt-2">
                          Tạo khóa học
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Sử dụng công cụ trực quan để xây dựng khóa học với
                          video, bài đọc, bài kiểm tra và tài liệu bổ sung.
                        </p>
                      </div>
                      <div className="z-10 flex items-center justify-center w-12 h-12 bg-white rounded-full border-4 border-gray-200 md:mx-0">
                        <span className="text-xl font-bold md:hidden">3</span>
                        <CheckCircle2 className="h-6 w-6 text-gray-800 hidden md:block" />
                      </div>
                    </div>
                    <div className="pl-16 md:w-1/2 md:pl-8 md:flex md:flex-col">
                      <span className="text-5xl font-bold text-gray-300 hidden md:block">
                        03
                      </span>
                      <div className="md:hidden">
                        <h3 className="text-xl font-semibold">Tạo khóa học</h3>
                        <p className="text-gray-600 mt-1">
                          Sử dụng công cụ trực quan để xây dựng khóa học với
                          video, bài đọc, bài kiểm tra và tài liệu bổ sung.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="relative flex items-center md:justify-between">
                    <div className="flex items-center md:w-1/2 md:pr-8 md:justify-end">
                      <div className="hidden md:block md:pr-8 md:text-right">
                        <span className="text-5xl font-bold text-gray-300">
                          04
                        </span>
                        <h3 className="text-xl font-semibold mt-2">
                          Xuất bản và kiếm tiền
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Sau khi nội dung được phê duyệt, khóa học của bạn sẽ
                          được xuất bản và bạn bắt đầu nhận thu nhập từ mỗi học
                          viên đăng ký.
                        </p>
                      </div>
                      <div className="z-10 flex items-center justify-center w-12 h-12 bg-white rounded-full border-4 border-gray-200 md:mx-0">
                        <span className="text-xl font-bold md:hidden">4</span>
                        <CheckCircle2 className="h-6 w-6 text-gray-800 hidden md:block" />
                      </div>
                    </div>
                    <div className="pl-16 md:w-1/2 md:pl-8 md:flex md:flex-col">
                      <span className="text-5xl font-bold text-gray-300 hidden md:block">
                        04
                      </span>
                      <div className="md:hidden">
                        <h3 className="text-xl font-semibold">
                          Xuất bản và kiếm tiền
                        </h3>
                        <p className="text-gray-600 mt-1">
                          Sau khi nội dung được phê duyệt, khóa học của bạn sẽ
                          được xuất bản và bạn bắt đầu nhận thu nhập từ mỗi học
                          viên đăng ký.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Giảng viên nói gì về chúng tôi
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
              </div>
              <p className="text-gray-600 mb-6">
                "Tôi đã có thể chia sẻ kiến thức chuyên môn với hàng nghìn học
                viên và tạo ra thu nhập đáng kể từ sự nghiệp giảng dạy trực
                tuyến."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/images/instructor/OIP.jpg"
                    alt="Instructor Avatar"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">Nguyễn Minh Tuấn</p>
                  <p className="text-sm text-gray-500">Chuyên gia JavaScript</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
              </div>
              <p className="text-gray-600 mb-6">
                "VinaAcademy đã giúp tôi chuyển đổi kiến thức chuyên môn thành
                nội dung giáo dục chất lượng cao và tiếp cận được nhiều học viên
                hơn."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/images/instructor/b52.jpg"
                    alt="Instructor Avatar"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">Trần Thị Mai</p>
                  <p className="text-sm text-gray-500">Chuyên gia Marketing</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4">
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
                <Star className="h-5 w-5 text-yellow-500" fill="currentColor" />
              </div>
              <p className="text-gray-600 mb-6">
                "Công cụ tạo khóa học trực quan và hỗ trợ từ đội ngũ VinaAcademy
                đã giúp tôi dễ dàng chuyển đổi từ giảng dạy truyền thống sang
                online."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/images/instructor/ba.jpeg"
                    alt="Instructor Avatar"
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">Phạm Văn Đức</p>
                  <p className="text-sm text-gray-500">
                    Giảng viên Thiết kế UX/UI
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Câu hỏi thường gặp
          </h2>

          <div className="max-w-3xl mx-auto space-y-4">
            {FAQ_ITEMS.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <span className="font-medium text-lg">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${expandedFaq === index ? 'transform rotate-180' : ''}`}
                  />
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all ${
                    expandedFaq === index ? 'max-h-96 pb-4' : 'max-h-0'
                  }`}
                >
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Bắt đầu hành trình giảng dạy của bạn ngay hôm nay
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Chia sẻ kiến thức, truyền cảm hứng cho người khác và kiếm thu nhập
            từ chuyên môn của bạn.
          </p>
          <button
            onClick={handleBecomeInstructor}
            className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-4 rounded-md font-medium text-lg transition-colors inline-flex items-center"
          >
            Đăng ký làm giảng viên
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  )
}
