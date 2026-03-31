import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const createStompClient = (onConnect, onError) => {
    const token = localStorage.getItem('token');
    
    // We connect to the proxy defined in vite.config.js (or direct to backend if no proxy)
    // The endpoint is /ws.
    const socket = new SockJS('/ws');
    
    const client = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
            Authorization: `Bearer ${token}`
        },
        debug: function (str) {
            console.log('STOMP: ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
        console.log('Connected: ' + frame);
        if (onConnect) onConnect(client);
    };

    client.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
        if (onError) onError(frame);
    };

    return client;
};
