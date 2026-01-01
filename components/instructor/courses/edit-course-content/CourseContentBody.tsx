// components/CourseContentBody.tsx
import { useState } from 'react'
import { SortableSection } from './SortableSection'
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { DragOverlay } from './DragOverlay'
import { SectionDto } from '@/types/course'

interface CourseContentBodyProps {
  sections: SectionDto[]
  courseId: string
  expandedSections: string[]
  isDragging: boolean
  onDragStart: (id: string) => void
  onDragEnd: (result: any) => void
  toggleSection: (sectionId: string) => void
  deleteSection: (sectionId: string) => void
  addLecture: (sectionId: string) => void
  deleteLecture: (sectionId: string, lectureId: string) => void
  onSectionUpdated: () => void
  onLectureUpdated: () => void
}

export const CourseContentBody = ({
  sections,
  courseId,
  expandedSections,
  isDragging,
  onDragStart,
  onDragEnd,
  toggleSection,
  deleteSection,
  addLecture,
  deleteLecture,
  onSectionUpdated,
  onLectureUpdated,
}: CourseContentBodyProps) => {
  const [activeId, setActiveId] = useState<string | null>(null)

  // Configure sensors for drag detection with some distance threshold
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement required before drag starts
      },
    }),
  )

  const sortedSections = [...sections].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  )

  // Create a sorted list of all section ids for SortableContext
  const sectionItems = sortedSections.map((section) => `section-${section.id}`)

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id.toString()
    setActiveId(id)
    onDragStart(id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    // Only proceed if there's both an active and over element
    if (!event.active || !event.over) {
      setActiveId(null)
      onDragEnd(event)
      return
    }

    const activeId = event.active.id.toString()
    const overId = event.over.id.toString()

    // Skip if dragging over itself
    if (activeId === overId) {
      setActiveId(null)
      onDragEnd(event)
      return
    }

    // If we have a valid drag operation, pass it to the parent
    onDragEnd(event)
    setActiveId(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className={`p-6 space-y-4 ${isDragging ? 'cursor-grabbing' : ''}`}>
          {sections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                Chưa có nội dung nào. Hãy thêm phần học đầu tiên.
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={sectionItems}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {sortedSections.map((section, index) => (
                    <SortableSection
                      key={section.id}
                      section={section}
                      courseId={courseId}
                      isExpanded={expandedSections.includes(section.id)}
                      onToggle={toggleSection}
                      onDelete={deleteSection}
                      onAddLecture={addLecture}
                      onDeleteLecture={deleteLecture}
                      onSectionUpdated={onSectionUpdated}
                      onLectureUpdated={onLectureUpdated}
                      isFirst={index === 0}
                      isLast={index === sections.length - 1}
                      onDragEnd={handleDragEnd}
                    />
                  ))}
                </div>
              </SortableContext>

              {/* Add drag overlay for visual feedback */}
              <DragOverlay activeId={activeId} sections={sections} />
            </DndContext>
          )}
        </div>
      </div>
    </div>
  )
}
