import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { Send, MessageSquare, Tag, Clock, User } from 'lucide-react';

const ChatPage = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const toast = useToast();
  const location = useLocation();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Fetch chats for the logged-in user
  const fetchChats = async (selectChatId = null) => {
    try {
      const res = await api.get('/chats');
      setChats(res.data.chats);
      
      // If a specific chatId was selected (e.g. redirected here), make it active
      if (selectChatId) {
        const found = res.data.chats.find((c) => c._id === selectChatId);
        if (found) {
          setActiveChat(found);
        }
      } else if (!activeChat && res.data.chats.length > 0) {
        // Fallback: select first chat
        setActiveChat(res.data.chats[0]);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load conversations');
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    const passedChatId = location.state?.activeChatId;
    fetchChats(passedChatId);
  }, [location.state]);

  // Handle Socket.io events
  useEffect(() => {
    if (!socket || !user) return;

    // Listen for global chat list updates for this user
    const listUpdateEvent = `chat_list_update_${user._id}`;
    socket.on(listUpdateEvent, () => {
      // Re-fetch conversation list to show latest previews/lastMessages
      fetchChats();
    });

    return () => {
      socket.off(listUpdateEvent);
    };
  }, [socket, user, activeChat]);

  // Load messages when active chat room changes
  useEffect(() => {
    if (!activeChat) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chats/${activeChat._id}/messages`);
        setMessages(res.data.messages);
      } catch (err) {
        toast.error('Failed to load message history');
      }
    };

    fetchMessages();

    // Join socket room
    if (socket) {
      socket.emit('join_room', { chatId: activeChat._id });

      // Receive real-time message handler
      socket.on('receive_message', (message) => {
        if (message.chat === activeChat._id) {
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.find((m) => m._id === message._id)) return prev;
            return [...prev, message];
          });
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('receive_message');
      }
    };
  }, [activeChat, socket]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat || !socket) return;

    socket.emit('send_message', {
      chatId: activeChat._id,
      content: inputText.trim(),
    });

    setInputText('');
  };

  const getChatPartner = (chat) => {
    if (!chat || !user) return null;
    return chat.buyer._id === user._id ? chat.seller : chat.buyer;
  };

  return (
    <div className="glass chat-container" style={{ boxShadow: 'var(--shadow-glow), var(--shadow-lg)' }}>
      {/* Sidebar - Rooms List */}
      <div className="chat-sidebar">
        <div className="chat-sidebar-header">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Messages</h3>
        </div>

        {loadingChats ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
        ) : chats.length > 0 ? (
          <div className="chat-list">
            {chats.map((chat) => {
              const partner = getChatPartner(chat);
              const isActive = activeChat && activeChat._id === chat._id;
              const formattedTime = chat.lastMessage
                ? new Date(chat.lastMessage.createdAt).toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                  })
                : '';

              return (
                <div
                  key={chat._id}
                  className={`chat-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveChat(chat)}
                >
                  <div
                    className="chat-avatar"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <User size={18} style={{ color: '#818cf8' }} />
                  </div>
                  <div className="chat-item-info">
                    <div className="chat-item-header">
                      <span className="chat-item-name">{partner?.name}</span>
                      <span className="chat-item-time">{formattedTime}</span>
                    </div>
                    <div className="chat-item-product">{chat.product?.title}</div>
                    <div className="chat-item-preview">
                      {chat.lastMessage ? chat.lastMessage.content : 'No messages yet'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
            <MessageSquare size={32} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem' }}>No conversations yet.</p>
          </div>
        )}
      </div>

      {/* Main Conversation Window */}
      <div className="chat-main">
        {activeChat ? (
          <>
            {/* Header info */}
            <div className="chat-header">
              <div className="chat-header-user">
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={18} style={{ color: '#818cf8' }} />
                </div>
                <div>
                  <div className="chat-header-name">{getChatPartner(activeChat)?.name}</div>
                  <div className="chat-header-product">
                    Item: <span style={{ color: '#818cf8', fontWeight: 600 }}>{activeChat.product?.title}</span> • ₹{activeChat.product?.price}
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Messages Area */}
            <div className="chat-messages">
              {messages.length > 0 ? (
                messages.map((msg) => {
                  const isOutgoing = msg.sender._id === user._id;
                  const timeStr = new Date(msg.createdAt).toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={msg._id}
                      className={`message-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`}
                    >
                      <div>{msg.content}</div>
                      <span className="message-time">{timeStr}</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Send a message to start bargaining!
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input area */}
            <div className="chat-input-area">
              <form onSubmit={handleSendMessage} className="chat-input-form">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Type your message here..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem' }}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <MessageSquare size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
            <h3>Select a conversation</h3>
            <p style={{ fontSize: '0.85rem' }}>Pick a student chat room from the left sidebar to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
