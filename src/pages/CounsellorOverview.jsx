import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Users, MessageSquare, AlertCircle, CheckCircle2, Calendar,
  Plus, ChevronRight, UserCheck
} from 'lucide-react';
import CounsellorLayout from '../components/CounsellorDashboard/CounsellorLayout';
import {
  getCounsellorProfile,
  getCounsellorSessions,
  getCounsellorAnalytics
} from '../api/counsellorApi';
import './CounsellorOverview.css';

/* ── Status pill ── */
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

/* ── Mood dot ── */
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
        setProfile(pRes.data?.data || null);
        setSessions(sRes.data?.data || []);
        setAnalytics(aRes.data?.data || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  // Derive today's actual data
  const totalStudents = profile?.assignedStudents?.length ?? 0;
  const totalVolunteers = profile?.assignedVolunteers?.length ?? 0;
  const todaySessions = sessions.filter(s => {
    const d = new Date(s.scheduledAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const activeSessions = todaySessions.length;
  const atRiskCount = analytics?.atRiskStudents ?? 0;
  const completionRate = analytics?.completionRate ? `${analytics.completionRate}%` : '0%';
  const fullName = user?.name || 'Counsellor';

  function formatTime(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit'
    });
  }

  return (
    <CounsellorLayout>
      <div className="co-page">

        {/* ── Welcome Header ── */}
        <div className="co-welcome-row">
          <div className="co-welcome-texts">
            <h1 className="co-welcome-title">Welcome back, {fullName}</h1>
            <p className="co-welcome-sub">
              You have {activeSessions} session{activeSessions === 1 ? '' : 's'} scheduled for today.
            </p>
          </div>
          <button className="co-new-session-primary" onClick={() => navigate('/dashboard/counsellor/sessions')}>
            <Plus size={18} /> New Session
          </button>
        </div>

        {/* ── Alert banner for at-risk students ── */}
        {atRiskCount > 0 && (
          <div className="co-alert-banner" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '0.9rem 1.25rem', color: '#9a3412', fontSize: '0.9rem' }}>
            <AlertCircle size={18} style={{ color: '#f97316' }}/>
            <span>
              <strong>{atRiskCount} student{atRiskCount > 1 ? 's' : ''}</strong> show{atRiskCount === 1 ? 's' : ''} elevated distress signals — review their mood trends.
            </span>
            <button onClick={() => navigate('/dashboard/counsellor/analytics')} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#fff', border: '1px solid #fed7aa', borderRadius: '8px', padding: '0.4rem 0.85rem', fontSize: '0.82rem', fontWeight: 600, color: '#9a3412', cursor: 'pointer' }}>
              View Analytics <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* ── STATS GRID ── */}
        <div className="co-stats-grid">
          {/* Total Students */}
          <div className="co-stat-card">
            <div className="co-stat-header">
              <div className="co-icon-sq bg-blue"><Users size={20} className="text-blue" /></div>
            </div>
            <div className="co-stat-body">
              <div className="co-stat-label">Total Students</div>
              <div className="co-stat-value">{totalStudents}</div>
            </div>
          </div>
          
          {/* Active Sessions */}
          <div className="co-stat-card">
            <div className="co-stat-header">
              <div className="co-icon-sq bg-purple"><MessageSquare size={20} className="text-purple" /></div>
            </div>
            <div className="co-stat-body">
              <div className="co-stat-label">Today's Sessions</div>
              <div className="co-stat-value">{activeSessions}</div>
            </div>
          </div>

          {/* Total Volunteers */}
          <div className="co-stat-card" onClick={() => navigate('/dashboard/counsellor/volunteers')} style={{ cursor: 'pointer' }}>
            <div className="co-stat-header">
              <div className="co-icon-sq bg-green"><UserCheck size={20} className="text-green" /></div>
            </div>
            <div className="co-stat-body">
              <div className="co-stat-label">My Volunteers</div>
              <div className="co-stat-value">{totalVolunteers}</div>
            </div>
          </div>

          {/* At Risk Students - Exchanged Pending Notes for Real Metric */}
          <div className="co-stat-card">
            <div className="co-stat-header">
              <div className="co-icon-sq bg-orange"><AlertCircle size={20} className="text-orange" /></div>
            </div>
            <div className="co-stat-body">
              <div className="co-stat-label">At-Risk Students</div>
              <div className="co-stat-value">{atRiskCount}</div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="co-stat-card">
            <div className="co-stat-header">
              <div className="co-icon-sq bg-teal"><CheckCircle2 size={20} className="text-teal" /></div>
              <span className="co-badge badge-neutral">Overall</span>
            </div>
            <div className="co-stat-body">
              <div className="co-stat-label">Completion Rate</div>
              <div className="co-stat-value">{completionRate}</div>
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT GRID ── */}
        <div className="co-main-grid">
          
          {/* LEFT: Upcoming Schedule */}
          <div className="co-widget">
            <div className="co-widget-header">
              <h2 className="co-widget-title">
                <Calendar size={20} strokeWidth={2.5}/> Upcoming Schedule
              </h2>
              <button 
                className="co-view-link" 
                onClick={() => navigate('/dashboard/counsellor/sessions')}
              >
                View Calendar
              </button>
            </div>

            {sessions.length === 0 ? (
               <div className="co-timeline-card" style={{ justifyContent: 'center', margin: 0 }}>
                 <p style={{ color: '#64748b', fontSize: '0.95rem' }}>No upcoming sessions scheduled.</p>
               </div>
            ) : (
                <div className="co-schedule-timeline">
                {/* Timeline Line */}
                <div className="co-timeline-track"></div>
  
                {sessions.map((session, i) => {
                  const sName = session.studentName || session.student?.name || 'Assigned Student';
                  return (
                    <div className="co-timeline-item" key={session._id || i}>
                      <div className="co-timeline-dot dot-dark"></div>
                      <div className="co-timeline-time">
                        <span className="co-time-main">{formatTime(session.scheduledAt)}</span>
                        <span className="co-time-sub">{session.durationMinutes ?? 50} MIN</span>
                      </div>
                      <div className="co-timeline-card">
                        <div className="co-tc-info">
                          <div className="co-tc-title">{sName}</div>
                          <div className="co-tc-desc">{session.type || 'Counseling Session'}</div>
                        </div>
                        <StatusPill status={session.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT: My Students */}
          <div className="co-right-col">
            
            <div className="co-widget">
              <div className="co-widget-header">
                <h2 className="co-widget-title">
                  <Users size={20} strokeWidth={2.5}/> My Students
                </h2>
                <button 
                  className="co-view-link" 
                  onClick={() => navigate('/dashboard/counsellor/students')}
                >
                  View all
                </button>
              </div>
              
              <div className="co-activity-list" style={{ borderRadius: '12px', borderBottom: '1px solid #f1f5f9' }}>
                
                {!profile?.assignedStudents?.length ? (
                    <div className="co-activity-item" style={{ justifyContent: 'center' }}>
                         <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No students assigned yet.</p>
                    </div>
                ) : (
                    profile.assignedStudents.slice(0, 5).map((s) => (
                        <div key={s._id} className="co-activity-item" style={{ cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => navigate(`/dashboard/counsellor/students`)}>
                            <div className="co-act-icon bg-blue-light text-blue" style={{ fontWeight: 700 }}>
                                {s.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="co-act-info" style={{ flex: 1 }}>
                                <div className="co-act-text"><strong>{s.name}</strong></div>
                                <div className="co-act-time">{s.email}</div>
                            </div>
                            {s.latestMoodScore !== undefined && (
                                <MoodDot score={s.latestMoodScore} />
                            )}
                            <ChevronRight size={16} style={{ color: '#cbd5e1' }} />
                        </div>
                    ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </CounsellorLayout>
  );
};

export default CounsellorOverview;