import React, { useState } from 'react';
import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
import { Send, Mic, Settings, ArrowRight, HeartHandshake } from 'lucide-react';
import './VolunteerChat.css';

const VolunteerChat = () => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle sending message logic
        console.log("Sending to volunteer:", message);
        setMessage('');
    };

    return (
        <DashboardLayout>
            <div className="volunteer-chat-page">
                {/* Header */}
                <div className="volunteer-chat-header">
                    <div className="volunteer-profile-info">
                        <img
                            src="https://ui-avatars.com/api/?name=Peer+Volunteer&background=1E293B&color=fff&rounded=true"
                            alt="Volunteer Avatar"
                            className="volunteer-avatar-img"
                        />
                        <div className="volunteer-header-text">
                            <h3>Peer Volunteer</h3>
                            <span>VYANNAID SUPPORT</span>
                        </div>
                    </div>
                    <button className="volunteer-settings-btn">
                        <Settings size={24} color="#334155" />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="volunteer-main-content">
                    <div className="greeting-card">
                        <div className="greeting-icon-wrapper">
                            <HeartHandshake size={24} color="#1E293B" />
                        </div>
                        <h1 className="greeting-title">Hello, I'm a Peer Volunteer.</h1>
                        <p className="greeting-subtitle">I'm here to listen and support you.</p>
                        <p className="greeting-quote">
                            "You don't have to face it alone.<br />
                            Let's talk."
                        </p>
                        <button className="start-convo-btn">
                            Start Conversation
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Bottom Input Area */}
                <div className="volunteer-input-container">
                    <form className="volunteer-form" onSubmit={handleSubmit}>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                className="volunteer-input"
                                placeholder="Type your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button type="button" className="volunteer-mic-btn">
                                <Mic size={20} color="#64748b" />
                            </button>
                        </div>
                        <button type="submit" className="volunteer-send-btn">
                            <Send size={20} color="#ffffff" />
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default VolunteerChat;
