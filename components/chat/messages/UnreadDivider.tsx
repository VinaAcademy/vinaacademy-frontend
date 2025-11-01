import React from "react";

interface UnreadDividerProps {
    label?: string; // optional custom text (default: "Tin nhắn chưa đọc")
    className?: string; // optional extra Tailwind classes
}

const UnreadDivider: React.FC<UnreadDividerProps> = ({
                                                         label = "Tin nhắn chưa đọc",
                                                         className = "",
                                                     }) => {
    return (
        <div
            className={`flex items-center justify-center my-6 animate-in fade-in slide-in-from-top-2 duration-500 ${className}`}
        >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"/>

            <div
                className="px-4 py-1.5 mx-4 bg-gradient-to-r from-cyan-500 to-sky-500 text-white text-xs font-semibold rounded-full shadow-lg flex items-center gap-2">
                <div className="h-2 w-2 bg-white rounded-full animate-pulse"/>
                <span>{label}</span>
            </div>

            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent"/>
        </div>
    );
};

export default UnreadDivider;
