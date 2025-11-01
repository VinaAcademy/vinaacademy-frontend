import React from "react";
import {Loader2} from "lucide-react";
import {cn} from "@/lib/utils";
import {useMessageInput} from "@/hooks/page/conversation/useMessageInput";
import {InputActionLeft as InputActionsLeft} from "./InputActionsLeft";
import InputTextarea from "./InputTextarea";
import InputActionsRight from "./InputActionsRight";
import InputStatusBar from "./InputStatusBar";

interface MessageInputProps {
    isSending: boolean;
    connected: boolean;
    onSendMessage: (message: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
                                                       isSending,
                                                       connected,
                                                       onSendMessage,
                                                   }) => {
    const {
        textareaRef,
        isFocused,
        setIsFocused,
        charCount,
        charPercentage,
        showCharCount,
        canSend,
        handleSend,
        handleInput,
        handleKeyDown
    } = useMessageInput({onSendMessage});

    return (
        <div className="border-t bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-2xl">
            <div className="container max-w-4xl mx-auto px-4 py-4">
                {/* Connection status */}
                {!connected && (
                    <div
                        className="mb-3 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 px-4 py-2.5 rounded-xl border border-amber-200/50 dark:border-amber-800/50 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin"/>
                        <span className="font-medium">Đang kết nối lại...</span>
                    </div>
                )}

                {/* Input container */}
                <div
                    className={cn(
                        "relative flex items-end gap-3 p-3 rounded-2xl transition-all duration-300 border-2",
                        isFocused
                            ? "bg-gradient-to-br from-cyan-50/80 via-sky-50/50 to-blue-50/30 dark:from-cyan-950/40 dark:via-sky-950/30 dark:to-blue-950/20 border-cyan-400/60 dark:border-cyan-500/60 shadow-xl"
                            : "bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/30 border-gray-200/50 dark:border-gray-700/50 shadow-md hover:border-gray-300 dark:hover:border-gray-600"
                    )}
                >
                    <InputActionsLeft/>
                    <InputTextarea
                        ref={textareaRef}
                        connected={connected}
                        isSending={isSending}
                        handleInput={handleInput}
                        handleKeyDown={handleKeyDown}
                        setIsFocused={setIsFocused}
                        isFocused={isFocused}
                        charCount={charCount}
                        charPercentage={charPercentage}
                        showCharCount={showCharCount}
                    />
                    <InputActionsRight
                        isSending={isSending}
                        canSend={canSend}
                        connected={connected}
                        handleSend={handleSend}
                    />
                </div>

                <InputStatusBar isFocused={isFocused} isSending={isSending} canSend={canSend}/>
            </div>
        </div>
    );
};

export default React.memo(MessageInput);
