import { useState, useEffect } from 'react';
import { QuestionType } from '@/types/quiz';  // Import the QuestionType enum
import { Save, PenSquare } from 'lucide-react';

interface QuestionFormProps {
    text: string;
    type: QuestionType;  // Updated type
    points: number;
    onUpdateText: (text: string) => void;
    onUpdateType: (type: QuestionType) => void;  // Updated type
    onUpdatePoints: (points: number) => void;
}

export default function QuestionForm({
                                         text,
                                         type,
                                         points,
                                         onUpdateText,
                                         onUpdateType,
                                         onUpdatePoints
                                     }: QuestionFormProps) {
    // Local state to track form values
    const [localText, setLocalText] = useState(text);
    const [localType, setLocalType] = useState(type);
    const [localPoints, setLocalPoints] = useState(points);
    const [isEditing, setIsEditing] = useState(false);

    // Update local state when props change
    useEffect(() => {
        setLocalText(text);
        setLocalType(type);
        setLocalPoints(points);
    }, [text, type, points]);

    // Save all question changes at once
    const handleSaveChanges = () => {
        onUpdateText(localText);
        onUpdateType(localType);
        onUpdatePoints(localPoints);
        setIsEditing(false);
    };

    // Get CSS class for question type
    const getTypeClass = () => {
        switch(type) {
            case QuestionType.SINGLE_CHOICE:
                return "bg-blue-100 text-blue-700 border-blue-200";
            case QuestionType.MULTIPLE_CHOICE:
                return "bg-green-100 text-green-700 border-green-200";
            case QuestionType.TRUE_FALSE:
                return "bg-amber-100 text-amber-700 border-amber-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className="space-y-4 bg-white p-5 rounded-lg border border-gray-100 shadow-sm transition-all hover:shadow-md">
            {/* Question text */}
            <div>
                <label htmlFor="question-text" className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <PenSquare className="h-4 w-4 mr-1" />
                    Nội dung câu hỏi <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                    <input
                        type="text"
                        id="question-text"
                        value={localText}
                        onChange={(e) => {
                            setLocalText(e.target.value);
                            setIsEditing(true);
                        }}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base p-3 border-gray-300 rounded-md bg-white transition-all"
                        placeholder="Nhập nội dung câu hỏi"
                    />
                </div>
            </div>

            {/* Question type and points */}
            <div className="grid grid-cols-2 gap-6 mt-4">
                <div>
                    <label htmlFor="question-type" className="block text-sm font-medium text-gray-700 mb-1">
                        Loại câu hỏi
                    </label>
                    <div className="relative">
                        <select
                            id="question-type"
                            value={localType}
                            onChange={(e) => {
                                setLocalType(e.target.value as QuestionType);
                                setIsEditing(true);
                            }}
                            className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base p-3 border-gray-300 rounded-md bg-white transition-all`}
                        >
                            <option value={QuestionType.SINGLE_CHOICE}>Chọn một đáp án</option>
                            <option value={QuestionType.MULTIPLE_CHOICE}>Chọn nhiều đáp án</option>
                            <option value={QuestionType.TRUE_FALSE}>Đúng / Sai</option>
                        </select>
                    </div>
                    <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium ${getTypeClass()}`}>
                        {type === QuestionType.SINGLE_CHOICE && "Chọn một đáp án"}
                        {type === QuestionType.MULTIPLE_CHOICE && "Chọn nhiều đáp án"}
                        {type === QuestionType.TRUE_FALSE && "Đúng / Sai"}
                    </div>
                </div>

                <div>
                    <label htmlFor="question-points" className="block text-sm font-medium text-gray-700 mb-1">
                        Điểm số
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            id="question-points"
                            min="0"
                            step="0.5"
                            value={localPoints}
                            onChange={(e) => {
                                setLocalPoints(parseFloat(e.target.value) || 0);
                                setIsEditing(true);
                            }}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-base p-3 border-gray-300 rounded-md bg-white transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Save button */}
            <div className="mt-4">
                <button
                    type="button"
                    onClick={handleSaveChanges}
                    disabled={!isEditing}
                    className={`px-6 py-2.5 flex items-center bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors ${!isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Save className="h-4 w-4 mr-2" />
                    Lưu thay đổi
                </button>
            </div>
        </div>
    );
}