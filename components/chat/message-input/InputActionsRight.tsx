import {Button} from "@/components/ui/button";
import {Smile, Send, Loader2} from "lucide-react";

interface Props {
    isSending: boolean;
    canSend: boolean;
    connected: boolean;
    handleSend: () => void;
}

export default function InputActionsRight({
                                              isSending,
                                              canSend,
                                              connected,
                                              handleSend,
                                          }: Props) {
    return (
        <div className="flex items-center gap-2 self-end pb-1">
            <Button
                variant="ghost"
                size="icon"
                disabled
                title="Thêm emoji (Coming soon)"
                className="h-10 w-10 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-all hover:scale-110 hover:rotate-12"
            >
                <Smile className="h-5 w-5 text-yellow-600 dark:text-yellow-400"/>
            </Button>

            <Button
                onClick={handleSend}
                disabled={!canSend || !connected || isSending}
                size="icon"
                className="h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all"
            >
                {isSending ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white"/>
                ) : (
                    <Send className="h-5 w-5 text-white"/>
                )}
            </Button>
        </div>
    );
}