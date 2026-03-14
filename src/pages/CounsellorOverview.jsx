import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, CalendarDays, TrendingUp, Clock,
  AlertCircle, CheckCircle2, ChevronRight, Activity
} from 'lucide-react';
import CounsellorLayout from '../components/CounsellorDashboard/CounsellorLayout';
import {
  getCounsellorProfile,
  getCounsellorSessions,
  getCounsellorAnalytics
} from '../api/counsellorApi';
import './CounsellorOverview.css';

/* ── Stat card ──────────────────────────────────────────── */
const StatCard = ({ icon: Icon, label, value, accent, sub }) => (
  <div className={`co-stat-card ${accent}`}>
    <div className="co-stat-icon"><Icon size={20} /></div>
    <div className="co-stat-body">
      <span className="co-stat-value">{value}</span>
      <span className="co-stat-label">{label}</span>
      {sub && <span className="co-stat-sub">{sub}</span>}
    </div>
  </div>
);

/* ── Session status pill ────────────────────────────────── */
const StatusPill = ({ status }) => {
  const map = {
    scheduled:  { label: 'Scheduled',  cls: 'pill-blue'   },
    completed:  { label: 'Completed',  cls: 'pill-green'  },
    cancelled:  { label: 'Cancelled',  cls: 'pill-red'    },
    'no-show':  { label: 'No-Show',    cls: 'pill-yellow' },
  };
  const { label, cls } = map[status] || { label: status, cls: '' };
  return <span className={`co-pill ${cls}`}>{label}</span>;
};

/* ── Mood dot ───────────────────────────────────────────── */
const MoodDot = ({ score }) => {
  const color = score >= 7 ? '#4ade80' : score >= 4 ? '#fbbf24' : '#f87171';
  return (
    <span
      className="co-mood-dot"
      style={{ background: color }}
      title={`Mood: ${score ?? '—'}/10`}
    />
  );
};

/* ── Main component ─────────────────────────────────────── */
const CounsellorOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile,   setProfile]   = useState(null);
  const [sessions,  setSessions]  = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      getCounsellorProfile(),
      getCounsellorSessions({ limit: 5, upcoming: true }),
      getCounsellorAnalytics(),
    ])
      .then(([pRes, sRes, aRes]) => {
        setProfile(pRes.data.data);
        setSessions(sRes.data.data || []);
        setAnalytics(aRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  });

  /* ── Derive quick stats ── */
  const totalStudents    = profile?.assignedStudents?.length ?? 0;
  const todaySessions    = sessions.filter(s => {
    const d = new Date(s.scheduledAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const atRiskCount      = analytics?.atRiskStudents ?? 0;
  const completionRate   = analytics?.completionRate  ?? 0;

  if (loading) {
    return (
      <CounsellorLayout>
        <div className="co-loading">
          <div className="co-spinner" />
          <p>Loading your dashboard…</p>
        </div>
      </CounsellorLayout>
    );
  }

  return (
    <CounsellorLayout>
      <div className="co-page">

        {/* ── Greeting ── */}
        <div className="co-greeting-row">
          <div>
            <h1 className="co-greeting">Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋</h1>
            <p className="co-date">{today} · {user?.institution || 'Your Institution'}</p>
          </div>
          <button className="co-new-session-btn" onClick={() => navigate('/dashboard/counsellor/sessions')}>
            <CalendarDays size={16} /> Schedule Session
          </button>
        </div>

        {/* ── Alert banner for at-risk students ── */}
        {atRiskCount > 0 && (
          <div className="co-alert-banner">
            <AlertCircle size={18} />
            <span>
              <strong>{atRiskCount} student{atRiskCount > 1 ? 's' : ''}</strong> show{atRiskCount === 1 ? 's' : ''} elevated distress signals — review their mood trends.
            </span>
            <button onClick={() => navigate('/dashboard/counsellor/analytics')}>
              View Analytics <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* ── Stat cards ── */}
        <div className="co-stats-grid">
          <StatCard icon={Users}       label="Assigned Students" value={totalStudents}             accent="accent-blue"   sub={`${user?.institution || ''}`} />
          <StatCard icon={CalendarDays} label="Today's Sessions" value={todaySessions.length}      accent="accent-indigo" sub="remaining today" />
          <StatCard icon={TrendingUp}  label="Completion Rate"   value={`${completionRate}%`}      accent="accent-green"  sub="this month" />
          <StatCard icon={AlertCircle} label="At-Risk Students"  value={atRiskCount}               accent={atRiskCount > 0 ? 'accent-red' : 'accent-slate'} sub="need attention" />
        </div>

        <div className="co-two-col">

          {/* ── Upcoming sessions ── */}
          <div className="co-card">
            <div className="co-card-header">
              <h2 className="co-section-title">
                <CalendarDays size={18} /> Upcoming Sessions
              </h2>
              <button className="co-view-all" onClick={() => navigate('/dashboard/counsellor/sessions')}>
                View all <ChevronRight size={14} />
              </button>
            </div>

            {sessions.length === 0 ? (
              <div className="co-empty">
                <CheckCircle2 size={32} />
                <p>No upcoming sessions scheduled.</p>
                <button onClick={() => navigate('/dashboard/counsellor/sessions')}>Schedule one →</button>
              </div>
            ) : (
              <div className="co-session-list">
                {sessions.slice(0, 5).map((s) => (
                  <div key={s._id} className="co-session-row">
                    <div className="co-session-avatar">
                      {s.studentName?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div className="co-session-info">
                      <span className="co-session-name">{s.studentName}</span>
                      <span className="co-session-time">
                        <Clock size={12} />
                        {formatDateTime(s.scheduledAt)} · {s.durationMinutes ?? 50}min
                      </span>
                    </div>
                    <StatusPill status={s.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Assigned students quick view ── */}
          <div className="co-card">
            <div className="co-card-header">
              <h2 className="co-section-title">
                <Users size={18} /> My Students
              </h2>
              <button className="co-view-all" onClick={() => navigate('/dashboard/counsellor/students')}>
                View all <ChevronRight size={14} />
              </button>
            </div>

            {!profile?.assignedStudents?.length ? (
              <div className="co-empty">
                <Users size={32} />
                <p>No students assigned yet.</p>
                <span className="co-empty-sub">Contact your admin to get students assigned.</span>
              </div>
            ) : (
              <div className="co-student-quick-list">
                {profile.assignedStudents.slice(0, 6).map((s) => (
                  <div
                    key={s._id}
                    className="co-student-quick-row"
                    onClick={() => navigate(`/dashboard/counsellor/students`)}
                  >
                    <div className="co-sq-avatar">{s.name?.charAt(0).toUpperCase()}</div>
                    <div className="co-sq-info">
                      <span className="co-sq-name">{s.name}</span>
                      <span className="co-sq-email">{s.email}</span>
                    </div>
                    {s.latestMoodScore !== undefined && (
                      <MoodDot score={s.latestMoodScore} />
                    )}
                    <ChevronRight size={14} className="co-sq-arrow" />
                  </div>
                ))}
                {profile.assignedStudents.length > 6 && (
                  <button className="co-more-btn" onClick={() => navigate('/dashboard/counsellor/students')}>
                    +{profile.assignedStudents.length - 6} more students
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Institution context (admin-link-ready) ── */}
        <div className="co-card co-institution-card">
          <div className="co-card-header">
            <h2 className="co-section-title">
              <Activity size={18} /> Institution Overview
            </h2>
          </div>
          <div className="co-institution-grid">
            <div className="co-inst-stat">
              <span className="co-inst-value">{totalStudents}</span>
              <span className="co-inst-label">Students Under Care</span>
            </div>
            <div className="co-inst-stat">
              <span className="co-inst-value">{analytics?.totalSessionsThisMonth ?? '—'}</span>
              <span className="co-inst-label">Sessions This Month</span>
            </div>
            <div className="co-inst-stat">
              <span className="co-inst-value">{analytics?.avgMoodScore ? analytics.avgMoodScore.toFixed(1) : '—'}</span>
              <span className="co-inst-label">Avg Mood Score</span>
            </div>
            <div className="co-inst-stat">
              <span className="co-inst-value">{user?.institution || '—'}</span>
              <span className="co-inst-label">Institution</span>
            </div>
          </div>
        </div>

      </div>
    </CounsellorLayout>
  );
};

/* ── Helpers ───────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });
}

export default CounsellorOverview;