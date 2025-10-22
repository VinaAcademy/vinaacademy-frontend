/**
 * Connection Manager
 * Manages WebSocket connection lifecycle
 */

import SockJS from 'sockjs-client';
import { Client, IFrame } from '@stomp/stompjs';
import { WS_ENDPOINTS } from '@/config/api.endpoint';
import { ChatWebSocketConfig, Logger, StatusTracker } from './types';
import { TokenRefreshHandler } from './TokenRefreshHandler';

export class ConnectionManager {
    private client: Client | null = null;

    constructor(
        private config: ChatWebSocketConfig,
        private logger: Logger,
        private statusTracker: StatusTracker,
        private tokenRefreshHandler: TokenRefreshHandler,
        private onConnected: () => void
    ) {}

    /**
     * Connect to WebSocket server
     */
    async connect(accessToken: string): Promise<void> {
        return new Promise((resolve, reject) => {
            if (this.statusTracker.isConnected()) {
                this.logger.log('Already connected');
                resolve();
                return;
            }

            if (this.statusTracker.isConnecting()) {
                this.logger.log('Connection already in progress');
                reject(new Error('Connection already in progress'));
                return;
            }

            this.statusTracker.setConnecting();

            try {
                this.client = this.createClient(accessToken, resolve, reject);
                this.client.activate();
            } catch (error) {
                this.handleConnectionError(error, reject);
            }
        });
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect(): void {
        if (this.client) {
            this.logger.log('Disconnecting...');
            this.client.deactivate().then(r => r);
            this.client = null;
            this.statusTracker.setDisconnected();
            this.tokenRefreshHandler.resetAttempts();
        }
    }

    /**
     * Reconnect with new token
     */
    async reconnect(newToken: string): Promise<void> {
        if (this.isConnected()) {
            this.logger.log('🔄 Updating token, reconnecting...');
            this.disconnect();
            await this.connect(newToken);
        }
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.statusTracker.isConnected() && this.client?.connected === true;
    }

    /**
     * Get STOMP client
     */
    getClient(): Client | null {
        return this.client;
    }

    /**
     * Create STOMP client
     */
    private createClient(
        accessToken: string,
        resolve: () => void,
        reject: (error: Error) => void
    ): Client {
        const socket = new SockJS(WS_ENDPOINTS.CHAT.URL);

        return new Client({
            webSocketFactory: () => socket as any,
            connectHeaders: {
                Authorization: `Bearer ${accessToken}`,
            },
            debug: this.config.debug ? (str) => console.log('[STOMP]', str) : undefined,
            reconnectDelay: this.config.reconnectDelay,
            heartbeatIncoming: this.config.heartbeatIncoming,
            heartbeatOutgoing: this.config.heartbeatOutgoing,

            onConnect: () => this.handleConnect(resolve),
            onStompError: (frame) => this.handleStompError(frame, reject),
            onWebSocketError: (event) => this.handleWebSocketError(event, reject),
            onDisconnect: () => this.handleDisconnect(),
        });
    }

    /**
     * Handle successful connection
     */
    private handleConnect(resolve: () => void): void {
        this.logger.log('✅ Connected to chat WebSocket');
        this.statusTracker.setConnected();
        this.onConnected();
        resolve();
    }

    /**
     * Handle STOMP error
     */
    private handleStompError(frame: IFrame, reject: (error: Error) => void): void {
        const error = `STOMP error: ${frame.headers['message'] || 'Unknown error'}`;
        this.logger.error(error, frame);
        this.statusTracker.setError(error);

        const isAuthError = this.tokenRefreshHandler.isAuthError(frame.headers['message']);

        if (isAuthError && !this.tokenRefreshHandler.isRefreshing()) {
            this.handleAuthError(reject).then(r => r);
        } else {
            reject(new Error(error));
        }
    }

    /**
     * Handle authentication error with token refresh
     */
    private async handleAuthError(reject: (error: Error) => void): Promise<void> {
        this.logger.log('🔑 Authentication error detected, attempting token refresh...');

        try {
            const newToken = await this.tokenRefreshHandler.refresh();
            if (newToken) {
                this.logger.log('✅ Token refreshed, reconnecting...');
                // Will reconnect automatically due to reconnectDelay
            } else {
                reject(new Error('Token refresh failed'));
            }
        } catch (err) {
            reject(err as Error);
        }
    }

    /**
     * Handle WebSocket error
     */
    private handleWebSocketError(event: any, reject: (error: Error) => void): void {
        const error = 'WebSocket connection error';
        this.logger.error(error, event);
        this.statusTracker.setError(error);
        reject(new Error(error));
    }

    /**
     * Handle disconnection
     */
    private handleDisconnect(): void {
        this.logger.log('❌ Disconnected from chat WebSocket');
        this.statusTracker.setDisconnected();
    }

    /**
     * Handle connection error
     */
    private handleConnectionError(error: unknown, reject: (error: Error) => void): void {
        this.logger.error('Connection error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Connection failed';
        this.statusTracker.setError(errorMessage);
        reject(error as Error);
    }
}
