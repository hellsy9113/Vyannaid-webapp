import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCheck, ShieldCheck,
  BarChart3, Settings, Menu, GraduationCap
} from 'lucide-react';
import './AdminSidebar.css';

const NAV = [
  { to: '/dashboard/admin',                    icon: LayoutDashboard, label: 'Overview'    },
  { to: '/dashboard/admin/counsellors',         icon: UserCheck,       label: 'Counsellors' },
  { to: '/dashboard/admin/students',            icon: GraduationCap,   label: 'Students'    },
  { to: '/dashboard/admin/volunteers',          icon: UserCheck,       label: 'Volunteers'  },
  { to: '/dashboard/admin/assign',              icon: Users,           label: 'Assign'      },
  { to: '/dashboard/admin/staff',               icon: ShieldCheck,     label: 'Create Staff' },
  { to: '/dashboard/admin/settings',            icon: Settings,        label: 'Settings'    },
];

const AdminSidebar = ({ isOpen, isCollapsed, setIsCollapsed, closeSidebar }) => {
  const location = useLocation();

  return (
    <aside className={`asb-sidebar ${isOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="asb-logo">
        <button
          className="asb-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={22} />
        </button>
        <span className="asb-logo-text">VYANNAID</span>
      </div>

      <div className="asb-role-pill">
        <span className="asb-role-dot" />
        <span className="asb-role-label">Admin</span>
      </div>

      <div className="asb-uni-badge">
        <span className="asb-uni-icon">🏛️</span>
        <span className="asb-uni-name">University A</span>
      </div>

      <nav className="asb-nav">
        {NAV.map(({ to, icon: Icon, label }) => {
          const active =
            to === '/dashboard/admin'
              ? location.pathname === to
              : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`asb-link ${active ? 'active' : ''}`}
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

export default AdminSidebar;