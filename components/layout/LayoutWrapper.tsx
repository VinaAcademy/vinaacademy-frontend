"use client";

import { usePathname } from "next/navigation";
import Navbar from "./navbar/Navbar";
import ClientWrapper from "./announcement-bar/ClientWrapper";
import Footer from "./Footer";
import LogoClickHandler from "./LogoClickHandler";
import {APP_CONFIG} from "@/config/app.config";
import React from "react";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Danh sách từ khóa để ẩn layout nếu đường dẫn chứa bất kỳ từ nào trong đây, trừ việc loại bỏ "/instructor"
    const hiddenKeywords = ["/dashboard", "/admin", "/learning"];

    // Kiểm tra nếu đường dẫn bắt đầu bằng các đường dẫn instructor cần ẩn
    const isHiddenInstructorPath = APP_CONFIG.HIDE_LAYOUT_ROUTES.some(path =>
        pathname === path || pathname.startsWith(`${path}`)
    );

    // Kiểm tra nếu chứa các từ khóa khác cần ẩn layout
    const hasHiddenKeyword = hiddenKeywords.some(keyword =>
        pathname.includes(keyword)
    );

    // Chỉ ẩn layout nếu là trang instructor cần ẩn HOẶC chứa từ khóa khác cần ẩn
    const shouldHideLayout = isHiddenInstructorPath || hasHiddenKeyword;

    return (
        <div className="relative">
            <div className="fixed top-0 left-0 right-0 z-50 w-full">
                {!shouldHideLayout && <ClientWrapper />}
                {!shouldHideLayout && <Navbar />}
            </div>
            {!shouldHideLayout && <LogoClickHandler />}
            <div className={`bg-gray-100 ${!shouldHideLayout ? "pt-24" : "pt-0"}`}>
                {children}
            </div>
            {!shouldHideLayout && <Footer />}
        </div>
    );
}