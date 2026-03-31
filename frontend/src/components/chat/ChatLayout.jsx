import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import MessageArea from './MessageArea';
import { createStompClient } from '../../services/websocket';
import { useAuth } from '../../context/AuthContext';

const ChatLayout = () => {
    const { user } = useAuth();
    const [stompClient, setStompClient] = useState(null);
    const [activeConversation, setActiveConversation] = useState(null);
    const [incomingMessage, setIncomingMessage] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        let client = null;

        const onConnected = (connectedClient) => {
            setIsConnected(true);
            setStompClient(connectedClient);
            
            // Subscribe to private messages queue
            connectedClient.subscribe(`/user/queue/messages`, (message) => {
                const receivedMessage = JSON.parse(message.body);
                setIncomingMessage(receivedMessage);
            });
        };

        const onError = (error) => {
            console.error("STOMP Connection error", error);
            setIsConnected(false);
        };

        // Initialize connection
        if (user) {
             client = createStompClient(onConnected, onError);
             client.activate();
        }

        return () => {
            if (client) {
                client.deactivate();
            }
        };
    }, [user]);

    const handleSendMessage = useCallback((msgData) => {
        if (stompClient && isConnected) {
            stompClient.publish({
                destination: '/app/chat.sendMessage',
                body: JSON.stringify(msgData)
            });
            // Optimistically update local UI
            setIncomingMessage({
                ...msgData,
                senderUsername: user.username,
                timestamp: new Date().toISOString()
            });
        }
    }, [stompClient, isConnected, user]);

    return (
        <div className="flex bg-gray-50 h-screen font-sans">
            <Sidebar 
                onSelectConversation={setActiveConversation} 
                activeConversation={activeConversation} 
            />
            <MessageArea 
                conversation={activeConversation} 
                onSendMessage={handleSendMessage}
                incomingMessage={incomingMessage}
            />
        </div>
    );
};

export default ChatLayout;
