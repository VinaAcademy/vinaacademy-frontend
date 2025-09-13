import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { validateUrlReturn } from "@/services/paymentService";
import { createErrorToast } from "@/components/ui/toast-cus";

interface paymentResultProp {
  slug?: string;
}

export default function PaymentResult({ slug }: paymentResultProp) {
  const { useSearchParams } = require("next/navigation");
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [animation, setAnimation] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Loading progress animation
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newValue = prev + 1;
          return newValue > 100 ? 100 : newValue;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  useEffect(() => {
    async function verifyPaymentData() {
      setIsLoading(true);

      // Extract all URL parameters
      const params: { [key: string]: string } = {};

      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }

      try {
        // Validate the payment data with the backend
        const validationResult = await validateUrlReturn(params);

        if (validationResult) {
          // Check if the payment was successful
          const paymentStatus = validationResult;
          const isVNPay = searchParams.has("vnp_ResponseCode");

          if (isVNPay) {
            // VNPay success is determined by response code '00'
            setIsSuccess(
              searchParams.get("vnp_ResponseCode") === "00" &&
                paymentStatus === "COMPLETED"
            );
          } else {
            // For other payment methods
            setIsSuccess(
              searchParams.get("status") === "success" &&
                paymentStatus === "COMPLETED"
            );
          }
        } else {
          // If validation fails, show error toast
          createErrorToast("Xác nhận thất bại vui lòng kiểm tra lại");
          return;
        }
      } catch (error) {
        console.error("Payment validation error:", error);
        createErrorToast("Đã xảy ra lỗi trong quá trình xác nhận");
        return;
      } finally {
        // Simulate a minimum loading time for better UX
        setTimeout(() => {
          setIsLoading(false);
          // Trigger animation after loading
          setTimeout(() => setAnimation(true), 100);
        }, 1000);
      }
    }

    verifyPaymentData();
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="flex flex-col items-center max-w-md w-full px-4">
          <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${loadingProgress}%` }}
            ></div>
          </div>

          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Đang xác nhận
          </h2>
          <p className="text-gray-600 text-center">
            Vui lòng chờ trong khi chúng tôi xác nhận giao dịch của bạn
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10">
      <div
        className={`bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full mx-4 flex flex-col items-center transition-all duration-1000 ${
          animation
            ? "opacity-100 transform translate-y-0"
            : "opacity-0 transform translate-y-10"
        }`}
      >
        {isSuccess ? (
          <>
            <div className="w-28 h-28 relative mb-8">
              <div
                className={`absolute inset-0 bg-green-100 rounded-full flex items-center justify-center transition-all duration-1000 ${
                  animation ? "opacity-100 scale-100" : "opacity-0 scale-0"
                }`}
              >
                <svg
                  className="w-16 h-16 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              {animation && (
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 text-center">
              Thanh toán thành công
            </h1>

            <div className="w-16 h-1 bg-green-500 rounded-full mb-6"></div>

            <p className="text-gray-600 mb-8 text-center">
              Giao dịch của bạn đã được xác nhận và hoàn tất.
            </p>

            <div className="w-full bg-gray-100 h-px mb-8"></div>

            <div className="bg-green-50 p-4 rounded-xl w-full mb-8 border border-green-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    Cảm ơn đã chọn tin tưởng và thanh toán
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-28 h-28 relative mb-8">
              <div
                className={`absolute inset-0 bg-red-100 rounded-full flex items-center justify-center transition-all duration-1000 ${
                  animation ? "opacity-100 scale-100" : "opacity-0 scale-0"
                }`}
              >
                <svg
                  className="w-16 h-16 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              {animation && (
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3 text-center">
              Thanh toán thất bại
            </h1>

            <div className="w-16 h-1 bg-red-500 rounded-full mb-6"></div>

            <p className="text-gray-600 mb-8 text-center">
              Rất tiếc, giao dịch của bạn không thể hoàn tất. Vui lòng thử lại
              hoặc sử dụng phương thức thanh toán khác.
            </p>

            <div className="w-full bg-gray-100 h-px mb-8"></div>

            <div className="bg-red-50 p-4 rounded-xl w-full mb-8 border border-red-100">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">
                    Nếu tiền đã bị trừ, vui lòng liên hệ bộ phận hỗ trợ khách
                    hàng.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row w-full space-y-3 sm:space-y-0 sm:space-x-4">
          {isSuccess ? (
            <Link
              href="/"
              className="py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-xl text-center transition-all duration-300 w-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                ></path>
              </svg>
              Về trang chủ
            </Link>
          ) : (
            <>
              <Link
                href="/"
                className="py-4 px-6 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl text-center transition-all duration-300 w-full flex items-center justify-center shadow-md hover:shadow-lg transform hover:-translate-y-1"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  ></path>
                </svg>
                Về trang chủ
              </Link>
            </>
          )}
        </div>
      </div>

      <div
        className={`mt-8 text-center transition-all duration-1000 ${
          animation ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="text-sm text-gray-500 mb-2">
          © {new Date().getFullYear()} - Hệ thống thanh toán an toàn
        </div>
        <div className="flex items-center justify-center space-x-4 mt-3">
          <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0014.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"></path>
            </svg>
          </div>
          <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
            <svg
              className="w-4 h-4 text-blue-400"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.016 10.016 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
            </svg>
          </div>
          <div className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
            <svg
              className="w-4 h-4 text-pink-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
