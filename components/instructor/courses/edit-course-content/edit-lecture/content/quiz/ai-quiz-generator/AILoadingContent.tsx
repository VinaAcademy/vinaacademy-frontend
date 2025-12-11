'use client'

import React from 'react'
import { Wand2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { DialogHeader, DialogTitle } from '@/components/ui/dialog'
import AILoadingView from './AILoadingView'

interface AILoadingContentProps {
  currentStep: number
  progress: number
  statusMessage: string
}

export default function AILoadingContent({
  currentStep,
  progress,
  statusMessage,
}: AILoadingContentProps) {
  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500">
            <Wand2 className="h-5 w-5 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Đang tạo câu hỏi...
          </span>
        </DialogTitle>
      </DialogHeader>
      <AILoadingView
        currentStep={currentStep}
        progress={progress}
        statusMessage={statusMessage}
      />
    </motion.div>
  )
}
