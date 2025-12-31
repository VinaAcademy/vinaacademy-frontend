import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { SectionItem } from './SectionItem'
import { motion } from 'framer-motion'
import { DragEndEvent } from '@dnd-kit/core'
import { SectionDto } from '@/types/course'

interface SortableSectionProps {
  section: SectionDto
  courseId: string
  isExpanded: boolean
  onToggle: (sectionId: string) => void
  onDelete: (sectionId: string) => void
  onAddLecture: (sectionId: string) => void
  onDeleteLecture: (sectionId: string, lectureId: string) => void
  onSectionUpdated: () => void
  onLectureUpdated: () => void
  isFirst?: boolean
  isLast?: boolean
  onDragEnd: (event: DragEndEvent) => void
}

export function SortableSection({ section, ...props }: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
    active,
  } = useSortable({
    id: `section-${section.id}`,
    data: { type: 'section', id: section.id },
  })

  // Apply different styles based on drag state
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 1000 : 0,
    pointerEvents: isDragging ? ('none' as 'none') : ('auto' as 'auto'),
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className={`${isDragging ? 'section-dragging' : ''}`}
    >
      <SectionItem
        section={section}
        {...props}
        onDragStart={() => {}}
        onDragEnd={props.onDragEnd}
        dragHandleProps={{
          ...attributes,
          ...listeners,
        }}
      />
    </motion.div>
  )
}
