/**
 * Conversations Layout
 * Provides consistent layout for all conversation pages
 */

import React from 'react';

interface ConversationsLayoutProps {
    children: React.ReactNode;
}

export default function ConversationsLayout({children}: ConversationsLayoutProps) {
    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    );
}
