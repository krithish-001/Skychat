import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, Info, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';
import api from '../../services/api';

const MessageArea = ({ conversation, onSendMessage, incomingMessage }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const otherParticipant = conversation?.participantUsernames?.find(u => u !== user?.username) || 'Unknown';

    useEffect(() => {
        if (conversation) {
            loadMessages(conversation.id);
        }
    }, [conversation]);

    useEffect(() => {
        if (incomingMessage && conversation && incomingMessage.conversationId === conversation.id) {
            setMessages(prev => [...prev, incomingMessage]);
        }
    }, [incomingMessage]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadMessages = async (conversationId) => {
        setLoading(true);
        try {
            const res = await api.get(`/chat/history/${conversationId}?page=0&size=50`);
            setMessages(res.data.reverse()); // Reverse to get oldest first
        } catch (err) {
            console.error('Failed to load chat history', err);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (newMessage.trim() && conversation) {
            onSendMessage({
                content: newMessage,
                recipientUsername: otherParticipant, // Fixed matching field for ChatMessage backend DTO
                conversationId: conversation.id
            });
            setNewMessage('');
        }
    };

    if (!conversation) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-50/50">
                <div className="text-center">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <Send size={32} className="text-indigo-500 transform translate-x-1" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Your Messages</h3>
                    <p className="text-gray-500 mt-2 max-w-xs mx-auto">Select a conversation or start a new one to begin messaging.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-gray-100 bg-white z-10">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-lg">
                        {otherParticipant[0].toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-gray-900 font-bold tracking-tight">{otherParticipant}</h2>
                        <p className="text-emerald-500 text-xs font-medium flex items-center">
                            Online
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                    <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors"><Phone size={20} /></button>
                    <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors"><Video size={20} /></button>
                    <button className="p-2 hover:bg-gray-50 rounded-xl transition-colors"><Info size={20} /></button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30 styled-scrollbar">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((msg, idx) => {
                            const isMe = msg.senderUsername === user.username;
                            
                            return (
                                <div key={idx} className={clsx("flex flex-col max-w-[70%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                                    <div className={clsx(
                                        "px-4 py-2.5 rounded-2xl shadow-sm relative group",
                                        isMe ? "bg-indigo-600 text-white rounded-br-none" : "bg-white border border-gray-100 text-gray-900 rounded-bl-none"
                                    )}>
                                        <p className="text-[15px] leading-relaxed break-words">{msg.content}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 font-medium px-1">
                                        {msg.timestamp ? format(new Date(msg.timestamp), 'h:mm a') : 'Now'}
                                    </span>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex items-center space-x-3 max-w-4xl mx-auto">
                    <button type="button" className="p-2.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-all flex-shrink-0">
                        <ImageIcon size={22} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Message..."
                        className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-full focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 px-5 py-3 transition-all outline-none"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="w-12 h-12 flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                        <Send size={20} className="transform translate-x-[1px] translate-y-[-1px]" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MessageArea;
