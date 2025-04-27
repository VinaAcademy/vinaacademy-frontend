import { CategoryDto } from "@/types/category";
import { CartItem } from "@/types/navbar";
import Link from "next/link";
import { LogOut } from "lucide-react";
import MobileCategories from "./MobileCategories";
import MobileNavLinks from "./MobileNavLinks";
import MobileUserMenu from "./MobileUserMenu";
interface MobileNavProps {
  isOpen: boolean;
  categories: CategoryDto[];
  isLoading: boolean;
  isAuthenticated: boolean;
  roleStaffAdmin: any;
  cartItems: CartItem[];
  totalUnread: number;
  onClose: () => void;
  onLogout: () => void;
}

const MobileNav = ({
  isOpen,
  categories,
  isLoading,
  isAuthenticated,
  roleStaffAdmin,
  cartItems,
  totalUnread,
  onClose,
  onLogout,
}: MobileNavProps) => {
  return (
    <div 
      className={`lg:hidden fixed inset-0 z-50 bg-white transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{ top: '57px' }}
    >
      <div className="h-full overflow-y-auto p-4">
        <div className="space-y-6">
          {/* Explore categories */}
          <MobileCategories 
            categories={categories}
            isLoading={isLoading}
            onClose={onClose}
          />

          {/* Navigation links */}
          <MobileNavLinks 
            isAuthenticated={isAuthenticated}
            roleStaffAdmin={roleStaffAdmin}
            onClose={onClose}
          />

          {/* User menu items */}
          {isAuthenticated ? (
            <MobileUserMenu 
              cartItemsCount={cartItems.length} 
              totalUnread={totalUnread}
              onClose={onClose}
              onLogout={onLogout}
            />
          ) : (
            <div className="mt-6 space-y-3">
              <Link 
                href="/login"
                className="block w-full py-2 px-4 text-center bg-white border border-black text-black rounded hover:bg-gray-100 transition-colors"
                onClick={onClose}
              >
                Đăng nhập
              </Link>
              <Link 
                href="/register"
                className="block w-full py-2 px-4 text-center bg-black text-white rounded hover:bg-gray-800 transition-colors"
                onClick={onClose}
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileNav;
