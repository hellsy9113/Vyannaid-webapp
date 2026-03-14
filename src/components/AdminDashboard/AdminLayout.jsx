import React from 'react';
import AdminSidebar from './AdminSidebar';
import Header from '../StudentDashboard/Header';
import ProfileSidebar from '../StudentDashboard/ProfileSidebar';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen]   = React.useState(false);
  const [isSidebarCollapsed, setIsCollapsed] = React.useState(
    () => localStorage.getItem('asb-collapsed') === 'true'
  );
  const [isProfileOpen, setIsProfileOpen]   = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem('asb-collapsed', isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  return (
    <div className="adm-layout">
      {isSidebarOpen && (
        <div className="adm-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      <AdminSidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsCollapsed}
        closeSidebar={() => setIsSidebarOpen(false)}
      />

      <ProfileSidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      <main className={`adm-main${isSidebarCollapsed ? ' collapsed' : ''}`}>
        <Header
          toggleSidebar={() => setIsSidebarOpen(p => !p)}
          toggleProfile={() => setIsProfileOpen(p => !p)}
        />
        <div className="adm-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;