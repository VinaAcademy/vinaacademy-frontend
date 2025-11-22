import {
    Trash2,
    Lightbulb,
    ArrowUp,
    ArrowDown,
    Save
} from 'lucide-react';
import {QuizQuestion} from '@/types/lecture';
import { QuestionType as QuizQuestionType } from '@/types/quiz';
import QuestionForm from './QuestionForm';
import QuestionOptions from './QuestionOptions';
import React, { useState } from 'react';
import { useQuizEdit } from '@/context/QuizEditContext';

// Helper to convert lecture question type (string) to quiz question type (enum)
const toQuizQuestionType = (type: string): QuizQuestionType => {
    switch(type) {
        case 'single_choice':
            return QuizQuestionType.SINGLE_CHOICE;
        case 'multiple_choice':
            return QuizQuestionType.MULTIPLE_CHOICE;
        case 'true_false':
            return QuizQuestionType.TRUE_FALSE;
        default:
            return QuizQuestionType.SINGLE_CHOICE;
    }
};

interface QuestionContentProps {
    question: QuizQuestion;
    index: number;
    totalQuestions: number;
}

export default function QuestionContent({
                                            question,
                                            index,
                                            totalQuestions
                                        }: QuestionContentProps) {
    const {
        onUpdateQuestionText,
        onUpdateQuestionType,
        onUpdateExplanation,
        onUpdatePoints,
        onRemoveQuestion,
        onMoveQuestion
    } = useQuizEdit();

    const [explanation, setExplanation] = useState(question.explanation || '');
    const [isExplanationChanged, setIsExplanationChanged] = useState(false);

    const handleExplanationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setExplanation(e.target.value);
        setIsExplanationChanged(true);
    };

    const saveExplanation = () => {
        onUpdateExplanation(question.id || '', explanation);
        setIsExplanationChanged(false);
    };

    return (
        <div className="p-5 space-y-6 bg-gradient-to-b from-blue-50 to-white">
            {/* Navigation controls */}
            <div className="flex justify-between">
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => onMoveQuestion(question.id || '', 'up')}
                        disabled={index === 0}
                        className={`p-2 text-gray-600 hover:bg-gray-100 rounded ${index === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Di chuyển lên"
                    >
                        <ArrowUp size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => onMoveQuestion(question.id || '', 'down')}
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
                        onClick={() => onRemoveQuestion(question.id || '')}
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
                type={toQuizQuestionType(question.type)}
                points={question.points}
                onUpdateText={(text) => onUpdateQuestionText(question.id || '', text)}
                onUpdateType={(type) => onUpdateQuestionType(question.id || '', type)}
                onUpdatePoints={(points) => onUpdatePoints(question.id || '', points)}
            />

            {/* Question Options */}
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 transition-all hover:shadow-sm">
                <QuestionOptions
                    questionId={question.id || ''}
                    questionType={toQuizQuestionType(question.type)}
                    options={question.options || []}
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
        </div>
    );
}