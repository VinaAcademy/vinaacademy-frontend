import Link from 'next/link'
import { Search, Filter, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SearchAndFilterBarProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  viewMode: 'grid' | 'list'
  setViewMode: (mode: 'grid' | 'list') => void
}

export default function SearchAndFilterBar({
  searchTerm,
  setSearchTerm,
  viewMode,
  setViewMode,
}: SearchAndFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
      {/* Tìm kiếm */}
      <div className="relative flex-grow max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-black focus:border-black sm:text-sm"
          placeholder="Tìm kiếm khóa học..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Các nút công cụ */}
      <div className="flex items-center space-x-3">
        {/* <Button
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                    <Filter className="h-4 w-4 mr-2"/>
                    Lọc
                </Button> */}
        <Button
          className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-gray-200' : 'bg-white hover:bg-gray-100'}`}
          onClick={() => setViewMode('grid')}
        >
          <Grid className="h-5 w-5 text-gray-700" />
        </Button>
        <Button
          className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-gray-200' : 'bg-white hover:bg-gray-100'}`}
          onClick={() => setViewMode('list')}
        >
          <List className="h-5 w-5 text-gray-700" />
        </Button>
        <Link href="/instructor/courses/new">
          <Button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
            Tạo khóa học mới
          </Button>
        </Link>
      </div>
    </div>
  )
}
