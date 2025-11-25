'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CategoryFilter from './CategoryFilter'
import PriceRangeFilter from './PriceRangeFilter'
import LevelFilter from './LevelFilter'
import RatingFilter from './RatingFilter'
import { FilterUpdates } from '@/app/(public)/courses/search/page'

interface FilterSidebarProps {
  showMobileFilters: boolean
  toggleMobileFilters: () => void
  categories: string[]
  subCategories?: string[]
  topics?: string[]
  selectedTopics?: string[]
  setSelectedTopics?: (topics: string[]) => void
  minPrice: string
  maxPrice: string
  levels: string[]
  selectedRating: string
  applyFilters: (filters: FilterUpdates) => void
  clearAllFilters: () => void
}

export default function FilterSidebar({
  showMobileFilters,
  toggleMobileFilters,
  categories,
  subCategories = [],
  topics = [],
  selectedTopics = [],
  setSelectedTopics = () => {},
  minPrice,
  maxPrice,
  levels,
  selectedRating,
  applyFilters,
  clearAllFilters,
}: FilterSidebarProps) {
  // Trạng thái cho các phần bộ lọc mở rộng
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    level: true,
    rating: true,
  })

  // Trạng thái cho danh mục mở rộng
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [expandedSubCategories, setExpandedSubCategories] = useState<string[]>(
    [],
  )

  // Chuyển đổi hiển thị phần bộ lọc
  const toggleSection = (
    section: 'categories' | 'price' | 'level' | 'rating',
  ) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Xử lý chuyển đổi danh mục - CHỈ cho checkbox
  const handleCategoryToggle = (categoryName: string) => {
    // Cập nhật lựa chọn bộ lọc
    let newCategories
    if (categories.includes(categoryName)) {
      newCategories = categories.filter((c) => c !== categoryName)
    } else {
      newCategories = [...categories, categoryName]
    }

    applyFilters({
      categories: newCategories.length > 0 ? newCategories.join(',') : null,
    })
  }

  // Xử lý mở rộng danh mục - CHỈ cho trạng thái mở rộng
  const handleCategoryExpand = (categoryName: string) => {
    // Chuyển đổi trạng thái mở rộng
    if (expandedCategories.includes(categoryName)) {
      setExpandedCategories(
        expandedCategories.filter((cat) => cat !== categoryName),
      )
    } else {
      setExpandedCategories([...expandedCategories, categoryName])
    }
  }

  // Xử lý chuyển đổi danh mục con - CHỈ cho checkbox
  const handleSubCategoryToggle = (subCategoryId: string) => {
    // Cập nhật lựa chọn bộ lọc
    let newSubCategories
    if (subCategories.includes(subCategoryId)) {
      newSubCategories = subCategories.filter((id) => id !== subCategoryId)
    } else {
      newSubCategories = [...subCategories, subCategoryId]
    }

    applyFilters({
      subCategories:
        newSubCategories.length > 0 ? newSubCategories.join(',') : null,
    })
  }

  // Xử lý mở rộng danh mục con - CHỈ cho trạng thái mở rộng
  const handleSubCategoryExpand = (subCategoryId: string) => {
    // Chuyển đổi trạng thái mở rộng
    if (expandedSubCategories.includes(subCategoryId)) {
      setExpandedSubCategories(
        expandedSubCategories.filter((id) => id !== subCategoryId),
      )
    } else {
      setExpandedSubCategories([...expandedSubCategories, subCategoryId])
    }
  }

  // Xử lý chuyển đổi chủ đề
  const handleTopicToggle = (topicName: string) => {
    let newTopics
    if (topics.includes(topicName)) {
      newTopics = topics.filter((name) => name !== topicName)
    } else {
      newTopics = [...topics, topicName]
    }

    // Cập nhật trạng thái cục bộ ngay lập tức để giao diện phản hồi
    setSelectedTopics(newTopics)

    applyFilters({
      topics: newTopics.length > 0 ? newTopics.join(',') : null,
    })
  }

  // Xử lý chuyển đổi cấp độ (radio - single select)
  const handleLevelToggle = (levelName: string) => {
    // If the same level is selected, clear it; otherwise, set the new level
    const newLevel = levels.includes(levelName) ? null : levelName

    applyFilters({
      level: newLevel,
    })
  }

  const hasActiveFilters =
    categories.length > 0 ||
    (subCategories && subCategories.length > 0) ||
    (topics && topics.length > 0) ||
    minPrice ||
    maxPrice ||
    levels.length > 0 ||
    selectedRating

  return (
    <div
      className={`${showMobileFilters ? 'block' : 'hidden'} lg:block lg:w-1/4`}
    >
      <div
        className="bg-white rounded-lg shadow-sm p-4 sticky top-24"
        style={{ position: 'sticky', top: '24px' }}
      >
        {/* Tiêu đề trên thiết bị di động */}
        <div className="lg:hidden flex justify-between items-center mb-4">
          <h3 className="font-bold">Bộ lọc</h3>
          <Button variant="ghost" size="sm" onClick={toggleMobileFilters}>
            <X size={18} />
          </Button>
        </div>

        {/* Bộ lọc danh mục */}
        <CategoryFilter
          expanded={expandedSections.categories}
          toggleSection={() => toggleSection('categories')}
          categories={categories}
          expandedCategories={expandedCategories}
          handleCategoryToggle={handleCategoryToggle}
          handleCategoryExpand={handleCategoryExpand}
          subCategories={subCategories}
          expandedSubCategories={expandedSubCategories}
          handleSubCategoryToggle={handleSubCategoryToggle}
          handleSubCategoryExpand={handleSubCategoryExpand}
          selectedTopics={selectedTopics}
          handleTopicToggle={handleTopicToggle}
        />

        {/* Bộ lọc khoảng giá */}
        <PriceRangeFilter
          expanded={expandedSections.price}
          toggleSection={() => toggleSection('price')}
          minPrice={minPrice}
          maxPrice={maxPrice}
          applyFilters={applyFilters}
        />

        {/* Bộ lọc cấp độ */}
        <LevelFilter
          expanded={expandedSections.level}
          toggleSection={() => toggleSection('level')}
          levels={levels}
          handleLevelToggle={handleLevelToggle}
        />

        {/* Bộ lọc đánh giá */}
        <RatingFilter
          expanded={expandedSections.rating}
          toggleSection={() => toggleSection('rating')}
          selectedRating={selectedRating}
          applyFilters={applyFilters}
        />

        {/* Nút xóa tất cả bộ lọc */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mb-4 text-blue-600 border-blue-600"
            onClick={clearAllFilters}
          >
            <X size={16} className="mr-1" />
            Xóa tất cả bộ lọc
          </Button>
        )}
      </div>
    </div>
  )
}
