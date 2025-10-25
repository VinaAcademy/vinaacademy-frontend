// app/user/[userId]/UserProfileContent.tsx
"use client";

import {format} from "date-fns";
import {QueryClient, QueryClientProvider, useQuery,} from "@tanstack/react-query";
import {getViewUserInfo} from "@/services/profileService";
import {Award, Book, Calendar, CheckCircle, Clock, Globe, Mail, User} from "lucide-react";
import {Button} from "@/components/ui/button";
import {getImageUrl} from "@/utils/imageUtils";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar-shadcn";
import {USER_KEYS} from "@/config/query-keys.config";

const queryClient = new QueryClient();

function UserProfileContentInner({ userId }: { userId: string }) {
  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: USER_KEYS.byId(userId),
    queryFn: async () => {
      try {
        return await getViewUserInfo(userId);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    },
    enabled: !!userId,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-red-50 rounded-xl p-8">
        <div className="text-red-600 text-xl font-medium">Không thể tải trang này vì ID trống</div>
        <Button 
          onClick={() => window.history.back()} 
          variant="outline"
          className="mt-4 px-6 py-2"
        >
          Quay lại
        </Button>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center p-16 bg-gray-50 rounded-xl shadow-sm">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
        </div>
        <h3 className="text-red-500 font-medium text-xl">
          Lỗi khi tải trang thông tin
        </h3>
        <p className="text-gray-600 mt-3 max-w-md mx-auto">
          {error instanceof Error 
            ? `Lỗi: ${error.message}` 
            : 'Hãy thử lại sau giây lát.'}
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <Button onClick={() => refetch()} className="px-8 py-2 bg-blue-600 hover:bg-blue-700">
            Thử lại
          </Button>
          <Button 
            onClick={() => window.history.back()} 
            variant="outline"
            className="px-8 py-2"
          >
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  const formatBirthday = (dateString: string): string | null => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (err) {
      console.error("Invalid date format:", err);
      return dateString;
    }
  };
  
  const formatCreatedDate = (dateString: string): string | null => {
    if (!dateString) return null;
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch (err) {
      console.error("Invalid date format:", err);
      return dateString;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl mx-auto">
      {/* Cover background */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 h-48 relative">
        <div className="absolute inset-0 opacity-20 bg-[url('/pattern.svg')]"></div>
      </div>

      <div className="px-8 py-8 relative">
        <div className="flex flex-col md:flex-row">
          {/* Avatar */}
          <div className="md:mr-8">
            <div className="absolute -top-20 md:-top-20 left-8 border-4 border-white rounded-full shadow-xl">
              <Avatar className="w-36 h-36">
                <AvatarImage 
                  src={user.avatarUrl ? getImageUrl(user.avatarUrl) : undefined} 
                  alt={user.fullName} 
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100">
                  <User size={40} className="text-blue-500" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Basic info */}
          <div className="mt-20 md:mt-16 flex-1">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                  {user.fullName}
                </h1>
                <p className="text-gray-500 mt-1">{user.email || '@' + userId}</p>
              </div>
            </div>

            {/* Roles */}
            <div className="flex mt-4 flex-wrap gap-2">
              {user.roles && user.roles.map((role: any) => (
                <span
                  key={role.id || `role-${Math.random()}`}
                  className="bg-gradient-to-r from-purple-100 to-indigo-100 text-indigo-800 px-4 py-1.5 rounded-full text-sm font-medium flex items-center shadow-sm"
                >
                  <Award size={14} className="mr-1.5" />
                  {role.name || role.code || 'User'}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* User details section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Left column - Profile info */}
          <div className="md:col-span-2">
            {/* Description */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                <Globe size={18} className="mr-2 text-blue-500" />
                Giới thiệu
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {user.description || "Không có"}
              </p>
            </div>

            {/* Additional info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Birthday */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
                <div className="bg-red-100 p-2.5 rounded-full mr-4">
                  <Calendar size={20} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Birthday</p>
                  <p className="text-gray-800 font-medium">
                    {user.birthday ? formatBirthday(user.birthday) : "trống"}
                  </p>
                </div>
              </div>

              {/* Email field */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
                <div className="bg-blue-100 p-2.5 rounded-full mr-4">
                  <Mail size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-800 font-medium">
                    {user.email || "Not shared"}
                  </p>
                </div>
              </div>
              
              {/* Account Creation Date */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
                <div className="bg-amber-100 p-2.5 rounded-full mr-4">
                  <Clock size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ngày tạo</p>
                  <p className="text-gray-800 font-medium">
                    {user.createdDate ? formatCreatedDate(user.createdDate) : "trống"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Stats */}
          <div>
            <div className="bg-white border border-gray-100 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Book size={18} className="mr-2 text-blue-600" />
                Các khóa học
              </h3>

              <div className="space-y-4">
                {/* Courses Created */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-200 p-2 rounded-full mr-3">
                        <Book size={16} className="text-blue-700" />
                      </div>
                      <span className="text-gray-700 font-medium">Đã tạo</span>
                    </div>
                    <span className="text-xl font-bold text-blue-700">
                      {user.countCourseCreate || 0}
                    </span>
                  </div>
                </div>

                {/* Courses Enrolled */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-purple-200 p-2 rounded-full mr-3">
                        <Book size={16} className="text-purple-700" />
                      </div>
                      <span className="text-gray-700 font-medium">Đã tham gia</span>
                    </div>
                    <span className="text-xl font-bold text-purple-700">
                      {user.countCourseEnroll || 0}
                    </span>
                  </div>
                </div>

                {/* Courses Completed */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-green-200 p-2 rounded-full mr-3">
                        <CheckCircle size={16} className="text-green-700" />
                      </div>
                      <span className="text-gray-700 font-medium">Đã hoàn thành</span>
                    </div>
                    <span className="text-xl font-bold text-green-700">
                      {user.countCourseEnrollComplete || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UserProfileContent({ userId }: { userId: string }) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProfileContentInner userId={userId} />
    </QueryClientProvider>
  );
}