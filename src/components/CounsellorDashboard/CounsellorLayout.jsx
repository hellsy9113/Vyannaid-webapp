import React from 'react';
import { useLocation } from 'react-router-dom';
import CounsellorSidebar from './CounsellorSidebar';
import CounsellorHeader from './CounsellorHeader';
import ProfileSidebar from '../StudentDashboard/ProfileSidebar';
import './CounsellorLayout.css';

const CounsellorLayout = ({ children }) => {
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen]       = React.useState(false);
  const [isSidebarCollapsed, setIsCollapsed]     = React.useState(
    () => localStorage.getItem('csb-collapsed') === 'true'
  );
  const [isProfileOpen, setIsProfileOpen]        = React.useState(false);

  React.useEffect(() => {
    localStorage.setItem('csb-collapsed', isSidebarCollapsed);
  }, [isSidebarCollapsed]);

  // Derive title from URL
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.endsWith('/counsellor') || path.endsWith('/counsellor/')) return 'Dashboard';
    if (path.includes('/students')) return 'My Students';
    if (path.includes('/sessions')) return 'Sessions';
    if (path.includes('/volunteers')) return 'Volunteers';
    if (path.includes('/notes')) return 'Notes';
    if (path.includes('/analytics')) return 'Analytics';
    if (path.includes('/messages')) return 'Messages';
    if (path.includes('/resources')) return 'Resources';
    if (path.includes('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="cl-layout" style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex' }}>
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

      <main className={`cl-main${isSidebarCollapsed ? ' collapsed' : ''}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <CounsellorHeader
          title={getPageTitle()}
          toggleSidebar={() => setIsSidebarOpen(p => !p)}
          toggleProfile={() => setIsProfileOpen(p => !p)}
        />
        <div 
          className="cl-content" 
          style={{ 
            flex: 1, 
            overflowY: location.pathname.includes('/messages') ? 'hidden' : 'auto', 
            padding: location.pathname.includes('/messages') ? '0' : '2.5rem' 
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default CounsellorLayout;