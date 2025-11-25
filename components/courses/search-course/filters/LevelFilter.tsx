// LevelFilter.tsx
'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import FilterSection from '../ui/FilterSection'

interface LevelFilterProps {
  expanded: boolean
  toggleSection: () => void
  levels: string[]
  handleLevelToggle: (level: string) => void
}

export default function LevelFilter({
  expanded,
  toggleSection,
  levels,
  handleLevelToggle,
}: LevelFilterProps) {
  // Level options
  const levelOptions = ['Cơ bản', 'Trung cấp', 'Nâng cao']

  // Get the currently selected level (first one, since radio only allows single selection)
  const selectedLevel = levels.length > 0 ? levels[0] : ''

  const handleLevelChange = (level: string) => {
    handleLevelToggle(level)
  }

  return (
    <FilterSection
      title="Cấp độ"
      expanded={expanded}
      toggleSection={toggleSection}
      className="mb-6 border-b pb-4"
    >
      <RadioGroup
        value={selectedLevel}
        onValueChange={handleLevelChange}
        className="space-y-2 mt-3"
      >
        {levelOptions.map((levelItem) => (
          <div key={levelItem} className="flex items-center">
            <RadioGroupItem
              value={levelItem}
              id={`level-${levelItem}`}
              className="text-black border-gray-400"
            />
            <Label
              htmlFor={`level-${levelItem}`}
              className="ml-2 text-sm cursor-pointer"
            >
              {levelItem}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </FilterSection>
  )
}
