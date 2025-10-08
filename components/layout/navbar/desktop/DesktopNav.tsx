import { CategoryDto } from "@/types/category";
import { CartItem } from "@/types/navbar";
import { NotificationDTO } from "@/types/notification";
import SearchBar from "../search-bar/SearchBar";
import UserLearning from "../user-learning/UserLearning";
import UserMenu from "../user-dropdown/UserMenu";
import ShoppingCart from "../shopping-cart/ShoppingCart";
import NavigationLinks from "../other-link/NavigationLinks";
import NotificationDropdown from "../notification-badge/NotificationDropdown";
import Link from "next/link";
import ExploreDropdown from "../explore-dropdown/ExploreDropdown";

interface DesktopNavProps {
  categories: CategoryDto[];
  isLoading: boolean;
  isAuthenticated: boolean;
  roleStaffAdmin: any;
  notifications: NotificationDTO[];
  totalUnread: number;
  cartItems: CartItem[];
  onRemoveFromCart: (id: number) => Promise<void>;
  totalPrice: number;
}

const DesktopNav = ({
  categories,
  isLoading,
  isAuthenticated,
  roleStaffAdmin,
  notifications,
  totalUnread,
  cartItems,
  onRemoveFromCart,
  totalPrice,
}: DesktopNavProps) => {
  return (
    <>
      {/* Search bar */}
      <div className="hidden lg:block flex-grow mx-4 max-w-xl">
        <SearchBar />
      </div>

      {/* Navigation links */}
      <div className="hidden lg:flex items-center space-x-4">
        <NavigationLinks />
        
        {isAuthenticated && (
          <div className="flex items-center space-x-4">
            {roleStaffAdmin && (
              <Link 
                href="/requests" 
                className="text-sm font-medium hover:text-gray-600 transition-colors"
              >
                Duyệt khóa học
              </Link>
            )}
            <UserLearning />
            <NotificationDropdown
              notifications={notifications}
              totalUnread={totalUnread}
            />
            <ShoppingCart
              items={cartItems}
              onRemoveItem={onRemoveFromCart}
              total={totalPrice}
            />
          </div>
        )}
        
        <UserMenu />
      </div>
    </>
  );
};

export default DesktopNav;
