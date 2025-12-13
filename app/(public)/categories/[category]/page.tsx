"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCategories } from "@/context/CategoryContext";
import { useCourses } from "@/hooks/useCourses";
import { CourseLevel } from "@/types/course";

// Import components
import { LoadingState } from "@/components/categories/ui/LoadingState";
import { NotFoundState } from "@/components/categories/ui/NotFoundState";
import { CategoryHeader } from "@/components/categories/category/CategoryHeader";
import { FilterSidebar } from "@/components/categories/category/FilterSidebar";
import { SortingControls } from "@/components/categories/category/SortingControls";
import { CourseTabs } from "@/components/categories/ui/CourseTabs";
import { CourseGrid } from "@/components/categories/ui/CourseGrid";
import CategoryTreeItem from "@/components/layout/navbar/explore-dropdown/CategoryTreeItem";
import Link from "next/link";

export default function CategoryPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { categories, isLoading: categoriesLoading, getCategoryBySlug, getCategoryPath, findSubcategories } = useCategories();

    const categorySlug = params.category as string;
    const selectedLevel = searchParams.get('level') || undefined;
    const priceRange = searchParams.get('price') || undefined;
    const sortParam = searchParams.get('sort') || 'popular';

    const [sortBy, setSortBy] = useState(sortParam);
    const [activeTab, setActiveTab] = useState(sortParam === 'newest' ? 'newest' : sortParam === 'rating' ? 'rating' : 'popular');

    // Get category information
    const categoryInfo = getCategoryBySlug(categorySlug);
    const categoryPath = getCategoryPath(categorySlug);
    const subCategories = findSubcategories(categorySlug);

    // Helper function to get sort field
    function getSortField(sort: string): string {
        switch (sort) {
            case 'popular': return 'totalStudent';
            case 'rating': return 'rating';
            case 'newest': return 'createdDate';
            case 'price-low':
            case 'price-high':
                return 'price';
            default:
                return 'totalStudent';
        }
    }

    // Helper function to get sort direction
    function getSortDirection(sort: string): 'asc' | 'desc' {
        switch (sort) {
            case 'price-low': return 'asc';
            case 'price-high':
            case 'popular':
            case 'rating':
            case 'newest':
                return 'desc';
            default:
                return 'desc';
        }
    }

    // Use the useCourses hook instead of direct React Query
    const {
        courses,
        loading: coursesLoading,
        error: coursesError,
        totalItems,
        totalPages,
        refetch
    } = useCourses({
        keyword: searchParams.get('query') || undefined,
        categorySlug: categorySlug,
        level: selectedLevel as CourseLevel,
        minPrice: priceRange === 'free' ? 0 :
            priceRange === 'low' ? 1 :
                priceRange === 'medium' ? 500000 :
                    priceRange === 'high' ? 1000000 : undefined,
        maxPrice: priceRange === 'free' ? 0 :
            priceRange === 'low' ? 500000 :
                priceRange === 'medium' ? 1000000 :
                    undefined,
        page: 0, // First page
        size: 20,
        sortBy: getSortField(sortBy),
        sortDirection: getSortDirection(sortBy)
    });

    // Create a coursesData object for compatibility with existing code
    const coursesData = {
        content: courses,
        totalElements: totalItems,
        totalPages: totalPages,
        number: 0
    };

    // Handle tab change - update sorting
    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setSortBy(tab);
    };

    // Update query params when filters change
    useEffect(() => {
        const currentParams = new URLSearchParams(searchParams.toString());

        if (sortBy) {
            currentParams.set('sort', sortBy);
        } else {
            currentParams.delete('sort');
        }

        const newQueryString = currentParams.toString();
        const queryPart = newQueryString ? `?${newQueryString}` : '';

        router.replace(`/categories/${categorySlug}${queryPart}`, { scroll: false });
    }, [sortBy]);

    // Reset all filters
    const resetFilters = () => {
        router.replace(`/categories/${categorySlug}`);
    };

    // Show loading state when fetching data
    if (categoriesLoading || coursesLoading) {
        return <LoadingState />;
    }

    // Show not found state if category doesn't exist
    if (!categoryInfo) {
        return <NotFoundState />;
    }

    // Show error state if courses query failed
    if (coursesError) {
        return (
            <div className="container mx-auto py-20 text-center">
                <h2 className="text-2xl font-bold mb-4">Có lỗi xảy ra</h2>
                <p className="text-gray-600 mb-6">Không thể tải danh sách khóa học. Vui lòng thử lại sau.</p>
                <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent">
            <div className="container mx-auto px-4 py-8">
                {/* Title section */}
                <CategoryHeader
                    category={categoryInfo.name}
                    subCategory={categoryPath.length > 1 ? categoryPath[categoryPath.length - 2].name : undefined}
                />

                {/* Course Grid with Sidebar - Tree Layout */}
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Left Sidebar with Category Tree */}
                    <div className="md:w-1/4">
                        <div className="bg-white shadow rounded-lg p-4 sticky top-24">
                            <h3 className="text-lg font-medium mb-4 border-b pb-2">Danh mục</h3>
                            <div className="max-h-[600px] overflow-y-auto">
                                {categories.map(category => (
                                    <CategoryTreeItem
                                        key={category.id}
                                        category={category}
                                        depth={0}
                                        isExpanded={categoryPath.some(cat => cat.id === category.id)}
                                        activePath={categoryPath.map(cat => cat.slug)}
                                    />
                                ))}
                            </div>

                            {/* Filter components */}
                            <FilterSidebar
                                selectedLevel={selectedLevel}
                                priceRange={priceRange}
                                categorySlug={categorySlug}
                                router={router}
                            />
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-grow">
                        {/* Breadcrumb Navigation */}
                        <div className="mb-6">
                            <nav className="flex" aria-label="Breadcrumb">
                                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                                    <li className="inline-flex items-center">
                                        <Link href="/" className="text-gray-700 hover:text-blue-600">
                                            Trang chủ
                                        </Link>
                                    </li>
                                    {categoryPath.map((cat, index) => (
                                        <li key={cat.id}>
                                            <div className="flex items-center">
                                                <span className="mx-2 text-gray-400">/</span>
                                                <a
                                                    href={`/categories/${cat.slug}`}
                                                    className={`${index === categoryPath.length - 1
                                                        ? 'text-blue-600 font-medium'
                                                        : 'text-gray-700 hover:text-blue-600'
                                                        }`}
                                                >
                                                    {cat.name}
                                                </a>
                                            </div>
                                        </li>
                                    ))}
                                </ol>
                            </nav>
                        </div>

                        {/* Sort dropdown and applied filters */}
                        <SortingControls
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            selectedLevel={selectedLevel}
                            priceRange={priceRange}
                            categorySlug={categorySlug}
                        />

                        {/* Subcategories Grid */}
                        {subCategories.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-4">Danh mục con</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {subCategories.map(subcat => (
                                        <a
                                            key={subcat.id}
                                            href={`/categories/${subcat.slug}`}
                                            className="p-4 border rounded-md hover:bg-gray-50 transition-colors text-center"
                                        >
                                            <span className="font-medium">{subcat.name}</span>
                                            <div className="text-sm text-gray-500 mt-1">
                                                {subcat.coursesCount || 0} khóa học
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Course Tabs */}
                        <CourseTabs
                            activeTab={activeTab}
                            onTabChange={handleTabChange}
                        />

                        {/* Course Grid */}
                        <CourseGrid
                            courses={coursesData?.content || []}
                            totalItems={coursesData?.totalElements || 0}
                            resetFilters={resetFilters}
                        />

                        {/* Pagination */}
                        {coursesData && coursesData.totalPages > 1 && (
                            <div className="flex justify-center mt-8">
                                <nav className="flex items-center space-x-2">
                                    {[...Array(Math.min(5, coursesData.totalPages))].map((_, i) => (
                                        <a
                                            key={i}
                                            href={`/categories/${categorySlug}?page=${i}`}
                                            className={`px-3 py-1 rounded border ${coursesData.number === i
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {i + 1}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}