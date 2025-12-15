"use client";

import {useState} from 'react';
import {Bell, Search, Menu, X, Settings, LogOut, User, HelpCircle} from 'lucide-react';
import { useAuth } from '@/providers';
import { useRouter } from 'next/navigation';

interface HeaderProps {
    onMenuButtonClick: () => void;
}

export default function Header({onMenuButtonClick}: HeaderProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const { logout } = useAuth();
    const router = useRouter();

    return (
        <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
            <button
                type="button"
                className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
                onClick={onMenuButtonClick}
            >
                <span className="sr-only">Mở sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true"/>
            </button>
            <div className="flex-1 px-4 flex justify-between">
                <div className="flex-1 flex">
                    {searchOpen ? (
                        <div className="w-full flex md:ml-0">
                            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="h-5 w-5" aria-hidden="true"/>
                                </div>
                                <input
                                    id="search-field"
                                    className="block w-full h-full pl-10 pr-3 py-2 border-transparent text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-0 focus:border-transparent sm:text-sm"
                                    placeholder="Tìm kiếm trong hệ thống..."
                                    type="search"
                                />
                                <button
                                    aria-label='searc open'
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                                    onClick={() => setSearchOpen(false)}
                                >
                                    <X className="h-5 w-5 text-gray-400 hover:text-gray-500"/>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            className="md:ml-6 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
                            onClick={() => setSearchOpen(true)}
                        >
                            <span className="sr-only">Tìm kiếm</span>
                            <Search className="h-5 w-5" aria-hidden="true"/>
                        </button>
                    )}
                </div>
                <div className="ml-4 flex items-center md:ml-6 space-x-4">
                    {/* Notification dropdown */}
                    {/* <div className="relative">
                        <button
                            type="button"
                            className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
                            onClick={() => {
                                setNotificationsOpen(!notificationsOpen);
                                setProfileOpen(false);
                            }}
                        >
                            <span className="sr-only">Xem thông báo</span>
                            <Bell className="h-6 w-6" aria-hidden="true"/>
                            <span
                                className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"/>
                        </button>

                        {notificationsOpen && (
                            <div
                                className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <h3 className="text-sm font-medium text-gray-900">Thông báo</h3>
                                </div>
                                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                                    <div className="px-4 py-3 hover:bg-gray-50">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 bg-indigo-500 rounded-md p-1">
                                                <User className="h-4 w-4 text-white"/>
                                            </div>
                                            <div className="ml-3 w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900">Người dùng mới đăng
                                                    ký</p>
                                                <p className="text-sm text-gray-500">5 người dùng mới đã đăng ký trong
                                                    24 giờ qua</p>
                                                <p className="mt-1 text-xs text-gray-400">2 giờ trước</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-4 py-3 hover:bg-gray-50">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 bg-green-500 rounded-md p-1">
                                                <Settings className="h-4 w-4 text-white"/>
                                            </div>
                                            <div className="ml-3 w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900">Cập nhật hệ thống</p>
                                                <p className="text-sm text-gray-500">Hệ thống sẽ được nâng cấp vào 00:00
                                                    ngày 15/03</p>
                                                <p className="mt-1 text-xs text-gray-400">1 ngày trước</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-4 py-3 hover:bg-gray-50">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 bg-yellow-500 rounded-md p-1">
                                                <Bell className="h-4 w-4 text-white"/>
                                            </div>
                                            <div className="ml-3 w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900">Yêu cầu phê duyệt khóa
                                                    học</p>
                                                <p className="text-sm text-gray-500">5 khóa học mới đang chờ phê
                                                    duyệt</p>
                                                <p className="mt-1 text-xs text-gray-400">3 ngày trước</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-gray-100 py-2 px-4">
                                    <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                        Xem tất cả thông báo
                                    </a>
                                </div>
                            </div>
                        )}
                    </div> */}

                    {/* Profile dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={() => {
                                setProfileOpen(!profileOpen);
                                setNotificationsOpen(false);
                            }}
                        >
                            <span className="sr-only">Mở menu người dùng</span>
                            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">A</span>
                            </div>
                        </button>

                        {profileOpen && (
                            <div
                                className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                                <a
                                    href="#"
                                    onClick={() => router.push('/profile/info')}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <User className="inline-block mr-2 h-4 w-4"/>
                                    Thông tin cá nhân
                                </a>
                                {/* <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <Settings className="inline-block mr-2 h-4 w-4"/>
                                    Cài đặt
                                </a> */}
                                {/* <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <HelpCircle className="inline-block mr-2 h-4 w-4"/>
                                    Trợ giúp
                                </a> */}
                                <div className="border-t border-gray-100"></div>
                                <a
                                    href="#"
                                    onClick={logout}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <LogOut className="inline-block mr-2 h-4 w-4"/>
                                    Đăng xuất
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}