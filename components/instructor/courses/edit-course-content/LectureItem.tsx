// components/LectureItem.tsx
import { Edit, Grip, MoreVertical, Trash2 } from 'lucide-react'
import { formatDuration, getLectureTypeIcon } from './formatters'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { LessonDto } from '@/types/course'

interface LectureItemProps {
  lecture: LessonDto
  courseId: string
  sectionId: string
  onDragStart: () => void
  onDragEnd: () => void
  onDelete: (sectionId: string, lectureId: string) => void
  onEdit: () => void
  isFirst?: boolean
  isLast?: boolean
  dragHandleProps?: any // Add drag handle props
}

export const LectureItem = ({
  lecture,
  courseId,
  sectionId,
  onDragStart,
  onDragEnd,
  onDelete,
  onEdit,
  isFirst = false,
  isLast = false,
  dragHandleProps = {}, // Add drag handle props with default empty object
}: LectureItemProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const handleDelete = () => {
    if (confirm('Bạn có chắc chắn muốn xóa bài giảng này không?')) {
      onDelete(sectionId, lecture.id)
    }
  }

  // Determine badge color based on lecture type
  const getBadgeVariant = () => {
    switch (lecture.type.toLowerCase()) {
      case 'video':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'reading':
        return 'bg-green-50 text-green-700 border-green-200'
      case 'quiz':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getStatusBadge = () => {
    if (!lecture.lessonStatus) return null

    switch (lecture.lessonStatus) {
      case 'PUBLISHED':
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 mr-2"
          >
            Đã xuất bản
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200 mr-2"
          >
            Chờ duyệt
          </Badge>
        )
      case 'REJECTED':
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 mr-2"
          >
            Từ chối
          </Badge>
        )
      case 'DRAFT':
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200 mr-2"
          >
            Nháp
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <motion.div
      className={`flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg border border-transparent
                ${isHovered ? 'border-gray-200 shadow-sm' : ''}
                transition-all duration-200`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={false}
      animate={{ scale: isHovered ? 1.005 : 1 }}
    >
      <div className="flex items-center flex-1 min-w-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={`text-gray-400 hover:text-gray-600 p-1.5 rounded-md mr-1.5
                                    ${isHovered ? 'visible' : 'sm:invisible'}
                                    hover:bg-gray-100 transition-colors`}
                {...dragHandleProps} // Apply drag handle props here
              >
                <Grip className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Kéo để sắp xếp thứ tự</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="mr-3 flex-shrink-0">
          {getLectureTypeIcon(lecture.type)}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-800 truncate">
            {lecture.title}
          </h4>
          <div className="flex items-center text-xs text-gray-500 mt-0.5">
            {getStatusBadge()}
            <Badge variant="outline" className={`mr-2 ${getBadgeVariant()}`}>
              {lecture.type === 'VIDEO'
                ? 'Video'
                : lecture.type === 'READING'
                  ? 'Bài đọc'
                  : lecture.type === 'QUIZ'
                    ? 'Bài kiểm tra'
                    : 'Bài giảng'}
            </Badge>

            {lecture.type === 'VIDEO' && lecture.duration && (
              <span>{formatDuration(lecture.duration)}</span>
            )}

            {lecture.free && (
              <span className="ml-2 text-xs text-blue-600">• Miễn phí</span>
            )}
          </div>
        </div>
      </div>

      <div
        className={`flex items-center ${isHovered ? 'visible' : 'sm:invisible'}`}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onEdit}
                className="text-gray-400 hover:text-blue-500 p-1.5 hover:bg-blue-50 rounded-md transition-colors mr-1"
              >
                <Edit className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Chỉnh sửa bài giảng</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa bài giảng
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  )
}
