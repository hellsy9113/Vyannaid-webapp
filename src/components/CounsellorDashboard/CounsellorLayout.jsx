import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import CounsellorSidebar from './CounsellorSidebar';
import Header from '../StudentDashboard/Header';         // reuse existing header
import ProfileSidebar from '../StudentDashboard/ProfileSidebar'; // reuse profile drawer
import './CounsellorLayout.css';

const CounsellorLayout = ({ children }) => {
  const { user } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen]       = React.useState(false);
  const [isSidebarCollapsed, setIsCollapsed]     = React.useState(
    () => localStorage.getItem('csb-collapsed') === 'true'
  );
  const [isProfileOpen, setIsProfileOpen]        = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem('csb-collapsed', isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  return (
    <div className="cl-layout">
      {isSidebarOpen && (
        <div className="cl-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}

      <CounsellorSidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsCollapsed}
        closeSidebar={() => setIsSidebarOpen(false)}
      />

      <ProfileSidebar isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      <main className={`cl-main${isSidebarCollapsed ? ' collapsed' : ''}`}>
        <Header
          toggleSidebar={() => setIsSidebarOpen(p => !p)}
          toggleProfile={() => setIsProfileOpen(p => !p)}
        />
        <div className="cl-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default CounsellorLayout;