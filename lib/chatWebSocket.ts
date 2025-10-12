/**
 * Chat WebSocket Client
 * Manages WebSocket connections for real-time chat functionality
 * Uses SockJS + STOMP protocol
 */

import SockJS from 'sockjs-client';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { WS_ENDPOINTS } from '@/config/api.endpoint';
import type {
    MessageDto,
    PrivateMessageRequest,
    GroupMessageRequest,
    MessageHandler,
    WebSocketStatus,
} from '@/types/chat';

/**
 * Chat WebSocket Client Configuration
 */
interface ChatWebSocketConfig {
    debug?: boolean;
    reconnectDelay?: number;
    heartbeatIncoming?: number;
    heartbeatOutgoing?: number;
}

/**
 * Chat WebSocket Client
 * Handles WebSocket connection, subscriptions, and message sending for chat
 */
export class ChatWebSocketClient {
    private client: Client | null = null;
    private messageHandlers: MessageHandler[] = [];
    private subscriptions: Map<string, StompSubscription> = new Map();
    private status: WebSocketStatus = {
        connected: false,
        connecting: false,
        error: null,
    };
    private config: ChatWebSocketConfig;
    private accessToken: string | null = null;

    constructor(config: ChatWebSocketConfig = {}) {
        this.config = {
            debug: config.debug ?? false,
            reconnectDelay: config.reconnectDelay ?? 5000,
            heartbeatIncoming: config.heartbeatIncoming ?? 4000,
            heartbeatOutgoing: config.heartbeatOutgoing ?? 4000,
        };
    }

    // ==================== CONNECTION MANAGEMENT ====================

    /**
     * Connect to chat WebSocket server
     * @param accessToken - JWT access token for authentication
     */
    public connect(accessToken: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.status.connected) {
                this.log('Already connected');
                resolve();
                return;
            }

            if (this.status.connecting) {
                this.log('Connection already in progress');
                reject(new Error('Connection already in progress'));
                return;
            }

            this.accessToken = accessToken;
            this.status.connecting = true;
            this.status.error = null;

            try {
                const socket = new SockJS(WS_ENDPOINTS.CHAT.URL);

                this.client = new Client({
                    webSocketFactory: () => socket as any,
                    connectHeaders: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    debug: this.config.debug ? (str) => console.log('[STOMP]', str) : undefined,
                    reconnectDelay: this.config.reconnectDelay,
                    heartbeatIncoming: this.config.heartbeatIncoming,
                    heartbeatOutgoing: this.config.heartbeatOutgoing,

                    onConnect: () => {
                        this.log('✅ Connected to chat WebSocket');
                        this.status.connected = true;
                        this.status.connecting = false;
                        this.status.error = null;

                        // Auto-subscribe to private messages
                        this.subscribeToPrivateMessages();

                        resolve();
                    },

                    onStompError: (frame) => {
                        const error = `STOMP error: ${frame.headers['message'] || 'Unknown error'}`;
                        console.error('[ChatWebSocket]', error, frame);
                        this.status.connecting = false;
                        this.status.connected = false;
                        this.status.error = error;
                        reject(new Error(error));
                    },

                    onWebSocketError: (event) => {
                        const error = 'WebSocket connection error';
                        console.error('[ChatWebSocket]', error, event);
                        this.status.connecting = false;
                        this.status.connected = false;
                        this.status.error = error;
                        reject(new Error(error));
                    },

                    onDisconnect: () => {
                        this.log('❌ Disconnected from chat WebSocket');
                        this.status.connected = false;
                        this.status.connecting = false;
                        this.clearSubscriptions();
                    },
                });

                this.client.activate();
            } catch (error) {
                console.error('[ChatWebSocket] Connection error:', error);
                this.status.connecting = false;
                this.status.connected = false;
                this.status.error = error instanceof Error ? error.message : 'Connection failed';
                reject(error);
            }
        });
    }

    /**
     * Disconnect from chat WebSocket server
     */
    public disconnect(): void {
        if (this.client) {
            this.log('Disconnecting...');
            this.clearSubscriptions();
            this.client.deactivate();
            this.client = null;
            this.status.connected = false;
            this.status.connecting = false;
        }
    }

    /**
     * Check if client is connected
     */
    public isConnected(): boolean {
        return this.status.connected && this.client?.connected === true;
    }

    /**
     * Get current connection status
     */
    public getStatus(): WebSocketStatus {
        return { ...this.status };
    }

    // ==================== SUBSCRIPTION MANAGEMENT ====================

    /**
     * Subscribe to private messages
     * Automatically called on connection
     */
    private subscribeToPrivateMessages(): void {
        if (!this.client || !this.isConnected()) {
            console.error('[ChatWebSocket] Cannot subscribe: not connected');
            return;
        }

        const destination = WS_ENDPOINTS.CHAT.PRIVATE_MESSAGE_QUEUE;

        if (this.subscriptions.has(destination)) {
            this.log(`Already subscribed to ${destination}`);
            return;
        }

        try {
            const subscription = this.client.subscribe(destination, (message: IMessage) => {
                this.handleIncomingMessage(message);
            });

            this.subscriptions.set(destination, subscription);
            this.log(`✅ Subscribed to private messages: ${destination}`);
        } catch (error) {
            console.error('[ChatWebSocket] Failed to subscribe to private messages:', error);
        }
    }

    /**
     * Subscribe to a group conversation
     * @param conversationId - UUID of the group conversation
     */
    public subscribeToGroup(conversationId: string): void {
        if (!this.client || !this.isConnected()) {
            console.error('[ChatWebSocket] Cannot subscribe to group: not connected');
            return;
        }

        const destination = WS_ENDPOINTS.CHAT.GROUP_MESSAGE_WEBSOCKET_TOPIC(conversationId);

        if (this.subscriptions.has(destination)) {
            this.log(`Already subscribed to group: ${conversationId}`);
            return;
        }

        try {
            const subscription = this.client.subscribe(destination, (message: IMessage) => {
                this.handleIncomingMessage(message);
            });

            this.subscriptions.set(destination, subscription);
            this.log(`✅ Subscribed to group: ${conversationId}`);
        } catch (error) {
            console.error(`[ChatWebSocket] Failed to subscribe to group ${conversationId}:`, error);
        }
    }

    /**
     * Unsubscribe from a group conversation
     * @param conversationId - UUID of the group conversation
     */
    public unsubscribeFromGroup(conversationId: string): void {
        const destination = WS_ENDPOINTS.CHAT.GROUP_MESSAGE_WEBSOCKET_TOPIC(conversationId);
        const subscription = this.subscriptions.get(destination);

        if (subscription) {
            try {
                subscription.unsubscribe();
                this.subscriptions.delete(destination);
                this.log(`✅ Unsubscribed from group: ${conversationId}`);
            } catch (error) {
                console.error(`[ChatWebSocket] Failed to unsubscribe from group ${conversationId}:`, error);
            }
        }
    }

    /**
     * Subscribe to multiple group conversations at once
     * @param conversationIds - Array of conversation UUIDs
     */
    public subscribeToGroups(conversationIds: string[]): void {
        conversationIds.forEach(id => this.subscribeToGroup(id));
    }

    /**
     * Unsubscribe from all group conversations
     */
    public unsubscribeFromAllGroups(): void {
        const groupSubscriptions = Array.from(this.subscriptions.keys()).filter(dest =>
            dest.startsWith('/topic/group/')
        );

        groupSubscriptions.forEach(dest => {
            const subscription = this.subscriptions.get(dest);
            if (subscription) {
                subscription.unsubscribe();
                this.subscriptions.delete(dest);
            }
        });

        this.log(`✅ Unsubscribed from ${groupSubscriptions.length} groups`);
    }

    /**
     * Clear all subscriptions
     */
    private clearSubscriptions(): void {
        this.subscriptions.forEach(sub => {
            try {
                sub.unsubscribe();
            } catch (error) {
                // Ignore errors during cleanup
            }
        });
        this.subscriptions.clear();
        this.log('Cleared all subscriptions');
    }

    // ==================== MESSAGE SENDING ====================

    /**
     * Send a private message
     * @param request - Private message request
     */
    public sendPrivateMessage(request: PrivateMessageRequest): void {
        if (!this.client || !this.isConnected()) {
            throw new Error('Cannot send message: not connected');
        }

        this.validateMessageRequest(request);

        try {
            this.client.publish({
                destination: WS_ENDPOINTS.CHAT.SEND_PRIVATE_MESSAGE,
                body: JSON.stringify(request),
            });

            this.log(`📤 Sent private message to ${request.recipientId}`);
        } catch (error) {
            console.error('[ChatWebSocket] Failed to send private message:', error);
            throw error;
        }
    }

    /**
     * Send a group message
     * @param request - Group message request
     */
    public sendGroupMessage(request: GroupMessageRequest): void {
        if (!this.client || !this.isConnected()) {
            throw new Error('Cannot send message: not connected');
        }

        this.validateMessageRequest(request);

        try {
            this.client.publish({
                destination: WS_ENDPOINTS.CHAT.SEND_GROUP_MESSAGE,
                body: JSON.stringify(request),
            });

            this.log(`📤 Sent group message to ${request.conversationId}`);
        } catch (error) {
            console.error('[ChatWebSocket] Failed to send group message:', error);
            throw error;
        }
    }

    /**
     * Send a text message (auto-detects private or group)
     * @param conversationId - Conversation ID
     * @param content - Message text content
     * @param isGroup - Whether this is a group conversation
     * @param recipientId - Recipient ID (required for private messages)
     */
    public sendTextMessage(
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

    // ==================== MESSAGE HANDLING ====================

    /**
     * Register a message handler
     * @param handler - Function to handle incoming messages
     */
    public onMessage(handler: MessageHandler): void {
        this.messageHandlers.push(handler);
    }

    /**
     * Remove a message handler
     * @param handler - Handler to remove
     */
    public removeMessageHandler(handler: MessageHandler): void {
        this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    }

    /**
     * Clear all message handlers
     */
    public clearMessageHandlers(): void {
        this.messageHandlers = [];
    }

    /**
     * Handle incoming WebSocket message
     * @param message - STOMP message
     */
    private handleIncomingMessage(message: IMessage): void {
        try {
            const messageData: MessageDto = JSON.parse(message.body);
            this.log('📩 Received message:', messageData);

            // Notify all registered handlers
            this.messageHandlers.forEach(handler => {
                try {
                    handler(messageData);
                } catch (error) {
                    console.error('[ChatWebSocket] Error in message handler:', error);
                }
            });
        } catch (error) {
            console.error('[ChatWebSocket] Failed to parse incoming message:', error);
        }
    }

    // ==================== VALIDATION ====================

    /**
     * Validate message request before sending
     * @param request - Message request to validate
     */
    private validateMessageRequest(request: PrivateMessageRequest | GroupMessageRequest): void {
        if (!request.type) {
            throw new Error('Message type is required');
        }

        if (request.type === 'TEXT') {
            if (!request.textContent || request.textContent.trim().length === 0) {
                throw new Error('Text content is required for TEXT messages');
            }
        } else if (request.type === 'IMAGE' || request.type === 'FILE') {
            if (!request.fileId || !request.fileName || !request.fileSize) {
                throw new Error('File metadata is required for IMAGE/FILE messages');
            }
        }
    }

    // ==================== UTILITY ====================

    /**
     * Log debug messages
     * @param messages - Messages to log
     */
    private log(...messages: any[]): void {
        if (this.config.debug) {
            console.log('[ChatWebSocket]', ...messages);
        }
    }
}

// ==================== SINGLETON INSTANCE ====================

/**
 * Global chat WebSocket client instance
 * Use this for application-wide chat functionality
 */
let chatWebSocketClient: ChatWebSocketClient | null = null;

/**
 * Get or create the global chat WebSocket client
 * @param config - Optional configuration (only used on first call)
 */
export function getChatWebSocketClient(config?: ChatWebSocketConfig): ChatWebSocketClient {
    if (!chatWebSocketClient) {
        chatWebSocketClient = new ChatWebSocketClient(config);
    }
    return chatWebSocketClient;
}

/**
 * Disconnect and destroy the global chat WebSocket client
 */
export function destroyChatWebSocketClient(): void {
    if (chatWebSocketClient) {
        chatWebSocketClient.disconnect();
        chatWebSocketClient = null;
    }
}
