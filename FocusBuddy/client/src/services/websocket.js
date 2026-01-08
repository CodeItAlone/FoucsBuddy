import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { WS_URL, getAuthToken } from './api';

let stompClient = null;
let subscriptions = new Map();

/**
 * Connect to WebSocket server
 * @param {Function} onConnect - Callback when connected
 * @param {Function} onError - Callback on error
 */
export const connect = (onConnect, onError) => {
    if (stompClient?.connected) {
        onConnect?.();
        return;
    }

    const socket = new SockJS(WS_URL);
    stompClient = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
            if (__DEV__) console.log('STOMP:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
        console.log('WebSocket connected');
        onConnect?.();
    };

    stompClient.onStompError = (frame) => {
        console.error('STOMP error:', frame.headers.message);
        onError?.(frame);
    };

    stompClient.onWebSocketClose = () => {
        console.log('WebSocket closed');
    };

    stompClient.activate();
};

/**
 * Disconnect from WebSocket server
 */
export const disconnect = () => {
    if (stompClient) {
        subscriptions.forEach((sub) => sub.unsubscribe());
        subscriptions.clear();
        stompClient.deactivate();
        stompClient = null;
    }
};

/**
 * Subscribe to a group's session updates
 * @param {number} groupId - Group ID to subscribe to
 * @param {Function} callback - Callback function when message received
 * @returns {Function} Unsubscribe function
 */
export const subscribeToGroup = (groupId, callback) => {
    if (!stompClient?.connected) {
        console.warn('WebSocket not connected');
        return () => { };
    }

    const topic = `/topic/group/${groupId}`;
    if (subscriptions.has(topic)) {
        return () => subscriptions.get(topic)?.unsubscribe();
    }

    const subscription = stompClient.subscribe(topic, (message) => {
        const event = JSON.parse(message.body);
        callback(event);
    });

    subscriptions.set(topic, subscription);
    return () => {
        subscription.unsubscribe();
        subscriptions.delete(topic);
    };
};

/**
 * Subscribe to a specific user's session updates
 * @param {number} userId - User ID to subscribe to
 * @param {Function} callback - Callback function when message received
 * @returns {Function} Unsubscribe function
 */
export const subscribeToUser = (userId, callback) => {
    if (!stompClient?.connected) {
        console.warn('WebSocket not connected');
        return () => { };
    }

    const topic = `/topic/user/${userId}`;
    if (subscriptions.has(topic)) {
        return () => subscriptions.get(topic)?.unsubscribe();
    }

    const subscription = stompClient.subscribe(topic, (message) => {
        const event = JSON.parse(message.body);
        callback(event);
    });

    subscriptions.set(topic, subscription);
    return () => {
        subscription.unsubscribe();
        subscriptions.delete(topic);
    };
};

/**
 * Check if WebSocket is connected
 * @returns {boolean}
 */
export const isConnected = () => stompClient?.connected ?? false;
