import React from 'react';
import { Home, Activity, Calendar, Users, Music, Menu, ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

import './Sidebar.css';

const Sidebar = ({ isOpen, isCollapsed, setIsCollapsed, closeSidebar }) => {
    const location = useLocation();

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-logo">
                <button
                    className="sidebar-toggle-integrated"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <Menu size={22} />
                </button>
                <span className="sidebar-logo-text">VYANNAID</span>
            </div>

            <nav className="sidebar-nav">
                <Link to="/dashboard/student" className={`sidebar-link ${location.pathname === '/dashboard/student' ? 'active' : ''}`}>
                    <Home size={20} strokeWidth={2} />
                    <span>Home</span>
                </Link>
                <Link to="/dashboard/analytics" className={`sidebar-link ${location.pathname === '/dashboard/analytics' ? 'active' : ''}`}>
                    <Activity size={20} strokeWidth={2} />
                    <span>Vitals</span>
                </Link>
                <Link to="/dashboard/activities" className={`sidebar-link ${location.pathname === '/dashboard/activities' ? 'active' : ''}`}>
                    <div className="activity-icon-compound">
                        {/* Approximating the rocks balance icon */}
                        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                            <circle cx="12" cy="12" r="4" />
                        </svg>
                    </div>
                    <span>Activities</span>
                </Link>
                <Link to="/dashboard/appointments" className={`sidebar-link ${location.pathname === '/dashboard/appointments' ? 'active' : ''}`}>
                    <Calendar size={20} strokeWidth={2} />
                    <span>Appointments</span>
                </Link>
                <Link to="/dashboard/community" className={`sidebar-link ${location.pathname === '/dashboard/community' ? 'active' : ''}`}>
                    <Users size={20} strokeWidth={2} />
                    <span>Community</span>
                </Link>
                <Link to="/dashboard/volunteer" className={`sidebar-link ${location.pathname === '/dashboard/volunteer' ? 'active' : ''}`}>
                    <ShieldCheck size={20} strokeWidth={2} />
                    <span>Volunteer</span>
                </Link>


            </nav>

        </aside>
    );
};

export default Sidebar;
