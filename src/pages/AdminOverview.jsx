import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, GraduationCap, ShieldCheck, ArrowRight, TrendingUp } from 'lucide-react';
import AdminLayout from '../components/AdminDashboard/AdminLayout';
import { getPlatformStats, getAllUsers } from '../api/adminApi';
import './AdminOverview.css';

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className={`ao-stat-card ao-accent-${accent}`}>
    <div className="ao-stat-icon"><Icon size={22} /></div>
    <div className="ao-stat-body">
      <span className="ao-stat-value">{value ?? '—'}</span>
      <span className="ao-stat-label">{label}</span>
    </div>
  </div>
);

const AdminOverview = () => {
  const navigate = useNavigate();
  const [stats, setStats]           = useState(null);
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      getPlatformStats(),
      getAllUsers('counsellor'),
    ])
      .then(([s, c]) => {
        setStats(s.data.data);
        setCounsellors(c.data.data?.slice(0, 5) ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="ao-page">

        {/* Header */}
        <div className="ao-header">
          <div>
            <h1 className="ao-title">Admin Dashboard</h1>
            <p className="ao-subtitle">University A — overview</p>
          </div>
        </div>

        {/* Stat Cards */}
        {loading ? (
          <div className="ao-loading"><div className="ao-spinner" /></div>
        ) : (
          <div className="ao-stats-grid">
            <StatCard icon={Users}         label="Total Users"      value={stats?.totalUsers}       accent="blue"   />
            <StatCard icon={GraduationCap} label="Students"         value={stats?.totalStudents}    accent="green"  />
            <StatCard icon={UserCheck}     label="Counsellors"      value={stats?.totalCounsellors} accent="purple" />
            <StatCard icon={ShieldCheck}   label="Admins"           value={stats?.totalAdmins}      accent="yellow" />
          </div>
        )}

        {/* Quick actions */}
        <div className="ao-quick-actions">
          <button className="ao-qa-btn" onClick={() => navigate('/dashboard/admin/assign')}>
            <Users size={18} /> Assign Student to Counsellor
          </button>
          <button className="ao-qa-btn ao-qa-secondary" onClick={() => navigate('/dashboard/admin/staff')}>
            <ShieldCheck size={18} /> Create Staff Account
          </button>
          <button className="ao-qa-btn ao-qa-secondary" onClick={() => navigate('/dashboard/admin/volunteers')}>
            <UserCheck size={18} /> Volunteer Applications
          </button>
          <button className="ao-qa-btn ao-qa-secondary" onClick={() => navigate('/dashboard/admin/counsellors')}>
            <UserCheck size={18} /> Manage Counsellors
          </button>
        </div>

        {/* Counsellors list */}
        <div className="ao-card">
          <div className="ao-card-header">
            <h2 className="ao-card-title"><UserCheck size={18} /> Counsellors</h2>
            <button className="ao-see-all" onClick={() => navigate('/dashboard/admin/counsellors')}>
              See all <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="ao-loading"><div className="ao-spinner" /></div>
          ) : counsellors.length === 0 ? (
            <p className="ao-empty">No counsellors yet. <button className="ao-link" onClick={() => navigate('/dashboard/admin/staff')}>Create one →</button></p>
          ) : (
            <div className="ao-user-list">
              {counsellors.map(c => (
                <div key={c._id} className="ao-user-row">
                  <div className="ao-avatar">{c.name?.charAt(0).toUpperCase()}</div>
                  <div className="ao-user-info">
                    <span className="ao-user-name">{c.name}</span>
                    <span className="ao-user-email">{c.email}</span>
                  </div>
                  <button
                    className="ao-assign-btn"
                    onClick={() => navigate('/dashboard/admin/assign')}
                  >
                    Assign Students
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminOverview;