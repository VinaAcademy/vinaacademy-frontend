/**
 * Shared types and interfaces for Chat WebSocket
 */

import type { WebSocketStatus } from '@/types/chat';

/**
 * Chat WebSocket Client Configuration
 */
export interface ChatWebSocketConfig {
    debug?: boolean;
    reconnectDelay?: number;
    heartbeatIncoming?: number;
    heartbeatOutgoing?: number;
    onTokenExpired?: () => Promise<string | null>;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Required<Omit<ChatWebSocketConfig, 'onTokenExpired'>> = {
    debug: false,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
};

/**
 * Logger utility
 */
export class Logger {
    constructor(private debug: boolean = false) {}

    log(...messages: any[]): void {
        if (this.debug) {
            console.log('[ChatWebSocket]', ...messages);
        }
    }

    error(...messages: any[]): void {
        console.error('[ChatWebSocket]', ...messages);
    }

    warn(...messages: any[]): void {
        console.warn('[ChatWebSocket]', ...messages);
    }
}

/**
 * Status tracker
 */
export class StatusTracker {
    private status: WebSocketStatus = {
        connected: false,
        connecting: false,
        error: null,
    };

    setConnecting(): void {
        this.status.connecting = true;
        this.status.error = null;
    }

    setConnected(): void {
        this.status.connected = true;
        this.status.connecting = false;
        this.status.error = null;
    }

    setDisconnected(): void {
        this.status.connected = false;
        this.status.connecting = false;
    }

    setError(error: string): void {
        this.status.connecting = false;
        this.status.connected = false;
        this.status.error = error;
    }

    getStatus(): WebSocketStatus {
        return { ...this.status };
    }

    isConnected(): boolean {
        return this.status.connected;
    }

    isConnecting(): boolean {
        return this.status.connecting;
    }
}
