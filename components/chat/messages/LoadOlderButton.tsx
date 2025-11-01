import React, {useState} from 'react'
import {ChevronUp} from 'lucide-react'

interface LoadOlderButtonProps {
    onLoadMore?: () => void
}

const LoadOlderButton: React.FC<LoadOlderButtonProps> = ({onLoadMore}) => {
    const [isLoadingOlder, setIsLoadingOlder] = useState(false)

    const handleClick = () => {
        if (isLoadingOlder) return
        setIsLoadingOlder(true)
        onLoadMore?.()
        setTimeout(() => setIsLoadingOlder(false), 300)
    }

    return (
        <div
            className="flex items-center justify-center py-4 top-0 z-10 bg-gradient-to-b from-background to-transparent">
            {isLoadingOlder ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce"
                             style={{animationDelay: '0ms'}}/>
                        <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce"
                             style={{animationDelay: '150ms'}}/>
                        <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce"
                             style={{animationDelay: '300ms'}}/>
                    </div>
                    <span>Đang tải tin nhắn cũ...</span>
                </div>
            ) : (
                <button
                    onClick={handleClick}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-full transition-colors duration-200 active:scale-95"
                >
                    <ChevronUp className="h-4 w-4"/>
                    <span>Xem tin nhắn cũ hơn</span>
                </button>
            )}
        </div>
    )
}

export default LoadOlderButton;