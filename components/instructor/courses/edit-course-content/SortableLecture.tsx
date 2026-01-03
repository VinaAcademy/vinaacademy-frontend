import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { LectureItem } from './LectureItem'
import { motion } from 'framer-motion'
import { LessonDto } from '@/types/course'

interface SortableLectureProps {
  lecture: LessonDto
  courseId: string
  sectionId: string
  onDelete: (sectionId: string, lectureId: string) => void
  onEdit: () => void
  isFirst?: boolean
  isLast?: boolean
  onDragStart?: () => void // Thêm prop này
  onDragEnd?: () => void // Thêm prop này
}

export function SortableLecture({
  lecture,
  sectionId,
  onDragStart,
  onDragEnd,
  ...props
}: SortableLectureProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: `lecture:${sectionId}:${lecture.id}`,
    data: {
      type: 'lecture',
      id: lecture.id,
      parentId: sectionId,
    },
  })

  // Apply different styles based on drag state
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1000 : 0,
    pointerEvents: isDragging ? 'none' : 'auto',
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: -5 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: isDragging ? 1.02 : 1,
        boxShadow: isDragging ? '0 5px 10px rgba(0,0,0,0.15)' : 'none',
      }}
      exit={{ opacity: 0, y: 5 }}
      transition={{ duration: 0.2 }}
      className={`
        ${isDragging ? 'lecture-dragging' : ''}
        ${isOver ? 'drop-area-over' : ''}
      `}
    >
      <LectureItem
        lecture={lecture}
        sectionId={sectionId}
        {...props}
        onDragStart={() => {
          document.body.classList.add('dragging-lecture')
          if (onDragStart) {
            onDragStart()
          }
        }}
        onDragEnd={() => {
          document.body.classList.remove('dragging-lecture')
          if (onDragEnd) {
            onDragEnd()
          }
        }}
        dragHandleProps={{
          ...attributes,
          ...listeners,
          'data-draggable': 'true',
          className: 'drag-handle',
        }}
      />
    </motion.div>
  )
}
