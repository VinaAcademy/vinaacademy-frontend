/**
 * Message Sender
 * Handles sending messages through WebSocket
 */

import { Client } from '@stomp/stompjs';
import { WS_ENDPOINTS } from '@/config/api.endpoint';
import type { PrivateMessageRequest, GroupMessageRequest } from '@/types/chat';
import { Logger } from './types';
import { MessageValidator } from './MessageValidator';

export class MessageSender {
    private validator: MessageValidator;

    constructor(
        private client: Client,
        private logger: Logger
    ) {
        this.validator = new MessageValidator();
    }

    /**
     * Send a private message
     */
    sendPrivateMessage(request: PrivateMessageRequest): void {
        this.validator.validatePrivateMessage(request);

        try {
            this.publish(WS_ENDPOINTS.CHAT.SEND_PRIVATE_MESSAGE, request);
            this.logger.log(`📤 Sent private message to ${request.recipientId}`);
        } catch (error) {
            this.logger.error('Failed to send private message:', error);
            throw error;
        }
    }

    /**
     * Send a group message
     */
    sendGroupMessage(request: GroupMessageRequest): void {
        this.validator.validateGroupMessage(request);

        try {
            this.publish(WS_ENDPOINTS.CHAT.SEND_GROUP_MESSAGE, request);
            this.logger.log(`📤 Sent group message to ${request.conversationId}`);
        } catch (error) {
            this.logger.error('Failed to send group message:', error);
            throw error;
        }
    }

    /**
     * Send a text message (auto-detects private or group)
     */
    sendTextMessage(
        conversationId: string,
        content: string,
        isGroup: boolean,
        recipientId?: string
    ): void {
        if (isGroup) {
            this.sendGroupMessage({
                conversationId,
                type: 'TEXT',
                textContent: content,
            });
        } else {
            if (!recipientId) {
                throw new Error('recipientId is required for private messages');
            }
            this.sendPrivateMessage({
                recipientId,
                type: 'TEXT',
                textContent: content,
            });
        }
    }

    /**
     * Publish message to destination
     */
    private publish(destination: string, body: PrivateMessageRequest | GroupMessageRequest): void {
        this.client.publish({
            destination,
            body: JSON.stringify(body),
        });
    }
}
