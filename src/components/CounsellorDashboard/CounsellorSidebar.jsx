import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Users, CalendarDays, FileText,
  MessageSquare, BookOpen, Menu, UserPlus
} from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import './CounsellorSidebar.css';

const NAV = [
  { to: '/dashboard/counsellor', icon: Home, label: 'Home' },
  { to: '/dashboard/counsellor/students', icon: Users, label: 'Student List' },
  { to: '/dashboard/counsellor/volunteers', icon: UserPlus, label: 'Volunteers' },
  { to: '/dashboard/counsellor/sessions', icon: CalendarDays, label: 'Sessions' },
  { to: '/dashboard/counsellor/notes', icon: FileText, label: 'Notes' },
  { to: '/dashboard/counsellor/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/dashboard/counsellor/resources', icon: BookOpen, label: 'Resources' },
];

const CounsellorSidebar = ({ isOpen, isCollapsed, setIsCollapsed, closeSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();

  const userName = user?.name || 'Counsellor';
  const roleTitle = 'COUNSELLOR';

  return (
    <aside className={`csb-sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="csb-logo-area">
        <button
          className="csb-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={22} />
        </button>
        <span className="csb-logo-title">VYANNAID</span>
      </div>

      {!isCollapsed && (
        <div className="csb-role-pill-holder">
          <div className="csb-role-pill">
            <span className="csb-role-dot" />
            <span className="csb-role-label">Counsellor</span>
          </div>
        </div>
      )}

      <nav className="csb-nav-main">
        {NAV.map(({ to, icon: Icon, label, badge }) => {
          const active = location.pathname === to ||
            (to !== '/dashboard/counsellor' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`csb-link ${active ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <Icon size={20} className="csb-icon" />
              <span className="csb-label">{label}</span>
              {badge && <span className="csb-badge">{badge}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="csb-bottom">
        {!isCollapsed && (
          <div className="csb-user-card">
            <div className="csb-user-avatar">
              <img src={`https://ui-avatars.com/api/?name=${userName.replace(' ', '+')}&background=f1f5f9&color=1e293b`} alt={userName} />
            </div>
            <div className="csb-user-info">
              <span className="csb-user-name">{userName}</span>
              <span className="csb-user-role">{roleTitle}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default CounsellorSidebar;