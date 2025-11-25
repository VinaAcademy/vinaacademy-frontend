// RatingFilter.tsx
'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Star } from 'lucide-react'
import FilterSection from '../ui/FilterSection'
import { FilterUpdates } from '@/app/(public)/courses/search/page'

interface RatingFilterProps {
  expanded: boolean
  toggleSection: () => void
  selectedRating: string
  applyFilters: (filters: FilterUpdates) => void
}

export default function RatingFilter({
  expanded,
  toggleSection,
  selectedRating,
  applyFilters,
}: RatingFilterProps) {
  // Rating options
  const ratingOptions = [
    { value: '4.5', label: '4.5 trở lên' },
    { value: '4.0', label: '4.0 trở lên' },
    { value: '3.5', label: '3.5 trở lên' },
    { value: '3.0', label: '3.0 trở lên' },
  ]

  const handleRatingChange = (rating: string) => {
    // If the same rating is selected, clear it; otherwise, set the new rating
    const newRating = selectedRating === rating ? null : rating

    applyFilters({
      minRating: newRating,
    })
  }

  const renderStars = (rating: string) => {
    const numStars = parseInt(rating)
    const hasHalfStar = rating.includes('.5')
    const stars = []

    for (let i = 0; i < 5; i++) {
      if (i < numStars) {
        stars.push(
          <Star
            key={i}
            size={14}
            className="text-yellow-500 fill-yellow-500 mr-1"
          />,
        )
      } else if (i === numStars && hasHalfStar) {
        // This is a simplified half-star, you might want to use a proper half-star icon
        stars.push(
          <Star
            key={i}
            size={14}
            className="text-yellow-500 fill-yellow-500 mr-1 opacity-50"
          />,
        )
      } else {
        stars.push(<Star key={i} size={14} className="text-gray-300 mr-1" />)
      }
    }
    return stars
  }

  return (
    <FilterSection
      title="Đánh giá"
      expanded={expanded}
      toggleSection={toggleSection}
      className="mb-6"
    >
      <RadioGroup
        value={selectedRating}
        onValueChange={handleRatingChange}
        className="space-y-2 mt-3"
      >
        {ratingOptions.map((option) => (
          <div key={option.value} className="flex items-center">
            <RadioGroupItem
              value={option.value}
              id={`rating-${option.value}`}
              className="text-black border-gray-400"
            />
            <Label
              htmlFor={`rating-${option.value}`}
              className="ml-2 text-sm flex items-center cursor-pointer"
            >
              <div className="flex">{renderStars(option.value)}</div>
              <span className="ml-1">{option.label}</span>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </FilterSection>
  )
}
