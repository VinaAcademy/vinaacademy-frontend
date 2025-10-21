import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import React from "react";
import {FileText, Image as ImageIcon, LucideIcon} from "lucide-react";

interface ActionButton {
    icon: LucideIcon;
    color: string;
    title: string;
}

const buttons: ActionButton[] = [
    {icon: ImageIcon, color: "green", title: "Đính kèm ảnh"},
    {icon: FileText, color: "sky", title: "Đính kèm file"},
];

export function InputActionLeft() {
    return (
        <div className="flex flex-col gap-2 self-end pb-1">
            {buttons.map(({icon: LucideIcon, color, title}, i) => (
                <Button
                    key={i}
                    variant="ghost"
                    size="icon"
                    disabled
                    title={`${title} (Coming soon)`}
                    className={cn(
                        "h-9 w-9 transition-all hover:scale-110 disabled:opacity-50",
                        `hover:bg-${color}-100 dark:hover:bg-${color}-900/30`
                    )}
                >
                    <LucideIcon className={cn("h-5 w-5", `text-${color}-600 dark:text-${color}-400`)}/>
                </Button>
            ))}
        </div>
    );
}