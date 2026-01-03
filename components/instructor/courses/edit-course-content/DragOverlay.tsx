import React from 'react'
import { DragOverlay as DndDragOverlay } from '@dnd-kit/core'
import { SectionItem } from './SectionItem'
import { LectureItem } from './LectureItem'
import { SectionDto } from '@/types/course'

interface DragOverlayProps {
  activeId: string | null
  sections: SectionDto[]
}

export function DragOverlay({ activeId, sections }: DragOverlayProps) {
  // Early return if nothing is being dragged
  if (!activeId) {
    return null
  }

  const activeIdString = activeId.toString()

  // Check if dragging a section
  if (activeIdString.startsWith('section-')) {
    const sectionId = activeIdString.replace('section-', '')
    const section = sections.find((s) => s.id === sectionId)

    if (section) {
      return (
        <DndDragOverlay
          dropAnimation={{
            duration: 300,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}
        >
          <div className="w-full opacity-80 pointer-events-none drag-overlay section-drag-overlay">
            <SectionItem
              section={section}
              courseId=""
              isExpanded={false}
              onToggle={() => {}}
              onDelete={() => {}}
              onAddLecture={() => {}}
              onDeleteLecture={() => {}}
              onDragStart={() => {}}
              onDragEnd={() => {}}
              onSectionUpdated={() => {}}
              onLectureUpdated={() => {}}
            />
          </div>
        </DndDragOverlay>
      )
    }
  }

  // Check if dragging a lecture
  if (activeIdString.startsWith('lecture:')) {
    const parts = activeIdString.split(':')
    if (parts.length === 3) {
      const sectionId = parts[1]
      const lectureId = parts[2]

      const section = sections.find((s) => s.id === sectionId)
      const lecture = section?.lessons?.find((l) => l.id === lectureId) || null

      if (section && lecture) {
        return (
          <DndDragOverlay
            dropAnimation={{
              duration: 300,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}
          >
            <div className="w-full max-w-md opacity-90 pointer-events-none drag-overlay lecture-drag-overlay">
              <LectureItem
                lecture={lecture}
                sectionId={sectionId}
                courseId=""
                onDelete={() => {}}
                onEdit={() => {}}
                onDragStart={() => {}}
                onDragEnd={() => {}}
              />
            </div>
          </DndDragOverlay>
        )
      }
    }
  }

  return null
}
