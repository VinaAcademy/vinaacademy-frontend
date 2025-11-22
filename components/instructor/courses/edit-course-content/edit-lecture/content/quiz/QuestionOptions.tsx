import { Plus } from 'lucide-react';
import { QuizOption } from '@/types/lecture';
import { QuestionType } from '@/types/quiz';  // Import the QuestionType enum
import OptionItem from './OptionItem';

interface QuestionOptionsProps {
    questionType: QuestionType;  // Updated type
    options: QuizOption[];
    onAddOption: () => void;
    onRemoveOption: (optionId: string) => void;
    onUpdateOptionText: (optionId: string, text: string) => void;
    onToggleOptionCorrect: (optionId: string) => void;
}

export default function QuestionOptions({
                                            questionType,
                                            options,
                                            onAddOption,
                                            onRemoveOption,
                                            onUpdateOptionText,
                                            onToggleOptionCorrect
                                        }: QuestionOptionsProps) {

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
                        onClick={onAddOption}
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
                        option={option}
                        optionIndex={index}
                        questionType={questionType}
                        onRemove={() => onRemoveOption(option.id || '')}
                        onUpdateText={(text) => onUpdateOptionText(option.id || '', text)}
                        onToggleCorrect={() => onToggleOptionCorrect(option.id || '')}
                        // For True/False or if there are only 2 options, don't allow removal
                        canRemove={questionType !== QuestionType.TRUE_FALSE && options.length > 2}
                    /> : null
                ))}
            </div>
        </div>
    );
}