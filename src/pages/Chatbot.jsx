import React, { useState } from 'react';
import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
import { Send, Mic, Settings, ArrowRight } from 'lucide-react';
// import aarivAvatar from '../assets/aariv-avatar.png'; // Assuming an avatar exists, I will use a placeholder if not
import './Chatbot.css';

const Chatbot = () => {
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle sending message logic
        console.log("Sending:", message);
        setMessage('');
    };

    return (
        <DashboardLayout>
            <div className="chatbot-page">
                {/* Header */}
                <div className="chatbot-header">
                    <div className="aariv-profile-info">
                        {/* <img src={} alt="Aariv Avatar" className="aariv-avatar-img" onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://ui-avatars.com/api/?name=Aariv&background=1E293B&color=fff&rounded=true'
                        }} /> */}
                        <div className="aariv-header-text">
                            <h3>Aariv</h3>
                            <span>VYANNAID COMPANION</span>
                        </div>
                    </div>
                    <button className="chatbot-settings-btn">
                        <Settings size={24} color="#334155" />
                    </button>
                </div>

                {/* Main Content Area */}
                <div className="chatbot-main-content">
                    <div className="greeting-card">
                        <div className="greeting-icon-wrapper">
                            {/* Head with gear icon as seen in the design */}
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 5.5C13.2505 5.5 14.414 5.86477 15.39 6.49526C16.892 7.46555 17.893 9.07185 17.9942 10.9575C17.9946 10.966 17.9948 10.9745 17.9948 10.983L17.9984 10.983L17.999 11.0945C17.9996 11.1685 18.0001 11.242 18 11.3149C18 11.3854 17.9997 11.4554 17.9993 11.5249C17.9953 12.2037 17.9863 13.91 16.5135 15.2635C15.8693 15.8558 15.0003 16.5786 14.456 16.5186L14.7176 17.6186C14.8694 18.2573 14.2882 18.8093 13.6334 18.6756L12.338 18.4116V18.1136C12.338 17.4764 11.8214 16.9598 11.1843 16.9598H10.8715C10.2343 16.9598 9.71776 17.4764 9.71776 18.1136V18.4116L8.3666 18.6756C7.7118 18.8093 7.13063 18.2573 7.28238 17.6186L7.54397 16.5186C7.00021 16.5786 6.13075 15.8558 5.48647 15.2635C4.01372 13.91 4.00473 12.2037 4.00069 11.5249C4.00032 11.4554 4 11.3854 4 11.3149C3.99986 11.242 4.0004 11.1685 4.00104 11.0945L4.00165 10.983L4.00518 10.983C4.00518 10.9745 4.00547 10.966 4.00584 10.9575C4.10702 9.07185 5.10803 7.46555 6.61 6.49526C7.58597 5.86477 8.7495 5.5 10 5.5H12ZM11.0002 8.7998V8.4002C11.0002 8.17928 11.1793 8 11.4002 8H12.6001C12.821 8 13.0001 8.17928 13.0001 8.4002V8.7998C13.5133 8.94165 13.9741 9.21544 14.3468 9.58814C14.7195 9.96084 14.9933 10.4216 15.1351 10.9348H15.5348C15.7557 10.9348 15.9348 11.1139 15.9348 11.3348V12.5347C15.9348 12.7556 15.7557 12.9347 15.5348 12.9347H15.1351C14.9933 13.4479 14.7195 13.9087 14.3468 14.2814C13.9741 14.6541 13.5133 14.9279 13.0001 15.0697V15.4693C13.0001 15.6902 12.821 15.8693 12.6001 15.8693H11.4002C11.1793 15.8693 11.0002 15.6902 11.0002 15.4693V15.0697C10.487 14.9279 10.0262 14.6541 9.65349 14.2814C9.28079 13.9087 9.00698 13.4479 8.86518 12.9347H8.46555C8.24463 12.9347 8.06555 12.7556 8.06555 12.5347V11.3348C8.06555 11.1139 8.24463 10.9348 8.46555 10.9348H8.86518C9.00698 10.4216 9.28079 9.96084 9.65349 9.58814C10.0262 9.21544 10.487 8.94165 11.0002 8.7998ZM12.0002 10.5348C11.2638 10.5348 10.6669 11.1317 10.6669 11.8682C10.6669 12.6046 11.2638 13.2015 12.0002 13.2015C12.7366 13.2015 13.3335 12.6046 13.3335 11.8682C13.3335 11.1317 12.7366 10.5348 12.0002 10.5348Z" fill="#154BBA" />
                            </svg>
                        </div>
                        <h1 className="greeting-title">Hello, I am Aariv.</h1>
                        <p className="greeting-subtitle">How are you feeling today?</p>
                        <p className="greeting-quote">
                            "The journey of a thousand miles<br />
                            begins with a single step."
                        </p>
                        <button className="start-convo-btn">
                            Start Conversation
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Bottom Input Area */}
                <div className="chatbot-input-container">
                    <form className="chatbot-form" onSubmit={handleSubmit}>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                className="chatbot-input"
                                placeholder="Type your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button type="button" className="chatbot-mic-btn">
                                <Mic size={20} color="#64748b" />
                            </button>
                        </div>
                        <button type="submit" className="chatbot-send-btn">
                            <Send size={20} color="#ffffff" />
                        </button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Chatbot;
