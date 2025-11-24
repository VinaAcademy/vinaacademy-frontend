import {Icons} from '@/components/icons';

// Định nghĩa interface NavItem cho một mục navigation (menu)
// Bao gồm tiêu đề, URL, một số thuộc tính tùy chọn như disabled, external, shortcut, icon, label, description, isActive và danh sách con items (nếu có)
export interface NavItem {
    title: string;                // Tiêu đề của mục điều hướng
    url: string;                  // Đường dẫn liên kết
    disabled?: boolean;           // Có vô hiệu hóa mục này hay không
    external?: boolean;           // Liên kết ngoại vi (mở ra ngoài ứng dụng) hay không
    shortcut?: [string, string];  // Phím tắt (nếu có) dạng tuple gồm 2 chuỗi
    icon?: keyof typeof Icons;    // Icon được sử dụng, lấy từ bộ sưu tập Icons
    label?: string;               // Nhãn hiển thị cho mục (ví dụ: badge)
    description?: string;         // Mô tả ngắn cho mục điều hướng
    isActive?: boolean;           // Trạng thái kích hoạt (active) của mục
    items?: NavItem[];            // Danh sách các mục con (dạng đệ quy)
}

// Interface NavItemWithChildren: mở rộng NavItem, nhưng chắc chắn có thuộc tính items chứa các phần tử NavItemWithChildren
export interface NavItemWithChildren extends NavItem {
    items: NavItemWithChildren[]; // Bắt buộc có danh sách children, cho phép lồng các mục dưới cấp
}

// Export revenue related types
export * from './revenue';

// Interface NavItemWithOptionalChildren: mở rộng NavItem, nhưng children có thể có hoặc không
export interface NavItemWithOptionalChildren extends NavItem {
    items?: NavItemWithChildren[]; // Danh sách các mục con tùy chọn
}

// Định nghĩa interface FooterItem cho các mục trong footer
export interface FooterItem {
    title: string;                // Tiêu đề của group footer
    items: {                     // Danh sách các mục con trong footer
        title: string;           // Tiêu đề của mục footer
        href: string;            // Liên kết đến mục footer
        external?: boolean;      // Cho biết liên kết có phải ngoại vi hay không
    }[];
}

// Định nghĩa kiểu MainNavItem, là NavItemWithOptionalChildren
export type MainNavItem = NavItemWithOptionalChildren;

// Định nghĩa kiểu SidebarNavItem, là NavItemWithChildren (bắt buộc có danh sách con)
export type SidebarNavItem = NavItemWithChildren;