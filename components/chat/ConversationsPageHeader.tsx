import {MessageCircle} from "lucide-react";
import React from "react";

type ConversationsPageHeaderProps = {
    connected?: boolean;
    connecting?: boolean;
};

export default function ConversationsPageHeader({connected, connecting}: ConversationsPageHeaderProps) {
    return <div className="mb-6 space-y-3">
        <div className="flex items-center gap-3">
            <div className="relative">
                <div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-sky-600 rounded-xl blur opacity-20"></div>
                <div className="relative bg-gradient-to-r from-cyan-600 to-sky-600 p-2.5 rounded-xl shadow-md">
                    <MessageCircle className="h-6 w-6 text-white"/>
                </div>
            </div>
            <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    Tin nhắn
                </h1>
                <p className="text-gray-600 text-sm mt-0.5">
                    Kết nối với giảng viên, sinh viên và nhóm học tập của bạn.
                </p>
            </div>
        </div>

        {/* Connection Status with better styling */}
        {!connected && !connecting && (
            <div
                className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm animate-in slide-in-from-top-2 duration-300">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></div>
                <span className="font-medium">Chat đang bị ngắt kết nối. Hệ thống sẽ tự động thử lại...</span>
            </div>
        )}
        {connecting && (
            <div
                className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm animate-in slide-in-from-top-2 duration-300">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="font-medium">Đang kết nối để trò chuyện...</span>
            </div>
        )}
        {connected && (
            <div
                className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm animate-in slide-in-from-top-2 duration-300">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <span className="font-medium">Đã kết nối</span>
            </div>
        )}
    </div>;
}