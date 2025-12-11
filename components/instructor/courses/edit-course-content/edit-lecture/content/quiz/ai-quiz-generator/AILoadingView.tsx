'use client'

import React from 'react'
import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { LOADING_STEPS } from '@/hooks/quiz/useAIQuizGenerator'
import AILoadingStep from './AILoadingStep'

interface AILoadingViewProps {
  currentStep: number
}

export default function AILoadingView({ currentStep }: AILoadingViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-4 py-6"
    >
      {/* AI Brain Animation */}
      <div className="flex justify-center mb-6">
        <motion.div
          className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 flex items-center justify-center shadow-xl shadow-purple-500/30"
          animate={{
            boxShadow: [
              '0 20px 40px -10px rgba(147, 51, 234, 0.3)',
              '0 20px 60px -10px rgba(147, 51, 234, 0.5)',
              '0 20px 40px -10px rgba(147, 51, 234, 0.3)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-10 h-10 text-white" />
          </motion.div>

          {/* Orbiting particles */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-white/80"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear',
                delay: i * 1,
              }}
              style={{
                transformOrigin: '40px 40px',
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Progress text */}
      <motion.p
        className="text-center text-sm text-gray-500 mb-4"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        AI đang xử lý yêu cầu của bạn...
      </motion.p>

      {/* Loading Steps */}
      <div className="space-y-2">
        {LOADING_STEPS.map((step, index) => (
          <AILoadingStep
            key={step.id}
            step={step}
            index={index}
            isActive={index === currentStep}
            isCompleted={index < currentStep}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500"
            initial={{ width: '0%' }}
            animate={{
              width: `${((currentStep + 1) / LOADING_STEPS.length) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Bước {currentStep + 1} / {LOADING_STEPS.length}
        </p>
      </div>
    </motion.div>
  )
}
