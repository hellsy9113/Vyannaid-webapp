import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import { sendMessageToAariv, getChatHistory, getRecentSessions, deleteChatSession } from "../api/aarivApi";
import DashboardLayout from "../components/StudentDashboard/DashboardLayout";
import AarivChatLayout from "../components/StudentDashboard/AarivChatLayout";
import { useAuth } from "../auth/AuthContext";
import { Send, Mic, Search, Share2, MoreHorizontal, Paperclip, ThumbsUp, Copy, Download, FileText } from "lucide-react";
import "./Chatbot.css";

const Chatbot = () => {
    const { user: authUser } = useAuth();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState("main");
    const [isLoading, setIsLoading] = useState(false);
    
    const messagesEndRef = useRef(null);
    const user = authUser || { id: "student_001", name: "Alex Thompson" };

    const getInitials = (name = "") =>
        name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        loadSessions();
        loadHistory(currentSessionId);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const loadSessions = async () => {
        try {
            const data = await getRecentSessions(user.id);
            setSessions(data);
        } catch (error) {
            console.error("Failed to load sessions:", error);
        }
    };

    const loadHistory = async (sessionId) => {
        try {
            const data = await getChatHistory(user.id, sessionId);
            const formattedMessages = data.map(chat => ([
                { sender: "user", text: chat.userMessage, time: new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
                { sender: "aariv", text: chat.botResponse, time: new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
            ])).flat();
            setMessages(formattedMessages);
            setCurrentSessionId(sessionId);
        } catch (error) {
            console.error("Failed to load history:", error);
        }
    };

    const handleNewChat = () => {
        const newId = `session_${Date.now()}`;
        setCurrentSessionId(newId);
        setMessages([]);
    };

    const handleDeleteSession = async (sessionId) => {
        if (!window.confirm("Are you sure you want to delete this chat session?")) return;
        try {
            await deleteChatSession(user.id, sessionId);
            if (currentSessionId === sessionId) {
                setMessages([]);
                setCurrentSessionId("main");
            }
            loadSessions();
        } catch (error) {
            console.error("Failed to delete session:", error);
            alert("Failed to delete session");
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        const userMsg = {
            sender: "user",
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg]);
        setMessage("");
        setIsLoading(true);

        try {
            const res = await sendMessageToAariv({
                userId: user.id,
                sessionId: currentSessionId,
                message: userMsg.text
            });

            setMessages(prev => [...prev, {
                sender: "aariv",
                text: res.response,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
            
            loadSessions(); // Refresh session list
        } catch (error) {
            console.error("AARIV error:", error);
            setMessages(prev => [...prev, {
                sender: "aariv",
                text: "I'm here with you. Tell me more.",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout hideHeader noPadding>
            <AarivChatLayout 
                sessions={sessions} 
                currentSessionId={currentSessionId} 
                onSessionSelect={loadHistory}
                onNewChat={handleNewChat}
                onSessionDelete={handleDeleteSession}
            >
                <div className="chatbot-container">
                <header className="chat-main-header">
                    <div className="header-title">
                        <h2>Aariv Chatroom</h2>
                    </div>
                </header>

                <div className="chat-content">
                    {messages.length === 0 ? (
                        <div className="empty-state">
                            <div className="aariv-large-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="#3B82F6"/>
                                </svg>
                            </div>
                            <h3>Hello! I'm Aariv.</h3>
                            <p>How can I assist you with your mental well-being today?</p>
                        </div>
                    ) : (
                        <div className="messages-list">
                            {messages.map((msg, index) => (
                                <div key={index} className={`message-wrapper ${msg.sender}`}>
                                    {msg.sender === "aariv" && (
                                        <div className="aariv-avatar-mini">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white"/>
                                            </svg>
                                        </div>
                                    )}
                                    <div className="message-content">
                                        <div className="message-info">
                                            <span className="sender-name">{msg.sender === "aariv" ? "Aariv" : "You"}</span>
                                            <span className="message-time">{msg.time}</span>
                                        </div>
                                        <div className="message-bubble">
                                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                                            
                                            {/* Example Attachment UI like in mockup */}
                                            {msg.text.includes("Report") && (
                                                <div className="attachment-card">
                                                    <div className="attachment-icon">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div className="attachment-info">
                                                        <span className="file-name">Contrast_Analysis_Report.pdf</span>
                                                        <span className="file-meta">2.4 MB • PDF Document</span>
                                                    </div>
                                                    <button className="download-btn">
                                                        <Download size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {msg.sender === "user" && (
                                        <div className="user-avatar-mini" style={{ background: user?.avatarColor || "#FDBA74" }}>
                                            {getInitials(user?.name)}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="message-wrapper aariv">
                                    <div className="aariv-avatar-mini">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="white"/>
                                        </svg>
                                    </div>
                                    <div className="message-content">
                                        <div className="message-bubble">
                                            <span className="loading-dots">Aariv is thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <footer className="chat-main-footer">
                    <div className="input-box-wrapper">
                        <form className="input-form" onSubmit={handleSubmit}>
                            <input 
                                type="text" 
                                placeholder="Message Aariv..." 
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <div className="input-right-actions">
                                <button type="submit" className={`send-btn ${message.trim() ? 'active' : ''}`}>
                                    <Send size={20} />
                                </button>
                            </div>
                        </form>
                    </div>
                    <span className="footer-disclaimer">Aariv AI can make mistakes. Verify important information.</span>
                </footer>
                </div>
            </AarivChatLayout>
        </DashboardLayout>
    );
};

export default Chatbot;