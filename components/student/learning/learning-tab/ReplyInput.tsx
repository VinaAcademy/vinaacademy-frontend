"use client";

import { FC, useState } from "react";
import { Loader } from "lucide-react";

interface ReplyInputProps {
  onSubmit: (content: string) => Promise<boolean>;
  onCancel: () => void;
  submitting: boolean;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

const ReplyInput: FC<ReplyInputProps> = ({
  onSubmit,
  onCancel,
  submitting,
  placeholder = "Trả lời...",
  rows = 3,
  maxLength = 2000,
}) => {
  const [content, setContent] = useState("");

  const handleSubmit = async () => {
    if (!content.trim()) return;

    const success = await onSubmit(content);
    if (success) {
      setContent("");
    }
  };

  return (
    <div className="mt-3 sm:mt-4 pl-2 sm:pl-4 border-l-2 border-blue-200">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-300"
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
      ></textarea>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">
          {content.length}/{maxLength}
        </span>
        <div className="space-x-2">
          <button
            onClick={onCancel}
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:text-gray-800"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
          >
            {submitting ? (
              <Loader className="animate-spin w-3 h-3" />
            ) : (
              "Trả lời"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyInput;
