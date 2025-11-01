/**
 * Chat WebSocket Client (Legacy Entry Point)
 * Re-exports from refactored module for backward compatibility
 * 
 * @deprecated This file is maintained for backward compatibility.
 * Import from '@/lib/chatWebSocket' directory for new code.
 */

// Re-export main client and factory functions
export {
    ChatWebSocketClient,
    getChatWebSocketClient,
    destroyChatWebSocketClient,
} from './chatWebSocket/ChatWebSocketClient';

// Re-export types for backward compatibility
export type { ChatWebSocketConfig } from './chatWebSocket/types';
