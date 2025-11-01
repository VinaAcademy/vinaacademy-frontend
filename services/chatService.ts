/**
 * Chat Service
 * Handles all REST API calls for chat functionality
 * WebSocket connections are managed separately in lib/websocket.ts
 */

import apiClient from '@/lib/apiClient';
import { API_ENDPOINTS } from '@/config/api.endpoint';
import type {
    ConversationDto,
    MessageDto,
    CreateGroupRequest
} from '@/types/chat';
import {PaginatedResponse} from "@/types/api-response";

// ==================== CONVERSATIONS ====================

/**
 * Get all conversations for the authenticated user
 * Conversations are ordered by last message time (newest first)
 */
export async function getConversations(): Promise<ConversationDto[] | null> {
    try {
        const response = await apiClient.get(API_ENDPOINTS.CHAT.CONVERSATIONS.LIST);
        return response.data.data;
    } catch (error) {
        console.error('getConversations error:', error);
        return null;
    }
}

/**
 * Get a specific conversation by ID
 * @param conversationId - UUID of the conversation
 */
export async function getConversationById(conversationId: string): Promise<ConversationDto | null> {
    try {
        const response = await apiClient.get(API_ENDPOINTS.CHAT.CONVERSATIONS.BY_ID(conversationId));
        return response.data.data;
    } catch (error) {
        console.error(`getConversationById error for ${conversationId}:`, error);
        return null;
    }
}

/**
 * Get or create a direct conversation with another user
 * If conversation exists, returns it; otherwise creates a new one
 * @param userId - UUID of the other user
 */
export async function getOrCreateDirectConversation(userId: string): Promise<ConversationDto | null> {
    try {
        const response = await apiClient.get(API_ENDPOINTS.CHAT.CONVERSATIONS.DIRECT(userId));
        return response.data.data;
    } catch (error) {
        console.error(`getOrCreateDirectConversation error for user ${userId}:`, error);
        return null;
    }
}

/**
 * Create a new group conversation
 * @param request - Group creation details (title and member IDs)
 */
export async function createGroupConversation(request: CreateGroupRequest): Promise<ConversationDto | null> {
    try {
        const response = await apiClient.post(API_ENDPOINTS.CHAT.CONVERSATIONS.CREATE_GROUP, request);
        return response.data.data;
    } catch (error) {
        console.error('createGroupConversation error:', error);
        return null;
    }
}

/**
 * Mark all messages in a conversation as read
 * @param conversationId - UUID of the conversation
 */
export async function markConversationAsRead(conversationId: string): Promise<boolean> {
    try {
        await apiClient.put(API_ENDPOINTS.CHAT.CONVERSATIONS.MARK_READ(conversationId));
        return true;
    } catch (error) {
        console.error(`markConversationAsRead error for ${conversationId}:`, error);
        return false;
    }
}

// ==================== MESSAGES ====================

/**
 * Get messages between the current user and a specific recipient
 * Messages are returned in descending order (newest first)
 * @param recipientId - UUID of the recipient user
 * @param page - Page number (0-indexed)
 * @param size - Number of messages per page (max: 50)
 */
export async function getMessagesByRecipient(
    recipientId: string,
    page: number = 0,
    size: number = 50
): Promise<PaginatedResponse<MessageDto> | null> {
    try {
        const response = await apiClient.get(API_ENDPOINTS.CHAT.MESSAGES.BY_RECIPIENT(recipientId), {
            params: { page, size }
        });
        return response.data.data;
    } catch (error) {
        console.error(`getMessagesByRecipient error for recipient ${recipientId}:`, error);
        return null;
    }
}

/**
 * Get messages from a specific conversation
 * Messages are returned in descending order (newest first)
 * @param conversationId - UUID of the conversation
 * @param page - Page number (0-indexed)
 * @param size - Number of messages per page (max: 50)
 */
export async function getMessagesByConversation(
    conversationId: string,
    page: number = 0,
    size: number = 50
): Promise<PaginatedResponse<MessageDto> | null> {
    try {
        const response = await apiClient.get(API_ENDPOINTS.CHAT.MESSAGES.BY_CONVERSATION(conversationId), {
            params: { page, size }
        });
        return response.data.data;
    } catch (error) {
        console.error(`getMessagesByConversation error for conversation ${conversationId}:`, error);
        return null;
    }
}

export async function getOnlineUsers(): Promise<string[] | null> {
    try {
        const response = await apiClient.get(API_ENDPOINTS.CHAT.ONLINE_USERS);
        return response.data.data;
    } catch (error) {
        console.error('getOnlineUsers error:', error);
        return null;
    }
}

// ==================== HELPER FUNCTIONS ====================
/**
 * Get the other participant in a direct conversation
 * @param conversation - The conversation
 * @param currentUserId - UUID of the current user
 */
export function getDirectConversationRecipient(
    conversation: ConversationDto,
    currentUserId: string
) {
    if (conversation.type !== 'DIRECT') return null;
    return conversation.members.find(m => m.memberId !== currentUserId);
}

/**
 * Check if user is conversation owner
 * @param conversation - The conversation
 * @param userId - UUID of the user to check
 */
export function isConversationOwner(conversation: ConversationDto, userId: string): boolean {
    const member = conversation.members.find(m => m.memberId === userId);
    return member?.role === 'OWNER';
}

/**
 * Check if user is conversation moderator or owner
 * @param conversation - The conversation
 * @param userId - UUID of the user to check
 */
export function isConversationModerator(conversation: ConversationDto, userId: string): boolean {
    const member = conversation.members.find(m => m.memberId === userId);
    return member?.role === 'OWNER' || member?.role === 'MOD';
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let i = Math.floor(Math.log(bytes) / Math.log(k));
    i = Math.min(i, sizes.length - 1);
    const value = bytes / Math.pow(k, i);
    return `${Math.round(value * 100) / 100} ${sizes[i]}`;
}
