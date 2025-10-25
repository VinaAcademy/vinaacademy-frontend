import {Client, IMessage} from "@stomp/stompjs";
import {Logger} from "@/lib/chatWebSocket/types";
import {WS_ENDPOINTS} from "@/config/api.endpoint";


export type OnlineUsersHandler = (userIds: Set<string>) => void;

export class OnlineUsersManager {
    private subscription: any = null;
    private handlers: Set<OnlineUsersHandler> = new Set();

    constructor(
        private client: Client,
        private logger: Logger
    ) {
    }

    /**
     * Subscribe to online users topic
     */
    public subscribe(): void {
        if (this.subscription) {
            this.logger.warn('[OnlineUsersManager] Already subscribed to online users topic');
            return;
        }

        this.subscription = this.client.subscribe(WS_ENDPOINTS.CHAT.ONLINE_USERS_WEBSOCKET_TOPIC, (message) => {
            this.handleMessage(message);
        })

        this.logger.log('[OnlineUsersManager] Subscribed to online users topic');
    }

    /**
     * Unsubscribe from online users topic
     */
    public unsubscribe(): void {
        if (!this.subscription) {
            this.logger.warn('[OnlineUsersManager] Not subscribed to online users topic');
            return;
        }

        this.subscription.unsubscribe();
        this.subscription = null;
        this.logger.log('[OnlineUsersManager] Unsubscribed from online users topic');
    }

    /**
     * Register a handler for online users updates
     */
    public onUpdate(handler: OnlineUsersHandler): void {
        this.logger.log('[OnlineUsersManager] Registered an online users handler');
        this.handlers.add(handler);
    }

    /**
     * Remove a handler
     */
    public removeHandler(handler: OnlineUsersHandler): void {
        this.handlers.delete(handler);
    }

    /**
     * Clear all handlers
     */
    public clearHandlers(): void {
        this.handlers.clear();
    }

    private handleMessage(message: IMessage) {
        try {
            const userIds: string[] = JSON.parse(message.body);
            const userIdsSet = new Set(userIds);

            this.logger.log(`📡 Online users update: ${userIdsSet.size} users`);

            // Notify all handlers
            this.handlers.forEach(handler => {
                try {
                    handler(userIdsSet);
                } catch (error) {
                    this.logger.error('Error in online users handler:', error);
                }
            });
        } catch (error) {
            this.logger.error('Failed to parse online users message:', error);
        }
    }
}