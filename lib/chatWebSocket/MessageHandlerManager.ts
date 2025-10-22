/**
 * Message Handler Manager
 * Manages message handlers and dispatches incoming messages
 */

import { IMessage } from '@stomp/stompjs';
import type { MessageDto, MessageHandler } from '@/types/chat';
import { Logger } from './types';

export class MessageHandlerManager {
    private handlers: MessageHandler[] = [];

    constructor(private logger: Logger) {}

    /**
     * Register a message handler
     */
    register(handler: MessageHandler): void {
        this.handlers.push(handler);
    }

    /**
     * Remove a message handler
     */
    remove(handler: MessageHandler): void {
        this.handlers = this.handlers.filter(h => h !== handler);
    }

    /**
     * Clear all message handlers
     */
    clearAll(): void {
        this.handlers = [];
    }

    /**
     * Handle incoming WebSocket message
     */
    handleIncoming(message: IMessage): void {
        try {
            const messageData: MessageDto = JSON.parse(message.body);
            this.logger.log('📩 Received message:', messageData);
            this.notifyHandlers(messageData);
        } catch (error) {
            this.logger.error('Failed to parse incoming message:', error);
        }
    }

    /**
     * Notify all registered handlers
     */
    private notifyHandlers(messageData: MessageDto): void {
        this.handlers.forEach(handler => {
            try {
                handler(messageData);
            } catch (error) {
                this.logger.error('Error in message handler:', error);
            }
        });
    }

    /**
     * Get handler count
     */
    getHandlerCount(): number {
        return this.handlers.length;
    }
}
