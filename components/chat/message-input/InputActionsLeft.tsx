import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import React from "react";
import {FileText, Image as ImageIcon, LucideIcon} from "lucide-react";

interface ActionButton {
    icon: LucideIcon;
    title: string;
    hoverBg?: string[];
    textColor: string;
}

const buttons: ActionButton[] = [
    {
        icon: ImageIcon,
        title: "Đính kèm ảnh",
        hoverBg: ["hover:bg-blue-100", "hover:dark:bg-blue-900/30"],
        textColor: "blue-600 dark:blue-400"
    },
    {
        icon: FileText,
        title: "Đính kèm file",
        hoverBg: ["hover:bg-green-100", "hover:dark:bg-green-900/30"],
        textColor: "green-600 dark:green-400"
    },
];

export function InputActionLeft() {
    return (
        <div className="flex flex-col gap-2 self-end pb-1">
            {buttons.map(({icon: LucideIcon, title, hoverBg, textColor}, i) => (
                <Button
                    key={i}
                    variant="ghost"
                    size="icon"
                    disabled
                    title={`${title} (Coming soon)`}
                    className={cn(
                        "h-9 w-9 transition-all hover:scale-110 disabled:opacity-50",
                        hoverBg ? hoverBg.join(" ") : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                >
                    <LucideIcon className={cn("h-5 w-5", `text-${textColor}`)}/>
                </Button>
            ))}
        </div>
    );
}