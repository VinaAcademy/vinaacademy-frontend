import {
    Trash2,
    Lightbulb,
    ArrowUp,
    ArrowDown,
    Save
} from 'lucide-react';
import {QuizQuestion} from '@/types/lecture';
import { QuestionType } from '@/types/quiz';  // Import the QuestionType enum
import QuestionForm from './QuestionForm';
import QuestionOptions from './QuestionOptions';
import QuestionActions from './QuestionActions';
import React, { useState } from 'react';

interface QuestionContentProps {
    question: QuizQuestion;
    index: number;
    totalQuestions: number;
    onUpdateText: (text: string) => void;
    onUpdateType: (type: QuestionType) => void;  // Updated type
    onAddOption: () => void;
    onRemoveOption: (optionId: string) => void;
    onUpdateOptionText: (optionId: string, text: string) => void;
    onToggleOptionCorrect: (optionId: string) => void;
    onUpdateExplanation: (text: string) => void;
    onUpdatePoints: (points: number) => void;
    onToggleRequired: () => void;
    onDuplicate: () => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}

export default function QuestionContent({
                                            question,
                                            index,
                                            totalQuestions,
                                            onUpdateText,
                                            onUpdateType,
                                            onAddOption,
                                            onRemoveOption,
                                            onUpdateOptionText,
                                            onToggleOptionCorrect,
                                            onUpdateExplanation,
                                            onUpdatePoints,
                                            onDuplicate,
                                            onRemove,
                                            onMoveUp,
                                            onMoveDown
                                        }: QuestionContentProps) {

    const [explanation, setExplanation] = useState(question.explanation || '');
    const [isExplanationChanged, setIsExplanationChanged] = useState(false);

    const handleExplanationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setExplanation(e.target.value);
        setIsExplanationChanged(true);
    };

    const saveExplanation = () => {
        onUpdateExplanation(explanation);
        setIsExplanationChanged(false);
    };

    return (
        <div className="p-5 space-y-6 bg-gradient-to-b from-blue-50 to-white">
            {/* Navigation controls */}
            <div className="flex justify-between">
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={onMoveUp}
                        disabled={index === 0}
                        className={`p-2 text-gray-600 hover:bg-gray-100 rounded ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Di chuyển lên"
                    >
                        <ArrowUp size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={onMoveDown}
                        disabled={index === totalQuestions - 1}
                        className={`p-2 text-gray-600 hover:bg-gray-100 rounded ${index === totalQuestions - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Di chuyển xuống"
                    >
                        <ArrowDown size={16} />
                    </button>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="p-2 text-red-600 hover:bg-red-50 hover:text-red-700 rounded transition-colors"
                        title="Xóa câu hỏi"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Question Form - Text & Type & Points */}
            <QuestionForm
                text={question.text}
                type={(question.type === 'single_choice' ? QuestionType.SINGLE_CHOICE :
                    question.type === 'multiple_choice' ? QuestionType.MULTIPLE_CHOICE :
                        QuestionType.TRUE_FALSE) as QuestionType}  // Updated type
                points={question.points}
                onUpdateText={onUpdateText}
                onUpdateType={onUpdateType}
                onUpdatePoints={onUpdatePoints}
            />

            {/* Question Options */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 transition-all hover:shadow-sm">
                <QuestionOptions
                    questionType={
                        question.type === 'single_choice' ? QuestionType.SINGLE_CHOICE :
                        question.type === 'multiple_choice' ? QuestionType.MULTIPLE_CHOICE :
                            QuestionType.TRUE_FALSE
                    }
                    options={question.options || []}
                    onAddOption={onAddOption}
                    onRemoveOption={onRemoveOption}
                    onUpdateOptionText={onUpdateOptionText}
                    onToggleOptionCorrect={onToggleOptionCorrect}
                />
            </div>

            {/* Question Explanation */}
            <div className="bg-amber-50 p-5 rounded-lg border border-amber-100">
                <label htmlFor={`explanation-${question.id}`} className="block text-sm font-medium text-amber-800 mb-2 items-center">
                    <Lightbulb className="h-4 w-4 mr-2 text-amber-600" />
                    Giải thích đáp án
                </label>
                <textarea
                    id={`explanation-${question.id}`}
                    value={explanation}
                    onChange={handleExplanationChange}
                    rows={3}
                    className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full text-base p-3 border-amber-200 rounded-md bg-white"
                    placeholder="Nhập giải thích cho đáp án (hiển thị sau khi học viên trả lời)"
                />
                <div className="mt-2 flex justify-end">
                    <button
                        onClick={saveExplanation}
                        disabled={!isExplanationChanged}
                        className={`flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-md hover:bg-amber-700 transition-colors ${!isExplanationChanged ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        Lưu giải thích
                    </button>
                </div>
            </div>

            {/* Question Actions */}
            <QuestionActions
                index={index}
                totalQuestions={totalQuestions}
                onDuplicate={onDuplicate}
                onRemove={onRemove}
                onMoveUp={onMoveUp}
                onMoveDown={onMoveDown}
            />
        </div>
    );
}