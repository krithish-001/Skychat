import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Use VITE_WS_URL for production (e.g. https://your-backend.railway.app/ws)
// Falls back to /ws which Vite proxies to localhost:8080 in development
const WS_URL = import.meta.env.VITE_WS_URL || '/ws';

export const createStompClient = (onConnect, onError) => {
    const token = localStorage.getItem('token');
    
    const socket = new SockJS(WS_URL);
    
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
