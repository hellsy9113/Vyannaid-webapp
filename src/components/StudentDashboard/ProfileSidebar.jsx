import React from 'react';
import { X, User, Info, HelpCircle, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfileSidebar.css';

const AVATAR_COLORS = [
  '#1A2234', '#4F46E5', '#0891B2', '#059669',
  '#D97706', '#DC2626', '#9333EA', '#DB2777',
];

// Profile edit route per role — only student has a dedicated profile page right now
const PROFILE_ROUTE = {
  student:    '/dashboard/profile',
  counsellor: '/dashboard/counsellor/settings',
  admin:      '/dashboard/admin/settings',
};

const getInitials = (name = '') =>
  name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

const ProfileSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  const goToProfile = () => {
    const route = PROFILE_ROUTE[user?.role] ?? '/';
    onClose();
    navigate(route);
  };

  const menuItems = [
    { icon: User,       label: 'Edit Profile', action: goToProfile },
    { icon: Info,       label: 'About',        action: () => {} },
    { icon: HelpCircle, label: 'Help',         action: () => {} },
  ];

  const avatarColor = user?.avatarColor || AVATAR_COLORS[0];
  const initials    = getInitials(user?.name);

  if (!isOpen) return null;

  return (
    <div className="profile-sidebar-overlay" onClick={onClose}>
      <div className="profile-sidebar" onClick={(e) => e.stopPropagation()}>
        <div className="profile-sidebar-header">
          <h2>Profile</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="profile-info">
          <div
            className="profile-avatar-large ps-avatar-initial"
            style={{ background: avatarColor }}
          >
            {initials}
          </div>
          <h3>{user?.name || 'User'}</h3>
          <p>{user?.email || ''}</p>
          <div className="ps-role-row">
            <span className="ps-role-badge">{user?.role}</span>
          </div>

          <button className="ps-edit-primary-btn" onClick={goToProfile}>
            <User size={18} />
            <span>Edit Profile</span>
          </button>
        </div>

        <div className="profile-menu-placeholder">
          {/* Menu items removed as per request for a single primary button */}
        </div>

        <div className="profile-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSidebar;