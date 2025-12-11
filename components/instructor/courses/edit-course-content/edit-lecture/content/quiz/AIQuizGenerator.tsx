'use client'

import React from 'react'
import { AnimatePresence } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAIQuizGenerator } from '@/hooks/quiz/useAIQuizGenerator'
import { QuestionDto } from '@/types/quiz'
import {
  AIQuizTriggerButton,
  AIQuizFormContent,
  AILoadingContent,
} from './ai-quiz-generator'

interface AIQuizGeneratorProps {
  quizId: string
  onQuestionsGenerated: (questions: QuestionDto[]) => void
}

export default function AIQuizGenerator({
  quizId,
  onQuestionsGenerated,
}: AIQuizGeneratorProps) {
  const {
    isOpen,
    openDialog,
    closeDialog,
    prompt,
    setPrompt,
    isGenerating,
    currentLoadingStep,
    handleGenerate,
  } = useAIQuizGenerator({
    quizId,
    onQuestionsGenerated,
  })

  return (
    <>
      <AIQuizTriggerButton onClick={openDialog} />

      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-lg">
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <AILoadingContent currentStep={currentLoadingStep} />
            ) : (
              <AIQuizFormContent
                prompt={prompt}
                setPrompt={setPrompt}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
                onClose={closeDialog}
              />
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  )
}
