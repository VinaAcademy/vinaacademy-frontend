/**
 * Token Refresh Handler
 * Handles token refresh and reconnection logic
 */

import { Logger } from './types';

export class TokenRefreshHandler {
    private isRefreshingToken: boolean = false;
    private reconnectAttempts: number = 0;
    private readonly maxReconnectAttempts: number = 5;

    constructor(
        private logger: Logger,
        private onTokenExpired?: () => Promise<string | null>
    ) {}

    /**
     * Check if authentication error occurred
     */
    isAuthError(errorMessage?: string): boolean {
        if (!errorMessage) return false;

        const message = errorMessage.toLowerCase();
        return message.includes('auth') ||
            message.includes('token') ||
            message.includes('unauthorized');
    }

    /**
     * Handle token refresh
     */
    async refresh(): Promise<string | null> {
        if (this.isRefreshingToken) {
            this.logger.log('Token refresh already in progress');
            return null;
        }

        if (!this.onTokenExpired) {
            this.logger.error('No token refresh callback configured');
            return null;
        }

        if (this.hasReachedMaxAttempts()) {
            this.logger.error('Max reconnect attempts reached');
            return null;
        }

        this.isRefreshingToken = true;
        this.reconnectAttempts++;

        try {
            this.logger.log(`🔄 Refreshing token (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            const newToken = await this.onTokenExpired();

            if (newToken) {
                this.logger.log('✅ Token refreshed successfully');
                this.resetAttempts();
                return newToken;
            } else {
                this.logger.error('Token refresh returned null');
                return null;
            }
        } catch (error) {
            this.logger.error('Token refresh failed:', error);
            return null;
        } finally {
            this.isRefreshingToken = false;
        }
    }

    /**
     * Check if max reconnect attempts reached
     */
    hasReachedMaxAttempts(): boolean {
        return this.reconnectAttempts >= this.maxReconnectAttempts;
    }

    /**
     * Reset reconnect attempts counter
     */
    resetAttempts(): void {
        this.reconnectAttempts = 0;
    }

    /**
     * Get current attempt count
     */
    getAttemptCount(): number {
        return this.reconnectAttempts;
    }

    /**
     * Check if currently refreshing
     */
    isRefreshing(): boolean {
        return this.isRefreshingToken;
    }
}
