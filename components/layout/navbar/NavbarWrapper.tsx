"use client";

import {usePathname} from "next/navigation";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
    const pathname = usePathname();

    if (pathname === "/dashboard") return null;

    return <Navbar />;
}