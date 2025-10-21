import React, {useCallback, useRef, useState} from "react";

export const SEND_DEBOUNCE_MS = 500;
export const MAX_LENGTH = 5000;
export const MAX_HEIGHT = 150;

export interface UseMessageInputProps {
    onSendMessage: (message: string) => void;
}

export function useMessageInput({onSendMessage}: UseMessageInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastSendTime = useRef(0);

    const [isFocused, setIsFocused] = useState(false);
    const [charCount, setCharCount] = useState(0);

    const value = textareaRef.current?.value.trim() ?? "";
    const canSend = value.length > 0 && value.length <= MAX_LENGTH;
    const charPercentage = (charCount / MAX_LENGTH) * 100;
    const showCharCount = charCount > MAX_LENGTH * 0.7;

    const resetTextarea = useCallback(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.value = "";
        el.style.height = "auto";
        setCharCount(0);
    }, []);

    const handleSend = useCallback(() => {
        const el = textareaRef.current;
        if (!el) return;

        const message = el.value.trim();
        if (!message || message.length > MAX_LENGTH) return;

        const now = Date.now();
        if (now - lastSendTime.current < SEND_DEBOUNCE_MS) return;
        lastSendTime.current = now;

        onSendMessage(message);
        resetTextarea();
    }, [onSendMessage, resetTextarea]);

    const handleInput = useCallback(
        (e: React.FormEvent<HTMLTextAreaElement>) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
            setCharCount(el.value.length);
        },
        []
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        },
        [handleSend]
    );

    return {
        textareaRef,
        isFocused,
        setIsFocused,
        charCount,
        charPercentage,
        showCharCount,
        canSend,
        handleSend,
        handleInput,
        handleKeyDown,
    };
}