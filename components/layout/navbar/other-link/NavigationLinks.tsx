import Link from "next/link";
import { useAuth } from '@/context/AuthContext';

// Định nghĩa component NavigationLinks
export const NavigationLinks = () => {
    const { isAuthenticated, user } = useAuth();

    // Xác định link cho "Trở thành Giảng viên/Giảng dạy"
    const teachingLink = (isAuthenticated && user?.roles.some(role => role.code === "instructor"))
        ? { href: "/instructor/dashboard", label: "Giảng dạy" }
        : { href: "/instructors", label: "Trở thành Giảng viên" };

    const links = [
        teachingLink,
    ];

    return (
        <ul className="hidden md:flex items-center space-x-6">
            {links.map((link) => (
                <li key={link.href}>
                    <Link
                        href={link.href}
                        className="hover:text-gray-500 transition-colors duration-200"
                    >
                        {link.label}
                    </Link>
                </li>
            ))}
        </ul>
    );
};

export default NavigationLinks;