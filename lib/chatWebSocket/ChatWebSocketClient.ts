/**
 * Chat WebSocket Client (Refactored)
 * Main orchestrator for WebSocket chat functionality
 * Delegates responsibilities to specialized managers
 */

import type {
    PrivateMessageRequest,
    GroupMessageRequest,
    MessageHandler,
    WebSocketStatus,
} from '@/types/chat';
import {
    ChatWebSocketConfig,
    DEFAULT_CONFIG,
    Logger,
    StatusTracker
} from './types';
import {ConnectionManager} from './ConnectionManager';
import {SubscriptionManager} from './SubscriptionManager';
import {MessageSender} from './MessageSender';
import {MessageHandlerManager} from './MessageHandlerManager';
import {TokenRefreshHandler} from './TokenRefreshHandler';
import {OnlineUsersHandler, OnlineUsersManager} from "@/lib/chatWebSocket/OnlineUsersManager";

/**
 * Chat WebSocket Client
 * Coordinates all WebSocket operations through specialized managers
 */
export class ChatWebSocketClient {
    private readonly logger: Logger;
    private readonly statusTracker: StatusTracker;
    private readonly tokenRefreshHandler: TokenRefreshHandler;
    private connectionManager: ConnectionManager;
    private subscriptionManager: SubscriptionManager | null = null;
    private messageSender: MessageSender | null = null;
    private messageHandlerManager: MessageHandlerManager;

    private onlineUsersManager: OnlineUsersManager | null = null;

    constructor(config: ChatWebSocketConfig = {}) {
        // Merge config with defaults
        const fullConfig = {
            ...DEFAULT_CONFIG,
            ...config,
        };

        // Initialize core utilities
        this.logger = new Logger(fullConfig.debug);
        this.statusTracker = new StatusTracker();
        this.tokenRefreshHandler = new TokenRefreshHandler(
            this.logger,
            config.onTokenExpired
        );
        this.messageHandlerManager = new MessageHandlerManager(this.logger);

        // Initialize connection manager
        this.connectionManager = new ConnectionManager(
            fullConfig,
            this.logger,
            this.statusTracker,
            this.tokenRefreshHandler,
            () => this.onConnected()
        );
    }

    // ==================== CONNECTION MANAGEMENT ====================

    /**
     * Connect to chat WebSocket server
     */
    public async connect(accessToken: string): Promise<void> {
        return this.connectionManager.connect(accessToken);
    }

    /**
     * Disconnect from chat WebSocket server
     */
    public disconnect(): void {
        this.clearManagers();
        this.connectionManager.disconnect();
    }

    /**
     * Update access token and reconnect if needed
     */
    public async updateToken(newToken: string): Promise<void> {
        return this.connectionManager.reconnect(newToken);
    }

    /**
     * Check if client is connected
     */
    public isConnected(): boolean {
        return this.connectionManager.isConnected();
    }

    /**
     * Get current connection status
     */
    public getStatus(): WebSocketStatus {
        return this.statusTracker.getStatus();
    }

    // ==================== SUBSCRIPTION MANAGEMENT ====================

    /**
     * Subscribe to a group conversation
     */
    public subscribeToGroup(conversationId: string): void {
        this.ensureConnected();
        this.subscriptionManager?.subscribeToGroup(conversationId);
    }

    /**
     * Unsubscribe from a group conversation
     */
    public unsubscribeFromGroup(conversationId: string): void {
        this.subscriptionManager?.unsubscribeFromGroup(conversationId);
    }

    /**
     * Subscribe to multiple group conversations at once
     */
    public subscribeToGroups(conversationIds: string[]): void {
        this.ensureConnected();
        this.subscriptionManager?.subscribeToGroups(conversationIds);
    }

    /**
     * Unsubscribe from all group conversations
     */
    public unsubscribeFromAllGroups(): void {
        this.subscriptionManager?.unsubscribeFromAllGroups();
    }

    // ==================== MESSAGE SENDING ====================

    /**
     * Send a private message
     */
    public sendPrivateMessage(request: PrivateMessageRequest): void {
        this.ensureConnected();
        this.messageSender?.sendPrivateMessage(request);
    }

    /**
     * Send a group message
     */
    public sendGroupMessage(request: GroupMessageRequest): void {
        this.ensureConnected();
        this.messageSender?.sendGroupMessage(request);
    }

    /**
     * Send a text message (auto-detects private or group)
     */
    public sendTextMessage(
        conversationId: string,
        content: string,
        isGroup: boolean,
        recipientId?: string
    ): void {
        this.ensureConnected();
        this.messageSender?.sendTextMessage(conversationId, content, isGroup, recipientId);
    }

    // ==================== MESSAGE HANDLING ====================

    /**
     * Register a message handler
     */
    public onMessage(handler: MessageHandler): void {
        this.messageHandlerManager.register(handler);
    }

    /**
     * Remove a message handler
     */
    public removeMessageHandler(handler: MessageHandler): void {
        this.messageHandlerManager.remove(handler);
    }

    /**
     * Clear all message handlers
     */
    public clearMessageHandlers(): void {
        this.messageHandlerManager.clearAll();
    }

    // ==================== PRIVATE METHODS ====================

    /**
     * Called when connection is established
     */
    private onConnected(): void {
        const client = this.connectionManager.getClient();
        if (!client) {
            this.logger.error('Client is null after connection');
            return;
        }

        // Initialize managers that need active connection
        this.subscriptionManager = new SubscriptionManager(
            client,
            this.logger,
            (message) => this.messageHandlerManager.handleIncoming(message)
        );

        this.messageSender = new MessageSender(client, this.logger);

        // Auto-subscribe to private messages
        this.subscriptionManager.subscribeToPrivateMessages();

        this.onlineUsersManager = new OnlineUsersManager(client, this.logger);
        this.onlineUsersManager.subscribe();
    }

    /**
     * Clear connection-dependent managers
     */
    private clearManagers(): void {
        this.subscriptionManager?.clearAll();
        this.subscriptionManager = null;
        this.messageSender = null;

        this.onlineUsersManager?.unsubscribe();
        this.onlineUsersManager = null;
    }

    /**
     * Ensure client is connected before operations
     */
    private ensureConnected(): void {
        if (!this.isConnected()) {
            throw new Error('Cannot perform operation: not connected');
        }
    }

    // ==================== ONLINE USERS MANAGEMENT ====================

    /**
     * Register handler for online users updates
     */
    public onOnlineUsersUpdate(handler: OnlineUsersHandler): void {
        this.onlineUsersManager?.onUpdate(handler);
    }

    /**
     * Remove online users handler
     */
    public removeOnlineUsersHandler(handler: OnlineUsersHandler): void {
        this.onlineUsersManager?.removeHandler(handler);
    }
}

// ==================== SINGLETON INSTANCE ====================

let chatWebSocketClient: ChatWebSocketClient | null = null;

/**
 * Get or create the global chat WebSocket client
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
