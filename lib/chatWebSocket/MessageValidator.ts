/**
 * Message Validator
 * Validates message requests before sending
 */

import type { PrivateMessageRequest, GroupMessageRequest } from '@/types/chat';

export class MessageValidator {
    /**
     * Validate message request before sending
     */
    validate(request: PrivateMessageRequest | GroupMessageRequest): void {
        this.validateType(request);
        this.validateContent(request);
    }

    /**
     * Validate message type
     */
    private validateType(request: PrivateMessageRequest | GroupMessageRequest): void {
        if (!request.type) {
            throw new Error('Message type is required');
        }
    }

    /**
     * Validate message content based on type
     */
    private validateContent(request: PrivateMessageRequest | GroupMessageRequest): void {
        if (request.type === 'TEXT') {
            this.validateTextContent(request);
        } else if (request.type === 'IMAGE' || request.type === 'FILE') {
            this.validateFileContent(request);
        }
    }

    /**
     * Validate text message content
     */
    private validateTextContent(request: PrivateMessageRequest | GroupMessageRequest): void {
        if (!request.textContent || request.textContent.trim().length === 0) {
            throw new Error('Text content is required for TEXT messages');
        }
    }

    /**
     * Validate file message content
     */
    private validateFileContent(request: PrivateMessageRequest | GroupMessageRequest): void {
        if (!request.fileId || !request.fileName || !request.fileSize) {
            throw new Error('File metadata is required for IMAGE/FILE messages');
        }
    }

    /**
     * Validate private message specific fields
     */
    validatePrivateMessage(request: PrivateMessageRequest): void {
        this.validate(request);
        if (!request.recipientId) {
            throw new Error('recipientId is required for private messages');
        }
    }

    /**
     * Validate group message specific fields
     */
    validateGroupMessage(request: GroupMessageRequest): void {
        this.validate(request);
        if (!request.conversationId) {
            throw new Error('conversationId is required for group messages');
        }
    }
}
