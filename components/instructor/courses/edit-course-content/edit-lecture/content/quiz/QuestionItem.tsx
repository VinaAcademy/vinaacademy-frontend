import {
    ChevronUp,
    ChevronDown,
    Edit,
    CheckCircle2
} from 'lucide-react';
import QuestionContent from './QuestionContent';
import {QuizQuestion} from '@/types/lecture';
import {useState} from 'react';

interface QuestionItemProps {
    question: QuizQuestion;
    index: number;
    isExpanded: boolean;
    onToggleExpand: () => void;
    totalQuestions: number;
}

export default function QuestionItem({
                                         question,
                                         index,
                                         isExpanded,
                                         onToggleExpand,
                                         totalQuestions
                                     }: QuestionItemProps) {
    const [isHovered, setIsHovered] = useState(false);
// Check if question is valid
    const isValid = question.text &&
        (question.type === 'text' ||
            question.options.some(o => o.text && o.isCorrect));

    // Get badge color based on question type
    const getTypeBadgeClass = () => {
        switch (question.type) {
            case 'single_choice':
                return "bg-blue-100 text-blue-700 border-blue-200";
            case 'multiple_choice':
                return "bg-green-100 text-green-700 border-green-200";
            case 'true_false':
                return "bg-amber-100 text-amber-700 border-amber-200";
            case 'text':
                return "bg-purple-100 text-purple-700 border-purple-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div
            className={`border ${isExpanded ? 'border-blue-300 shadow-md' : 'border-gray-200 hover:border-blue-200 hover:shadow-sm'} rounded-lg overflow-hidden transition-all duration-200 ease-in-out`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Question header */}
            <div
                className={`${isExpanded ? 'bg-blue-50' : 'bg-white'} p-4 flex items-center justify-between cursor-pointer transition-colors duration-200`}
                onClick={onToggleExpand}
            >
                <div className="flex items-center flex-1">
                    <div
                        className={`flex items-center justify-center w-8 h-8 ${isValid ? 'bg-blue-600' : 'bg-gray-400'} text-white rounded-full text-sm font-medium mr-4 transition-colors`}>
                        {index + 1}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center mb-1">
                            <div className="mr-2 font-medium text-gray-800 line-clamp-1">
                                {question.text ? question.text :
                                    <span className="text-gray-400 italic">Câu hỏi chưa có tiêu đề</span>}
                            </div>
                            {isValid && <CheckCircle2 className="text-green-500 h-4 w-4"/>}
                        </div>
                        <div className="flex items-center text-sm">
                            <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeClass()}`}>
                                {question.type === 'single_choice' && "Chọn một"}
                                {question.type === 'multiple_choice' && "Chọn nhiều"}
                                {question.type === 'true_false' && "Đúng / Sai"}
                                {question.type === 'text' && "Tự luận"}
                            </span>
                            <span className="mx-2">•</span>
                            <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                                {question.points} điểm
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    {isHovered && !isExpanded && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleExpand();
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                            title="Chỉnh sửa câu hỏi"
                        >
                            <Edit size={16}/>
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleExpand();
                        }}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        {isExpanded ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                    </button>
                </div>
            </div>

            {/* Question content (expanded) */}
            {isExpanded && (
                <QuestionContent
                    question={question}
                    index={index}
                    totalQuestions={totalQuestions}
                />
            )}
        </div>
    );
}