'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'

interface AIQuizTriggerButtonProps {
  onClick: () => void
}

export default function AIQuizTriggerButton({
  onClick,
}: AIQuizTriggerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg 
                  bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 
                  hover:from-purple-600 hover:via-violet-600 hover:to-indigo-600
                  text-white font-medium text-sm shadow-lg shadow-purple-500/25
                  transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105
                  focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
    >
      <Sparkles className="h-4 w-4 animate-pulse" />
      <span>Tạo bằng AI</span>

      {/* Animated glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-400 via-violet-400 to-indigo-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300" />
    </button>
  )
}
