import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CourseDetailsResponse, CourseDto } from "@/types/course";
import { Check, Eye, X } from "lucide-react";

type CourseRequestProps = {
  onApprove?: (slug: string) => void;
  onReject?: (slug: string, nameg: string, id: string, recipid: string) => void;
  onViewDetails?: (id: string) => void;
  courseDto: CourseDetailsResponse;
};

const formatUpdatedDate = (
  updatedDate?: string | number[],
) => {
  if (!updatedDate) return ''

  try {
    let date: Date
    if (Array.isArray(updatedDate)) {
      // Spring Boot array format: [year, month, day, hour, minute, second]
      date = new Date(
        updatedDate[0],
        updatedDate[1] - 1,
        updatedDate[2],
        updatedDate[3] || 0,
        updatedDate[4] || 0,
      )
    } else {
      // ISO string format
      date = new Date(updatedDate)
    }

    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch (error) {
    return ''
  }
}

const CourseRequestCard = ({
  courseDto,
  onApprove,
  onReject,
  onViewDetails,
}: CourseRequestProps) => {
  

  const instructor = courseDto.ownerInstructor?.fullName || "Không xác định";
  const updateDate = new Date(courseDto.updatedDate).toLocaleDateString("vi-VN");
  const category = courseDto.categoryName;

  const statusColor: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800 border-gray-200",
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    PUBLISHED: "bg-green-100 text-green-800 border-green-200",
    REJECTED: "bg-red-100 text-red-800 border-red-200",
  };

  const statusText: Record<string, string> = {
    DRAFT: "Bản nháp",
    PENDING: "Đang chờ",
    PUBLISHED: "Đã duyệt",
    REJECTED: "Từ chối",
  };

  const levelText: Record<string, string> = {
    BEGINNER: "Mới bắt đầu",
    INTERMEDIATE: "Trung cấp",
    ADVANCED: "Cao cấp",
    
  };

  return (
    <Card className="overflow-hidden transition-all border-none shadow-none">
      <CardContent className="p-0">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg line-clamp-2">{courseDto.name}</h3>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full px-3 ml-2 shrink-0",
                statusColor[courseDto.status]
              )}
            >
              {statusText[courseDto.status]}
            </Badge>
          </div>

          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-muted-foreground">Giảng viên:</span>{" "}
              {instructor}
            </p>
            <p className="text-sm">
              <span className="text-muted-foreground">Danh mục:</span>{" "}
              {category}
            </p>
            <div className="flex justify-between items-center">
              <p className="text-sm">
                <span className="text-muted-foreground">Ngày cập nhật:</span>{" "}
                {formatUpdatedDate(courseDto.updatedDate)}
              </p>
              <Badge variant="outline" className="rounded-md px-3 bg-slate-300">
                {levelText[courseDto.level]}
              </Badge>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary hover:bg-primary/10"
              onClick={() => onViewDetails?.(courseDto.id)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Xem chi tiết
            </Button>

            {courseDto.status === "PENDING" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={() => onReject?.(courseDto.slug, courseDto.name, courseDto.id, courseDto.ownerInstructor?.id || "")}
                >
                  <X className="h-4 w-4 mr-1" />
                  Từ chối
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => onApprove?.(courseDto.slug)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Phê duyệt
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseRequestCard;
