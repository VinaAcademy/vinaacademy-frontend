"use client";

import { useEffect, useState } from "react";
import { CartItem } from "@/types/navbar";
import HomeLink from "../HomeLink";
import DesktopNav from "./desktop/DesktopNav";
import MobileSearchBar from "./mobile/MobileSearchBar";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/context/CategoryContext";
import { useCart } from "@/context/CartContext";
import { useNotification } from "@/hooks/useNotification";
import { useToast } from "@/hooks/use-toast";
import { Search, Menu, X } from "lucide-react";
import ExploreDropdown from "./explore-dropdown/ExploreDropdown";
import MobileNav from "./mobile/MobileNav";
const Navbar = () => {
  const { categories, isLoading } = useCategories();
  const { isAuthenticated, user, logout } = useAuth();
  const { cartItems, removeFromCart, totalPrice } = useCart();
  const { notifications, unreadCount} = useNotification();
  const { toast } = useToast();
  const [formattedCartItems, setFormattedCartItems] = useState<CartItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const roleStaff =
    user?.roles.findLast(
      (role) => role.name === "staff"
    ) || null;
  const isAdmin = user?.roles.some((role) => role.name === "admin") || false;
  // Handle logout function
  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
  };

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const formatted = cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
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
            <HomeLink className="flex items-center">
              <span className="hidden sm:inline">Vina Academy</span>
            </HomeLink>
            {/* Categories dropdown - hidden on mobile */}
            <div className="hidden lg:block ml-6">
              <ExploreDropdown categories={isLoading ? [] : categories} />
            </div>
          </div>

          {/* Desktop navigation */}
          <DesktopNav
            categories={categories}
            isLoading={isLoading}
            roleStaff={roleStaff}
            roleAdmin={isAdmin}
            notifications={notifications}
            totalUnread={unreadCount}
            cartItems={formattedCartItems}
            onRemoveFromCart={handleRemoveFromCart}
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
        roleStaff={roleStaff}
        roleAdmin={isAdmin}
        cartItems={formattedCartItems}
        totalUnread={unreadCount}
        onClose={() => setMobileMenuOpen(false)}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default Navbar;
