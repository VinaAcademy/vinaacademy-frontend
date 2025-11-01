'use client';

import React from 'react';
import {cn} from '@/lib/utils';

interface OnlineIndicatorProps {
    isOnline: boolean;
    size?: number;
    className?: string;
}

const OnlineIndicator: React.FC<OnlineIndicatorProps> = ({
                                                             isOnline,
                                                             size = 14,
                                                             className,
                                                         }) => {
    return (
        <div
            className={cn(
                'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-800',
                isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400',
                className
            )}
            style={{
                width: size,
                height: size,
            }}
        />
    );
};

export default OnlineIndicator;