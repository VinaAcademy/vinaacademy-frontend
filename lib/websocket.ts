import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface WebSocketConfig {
  url: string;
  token: string | null;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
  onTokenExpired?: () => Promise<string | null>; // Callback to refresh token
  debug?: boolean;
}

/**
 * Creates and configures a STOMP client for WebSocket connections
 * with automatic token refresh support
 * @param config WebSocket configuration object
 * @returns Configured STOMP Client instance
 */
export function createWebSocketClient(config: WebSocketConfig): Client {
  const { url, token, onConnect, onDisconnect, onError, onTokenExpired, debug = false } = config;

  let isRefreshingToken = false;
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 5;

  /**
   * Handle token refresh and reconnection
   */
  const handleTokenRefresh = async (client: Client): Promise<boolean> => {
    if (isRefreshingToken) {
      if (debug) {
        console.log('[WebSocket] Token refresh already in progress');
      }
      return false;
    }

    if (!onTokenExpired) {
      console.error('[WebSocket] No token refresh callback configured');
      return false;
    }

    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnect attempts reached');
      return false;
    }

    isRefreshingToken = true;
    reconnectAttempts++;

    try {
      if (debug) {
        console.log(`[WebSocket] 🔄 Refreshing token (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
      }
      
      const newToken = await onTokenExpired();

      if (newToken) {
        if (debug) {
          console.log('[WebSocket] ✅ Token refreshed successfully');
        }
        
        // Update connect headers with new token
        client.connectHeaders = {
          Authorization: `Bearer ${newToken}`,
        };
        
        // Deactivate current connection
        await client.deactivate();
        
        // Small delay to ensure clean disconnect
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Reactivate with new token
        client.activate();
        
        reconnectAttempts = 0; // Reset on successful reconnect
        return true;
      } else {
        console.error('[WebSocket] Token refresh returned null');
        return false;
      }
    } catch (error) {
      console.error('[WebSocket] Token refresh failed:', error);
      return false;
    } finally {
      isRefreshingToken = false;
    }
  };

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
      reconnectAttempts = 0; // Reset on successful connect
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
      
      // Check if error is due to authentication
      const isAuthError = frame.headers['message']?.toLowerCase().includes('auth') ||
                        frame.headers['message']?.toLowerCase().includes('token') ||
                        frame.headers['message']?.toLowerCase().includes('unauthorized');
      
      if (isAuthError && onTokenExpired && !isRefreshingToken) {
        if (debug) {
          console.log('[WebSocket] 🔑 Authentication error detected, attempting token refresh...');
        }
        
        handleTokenRefresh(client).then((success: boolean) => {
          if (success) {
            if (debug) {
              console.log('[WebSocket] ✅ Token refreshed, reconnecting...');
            }
          } else {
            if (debug) {
              console.error('[WebSocket] ❌ Token refresh failed');
            }
          }
        }).catch((err: Error) => {
          console.error('[WebSocket] Token refresh error:', err);
        });
      }
      
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
