'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { AlertCircle } from 'lucide-react';

interface FullPageLoadingOverlayProps {
  children: React.ReactNode;
  error?: string | null;
}

/**
 * FullPageLoadingOverlay - Displays a full-screen loading overlay
 * 
 * This component wraps the application content and shows a loading overlay
 * when the AuthContext is in a loading state (isLoading === true).
 * 
 * Features:
 * - Full-screen semi-transparent backdrop
 * - Centered loading spinner with animation
 * - Error message display when error prop is provided
 * - Automatically hides when loading is complete
 * - Prevents interaction with content behind overlay
 * 
 * Usage:
 * ```tsx
 * <FullPageLoadingOverlay error={error}>
 *   <YourAppContent />
 * </FullPageLoadingOverlay>
 * ```
 */
export default function FullPageLoadingOverlay({ 
  children, 
  error = null 
}: FullPageLoadingOverlayProps) {
  const { isLoading } = useAuth();

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="alert"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-lg shadow-2xl">
            {/* Spinner */}
            <div className="relative">
              <LoadingSpinner size="lg" className="text-blue-600 w-16 h-16 border-4" />
            </div>
            
            {/* Loading Text */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Đang tải...
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Vui lòng đợi trong giây lát
              </p>
            </div>

            {/* Animated dots */}
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0.3s]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message Overlay */}
      {error && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex flex-col items-center space-y-4 p-8 bg-white rounded-lg shadow-2xl max-w-md mx-4">
            {/* Error Icon */}
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            
            {/* Error Text */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Đã xảy ra lỗi
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                {error}
              </p>
            </div>

            {/* Retry Button */}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      )}

      {/* App Content - Only rendered when not loading and no error */}
      {!isLoading && !error && children}
    </>
  );
}
