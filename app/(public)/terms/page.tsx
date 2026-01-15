'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <Button
          variant="outline"
          className="mb-8 gap-2"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </Button>

        {/* Header */}
        <header className="mb-12 pb-8 border-b border-gray-200">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Điều khoản và Chính sách
          </h1>
          <p className="text-gray-600 mb-2">
            VinaAcademy - Nền tảng học trực tuyến hàng đầu
          </p>
          <p className="text-sm text-gray-500">
            Cập nhật lần cuối: Tháng 1 năm 2026
          </p>
        </header>

        {/* Table of Contents */}
        <div className="bg-blue-50 rounded-lg p-8 mb-12 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mục lục</h2>
          <ul className="space-y-3">
            <li>
              <a
                href="#terms"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                1. Điều khoản sử dụng
              </a>
            </li>
            <li>
              <a
                href="#privacy"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                2. Chính sách bảo mật
              </a>
            </li>
            <li>
              <a
                href="#payments"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                3. Chính sách thanh toán
              </a>
            </li>
            <li>
              <a
                href="#refund"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                4. Chính sách hoàn tiền
              </a>
            </li>
            <li>
              <a
                href="#intellectual"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                5. Quyền sở hữu trí tuệ
              </a>
            </li>
            <li>
              <a
                href="#liability"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                6. Giới hạn trách nhiệm
              </a>
            </li>
            <li>
              <a
                href="#contact"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                7. Liên hệ
              </a>
            </li>
          </ul>
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {/* Section 1: Terms */}
          <section id="terms">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
              1. Điều khoản sử dụng
            </h2>
            <p className="text-gray-700 mb-6">
              Bằng cách truy cập và sử dụng nền tảng VinaAcademy, bạn đồng ý bị
              ràng buộc bởi các điều khoản và chính sách này. Nếu bạn không đồng
              ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử
              dụng dịch vụ của chúng tôi.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Quyền và trách nhiệm của người dùng
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>
                Bạn phải cung cấp thông tin chính xác, đầy đủ và cập nhật khi
                đăng ký tài khoản
              </li>
              <li>
                Bạn chịu trách nhiệm bảo mật mật khẩu và các hoạt động trên tài
                khoản của mình
              </li>
              <li>
                Bạn không được sử dụng dịch vụ cho bất kỳ mục đích bất hợp pháp
                hoặc không được phép
              </li>
              <li>
                Bạn không được cố gắng truy cập trái phép vào bất kỳ phần nào
                của nền tảng
              </li>
              <li>
                Bạn không được tải lên nội dung bạo lực, đe dọa, quấy rối hoặc
                bất kỳ nội dung không phù hợp nào
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Quyền của VinaAcademy
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>
                VinaAcademy có quyền từ chối cấp hoặc hủy bỏ quyền truy cập nếu
                vi phạm các điều khoản này
              </li>
              <li>
                VinaAcademy có quyền tạm dừng hoặc chấm dứt tài khoản của bạn mà
                không cần thông báo trước
              </li>
              <li>
                VinaAcademy có quyền sửa đổi các dịch vụ hoặc các điều khoản này
                bất cứ lúc nào
              </li>
            </ul>
          </section>

          {/* Section 2: Privacy */}
          <section id="privacy">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
              2. Chính sách bảo mật
            </h2>
            <p className="text-gray-700 mb-6">
              Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Thông tin cá nhân
              của bạn sẽ được thu thập, sử dụng và bảo vệ theo các luật bảo vệ
              dữ liệu hiện hành.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Thông tin chúng tôi thu thập
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Thông tin đăng ký: tên, email, mật khẩu</li>
              <li>
                Thông tin hồ sơ: ảnh đại diện, tiểu sử, thông tin liên lạc
              </li>
              <li>Dữ liệu học tập: tiến độ khóa học, điểm số, hoạt động</li>
              <li>
                Thông tin thanh toán: chi tiết thẻ tín dụng (được xử lý an toàn
                bởi bên thứ ba)
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Cách chúng tôi sử dụng thông tin
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Cung cấp và cải thiện dịch vụ của chúng tôi</li>
              <li>
                Gửi thông báo về tài khoản của bạn hoặc các cập nhật khóa học
              </li>
              <li>Xử lý thanh toán và gửi biên lai</li>
              <li>Tuân thủ các yêu cầu pháp lý</li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
              <p className="text-gray-800">
                <strong>Bảo mật dữ liệu:</strong> Chúng tôi sử dụng các biện
                pháp bảo mật tiêu chuẩn ngành để bảo vệ thông tin của bạn khỏi
                truy cập trái phép.
              </p>
            </div>
          </section>

          {/* Section 3: Payments */}
          <section id="payments">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
              3. Chính sách thanh toán
            </h2>
            <p className="text-gray-700 mb-6">
              Tất cả các giao dịch thanh toán được xử lý một cách an toàn thông
              qua các cổng thanh toán được chứng nhận.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Phương thức thanh toán được chấp nhận
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>
                <strong>VNPAY</strong> - Cổng thanh toán trực tuyến hàng đầu
                Việt Nam
              </li>
              <li>
                <strong>Thẻ tín dụng / Thẻ ghi nợ</strong> - Sắp cập nhật
              </li>
              <li>
                <strong>Ví điện tử</strong> - Sắp cập nhật
              </li>
              <li>
                <strong>Chuyển khoản ngân hàng</strong> - Sắp cập nhật
              </li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Hóa đơn và biên lai
            </h3>
            <p className="text-gray-700">
              Hóa đơn sẽ được gửi cho bạn qua email sau khi thanh toán thành
              công. Bạn cũng có thể tải hóa đơn từ tài khoản VinaAcademy của
              mình.
            </p>
          </section>

          {/* Section 4: Refund */}
          <section id="refund">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
              4. Chính sách hoàn tiền
            </h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-6">
              <p className="text-gray-800">
                <strong>Thông báo:</strong> Tính năng hoàn tiền tạm thời chưa
                được cung cấp trên nền tảng VinaAcademy. Chúng tôi đang phát
                triển và sẽ triển khai dịch vụ này trong thời gian sắp tới.
              </p>
            </div>
          </section>

          {/* Section 5: Intellectual Property */}
          <section id="intellectual">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
              5. Quyền sở hữu trí tuệ
            </h2>
            <p className="text-gray-700 mb-6">
              Tất cả nội dung trên VinaAcademy bao gồm các bài giảng, video, tài
              liệu, v.v. được bảo vệ bởi luật bản quyền.
            </p>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Quyền của bạn
            </h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Bạn có quyền truy cập nội dung của khóa học mà bạn đã mua</li>
              <li>
                Bạn có thể tải xuống tài liệu cho mục đích sử dụng cá nhân
              </li>
              <li>Bạn KHÔNG được tái bản, phân phối hoặc bán lại nội dung</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Quyền của giáo viên
            </h3>
            <p className="text-gray-700">
              Các giáo viên trên VinaAcademy giữ toàn bộ quyền sở hữu trí tuệ
              đối với nội dung của họ. Không được sao chép hoặc sử dụng nội dung
              của họ mà không có sự cho phép.
            </p>
          </section>

          {/* Section 6: Liability */}
          <section id="liability">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
              6. Giới hạn trách nhiệm
            </h2>

            <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-6">
              <p className="text-gray-800 font-semibold">
                TUYÊN BỐ MIỄN TRỪ TRÁCH NHIỆM: Nền tảng VinaAcademy được cung
                cấp "như hiện tại" mà không có bất kỳ bảo đảm nào, dù là rõ ràng
                hay ngụ ý.
              </p>
            </div>

            <p className="text-gray-700 mb-4">
              VinaAcademy không chịu trách nhiệm cho:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Bất kỳ thiệt hại gián tiếp hoặc ngẫu nhiên nào</li>
              <li>Mất dữ liệu hoặc thất bại của dịch vụ</li>
              <li>Sự không có sẵn tạm thời của nền tảng</li>
              <li>Bất kỳ lỗi hoặc bỏ sót nào trong nội dung</li>
            </ul>
          </section>

          {/* Section 7: Contact */}
          <section id="contact">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
              7. Liên hệ
            </h2>
            <p className="text-gray-700 mb-6">
              Nếu bạn có bất kỳ câu hỏi nào về các điều khoản và chính sách này,
              vui lòng liên hệ với chúng tôi:
            </p>

            <ul className="space-y-3 text-gray-700 mb-8">
              <li>
                <strong>Email:</strong> support@vinaacademy.com
              </li>
              <li>
                <strong>Địa chỉ:</strong> VinaAcademy, Việt Nam
              </li>
              <li>
                <strong>Điện thoại:</strong> +84 (0) 123 456 789
              </li>
            </ul>

            <p className="text-gray-700 text-lg">
              Chúng tôi sẵn sàng giúp đỡ! Xin cảm ơn bạn đã sử dụng VinaAcademy.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p>
            &copy; 2026 VinaAcademy. Bảo lưu mọi quyền. |{' '}
            <button
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Quay lại trang trước
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
