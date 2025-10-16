import React, {useRef, useCallback, useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Smile, Send, Loader2, Image, FileText} from 'lucide-react';
import {cn} from '@/lib/utils';

interface MessageInputProps {
    messageInput: string;
    isSending: boolean;
    connected: boolean;
    onMessageChange: (value: string) => void;
    onSendMessage: () => void;
    onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({
    messageInput,
    isSending,
    connected,
    onMessageChange,
    onSendMessage,
                                                   }) => {
    // Debounce send to prevent spam clicking
    const lastSendTime = useRef<number>(0);
    const SEND_DEBOUNCE_MS = 500; // 500ms debounce
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const MAX_LENGTH = 5000; // From CHAT_CONSTRAINTS

    const handleSendClick = useCallback(() => {
        const now = Date.now();
        if (now - lastSendTime.current < SEND_DEBOUNCE_MS) {
            return; // Ignore rapid clicks
        }
        lastSendTime.current = now;
        onSendMessage();
    }, [onSendMessage]);

    // Auto-resize textarea based on content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const newHeight = Math.min(textareaRef.current.scrollHeight, 150); // Max 150px
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [messageInput]);

    // Calculate character count percentage for color coding
    const charPercentage = (messageInput.length / MAX_LENGTH) * 100;
    const showCharCount = messageInput.length > MAX_LENGTH * 0.7; // Show when 70% full

    return (
        <div className="border-t bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-2xl">
            <div className="container max-w-4xl mx-auto px-4 py-4">
                {/* Connection status indicator */}
                {!connected && (
                    <div className="mb-3 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 px-4 py-2.5 rounded-xl border border-amber-200/50 dark:border-amber-800/50 animate-in fade-in slide-in-from-bottom-2 duration-300 shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin"/>
                        <span className="font-medium">Đang kết nối lại...</span>
                    </div>
                )}
                
                <div className={cn(
                    "relative flex items-end gap-3 p-3 rounded-2xl transition-all duration-300 border-2",
                    isFocused 
                        ? "bg-gradient-to-br from-cyan-50/80 via-sky-50/50 to-blue-50/30 dark:from-cyan-950/40 dark:via-sky-950/30 dark:to-blue-950/20 border-cyan-400/60 dark:border-cyan-500/60 shadow-xl shadow-cyan-500/10" 
                        : "bg-gradient-to-br from-gray-50/80 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/30 border-gray-200/50 dark:border-gray-700/50 shadow-md hover:border-gray-300 dark:hover:border-gray-600"
                )}>
                    {/* Quick action buttons */}
                    <div className="flex flex-col gap-2 self-end pb-1">
                        {/* Image upload */}
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled
                            title="Đính kèm ảnh (Coming soon)"
                            className="h-9 w-9 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-all hover:scale-110 disabled:opacity-50"
                        >
                            <Image className="h-4.5 w-4.5 text-cyan-600 dark:text-cyan-400"/>
                        </Button>
                        
                        {/* File attachment */}
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled
                            title="Đính kèm file (Coming soon)"
                            className="h-9 w-9 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-all hover:scale-110 disabled:opacity-50"
                        >
                            <FileText className="h-4.5 w-4.5 text-sky-600 dark:text-sky-400"/>
                        </Button>
                    </div>

                    {/* Main input area */}
                    <div className="flex-1 relative">
                        <Textarea
                            ref={textareaRef}
                            placeholder={connected ? "Nhập tin nhắn của bạn..." : "Đang kết nối..."}
                            value={messageInput}
                            onChange={(e) => onMessageChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendClick();
                                }
                            }}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            disabled={!connected || isSending}
                            maxLength={MAX_LENGTH}
                            className={cn(
                                "min-h-[44px] max-h-[150px] resize-none border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm focus-visible:ring-0 focus-visible:ring-offset-0 text-base leading-relaxed px-4 py-3 rounded-xl shadow-inner",
                                "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                            rows={1}
                        />
                        
                        {/* Character counter */}
                        {showCharCount && (
                            <div className={cn(
                                "absolute bottom-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full transition-all duration-200",
                                charPercentage >= 100 
                                    ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                    : charPercentage >= 90
                                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                                    : "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400"
                            )}>
                                {messageInput.length}/{MAX_LENGTH}
                            </div>
                        )}
                    </div>

                    {/* Right action buttons */}
                    <div className="flex items-center gap-2 self-end pb-1">
                        {/* Emoji button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled
                            title="Thêm emoji (Coming soon)"
                            className="h-10 w-10 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all hover:scale-110 hover:rotate-12 disabled:opacity-50"
                        >
                            <Smile className="h-5 w-5 text-yellow-600 dark:text-yellow-400"/>
                        </Button>

                        {/* Send button */}
                        <Button
                            onClick={handleSendClick}
                            disabled={!messageInput.trim() || !connected || isSending || messageInput.length > MAX_LENGTH}
                            size="icon"
                            className={cn(
                                "h-11 w-11 relative overflow-hidden transition-all duration-300 rounded-xl shadow-lg",
                                messageInput.trim() && connected && !isSending && messageInput.length <= MAX_LENGTH
                                    ? "bg-gradient-to-br from-cyan-500 via-sky-500 to-blue-500 hover:from-cyan-600 hover:via-sky-600 hover:to-blue-600 hover:shadow-2xl hover:shadow-cyan-500/50 scale-100 hover:scale-110 hover:rotate-3"
                                    : "opacity-50"
                            )}
                        >
                            {isSending ? (
                                <Loader2 className="h-5 w-5 animate-spin text-white"/>
                            ) : (
                                <div className="relative">
                                    <Send className="h-5 w-5 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/>
                                    {messageInput.trim() && connected && !isSending && (
                                        <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"/>
                                    )}
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
                
                {/* Keyboard shortcuts hint */}
                {isFocused && (
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border border-gray-300 dark:border-gray-700">Enter</kbd>
                            <span>để gửi</span>
                            <span className="mx-2">•</span>
                            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border border-gray-300 dark:border-gray-700">Shift+Enter</kbd>
                            <span>để xuống dòng</span>
                        </span>
                        {!isSending && messageInput.trim() && (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"/>
                                Sẵn sàng gửi
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageInput;
