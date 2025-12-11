'use client'

import React from 'react'
import {
  Search,
  FileQuestion,
  CheckCircle2,
  MessageSquare,
  ListChecks,
  LucideIcon,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { LoadingStep } from '@/hooks/quiz/useAIQuizGenerator'

// Icon mapping for loading steps
const STEP_ICONS: Record<LoadingStep['id'], LucideIcon> = {
  analyze: Search,
  questions: FileQuestion,
  answers: ListChecks,
  explanations: MessageSquare,
  finalize: CheckCircle2,
}

interface AILoadingStepProps {
  step: LoadingStep
  isActive: boolean
  isCompleted: boolean
  index: number
}

export default function AILoadingStep({
  step,
  isActive,
  isCompleted,
  index,
}: AILoadingStepProps) {
  const IconComponent = STEP_ICONS[step.id]

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 shadow-sm'
          : isCompleted
            ? 'bg-green-50 border border-green-200'
            : 'bg-gray-50 border border-gray-100'
      }`}
    >
      {/* Icon Container */}
      <div
        className={`relative flex items-center justify-center w-10 h-10 rounded-lg ${
          isActive
            ? 'bg-gradient-to-br from-purple-500 to-indigo-500'
            : isCompleted
              ? 'bg-gradient-to-br from-green-500 to-emerald-500'
              : 'bg-gray-200'
        }`}
      >
        {isActive ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <IconComponent className="w-5 h-5 text-white" />
          </motion.div>
        ) : isCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <CheckCircle2 className="w-5 h-5 text-white" />
          </motion.div>
        ) : (
          <IconComponent className="w-5 h-5 text-gray-400" />
        )}

        {/* Active pulse effect */}
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-purple-400"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </div>

      {/* Label */}
      <span
        className={`text-sm font-medium ${
          isActive
            ? 'text-purple-700'
            : isCompleted
              ? 'text-green-700'
              : 'text-gray-400'
        }`}
      >
        {step.label}
      </span>

      {/* Active indicator dots */}
      {isActive && (
        <div className="ml-auto flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-purple-500"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      )}

      {/* Completed checkmark */}
      {isCompleted && !isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-auto"
        >
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </motion.div>
      )}
    </motion.div>
  )
}
