import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, CalendarDays, ClipboardList,
  BarChart3, MessageSquare, Settings, Menu, BookOpen
} from 'lucide-react';
import './CounsellorSidebar.css';

const NAV = [
  { to: '/dashboard/counsellor',             icon: LayoutDashboard, label: 'Overview'    },
  { to: '/dashboard/counsellor/students',    icon: Users,            label: 'My Students' },
  { to: '/dashboard/counsellor/sessions',    icon: CalendarDays,     label: 'Sessions'    },
  { to: '/dashboard/counsellor/notes',       icon: ClipboardList,    label: 'Notes'       },
  { to: '/dashboard/counsellor/analytics',   icon: BarChart3,        label: 'Analytics'   },
  { to: '/dashboard/counsellor/messages',    icon: MessageSquare,    label: 'Messages'    },
  { to: '/dashboard/counsellor/resources',   icon: BookOpen,         label: 'Resources'   },
  { to: '/dashboard/counsellor/settings',    icon: Settings,         label: 'Settings'    },
];

const CounsellorSidebar = ({ isOpen, isCollapsed, setIsCollapsed, closeSidebar }) => {
  const location = useLocation();

  return (
    <aside className={`csb-sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="csb-logo">
        <button
          className="csb-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={22} />
        </button>
        <span className="csb-logo-text">VYANNAID</span>
      </div>

      <div className="csb-role-pill">
        <span className="csb-role-dot" />
        <span className="csb-role-label">Counsellor</span>
      </div>

      <nav className="csb-nav">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to ||
            (to !== '/dashboard/counsellor' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`csb-link ${active ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <Icon size={20} strokeWidth={2} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default CounsellorSidebar;