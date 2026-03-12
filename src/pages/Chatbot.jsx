import { sendMessageToAariv } from "../api/aarivApi";
import React, { useState } from "react";
import DashboardLayout from "../components/StudentDashboard/DashboardLayout";
import { Send, Mic, Settings, ArrowRight } from "lucide-react";
import "./Chatbot.css";

const Chatbot = () => {

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const user = {
    id: "student_001"
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!message.trim()) return;

    const userMessage = message;

    // Show user message immediately
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage }
    ]);

    setMessage("");

    try {

      const res = await sendMessageToAariv({
        userId: user.id,
        sessionId: "main",
        message: userMessage
      });

      setMessages((prev) => [
        ...prev,
        { sender: "aariv", text: res.response }
      ]);

    } catch (error) {

      console.error("AARIV error:", error);

      setMessages((prev) => [
        ...prev,
        { sender: "aariv", text: "I'm here with you. Tell me more." }
      ]);

    }
  };

  return (
    <DashboardLayout>
      <div className="chatbot-page">

        {/* Header */}

        <div className="chatbot-header">

          <div className="aariv-profile-info">

            <img
              src="https://ui-avatars.com/api/?name=Aariv&background=1E293B&color=fff&rounded=true"
              alt="Aariv Avatar"
              className="aariv-avatar-img"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://ui-avatars.com/api/?name=Aariv&background=1E293B&color=fff&rounded=true";
              }}
            />

            <div className="aariv-header-text">
              <h3>Aariv</h3>
              <span>VYANNAID COMPANION</span>
            </div>

          </div>

          <button className="chatbot-settings-btn">
            <Settings size={24} color="#334155" />
          </button>

        </div>

        {/* Chat Messages */}

        <div className="chatbot-main-content">

          {messages.length === 0 ? (

            <div className="greeting-card">

              <div className="greeting-icon-wrapper">
                <svg width="32" height="32" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="#154BBA" />
                </svg>
              </div>

              <h1 className="greeting-title">Hello, I am Aariv.</h1>

              <p className="greeting-subtitle">
                How are you feeling today?
              </p>

              <button className="start-convo-btn">
                Start Conversation
                <ArrowRight size={20} />
              </button>

            </div>

          ) : (

            <div className="chat-messages">

              {messages.map((msg, index) => (

                <div
                  key={index}
                  className={
                    msg.sender === "user"
                      ? "message user-message"
                      : "message aariv-message"
                  }
                >

                  {msg.text}

                </div>

              ))}

            </div>

          )}

        </div>

        {/* Input */}

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