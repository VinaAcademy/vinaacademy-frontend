export interface Notification {
  id: number
  message: string
}

// Định nghĩa interface TrendingTopic cho các chủ đề thịnh hành trong một danh mục con
export interface TrendingTopic {
  name: string
  link: string
  students: string
  category?: string // Tên danh mục chính
  subCategory?: string // Tên danh mục con
}

// Định nghĩa interface SubCategory cho danh mục con, chứa thông tin và các chủ đề thịnh hành
export interface SubCategory {
  name: string // Tên danh mục con
  link: string // Đường dẫn đến danh mục con
  trendingTopics: TrendingTopic[] // Danh sách các chủ đề thịnh hành trong danh mục con
}

// Định nghĩa interface Category cho danh mục, chứa tên, đường dẫn và danh sách các danh mục con
export interface Category {
  name: string // Tên danh mục (ví dụ: "Lập trình", "Thiết kế")
  link: string // Đường dẫn đến trang danh mục
  description: string // Mô tả danh mục
  coursesCount: number // Số lượng khoá học trong danh mục
  subCategories: SubCategory[] // Danh sách các danh mục con bên trong danh mục
}

// Định nghĩa interface CartItem cho các sản phẩm trong giỏ hàng
export interface CartItem {
  id: number // ID duy nhất của khoá học
  slug?: string // Slug của khóa học để sử dụng trong URL
  name: string // Tên khoá học
  price: number
  image: string // Đường dẫn hình ảnh của khoá học
  instructor?: string // Tên giảng viên (tùy chọn)
  originalPrice?: string // Giá gốc trước giảm giá (tùy chọn)
  discount?: number // Phần trăm giảm giá (tùy chọn, ví dụ: 20, 50)
}

// Định nghĩa interface LearningCourse cho khoá học đang học, chứa thông tin tiến độ cũng như các chi tiết khác
export interface LearningCourse {
  id?: string
  name: string
  slug: string
  courseStatus?: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED'
  image: string
  instructor?: string
  progress: number
  completedLessons?: number
  totalLessons?: number
  category?: string
  lastAccessed?: string
  enrollmentId?: number // Thêm trường này để khắc phục lỗi
}
