/**
 * Chat Service Type Definitions
 * Based on the Chat Service API Documentation
 */

// ==================== ENUMS ====================

/**
 * Type of conversation
 */
export type ConversationType = 'DIRECT' | 'GROUP';

/**
 * Type of message content
 */
export type MessageType = 'TEXT' | 'IMAGE' | 'FILE';

/**
 * Member role in a conversation
 */
export type MemberRole = 'OWNER' | 'MOD' | 'MEMBER';

// ==================== CORE MODELS ====================

/**
 * Conversation member details
 */
export interface MemberDto {
    memberId: string;           // UUID
    username: string;           // Username
    fullName: string;          // Full name
    avatarUrl: string;         // Avatar URL
    conversationId: string;    // UUID
    role: MemberRole;          // Member role
    joinedAt: string;          // ISO 8601 timestamp (Instant)
    leftAt: string | null;     // ISO 8601 timestamp (null if active)
    muteUntil: string | null;  // ISO 8601 timestamp (null if not muted)
    lastReadMsgId: string | null; // UUID of last read message
    lastReadAt: string | null; // ISO 8601 timestamp (Instant)
}

/**
 * Message data transfer object
 */
export interface MessageDto {
    id: string;                // UUID
    seq: number;               // Sequence number (for pagination)
    conversationId: string;    // UUID
    senderId: string;          // UUID
    type: MessageType;         // Message type
    textContent: string | null; // Text content (null for files)
    fileId: string | null;     // File UUID (null for text)
    fileName: string | null;   // File name (null for text)
    fileSize: number | null;   // File size in bytes (null for text)
    createdAt: string;         // ISO 8601 timestamp
    deletedAt: string | null;  // ISO 8601 timestamp (null if not deleted)
}

/**
 * Conversation data transfer object
 */
export interface ConversationDto {
    id: string;                    // UUID
    name: string;                  // Display name (user name for DIRECT, title for GROUP)
    avatarUrl: string;             // Avatar URL
    createdAt: string;             // ISO 8601 timestamp
    updatedAt: string;             // ISO 8601 timestamp
    title: string | null;          // Group title (null for DIRECT)
    type: ConversationType;        // Conversation type
    lastMessage: MessageDto | null; // Last message in conversation
    lastMessageAt: string | null;  // ISO 8601 timestamp (Instant)
    members: MemberDto[];          // List of conversation members
    isRead?: boolean| null;      // Whether the current user has read the latest message
}

// ==================== REQUEST MODELS ====================

/**
 * Request to send a private message via WebSocket
 */
export interface PrivateMessageRequest {
    recipientId: string;           // UUID (required)
    type: MessageType;             // Required
    textContent?: string;          // Required for TEXT
    fileId?: string;               // Required for IMAGE/FILE
    fileName?: string;             // Required for IMAGE/FILE
    fileSize?: number;             // Required for IMAGE/FILE
}

/**
 * Request to send a group message via WebSocket
 */
export interface GroupMessageRequest {
    conversationId: string;        // UUID (required)
    type: MessageType;             // Required
    textContent?: string;          // Required for TEXT
    fileId?: string;               // Required for IMAGE/FILE
    fileName?: string;             // Required for IMAGE/FILE
    fileSize?: number;             // Required for IMAGE/FILE
}

/**
 * Request to create a group conversation
 */
export interface CreateGroupRequest {
    title: string;                 // Required, 1-100 characters
    memberIds: string[];           // Required, 2-100 UUIDs (creator auto-included)
}

// ==================== RESPONSE MODELS ====================

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;            // Current page (0-indexed)
    first: boolean;
    last: boolean;
}

/**
 * Message pagination response
 */
export type MessagePaginatedResponse = PaginatedResponse<MessageDto>;

// ==================== WEBSOCKET MODELS ====================

/**
 * WebSocket connection status
 */
export interface WebSocketStatus {
    connected: boolean;
    connecting: boolean;
    error: string | null;
}

/**
 * WebSocket subscription
 */
export interface WebSocketSubscription {
    id: string;
    destination: string;
    unsubscribe: () => void;
}

/**
 * WebSocket message handler
 */
export type MessageHandler = (message: MessageDto) => void;

// ==================== UI STATE MODELS ====================

/**
 * Conversation list item (extended for UI)
 */
export interface ConversationListItem extends ConversationDto {
    unreadCount?: number;
    isOnline?: boolean;
    lastSeenAt?: string;
}

/**
 * Message list item (extended for UI)
 */
export interface MessageListItem extends MessageDto {
    senderName?: string;
    senderAvatar?: string;
    isOwn?: boolean;
    isRead?: boolean;
    isSending?: boolean;
    sendError?: string;
}

/**
 * Chat state for UI
 */
export interface ChatState {
    conversations: ConversationDto[];
    selectedConversationId: string | null;
    messages: Record<string, MessageDto[]>; // conversationId -> messages
    loading: boolean;
    error: string | null;
}

/**
 * Typing indicator state
 */
export interface TypingIndicator {
    conversationId: string;
    userId: string;
    username: string;
    timestamp: number;
}

// ==================== FILE UPLOAD MODELS ====================

/**
 * File upload progress
 */
export interface FileUploadProgress {
    fileId: string;
    fileName: string;
    fileSize: number;
    uploadedBytes: number;
    progress: number; // 0-100
    status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
    error?: string;
}

/**
 * File metadata after upload
 */
export interface UploadedFileMetadata {
    fileId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    url: string;
}

// ==================== VALIDATION CONSTRAINTS ====================

/**
 * Validation constraints for chat entities
 */
export const CHAT_CONSTRAINTS = {
    GROUP_TITLE: {
        MIN_LENGTH: 1,
        MAX_LENGTH: 100,
    },
    GROUP_MEMBERS: {
        MIN: 2,
        MAX: 100,
    },
    MESSAGE: {
        MAX_LENGTH: 5000, // Adjust based on backend
    },
    PAGE_SIZE: {
        DEFAULT: 50,
        MAX: 50,
    },
    FILE: {
        MAX_SIZE: 100 * 1024 * 1024, // 100MB (adjust based on backend)
    },
} as const;

// ==================== ERROR TYPES ====================

/**
 * Chat service error
 */
export interface ChatServiceError {
    code: string;
    message: string;
    details?: any;
}

/**
 * WebSocket error types
 */
export type WebSocketErrorType = 
    | 'CONNECTION_FAILED'
    | 'AUTHENTICATION_FAILED'
    | 'SUBSCRIPTION_FAILED'
    | 'MESSAGE_SEND_FAILED'
    | 'DISCONNECTED'
    | 'UNKNOWN';

/**
 * WebSocket error
 */
export interface WebSocketError {
    type: WebSocketErrorType;
    message: string;
    originalError?: any;
}
