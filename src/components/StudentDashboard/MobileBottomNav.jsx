import React from 'react';
import { Home, Activity, Calendar, Users, Bot, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
    const location = useLocation();

    // Helper function to check if a route is active
    const isActive = (path) => location.pathname === path;

    return (
        <nav className="mobile-bottom-nav">
            <Link to="/dashboard/student" className={`nav-item ${isActive('/dashboard/student') ? 'active' : ''}`}>
                <Home size={isActive('/dashboard/student') ? 26 : 22} />
                <span>Home</span>
            </Link>

            <Link to="/dashboard/appointments" className={`nav-item ${isActive('/dashboard/appointments') ? 'active' : ''}`}>
                <MessageSquare size={isActive('/dashboard/appointments') ? 26 : 22} />
                <span>Desk</span>
            </Link>

            <Link to="/dashboard/analytics" className={`nav-item ${isActive('/dashboard/analytics') ? 'active' : ''}`}>
                <Activity size={isActive('/dashboard/analytics') ? 26 : 22} />
                <span>Vitals</span>
            </Link>

            <Link to="/dashboard/activities" className={`nav-item ${isActive('/dashboard/activities') ? 'active' : ''}`}>
                <Bot size={isActive('/dashboard/activities') ? 26 : 22} />
                <span>AI Care</span>
            </Link>

            <Link to="/dashboard/community" className={`nav-item ${isActive('/dashboard/community') ? 'active' : ''}`}>
                <Users size={isActive('/dashboard/community') ? 26 : 22} />
                <span>Forum</span>
            </Link>
        </nav>
    );
};

export default MobileBottomNav;
