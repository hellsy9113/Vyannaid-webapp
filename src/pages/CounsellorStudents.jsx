import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ChevronRight, X, BookOpen,
  Target, BarChart3, AlertCircle, Clock
} from 'lucide-react';
import CounsellorLayout from '../components/CounsellorDashboard/CounsellorLayout';
import {
  getCounsellorProfile,
  getAssignedStudentDashboard
} from '../api/counsellorApi';
import './CounsellorStudents.css';

/* ── Mood badge ──────────────────────────────────────────── */
const MoodBadge = ({ score }) => {
  if (score == null) return <span className="cs-badge cs-badge-grey">No data</span>;
  if (score >= 7)    return <span className="cs-badge cs-badge-green">Good ({score}/10)</span>;
  if (score >= 4)    return <span className="cs-badge cs-badge-yellow">Fair ({score}/10)</span>;
  return               <span className="cs-badge cs-badge-red">Low ({score}/10)</span>;
};

/* ── Student detail panel ──────────────────────────────── */
const StudentPanel = ({ student, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setData(null);
    setLoading(true);
    getAssignedStudentDashboard(student._id)
      .then(r => setData(r.data.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [student._id]);

  return (
    <div className="cs-panel">
      <div className="cs-panel-header">
        <div className="cs-panel-identity">
          <div className="cs-panel-avatar">{student.name?.charAt(0).toUpperCase()}</div>
          <div>
            <h3 className="cs-panel-name">{student.name}</h3>
            <p className="cs-panel-email">{student.email}</p>
          </div>
        </div>
        <button className="cs-close-btn" onClick={onClose}><X size={18} /></button>
      </div>

      {loading ? (
        <div className="cs-panel-loading"><div className="cs-spinner" /><p>Loading student data…</p></div>
      ) : !data ? (
        <div className="cs-panel-empty"><AlertCircle size={28} /><p>No dashboard data available yet.</p></div>
      ) : (
        <div className="cs-panel-body">

          {/* Mental stats */}
          <div className="cs-section">
            <h4 className="cs-section-label"><BarChart3 size={14} /> Mental Health Stats</h4>
            <div className="cs-stat-row">
              <div className="cs-mini-stat">
                <span className="cs-mini-val">{data.mentalStats?.moodScore ?? '—'}</span>
                <span className="cs-mini-lbl">Mood Score</span>
              </div>
              <div className="cs-mini-stat">
                <span className="cs-mini-val">{data.mentalStats?.stressLevel ?? '—'}</span>
                <span className="cs-mini-lbl">Stress Level</span>
              </div>
              <div className="cs-mini-stat">
                <span className="cs-mini-val">
                  {data.mentalStats?.lastCheckIn
                    ? new Date(data.mentalStats.lastCheckIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
                    : '—'}
                </span>
                <span className="cs-mini-lbl">Last Check-in</span>
              </div>
            </div>
          </div>

          {/* Goals */}
          <div className="cs-section">
            <h4 className="cs-section-label"><Target size={14} /> Goals ({data.goals?.length || 0})</h4>
            {data.goals?.length ? (
              <ul className="cs-goals-list">
                {data.goals.map((g, i) => (
                  <li key={i} className={`cs-goal-item${g.completed ? ' done' : ''}`}>
                    <span className="cs-goal-icon">{g.completed ? '✓' : '○'}</span>
                    {g.title}
                  </li>
                ))}
              </ul>
            ) : <p className="cs-empty-text">No goals set yet.</p>}
          </div>

          {/* Journal entries */}
          <div className="cs-section">
            <h4 className="cs-section-label"><BookOpen size={14} /> Recent Journal Entries ({data.journalEntries?.length || 0})</h4>
            {data.journalEntries?.length ? (
              <div className="cs-journal-list">
                {data.journalEntries.slice(0, 3).map((e, i) => (
                  <div key={i} className="cs-journal-entry">
                    <span className="cs-journal-date">
                      {new Date(e.createdAt || e.date).toLocaleDateString('en-GB', {
                        weekday: 'short', day: 'numeric', month: 'short'
                      })}
                    </span>
                    <p className="cs-journal-text">{e.content?.slice(0, 160)}{e.content?.length > 160 ? '…' : ''}</p>
                  </div>
                ))}
              </div>
            ) : <p className="cs-empty-text">No journal entries yet.</p>}
          </div>

          {/* Session history (admin-reportable) */}
          <div className="cs-section">
            <h4 className="cs-section-label"><Clock size={14} /> Session History</h4>
            {data.sessionHistory?.length ? (
              <div className="cs-session-hist">
                {data.sessionHistory.slice(0, 4).map((s, i) => (
                  <div key={i} className="cs-sh-row">
                    <span className="cs-sh-date">
                      {new Date(s.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className={`cs-sh-status ${s.status}`}>{s.status}</span>
                    {s.notes && <span className="cs-sh-note">{s.notes.slice(0, 60)}…</span>}
                  </div>
                ))}
              </div>
            ) : <p className="cs-empty-text">No sessions recorded yet.</p>}
          </div>

        </div>
      )}
    </div>
  );
};

/* ── Main component ─────────────────────────────────────── */
const CounsellorStudents = () => {
  const [profile,  setProfile]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getCounsellorProfile()
      .then(r => setProfile(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const students = (profile?.assignedStudents || []).filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CounsellorLayout>
      <div className={`cs-page ${selected ? 'with-panel' : ''}`}>

        {/* Left: student list */}
        <div className="cs-list-col">
          <div className="cs-list-header">
            <div>
              <h1 className="cs-title">My Students</h1>
              <p className="cs-subtitle">{profile?.assignedStudents?.length || 0} students assigned to you</p>
            </div>
          </div>

          <div className="cs-search-box">
            <Search size={16} className="cs-search-icon" />
            <input
              className="cs-search-input"
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="cs-load-row"><div className="cs-spinner" /></div>
          ) : students.length === 0 ? (
            <div className="cs-empty-list">
              <p>{search ? 'No students match your search.' : 'No students assigned yet.'}</p>
            </div>
          ) : (
            <div className="cs-students-grid">
              {students.map(s => (
                <div
                  key={s._id}
                  className={`cs-student-card${selected?._id === s._id ? ' active' : ''}`}
                  onClick={() => setSelected(selected?._id === s._id ? null : s)}
                >
                  <div className="cs-sc-avatar">{s.name?.charAt(0).toUpperCase()}</div>
                  <div className="cs-sc-info">
                    <span className="cs-sc-name">{s.name}</span>
                    <span className="cs-sc-email">{s.email}</span>
                    {s.institution && <span className="cs-sc-inst">{s.institution}</span>}
                  </div>
                  <MoodBadge score={s.latestMoodScore} />
                  <ChevronRight size={16} className="cs-sc-arrow" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: student detail panel */}
        {selected && (
          <div className="cs-panel-col">
            <StudentPanel student={selected} onClose={() => setSelected(null)} />
          </div>
        )}
      </div>
    </CounsellorLayout>
  );
};

export default CounsellorStudents;