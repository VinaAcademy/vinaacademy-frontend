/**
 * Subscription Manager
 * Manages WebSocket subscriptions for private and group messages
 */

import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { WS_ENDPOINTS } from '@/config/api.endpoint';
import { Logger } from './types';

export class SubscriptionManager {
    private subscriptions: Map<string, StompSubscription> = new Map();

    constructor(
        private client: Client,
        private logger: Logger,
        private onMessage: (message: IMessage) => void
    ) {}

    /**
     * Subscribe to private messages queue
     */
    subscribeToPrivateMessages(): void {
        const destination = WS_ENDPOINTS.CHAT.PRIVATE_MESSAGE_QUEUE;

        if (this.hasSubscription(destination)) {
            this.logger.log(`Already subscribed to ${destination}`);
            return;
        }

        try {
            const subscription = this.client.subscribe(destination, this.onMessage);
            this.subscriptions.set(destination, subscription);
            this.logger.log(`✅ Subscribed to private messages: ${destination}`);
        } catch (error) {
            this.logger.error('Failed to subscribe to private messages:', error);
        }
    }

    /**
     * Subscribe to a group conversation topic
     */
    subscribeToGroup(conversationId: string): void {
        const destination = WS_ENDPOINTS.CHAT.GROUP_MESSAGE_WEBSOCKET_TOPIC(conversationId);

        if (this.hasSubscription(destination)) {
            this.logger.log(`Already subscribed to group: ${conversationId}`);
            return;
        }

        try {
            const subscription = this.client.subscribe(destination, this.onMessage);
            this.subscriptions.set(destination, subscription);
            this.logger.log(`✅ Subscribed to group: ${conversationId}`);
        } catch (error) {
            this.logger.error(`Failed to subscribe to group ${conversationId}:`, error);
        }
    }

    /**
     * Unsubscribe from a group conversation
     */
    unsubscribeFromGroup(conversationId: string): void {
        const destination = WS_ENDPOINTS.CHAT.GROUP_MESSAGE_WEBSOCKET_TOPIC(conversationId);
        this.unsubscribe(destination, `group: ${conversationId}`);
    }

    /**
     * Subscribe to multiple group conversations
     */
    subscribeToGroups(conversationIds: string[]): void {
        conversationIds.forEach(id => this.subscribeToGroup(id));
    }

    /**
     * Unsubscribe from all group conversations
     */
    unsubscribeFromAllGroups(): void {
        const groupDestinations = this.getGroupSubscriptions();

        groupDestinations.forEach(destination => {
            this.unsubscribe(destination);
        });

        this.logger.log(`✅ Unsubscribed from ${groupDestinations.length} groups`);
    }

    /**
     * Clear all subscriptions
     */
    clearAll(): void {
        this.subscriptions.forEach((subscription) => {
            try {
                subscription.unsubscribe();
            } catch (error) {
                // Ignore errors during cleanup
            }
        });

        this.subscriptions.clear();
        this.logger.log('Cleared all subscriptions');
    }

    /**
     * Check if subscription exists
     */
    hasSubscription(destination: string): boolean {
        return this.subscriptions.has(destination);
    }

    /**
     * Get all group subscription destinations
     */
    private getGroupSubscriptions(): string[] {
        return Array.from(this.subscriptions.keys()).filter(dest =>
            dest.startsWith('/topic/group/')
        );
    }

    /**
     * Unsubscribe from a destination
     */
    private unsubscribe(destination: string, label?: string): void {
        const subscription = this.subscriptions.get(destination);

        if (subscription) {
            try {
                subscription.unsubscribe();
                this.subscriptions.delete(destination);
                this.logger.log(`✅ Unsubscribed from ${label || destination}`);
            } catch (error) {
                this.logger.error(`Failed to unsubscribe from ${label || destination}:`, error);
            }
        }
    }

    /**
     * Get subscription count
     */
    getSubscriptionCount(): number {
        return this.subscriptions.size;
    }

    /**
     * Get all subscription destinations
     */
    getDestinations(): string[] {
        return Array.from(this.subscriptions.keys());
    }
}
