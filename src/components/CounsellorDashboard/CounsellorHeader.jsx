import React, { useState, useEffect } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import './CounsellorHeader.css';

const CounsellorHeader = ({ title = "Dashboard", toggleSidebar, toggleProfile }) => {
  const { user } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  }); // e.g. "Monday, Oct 23"

  const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  }); // e.g. "09:42 AM"

  const getInitials = (name = "") =>
    name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <header className="ch-header">
      <div className="ch-left-actions desktop-hide">
        <button className="ch-menu-btn" onClick={toggleSidebar}>
          <Menu size={22} color="#1a2234" />
        </button>
      </div>

      <div className="ch-title-area">
        <h1 className="ch-page-title">{title}</h1>
      </div>

      <div className="ch-actions">
        <div className="ch-datetime mobile-hide">
          <div className="ch-date">{formattedDate}</div>
          <div className="ch-time">{formattedTime}</div>
        </div>

        <button className="ch-notification-btn">
          <Bell size={20} color="#64748B" />
          <span className="ch-notification-dot" />
        </button>

        <button className="ch-profile-pill" onClick={toggleProfile}>
          <div className="ch-avatar" style={{ background: user?.avatarColor || "#4F46E5" }}>
            {getInitials(user?.name || "C")}
          </div>
        </button>
      </div>
    </header>
  );
};

export default CounsellorHeader;
