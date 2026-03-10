

import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import ProfileSidebar from './ProfileSidebar';
import MobileBottomNav from './MobileBottomNav';
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
    const { user } = useAuth();
    const isStudent = user?.role === 'student';

    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
        return localStorage.getItem('sidebar-collapsed') === 'true';
    });
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);

    React.useEffect(() => {
        localStorage.setItem('sidebar-collapsed', isSidebarCollapsed);
    }, [isSidebarCollapsed]);

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
    const closeSidebar = () => setIsSidebarOpen(false);
    const toggleProfile = () => setIsProfileOpen(prev => !prev);
    const closeProfile = () => setIsProfileOpen(false);

    return (
        <div className="dashboard-layout">
            {/* Sidebar overlay + nav — students only */}
            {isStudent && isSidebarOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar} />
            )}
            {isStudent && (
                <Sidebar
                    isOpen={isSidebarOpen}
                    isCollapsed={isSidebarCollapsed}
                    setIsCollapsed={setIsSidebarCollapsed}
                    closeSidebar={closeSidebar}
                />
            )}

            <ProfileSidebar isOpen={isProfileOpen} onClose={closeProfile} />

            <main className={`dashboard-main${isStudent ? '' : ' no-sidebar'}${isSidebarCollapsed ? ' collapsed' : ''}`}>
                <Header toggleSidebar={isStudent ? toggleSidebar : undefined} toggleProfile={toggleProfile} />
                <div className="dashboard-content-wrapper">
                    {children}
                </div>
            </main>

            {/* Mobile bottom nav — students only */}
            {isStudent && <MobileBottomNav />}
        </div>
    );
};

export default DashboardLayout;