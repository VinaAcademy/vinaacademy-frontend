interface Props {
    isFocused: boolean;
    isSending: boolean;
    canSend: boolean;
}

export default function InputStatusBar({ isFocused, isSending, canSend }: Props) {
    if (!isFocused) return null;
    return (
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-1 duration-200">
      <span className="flex items-center gap-1">
        <kbd className="kbd">Enter</kbd>
        <span>để gửi</span>
        <span className="mx-2">•</span>
        <kbd className="kbd">Shift+Enter</kbd>
        <span>để xuống dòng</span>
      </span>

            {!isSending && canSend && (
                <span className="flex items-center gap-1 text-green-600">
          <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
          Sẵn sàng gửi
        </span>
            )}
        </div>
    );
}
