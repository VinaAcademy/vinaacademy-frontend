// context/QuizEditContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { QuestionType } from '@/types/quiz';

/**
 * Context to eliminate props drilling in the quiz editor component hierarchy:
 * QuizEditor → QuestionList → QuestionItem → QuestionContent → QuestionOptions → OptionItem
 * 
 * This context provides all the handlers needed to manipulate quiz questions and options
 * without passing them through every component layer.
 */

interface QuizEditContextValue {
  // Question handlers
  onAddQuestion: () => void;
  onRemoveQuestion: (id: string) => void;
  onDuplicateQuestion: (id: string) => void;
  onUpdateQuestionText: (id: string, text: string) => void;
  onUpdateQuestionType: (id: string, type: QuestionType) => void;
  onUpdateExplanation: (id: string, explanation: string) => void;
  onUpdatePoints: (id: string, points: number) => void;
  onToggleRequired: (id: string) => void;
  onMoveQuestion: (id: string, direction: 'up' | 'down') => void;
  
  // Option handlers
  onAddOption: (questionId: string) => void;
  onRemoveOption: (questionId: string, optionId: string) => void;
  onUpdateOptionText: (questionId: string, optionId: string, text: string) => void;
  onToggleOptionCorrect: (questionId: string, optionId: string) => void;
  
  // Expansion state (shared between QuestionList and QuestionItem)
  expandedQuestion: string;
  setExpandedQuestion: (id: string) => void;
}

const QuizEditContext = createContext<QuizEditContextValue | undefined>(undefined);

interface QuizEditProviderProps {
  children: ReactNode;
  value: QuizEditContextValue;
}

export function QuizEditProvider({ children, value }: QuizEditProviderProps) {
  return (
    <QuizEditContext.Provider value={value}>
      {children}
    </QuizEditContext.Provider>
  );
}

/**
 * Hook to access quiz editing functions from any component in the hierarchy.
 * Eliminates the need to pass props through multiple levels.
 */
export function useQuizEdit() {
  const context = useContext(QuizEditContext);
  if (context === undefined) {
    throw new Error('useQuizEdit must be used within a QuizEditProvider');
  }
  return context;
}
