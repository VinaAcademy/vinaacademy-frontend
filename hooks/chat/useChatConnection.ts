/**
 * Chat Connection Hook
 * Manages WebSocket connection state and lifecycle
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { getChatWebSocketClient, ChatWebSocketClient } from '@/lib/chatWebSocket';
import { APP_CONFIG } from '@/config/app.config';
import type { WebSocketStatus } from '@/types/chat';

/**
 * Connection hook configuration
 */
interface UseChatConnectionConfig {
  accessToken: string;
  debug?: boolean;
  autoConnect?: boolean;
}

/**
 * Connection hook return type
 */
interface UseChatConnectionReturn {
  // Connection state
  connected: boolean;
  connecting: boolean;
  connectionError: string | null;
  
  // Connection methods
  connect: () => Promise<void>;
  disconnect: () => void;
  
  // WebSocket client instance
  client: ChatWebSocketClient;
}

/**
 * Hook for managing WebSocket connection
 * @param config - Connection configuration
 */
export function useChatConnection(config: UseChatConnectionConfig): UseChatConnectionReturn {
  const { accessToken, debug = false, autoConnect = true } = config;

  // WebSocket client with token refresh callback
  const clientRef = useRef(
    getChatWebSocketClient({
      debug,
      onTokenExpired: async () => {
        // Import dynamically to avoid circular dependencies
        const { getAccessToken } = await import('@/lib/apiClient');
        const { refreshToken: refreshAuthToken } = await import('@/services/authService');

        try {
          console.log('[useChatConnection] Token expired, refreshing...');
          const refreshedUser = await refreshAuthToken();

          if (refreshedUser) {
            const newToken = getAccessToken();
            console.log('[useChatConnection] Token refreshed successfully');
            return newToken || null;
          }

          console.error('[useChatConnection] Failed to refresh token');
          return null;
        } catch (error) {
          console.error('[useChatConnection] Token refresh error:', error);
          return null;
        }
      },
      heartbeatIncoming: APP_CONFIG.WS_HEARTBEAT_INTERVAL,
      heartbeatOutgoing: APP_CONFIG.WS_HEARTBEAT_INTERVAL,
    })
  );
  const client = clientRef.current;

  // Connection state
  const [wsStatus, setWsStatus] = useState<WebSocketStatus>({
    connected: false,
    connecting: false,
    error: null,
  });

  // Connect to WebSocket
  const connect = useCallback(async () => {
    if (!accessToken) {
      console.error('[useChatConnection] No access token provided');
      return;
    }

    if (wsStatus.connected) {
      console.log('[useChatConnection] Already connected');
      return;
    }

    try {
      setWsStatus({ connected: false, connecting: true, error: null });
      await client.connect(accessToken);
      setWsStatus({ connected: true, connecting: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setWsStatus({ connected: false, connecting: false, error: errorMessage });
      console.error('[useChatConnection] Connection error:', error);
    }
  }, [accessToken, client, wsStatus.connected]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    client.disconnect();
    setWsStatus({ connected: false, connecting: false, error: null });
  }, [client]);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && accessToken && !wsStatus.connected && !wsStatus.connecting) {
      connect().then(r => r);
    }

    return () => {
      if (autoConnect) {
        disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, accessToken]);

  // Watch for token changes and update WebSocket connection
  useEffect(() => {
    if (accessToken && wsStatus.connected) {
      // Update token in WebSocket client when it changes
      client.updateToken(accessToken).catch(error => {
        console.error('[useChatConnection] Failed to update token:', error);
      });
    }
  }, [accessToken, wsStatus.connected, client]);

  return {
    // Connection state
    connected: wsStatus.connected,
    connecting: wsStatus.connecting,
    connectionError: wsStatus.error,

    // Connection methods
    connect,
    disconnect,

    // WebSocket client
    client,
  };
}
