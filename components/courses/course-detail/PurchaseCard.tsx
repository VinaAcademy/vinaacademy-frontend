"use client";

import { Button } from "@/components/ui/button";
import { CourseDetailsResponse, SectionDto, UserDto } from "@/types/course";
import {
  Book,
  Clock,
  Globe,
  Play,
  Share2,
  ShoppingCart,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  enrollInCourse,
  checkEnrollment,
  EnrollmentRequest,
} from "@/services/enrollmentService";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/context/CartContext";
import { getImageUrl } from "@/utils/imageUtils";

interface PurchaseCardProps {
  course: CourseDetailsResponse;
  instructors: UserDto[];
  sections: SectionDto[];
}

export default function PurchaseCard({
  course,
  instructors,
  sections,
}: PurchaseCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { addToCart, cartItems } = useCart();
  const router = useRouter();
  const { toast } = useToast();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  // Calculate total course duration in seconds
  const totalDuration = course.sections.reduce((total, section) => {
    return (
      total +
      (section.lessons?.reduce((sectionTotal, lesson) => {
        return sectionTotal + (lesson.videoDuration || 0);
      }, 0) ?? 0)
    );
  }, 0);

  // Format duration to hours and minutes
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? `${hours} giờ ` : ""}${minutes} phút`;
  };

  // Check if user is already enrolled
  useEffect(() => {
    const checkUserEnrollment = async () => {
      if (isAuthenticated && course.id) {
        try {
          const enrolled = await checkEnrollment(course.id.toString());
          setIsEnrolled(enrolled);
        } catch (error) {
          console.error("Error checking enrollment:", error);
        }
      }
    };

    checkUserEnrollment();
  }, [isAuthenticated, course.id]);

  // Check if course is already in cart
  useEffect(() => {
    if (isAuthenticated && course.id && cartItems.length > 0) {
      const courseInCart = cartItems.some(
        (item) => item.courseId === course.id.toString()
      );
      setIsInCart(courseInCart);
    }
  }, [isAuthenticated, course.id, cartItems]);

  // Handle enrollment
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Bạn cần đăng nhập",
        description: "Vui lòng đăng nhập để đăng ký khóa học",
        variant: "destructive",
      });
      router.push(
        "/login?redirect=" + encodeURIComponent(window.location.pathname)
      );
      return;
    }

    // Nếu khóa học có giá > 0 thì chuyển đến trang thanh toán
    if (course.price > 0) {
      router.push(`/checkout?course=${course.id}`);
      return;
    }

    // Tiếp tục xử lý đăng ký miễn phí
    setIsEnrolling(true);
    try {
      const enrollmentData: EnrollmentRequest = {
        courseId: course.id.toString(),
      };

      await enrollInCourse(enrollmentData);
      setIsEnrolled(true);
      toast({
        title: "Đăng ký thành công!",
        description: "Bạn đã đăng ký khóa học thành công.",
      });

      // Redirect to the course learning page
      router.push(`/learning/${course.slug}`);
    } catch (error) {
      console.error("Error enrolling:", error);
      toast({
        title: "Đăng ký thất bại",
        description:
          "Có lỗi xảy ra khi đăng ký khóa học. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Bạn cần đăng nhập",
        description: "Vui lòng đăng nhập để thêm khóa học vào giỏ hàng",
        variant: "destructive",
      });
      router.push(
        "/login?redirect=" + encodeURIComponent(window.location.pathname)
      );
      return;
    }

    setIsAddingToCart(true);
    try {
      // Truyền object đúng format
      const success = await addToCart({
        courseId: course.id.toString(),
        price: course.price,
      });

      if (success) {
        setIsInCart(true);
        toast({
          title: "Đã thêm vào giỏ hàng",
          description: "Khóa học đã được thêm vào giỏ hàng của bạn",
        });
      } else {
        toast({
          title: "Không thể thêm vào giỏ hàng",
          description: "Có lỗi xảy ra khi thêm khóa học vào giỏ hàng",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast({
        title: "Không thể thêm vào giỏ hàng",
        description: "Có lỗi xảy ra khi thêm khóa học vào giỏ hàng",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden">
      {/* Course preview image with play button overlay */}
      <div className="relative">
        <div className="aspect-video w-full relative">
          <Image
            src={getImageUrl(course.image) || "/images/course-placeholder.jpg"}
            alt={course.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            {/* <div className="w-16 h-16 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
              <Play className="w-8 h-8 text-[#a435f0] ml-1" />
            </div> */}
          </div>
        </div>
      </div>

      {/* Purchase info and action buttons */}
      <div className="p-6">
        <div className="mb-6">
          {/* Hiển thị giá dựa trên điều kiện */}
          <div className="flex items-center mb-2">
            <p className="text-2xl font-bold">
              {course.price === 0
                ? "Miễn phí"
                : `${Math.round(Number(course.price)).toLocaleString(
                    "vi-VN"
                  )} VNĐ`}
            </p>
            {course.price > 0 && (
              <span className="ml-3 text-base text-gray-500 line-through">
                {Math.round(Number(course.price) * 1.5).toLocaleString("vi-VN")}{" "}
                VNĐ
              </span>
            )}
          </div>
          <div className="space-y-3 mt-4">
            {isEnrolled ? (
              <Button
                variant="default"
                className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center"
                onClick={() => router.push(`/learning/${course.slug}`)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Tiếp tục học
              </Button>
            ) : (
              course.price <= 0 && (
                <Button
                  variant="default"
                  className="w-full bg-[#a435f0] hover:bg-[#8710d8]"
                  onClick={handleEnroll}
                  disabled={isEnrolling}
                >
                  {isEnrolling
                    ? "Đang xử lý..."
                    : "Đăng ký học ngay"}
                </Button>
              )
            )}

            {/* Hiển thị nút "Thêm vào giỏ hàng" chỉ khi có giá và chưa đăng ký */}
            {course.price > 0 && !isEnrolled && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleAddToCart}
                disabled={isAddingToCart || isInCart}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isAddingToCart ? "Đang xử lý..." : "Thêm vào giỏ hàng"}
              </Button>
            )}

            {/* Hiển thị thông báo đã có trong giỏ hàng */}
            {isInCart && (
              <p className="text-xs text-center text-orange-500 font-medium">
                Khóa học đã có trong giỏ hàng của bạn
              </p>
            )}
          </div>
          {course.price > 0 && (
            <p className="text-xs text-center text-gray-500 mt-2">
              Đảm bảo hoàn tiền trong 30 ngày
            </p>
          )}
        </div>

        {/* Course included features */}
        <div className="space-y-3 text-sm">
          <h3 className="font-bold">Khóa học này bao gồm:</h3>
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-gray-600" />
            <span>{formatDuration(totalDuration)} video học tập</span>
          </div>
          <div className="flex items-center gap-2">
            <Book className="w-4 h-4 text-gray-600" />
            <span>{course.totalLesson} bài học</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-600" />
            <span>Học mọi lúc mọi nơi</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-600" />
            <span>Truy cập vĩnh viễn</span>
          </div>
        </div>

        {/* Share and gift buttons */}
        <div className="flex gap-2 mt-6 text-sm font-medium">
          <Button variant="ghost" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            Chia sẻ
          </Button>
          <Button variant="ghost" className="flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            Tặng kèm
          </Button>
        </div>
      </div>
    </div>
  );
}
