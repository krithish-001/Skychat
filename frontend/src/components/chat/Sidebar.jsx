import React, { useState, useEffect } from 'react';
import { Search, MessageCircle, UserPlus, LogOut } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

const Sidebar = ({ onSelectConversation, activeConversation }) => {
    const { user, logout } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            const res = await api.get('/chat/conversations');
            setConversations(res.data);
        } catch (err) {
            console.error('Failed to load conversations', err);
        }
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim().length > 0) {
            setIsSearching(true);
            try {
                const res = await api.get(`/users/search?query=${query}`);
                // Map the string list to object array to match our display logic
                const formattedResults = res.data.map((uname, idx) => ({ id: idx, username: uname }));
                setSearchResults(formattedResults);
            } catch (err) {
                console.error(err);
            }
        } else {
            setIsSearching(false);
            setSearchResults([]);
        }
    };

    const startConversation = async (username) => {
        try {
            const res = await api.post(`/chat/conversation/${username}`);
            // Add to conversations if not exists
            const existing = conversations.find(c => c.id === res.data.id);
            if (!existing) {
                setConversations([res.data, ...conversations]);
            }
            onSelectConversation(res.data);
            setSearchQuery('');
            setIsSearching(false);
        } catch (err) {
            console.error('Failed to start conversation', err);
        }
    };

    return (
        <div className="w-80 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-full shadow-lg shadow-gray-100/50 z-20">
            {/* Header */}
            <div className="h-16 px-6 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-gray-900 font-bold tracking-tight">{user?.username}</h2>
                        <p className="text-emerald-500 text-xs font-medium flex items-center">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                            Online
                        </p>
                    </div>
                </div>
                <button 
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Logout"
                >
                    <LogOut size={18} />
                </button>
            </div>

            {/* Search */}
            <div className="px-5 py-4">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search size={16} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 block pl-10 pr-3 py-2.5 transition-all outline-none"
                        placeholder="Search users or chats..."
                        value={searchQuery}
                        onChange={handleSearch}
                    />
                </div>
            </div>

            {/* Chat List */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 styled-scrollbar">
                {isSearching ? (
                    <div className="space-y-1">
                        <h3 className="px-3 pb-2 pt-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Search Results</h3>
                        {searchResults.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">No users found</div>
                        ) : (
                            searchResults.map((usr) => (
                                usr.username !== user.username && (
                                    <button
                                        key={usr.id}
                                        onClick={() => startConversation(usr.username)}
                                        className="w-full flex items-center px-3 py-2.5 hover:bg-indigo-50 rounded-xl transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold group-hover:bg-indigo-200 transition-colors">
                                            {usr.username[0].toUpperCase()}
                                        </div>
                                        <div className="ml-3 text-left">
                                            <p className="text-sm font-semibold text-gray-900">{usr.username}</p>
                                            <p className="text-xs text-gray-500 flex items-center mt-0.5">
                                                <UserPlus size={12} className="mr-1" />
                                                Start chat
                                            </p>
                                        </div>
                                    </button>
                                )
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-1">
                        <h3 className="px-3 pb-2 pt-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Recent Chats</h3>
                        {conversations.length === 0 ? (
                            <div className="text-center py-10 flex flex-col items-center justify-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <MessageCircle size={24} className="text-gray-300" />
                                </div>
                                <p className="text-gray-500 text-sm">No recent chats</p>
                                <p className="text-gray-400 text-xs mt-1">Search for a user to start</p>
                            </div>
                        ) : (
                            conversations.map((chat) => {
                                const isSelected = activeConversation?.id === chat.id;
                                const otherParticipant = chat.participantUsernames?.find(u => u !== user?.username) || 'Unknown';
                                
                                return (
                                    <button
                                        key={chat.id}
                                        onClick={() => onSelectConversation(chat)}
                                        className={clsx(
                                            "w-full flex items-center px-3 py-3 rounded-xl transition-all relative",
                                            isSelected 
                                                ? "bg-indigo-50 border border-indigo-100 shadow-sm"
                                                : "hover:bg-gray-50 border border-transparent"
                                        )}
                                    >
                                        <div className="relative">
                                            <div className={clsx(
                                                "w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold shadow-sm",
                                                isSelected ? "bg-indigo-500" : "bg-gradient-to-br from-gray-400 to-gray-500"
                                            )}>
                                                {otherParticipant[0].toUpperCase()}
                                            </div>
                                            {/* Fake online status for demo */}
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                                        </div>
                                        <div className="ml-3 flex-1 text-left min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <p className={clsx("text-sm font-semibold truncate", isSelected ? "text-indigo-900" : "text-gray-900")}>
                                                    {otherParticipant}
                                                </p>
                                                {chat.lastMessageAt && (
                                                    <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                                                        {new Date(chat.lastMessageAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 truncate mt-0.5 pr-2">
                                                {chat.lastMessageContent || "Draft in progress..."}
                                            </p>
                                        </div>
                                        {chat.unreadCount > 0 && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                                                <span className="text-[10px] text-white font-bold">{chat.unreadCount}</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
