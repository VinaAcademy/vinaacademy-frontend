/**
 * Chat WebSocket Module
 * Exports all classes and utilities
 */

// Main client
export { ChatWebSocketClient, getChatWebSocketClient, destroyChatWebSocketClient } from './ChatWebSocketClient';

// Types and utilities
export type { ChatWebSocketConfig } from './types';
export { DEFAULT_CONFIG, Logger, StatusTracker } from './types';

// Managers (exported for testing or advanced usage)
export { ConnectionManager } from './ConnectionManager';
export { SubscriptionManager } from './SubscriptionManager';
export { MessageSender } from './MessageSender';
export { MessageHandlerManager } from './MessageHandlerManager';
export { TokenRefreshHandler } from './TokenRefreshHandler';
export { MessageValidator } from './MessageValidator';
