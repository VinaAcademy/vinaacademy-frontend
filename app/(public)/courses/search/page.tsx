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
import { searchCourses, aiSearchCourses } from '@/services/courseService'
import { CourseSearchRequest } from '@/types/course'

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

  // Read all params directly from searchParams for immediate reactivity
  const query = searchParams.get('q') || ''
  const categoriesParam = searchParams.get('categories') || ''
  const categories = categoriesParam ? categoriesParam.split(',') : []
  const subCategoriesParam = searchParams.get('subCategories') || ''
  const subCategories = subCategoriesParam ? subCategoriesParam.split(',') : []
  const topicsParam = searchParams.get('topics') || ''
  const topics = topicsParam ? topicsParam.split(',') : []
  const levelsParam = searchParams.get('level') || ''
  const levels = levelsParam ? levelsParam.split(',') : []
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const minRating = searchParams.get('minRating') || ''
  const pageParam = searchParams.get('page') || '1'
  const currentPage = parseInt(pageParam) - 1 // Convert to 0-based for API
  const pageSize = 9
  const sortBy = searchParams.get('sortBy') || 'name'
  const sortDirection = (searchParams.get('sortDirection') || 'asc') as
    | 'asc'
    | 'desc'
  const aiSearchEnabled = searchParams.get('ai') === 'true'

  // UI state (only for UI, not for data fetching)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [selectedTopics, setSelectedTopics] = useState<string[]>(topics)

  // Data state
  const [courses, setCourses] = useState<CourseDto[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  // Sync selectedTopics with URL topics
  useEffect(() => {
    setSelectedTopics(topics)
  }, [topicsParam])

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

  // Fetch courses directly when params change
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoading(true)

      const searchRequest: CourseSearchRequest = {
        keyword: query || undefined,
        categorieSlugs: categories.length > 0 ? categories : undefined,
        level: mapLevelToApiFormat(levels[0]),
        minPrice: minPrice ? parseInt(minPrice) * 1000 : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) * 1000 : undefined,
        minRating: minRating ? parseFloat(minRating) : undefined,
        status: 'PUBLISHED',
      }

      try {
        console.log('Fetching with AI:', aiSearchEnabled)
        let result

        if (aiSearchEnabled) {
          result = await aiSearchCourses(searchRequest, currentPage, pageSize)
        } else {
          result = await searchCourses(
            searchRequest,
            currentPage,
            pageSize,
            sortBy,
            sortDirection,
          )
        }

        if (result) {
          setCourses(result.content || [])
          setTotalItems(result.totalElements || 0)
          setTotalPages(result.totalPages || 0)
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
        setCourses([])
        setTotalItems(0)
        setTotalPages(0)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [
    query,
    categoriesParam,
    levelsParam,
    minPrice,
    maxPrice,
    minRating,
    currentPage,
    sortBy,
    sortDirection,
    aiSearchEnabled,
  ])

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
