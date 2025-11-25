'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { CourseDto, CourseLevel } from '@/types/course'
import SearchResults from '@/components/courses/search-course/search/SearchResults'
import FilterSidebar from '@/components/courses/search-course/filters/FilterSidebar'
import MobileFilterToggle from '@/components/courses/search-course/filters/MobileFilterToggle'
import NoResultsFound from '@/components/courses/search-course/ui/NoResultsFound'
import SearchHeader from '@/components/courses/search-course/search/SearchHeader'
import { PaginatedResponse } from '@/types/api-response'
import { Suspense } from 'react'
import { useCourses } from '@/hooks/useCourses'

// Types
export type FilterUpdates = {
  [key: string]: string | null
}

// Loading component for Suspense fallback
function SearchPageLoading() {
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Kết quả tìm kiếm</h1>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      </div>
    </div>
  )
}

// Actual Search Page Component
function SearchPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  useRef(true)
  // State for search and filter params
  const [query, setQuery] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [subCategories, setSubCategories] = useState<string[]>([])
  const [topics, setTopics] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [levels, setLevels] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [minRating, setMinRating] = useState('')
  const [currentPage, setCurrentPage] = useState(0) // API is 0-based
  const [pageSize, setPageSize] = useState(10)
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // UI state
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Map UI level strings to API CourseLevel enum
  const mapLevelToApiFormat = (
    level: string | undefined,
  ): CourseLevel | undefined => {
    if (!level) return undefined

    const levelMap: Record<string, CourseLevel> = {
      'Cơ bản': 'BEGINNER',
      'Trung cấp': 'INTERMEDIATE',
      'Nâng cao': 'ADVANCED',
    }

    return (levelMap[level] as CourseLevel) || undefined
  }

  // Initialize state from URL params
  const isParamsReady = useRef(false)
  useEffect(() => {
    console.log('Search params changed:', searchParams.toString())
    setQuery(searchParams.get('q') || '')

    const categoriesParam = searchParams.get('categories') || ''
    setCategories(categoriesParam ? categoriesParam.split(',') : [])

    const subCategoriesParam = searchParams.get('subCategories') || ''
    setSubCategories(subCategoriesParam ? subCategoriesParam.split(',') : [])

    const topicsParam = searchParams.get('topics') || ''
    setTopics(topicsParam ? topicsParam.split(',') : [])
    setSelectedTopics(topicsParam ? topicsParam.split(',') : [])

    const levelsParam = searchParams.get('level') || ''
    setLevels(levelsParam ? levelsParam.split(',') : [])

    setMinPrice(searchParams.get('minPrice') || '')
    setMaxPrice(searchParams.get('maxPrice') || '')
    setMinRating(searchParams.get('minRating') || '')

    const pageParam = searchParams.get('page') || '1'
    setCurrentPage(parseInt(pageParam) - 1) // Convert to 0-based for API

    const sortByParam = searchParams.get('sortBy') || 'name'
    setSortBy(sortByParam)

    const sortDirParam = searchParams.get('sortDirection') || 'asc'
    setSortDirection(sortDirParam as 'asc' | 'desc')

    setPageSize(9)

    isParamsReady.current = true
  }, [searchParams])

  // Use the useCourses hook instead of direct React Query
  // Use categorieSlugs array for multiple categories filter
  const {
    courses,
    loading: isLoading,
    totalItems,
    totalPages,
  } = useCourses({
    keyword: query || undefined,
    categorieSlugs: categories.length > 0 ? categories : undefined,
    level: mapLevelToApiFormat(levels[0]),
    minPrice: minPrice ? parseInt(minPrice) * 1000 : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice) * 1000 : undefined,
    minRating: minRating ? parseFloat(minRating) : undefined,
    page: currentPage,
    size: pageSize,
    sortBy: sortBy,
    sortDirection: sortDirection,
  })

  // Ensure we have a valid coursesData object
  const normalizedCoursesData: PaginatedResponse<CourseDto> = {
    content: courses,
    totalPages: totalPages,
    totalElements: totalItems,
    size: pageSize,
    number: currentPage,
    first: currentPage === 0,
    last: currentPage === totalPages - 1,
  }

  // Handle category change - used by CategoryFilterTree
  // Handle sort change
  // Toggle mobile filters visibility
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters)
  }

  // Apply filters by updating URL params
  const applyFilters = (newFilters: FilterUpdates) => {
    const params = new URLSearchParams(searchParams.toString())

    // Update params based on new filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })

    // Reset to page 1 when applying new filters
    params.set('page', '1')

    router.push(`/courses/search?${params.toString()}`)
  }

  // Clear all filters
  const clearAllFilters = () => {
    router.push('/courses/search?page=1')
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Kết quả tìm kiếm</h1>

        {/* Search header with query and result count */}
        {query && (
          <SearchHeader
            query={query}
            resultCount={normalizedCoursesData.totalElements}
          />
        )}

        {/* Main content with sidebar layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile filter toggle */}
          <MobileFilterToggle toggleMobileFilters={toggleMobileFilters} />

          {/* Filter sidebar - updated props to match component interface */}
          <FilterSidebar
            showMobileFilters={showMobileFilters}
            toggleMobileFilters={toggleMobileFilters}
            categories={categories}
            subCategories={subCategories}
            topics={topics}
            selectedTopics={selectedTopics}
            setSelectedTopics={setSelectedTopics}
            minPrice={minPrice}
            maxPrice={maxPrice}
            levels={levels}
            selectedRating={minRating}
            applyFilters={applyFilters}
            clearAllFilters={clearAllFilters}
          />

          {/* Course results */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
              </div>
            ) : searchParams.toString() === '' ? (
              <div className="text-center py-20">
                <h2 className="text-xl font-semibold mb-2">Bắt đầu tìm kiếm</h2>
                <p className="text-gray-600">
                  Nhập từ khóa hoặc chọn bộ lọc để tìm khóa học phù hợp
                </p>
              </div>
            ) : normalizedCoursesData.content.length > 0 ? (
              <SearchResults coursesData={normalizedCoursesData} />
            ) : (
              <NoResultsFound />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Export wrapped in Suspense
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageLoading />}>
      <SearchPageContent />
    </Suspense>
  )
}
