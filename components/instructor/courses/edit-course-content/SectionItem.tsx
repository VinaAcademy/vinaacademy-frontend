// components/SectionItem.tsx
import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Edit,
  Grip,
  MoreVertical,
  Plus,
  Trash2,
} from 'lucide-react'
import { SectionEditModal } from '@/components/instructor/courses/SectionEditModal'
import { LectureEditModal } from '@/components/instructor/courses/LectureEditModal'
import { useRouter } from 'next/navigation'
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
import { createPortal } from 'react-dom'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableLecture } from './SortableLecture'
import { SectionDto } from '@/types/course'

interface SectionItemProps {
  section: SectionDto
  courseId: string
  isExpanded: boolean
  onToggle: (sectionId: string) => void
  onDragStart: () => void
  onDragEnd: (event: DragEndEvent) => void
  onDelete: (sectionId: string) => void
  onAddLecture: (sectionId: string) => void
  onDeleteLecture: (sectionId: string, lectureId: string) => void
  onSectionUpdated: () => void
  onLectureUpdated: () => void
  isFirst?: boolean
  isLast?: boolean
  dragHandleProps?: any
}

export const SectionItem = ({
  section,
  courseId,
  isExpanded,
  onToggle,
  onDragStart,
  onDragEnd,
  onDelete,
  onAddLecture,
  onDeleteLecture,
  onSectionUpdated,
  onLectureUpdated,
  isFirst = false,
  isLast = false,
  dragHandleProps = {},
}: SectionItemProps) => {
  const router = useRouter()
  const [isSectionModalOpen, setSectionModalOpen] = useState(false)
  const [isLectureModalOpen, setLectureModalOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isDraggingLecture, setIsDraggingLecture] = useState(false)

  // Configure sensors for lecture drag detection

  const handleEditSection = () => {
    setSectionModalOpen(true)
  }

  const handleAddLecture = () => {
    setLectureModalOpen(true)
  }

  const handleEditLecture = (lectureId: string) => {
    router.push(`/instructor/courses/${courseId}/lectures/${lectureId}`)
  }

  const handleDeleteSection = () => {
    if ((section?.lessons?.length || 0) > 0) {
      if (
        confirm(
          `Phần học này có ${section?.lessons?.length} bài giảng. Bạn có chắc chắn muốn xóa không?`,
        )
      ) {
        onDelete(section.id)
      }
    } else {
      onDelete(section.id)
    }
  }

  const handleLectureDragStart = (id: string) => {
    setIsDraggingLecture(true)
    document.body.classList.add('dragging')
    onDragStart() // Call the parent drag start handler
  }
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  )

  return (
    <motion.div
      className={`border border-gray-200 rounded-lg overflow-hidden shadow-sm 
                ${isHovered ? 'shadow-md border-gray-300' : ''} 
                ${isExpanded ? 'shadow-md' : ''} 
                ${isDraggingLecture ? 'section-with-dragging-lecture' : ''}
                transition-all duration-200`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={false}
      animate={{ scale: isHovered ? 1.005 : 1 }}
    >
      {/* Section header */}
      <div
        className={`px-4 py-3 flex justify-between items-center ${isExpanded ? 'bg-blue-50 border-b border-blue-100' : 'bg-white'}`}
      >
        <div className="flex items-center flex-1 min-w-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={`text-gray-400 hover:text-gray-600 p-1.5 rounded-md mr-2
                                        ${isHovered ? 'visible' : 'sm:invisible'} 
                                        hover:bg-gray-100 transition-colors drag-handle`}
                  {...dragHandleProps}
                >
                  <Grip className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Kéo để sắp xếp thứ tự</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                Phần {section.orderIndex + 1}: {section.title}
              </h3>
              <Badge variant="outline" className="ml-2 text-xs border-gray-300">
                {section?.lessons?.length} bài giảng
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            className={`text-gray-500 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-md transition-colors ${isExpanded ? 'bg-blue-100' : ''}`}
            onClick={() => onToggle(section.id)}
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-700 transition-colors">
                <MoreVertical className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={handleEditSection}
                className="cursor-pointer"
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa phần học
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleAddLecture}
                className="cursor-pointer text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm bài giảng
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteSection}
                className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Xóa phần học
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Section content */}
      {isExpanded && (
        <div className="bg-white p-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragStart={() => {
              setIsDraggingLecture(true)
              document.body.classList.add('dragging')
              onDragStart()
            }}
            onDragEnd={onDragEnd}
          >
            <SortableContext
              items={
                section?.lessons?.map(
                  (lecture) => `lecture:${section.id}:${lecture.id}`,
                ) || []
              }
              strategy={verticalListSortingStrategy}
            >
              {section?.lessons
                ?.sort((a, b) => a.orderIndex - b.orderIndex)
                .map((lecture, index) => (
                  <SortableLecture
                    key={lecture.id}
                    lecture={lecture}
                    courseId={courseId}
                    sectionId={section.id}
                    onDelete={onDeleteLecture}
                    onEdit={() => handleEditLecture(lecture.id)}
                    isFirst={index === 0}
                    isLast={index === (section?.lessons?.length || 0) - 1}
                    onDragStart={() => {}}
                    onDragEnd={() => {}}
                  />
                ))}
            </SortableContext>
          </DndContext>

          {/* Nút thêm bài giảng và các phần khác giữ nguyên */}
        </div>
      )}

      {/* Portals for modals */}
      {typeof window !== 'undefined' &&
        isSectionModalOpen &&
        createPortal(
          <SectionEditModal
            section={section}
            courseId={courseId}
            isOpen={isSectionModalOpen}
            onClose={() => setSectionModalOpen(false)}
            onSave={onSectionUpdated}
          />,
          document.body,
        )}

      {typeof window !== 'undefined' &&
        isLectureModalOpen &&
        createPortal(
          <LectureEditModal
            sectionId={section.id}
            isOpen={isLectureModalOpen}
            onClose={() => setLectureModalOpen(false)}
            onSave={onLectureUpdated}
          />,
          document.body,
        )}
    </motion.div>
  )
}
