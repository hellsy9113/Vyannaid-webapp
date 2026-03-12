import React from 'react';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import './AarivChatLayout.css';

const AarivChatLayout = ({ children, sessions, currentSessionId, onSessionSelect, onNewChat, onSessionDelete }) => {
    return (
        <div className="aariv-chat-layout">
            <aside className="aariv-sidebar">
                <div className="aariv-sidebar-header">
                    <div className="aariv-logo">
                        <div className="aariv-logo-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white"/>
                            </svg>
                        </div>
                        <div className="aariv-logo-text">
                            <h3>Aariv AI</h3>
                        </div>
                    </div>
                    <button className="new-chat-btn" onClick={onNewChat}>
                        <Plus size={18} />
                        <span>New Chat</span>
                    </button>
                </div>

                <div className="sessions-list">
                    <div className="sessions-label">ALL CHATS</div>
                    {sessions.length === 0 ? (
                        <div className="no-sessions">No previous chats yet</div>
                    ) : (
                        sessions.map((session) => (
                            <div 
                                key={session._id} 
                                className={`session-item ${currentSessionId === session._id ? 'active' : ''}`}
                                onClick={() => onSessionSelect(session._id)}
                            >
                                <div className="session-item-icon">
                                    <MessageSquare size={16} />
                                </div>
                                <div className="session-item-body">
                                    <div className="session-item-title">{session.lastMessage}</div>
                                    <div className="session-item-meta">
                                        <span>{new Date(session.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                        <button 
                                            className="delete-session-btn" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onSessionDelete(session._id);
                                            }}
                                            title="Delete chat"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </aside>
            <main className="aariv-main-content">
                {children}
            </main>
        </div>
    );
};

export default AarivChatLayout;
