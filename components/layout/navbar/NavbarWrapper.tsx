"use client";

import {usePathname} from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
    const pathname = usePathname();

    // Hàm xử lý điều hướng về trang chủ
// Ẩn Navbar nếu ở trang dashboard
    if (pathname === "/dashboard") return null;

    return <Navbar />;
}