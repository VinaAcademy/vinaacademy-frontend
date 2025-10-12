"use client"; // Chỉ định rằng file này sẽ được render phía client
import {usePathname} from "next/navigation"; // Import hook usePathname từ next/navigation
import AnnouncementBar from "@/components/layout/announcement-bar/AnnouncementBar";
import {useAuth} from "@/context/AuthContext"; // Import component AnnouncementBar

// Định nghĩa component ClientWrapper
const ClientWrapper = () => {
    const {isAuthenticated} = useAuth();
    const pathname = usePathname();

    // Định nghĩa mảng các đường dẫn mà announcement bar sẽ bị ẩn

    const hiddenPaths = ['/categories', '/courses', "/profile", "/payment/checkout", "/login", "/register", "/requests", "/cart", "/settings"];

    // Kiểm tra nếu đường dẫn hiện tại khớp với bất kỳ đường dẫn nào trong mảng hiddenPaths
    if (hiddenPaths.some(path => pathname?.startsWith(path))) {
        return null;
    }

    return !isAuthenticated ? <AnnouncementBar onClose={() => {
    }}/> : null;
};

export default ClientWrapper;
