'use client'

import WelcomeSection from '@/components/layout/home/WelcomeSection'
import BannerSection from '@/components/layout/home/BannerSection'
import RecentCoursesSection from '@/components/layout/home/RecentCoursesSection'
import LearningRecommendations from '@/components/layout/home/LearningRecommendations'
import TopRatedCourses from '@/components/layout/home/TopRatedCourses'
import NewCoursesSection from '@/components/layout/home/NewCoursesSection'
import PopularCoursesSection from '@/components/layout/home/PopularCoursesSection'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { motion } from 'framer-motion'
import Link from 'next/link'
import TestSection from '@/components/layout/home/TestSection'
import HeroSection from '@/components/layout/home/HeroSection'
import PopularCourseFeatures from '@/components/layout/home/PopularCourseFeatures'
import ImageSection from '@/components/layout/home/ImageSection'
import InstructorSection from '@/components/layout/home/InstructorSection'
import SupportChat from '@/components/layout/home/SupportChat'

const userAvatar = ''

export default function Home() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const [contentLoading, setContentLoading] = useState(true)
  const username =
    user?.fullName || user?.email || user?.username || 'Người dùng'

  // Simulate content loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setContentLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Enhanced animation variants with smoother transitions
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }
  //   if (isAuthenticated) {
  //     const notificationData = {
  //       title: `Bạn là gì test`,
  //       content: `Lí do: test`,
  //       targetUrl: `/instructor/courses`,
  //       userId: user?.id||"undefined",
  //       type: NotificationType.SYSTEM,
  //     };

  //     createNotification(notificationData);
  //   }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
        duration: 0.4,
      },
    },
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg=transparent px-2 sm:px-4">
      {/* bg-gradient-to-b from-gray-50 to-gray-100 */}
      <div className="w-full">
        <WelcomeSection userName={username} userAvatar={userAvatar} />
        <HeroSection />
        {authLoading ? (
          <div className="w-full">
            <Skeleton className="h-16 sm:h-20 w-full rounded-lg mb-4 shadow-sm" />
          </div>
        ) : (
          isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-4"
            >
              
            </motion.div>
          )
        )}

        {contentLoading ? (
          <Skeleton className="h-52 sm:h-56 md:h-64 w-full rounded-lg mb-6 shadow-md" />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-5 flex items-center justify-center mx-auto"
          >
            <BannerSection />
          </motion.div>
        )}

        {contentLoading ? (
          <div className="space-y-6">
            <div className="mb-4">
              <Skeleton className="h-8 w-36 mb-3 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <Skeleton className="h-48 sm:h-52 rounded-lg shadow-sm" />
                <Skeleton className="h-48 sm:h-52 rounded-lg shadow-sm" />
                <Skeleton className="h-48 sm:h-52 rounded-lg shadow-sm hidden md:block" />
              </div>
            </div>

            <div className="mb-4">
              <Skeleton className="h-8 w-40 mb-3 rounded-md" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <Skeleton className="h-48 sm:h-52 rounded-lg shadow-sm" />
                <Skeleton className="h-48 sm:h-52 rounded-lg shadow-sm" />
                <Skeleton className="h-48 sm:h-52 rounded-lg shadow-sm hidden md:block" />
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            className="space-y-8 sm:space-y-10 mt-3 max-w-7xl flex justify-center flex-col mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={itemVariants}>
              <RecentCoursesSection />
            </motion.div>

            <motion.div variants={itemVariants}>
              <LearningRecommendations />
            </motion.div>

            <motion.div variants={itemVariants}>
              <PopularCoursesSection />
            </motion.div>

            <motion.div variants={itemVariants}>
              <TopRatedCourses />
            </motion.div>

            <motion.div variants={itemVariants}>
              <NewCoursesSection />
            </motion.div>
          </motion.div>
        )}

        {!contentLoading && (
          <div className="flex justify-end mt-8">
            <Link
              href="/courses"
              className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-1 font-medium"
            >
              Tất cả khóa học
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        )}
        <TestSection />
        <div className="w-full">
          <ImageSection />
        </div>
        <div className="w-full">
          <InstructorSection />
        </div>
        <div className="w-full">
          <PopularCourseFeatures />
        </div>
      </div>
      <SupportChat />
    </div>
  )
}
