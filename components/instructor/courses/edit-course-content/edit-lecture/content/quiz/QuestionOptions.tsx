import { Plus } from 'lucide-react';
import { QuizOption } from '@/types/lecture';
import { QuestionType } from '@/types/quiz';
import OptionItem from './OptionItem';
import { useQuizEdit } from '@/context/QuizEditContext';

interface QuestionOptionsProps {
    questionId: string;
    questionType: QuestionType;
    options: QuizOption[];
}

export default function QuestionOptions({
                                            questionId,
                                            questionType,
                                            options
                                        }: QuestionOptionsProps) {
    const { 
        onAddOption
    } = useQuizEdit();

    return (
        <div>
            <div className="mb-2 flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                    Các lựa chọn
                </label>
                {/* Only show add button for multiple choice and single choice */}
                {questionType !== QuestionType.TRUE_FALSE && (
                    <button
                        type="button"
                        onClick={() => onAddOption(questionId)}
                        className="inline-flex items-center text-xs text-black hover:text-gray-900"
                    >
                        <Plus size={14} className="mr-1"/> Thêm lựa chọn
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {options.map((option, index) => (
                    option.id ? <OptionItem
                        key={option.id}
                        questionId={questionId}
                        option={option}
                        optionIndex={index}
                        questionType={questionType}
                        // For True/False or if there are only 2 options, don't allow removal
                        canRemove={questionType !== QuestionType.TRUE_FALSE && options.length > 2}
                    /> : null
                ))}
            </div>
        </div>
    );
}