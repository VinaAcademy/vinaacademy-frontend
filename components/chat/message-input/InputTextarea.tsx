import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MAX_LENGTH } from "@/hooks/page/conversation/useMessageInput";

interface Props {
    connected: boolean;
    isSending: boolean;
    handleInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    setIsFocused: (v: boolean) => void;
    isFocused: boolean;
    charCount: number;
    charPercentage: number;
    showCharCount: boolean;
}

const InputTextarea = React.forwardRef<HTMLTextAreaElement, Props>(
    (
        {
            connected,
            isSending,
            handleInput,
            handleKeyDown,
            setIsFocused,
            isFocused,
            charCount,
            charPercentage,
            showCharCount,
        },
        ref
    ) => (
        <div className="flex-1 relative">
            <Textarea
                ref={ref}
                placeholder={connected ? "Nhập tin nhắn..." : "Đang kết nối..."}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                disabled={!connected || isSending}
                maxLength={MAX_LENGTH}
                rows={1}
                className={cn(
                    "min-h-[44px] max-h-[150px] resize-none border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm",
                    "focus-visible:ring-0 text-base leading-relaxed px-4 py-3 rounded-xl shadow-inner"
                )}
            />
            {showCharCount && (
                <div
                    className={cn(
                        "absolute bottom-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full",
                        charPercentage >= 100
                            ? "bg-red-100 text-red-700"
                            : charPercentage >= 90
                                ? "bg-amber-100 text-amber-700"
                                : "bg-cyan-100 text-cyan-700"
                    )}
                >
                    {charCount}/{MAX_LENGTH}
                </div>
            )}
        </div>
    )
);
InputTextarea.displayName = "InputTextarea";
export default InputTextarea;
