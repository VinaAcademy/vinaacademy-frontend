"use client"; // Chỉ định rằng file này sẽ được render phía client
import {useState, useEffect} from "react"; // Import các hook useState và useEffect từ react
import {usePathname} from "next/navigation"; // Import hook usePathname từ next/navigation
import AnnouncementBar from "@/components/layout/announcement-bar/AnnouncementBar"; // Import component AnnouncementBar

// Định nghĩa component ClientWrapper
const ClientWrapper = () => {
    const [isClient, setIsClient] = useState(false);
    const pathname = usePathname();

    // Định nghĩa mảng các đường dẫn mà announcement bar sẽ bị ẩn

    const hiddenPaths = ['/categories', '/courses', "/profile", "/payment/checkout", "/login", "/register", "/requests", "/cart", "/settings"];


    // Sử dụng useEffect để cập nhật state isClient khi component được mount
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Kiểm tra nếu đường dẫn hiện tại khớp với bất kỳ đường dẫn nào trong mảng hiddenPaths
    if (hiddenPaths.some(path => pathname?.startsWith(path))) {
        return null;
    }

    // Nếu isClient là true, hiển thị AnnouncementBar, ngược lại trả về null
    return isClient ? <AnnouncementBar onClose={() => {
    }}/> : null;
};

export default ClientWrapper;
