import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface WebSocketConfig {
  url: string;
  token: string | null;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  debug?: boolean;
}

/**
 * Creates and configures a STOMP client for WebSocket connections
 * @param config WebSocket configuration object
 * @returns Configured STOMP Client instance
 */
export function createWebSocketClient(config: WebSocketConfig): Client {
  const { url, token, onConnect, onDisconnect, onError, debug = false } = config;

  const client = new Client({
    // Use SockJS for WebSocket connection
    webSocketFactory: () => new SockJS(url) as any,
    
    // Add Authorization header if token is available
    connectHeaders: token ? {
      Authorization: `Bearer ${token}`,
    } : {},

    // Connection successful callback
    onConnect: () => {
      if (debug) {
        console.log('[WebSocket] Connected successfully');
      }
      onConnect?.();
    },

    // Connection lost callback
    onDisconnect: () => {
      if (debug) {
        console.log('[WebSocket] Disconnected');
      }
      onDisconnect?.();
    },

    // STOMP protocol error callback
    onStompError: (frame) => {
      console.error('[WebSocket] STOMP error:', frame.headers['message'], frame.body);
      onError?.(frame);
    },

    // WebSocket close callback
    onWebSocketClose: (event) => {
      if (debug) {
        console.log('[WebSocket] Connection closed:', event.code, event.reason);
      }
    },

    // Auto-reconnect configuration
    reconnectDelay: 5000, // Reconnect after 5 seconds
    heartbeatIncoming: 4000, // Expect heartbeat from server every 4 seconds
    heartbeatOutgoing: 4000, // Send heartbeat to server every 4 seconds

    // Enable debug logging if specified
    debug: debug ? (str) => console.log('[WebSocket Debug]', str) : undefined,
  });

  return client;
}
