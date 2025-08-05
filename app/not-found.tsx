'use client';
import { useState, useEffect } from 'react';

export default function NotFound() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Simple geometric background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-100 rounded-full opacity-70" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-orange-100 rounded-full opacity-70" />
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-amber-100 rounded-full opacity-70" />
      </div>

      <div className={`text-center max-w-md transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* 404 Number */}
        <div className="mb-2">
          <h1 className="text-8xl md:text-9xl font-black text-gray-800 mb-4 relative">
            4
            <span className="text-gray-400">0</span>
            4
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-emerald-500 to-orange-500 rounded-full" />
          </h1>
        </div>

        {/* Error message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Trang không tìm thấy
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
          </p>
        </div>

        {/* Home button */}
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 bg-emerald-950 text-white rounded-lg font-medium hover:bg-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <svg 
            className="w-4 h-4 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Về trang chủ
        </a>

        {/* Simple decoration */}
        <div className="mt-12 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-black rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-gray-800 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
      </div>
    </div>
  );
}