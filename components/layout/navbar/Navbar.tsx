"use client";

import { useEffect, useState } from "react";
import { CartItem } from "@/types/navbar";
import HomeLink from "../HomeLink";
import DesktopNav from "./desktop/DesktopNav";
import MobileSearchBar from "./mobile/MobileSearchBar";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/context/CategoryContext";
import { useCart } from "@/context/CartContext";
import {
  fetchUserNotifications,
  markAllNotificationsAsRead,
} from "@/services/notificationService";
import { NotificationDTO } from "@/types/notification-type";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Search, Menu, X } from "lucide-react";
import ExploreDropdown from "./explore-dropdown/ExploreDropdown";
import MobileNav from "./mobile/MobileNav";

interface NavbarProps {
  onNavigateHome?: () => void;
}

const Navbar = ({ onNavigateHome }: NavbarProps) => {
  const { categories, isLoading } = useCategories();
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItems, removeFromCart, totalPrice } = useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [totalUnread, setTotalUnread] = useState<number>(0);
  const [formattedCartItems, setFormattedCartItems] = useState<CartItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  const roleStaffAdmin =
    user?.roles.findLast(
      (role) => role.name === "admin" || role.name === "staff"
    ) || null;

  // Handle logout function
  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    router.push("/");
    toast({
      title: "Đã đăng xuất",
      description: "Bạn đã đăng xuất thành công",
    });
  };

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const formatted = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: `${item.price.toLocaleString("vi-VN")}đ`,
        image: item.image || "/images/course-placeholder.jpg",
      }));
      setFormattedCartItems(formatted);
    } else {
      setFormattedCartItems([]);
    }
  }, [cartItems]);

  const handleRemoveFromCart = async (id: number) => {
    try {
      const success = await removeFromCart(id);
      if (success) {
        toast({
          title: "Đã xóa khỏi giỏ hàng",
          description: "Khóa học đã được xóa khỏi giỏ hàng của bạn",
        });
      } else {
        toast({
          title: "Không thể xóa khóa học",
          description: "Đã xảy ra lỗi khi xóa khóa học khỏi giỏ hàng.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast({
        title: "Không thể xóa khóa học",
        description: "Đã xảy ra lỗi khi xóa khóa học khỏi giỏ hàng.",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead();
    load2notifications();
  };

  const load2notifications = async () => {
    const result = await fetchUserNotifications({
      type: null,
      isRead: false,
      page: 0,
      size: 2,
      sortBy: "createdAt",
      direction: "desc",
    });
    setTotalUnread(result.totalElements);
    setNotifications(result.content);
  };

  useEffect(() => {
    if (isAuthenticated) {
      load2notifications();
    }
  }, [isAuthenticated]);

  // Close mobile menu when screen resizes to larger size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="sticky top-0 z-50 bg-white">
      <nav className="bg-white text-black shadow-md border-b border-gray-200 py-3 px-4 lg:py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo and brand */}
          <div className="flex items-center">
            <HomeLink className="text-2xl font-bold mr-6">Vina</HomeLink>
            {/* Categories dropdown - hidden on mobile */}
            <div className="hidden lg:block">
              <ExploreDropdown categories={isLoading ? [] : categories} />
            </div>
          </div>

          {/* Desktop navigation */}
          <DesktopNav 
            categories={categories}
            isLoading={isLoading}
            isAuthenticated={isAuthenticated}
            roleStaffAdmin={roleStaffAdmin}
            notifications={notifications}
            totalUnread={totalUnread}
            cartItems={formattedCartItems}
            onRemoveFromCart={handleRemoveFromCart}
            onMarkAllAsRead={handleMarkAllAsRead}
            totalPrice={totalPrice}
          />

          {/* Mobile menu buttons */}
          <div className="flex items-center lg:hidden">
            <button 
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="p-2 mr-2 text-gray-600 hover:text-black"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-black"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile search bar - expands when active */}
      <MobileSearchBar isOpen={mobileSearchOpen} />

      {/* Mobile menu */}
      <MobileNav
        isOpen={mobileMenuOpen}
        categories={categories}
        isLoading={isLoading}
        isAuthenticated={isAuthenticated} 
        roleStaffAdmin={roleStaffAdmin}
        cartItems={formattedCartItems}
        totalUnread={totalUnread}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default Navbar;
