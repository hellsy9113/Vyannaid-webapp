import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ChevronRight, X, BookOpen,
  Target, BarChart3, AlertCircle, Clock,
  UserPlus, SlidersHorizontal, ChevronLeft
} from 'lucide-react';
import CounsellorLayout from '../components/CounsellorDashboard/CounsellorLayout';
import {
  getCounsellorProfile,
  getAssignedStudentDashboard
} from '../api/counsellorApi';
import './CounsellorStudents.css';

/* ── Mood badge ──────────────────────────────────────────── */
const MoodBadge = ({ score }) => {
  if (score == null) return <span className="cs-status-tag tag-grey">No data</span>;
  if (score >= 7)    return <span className="cs-status-tag tag-green">Active</span>;
  if (score >= 4)    return <span className="cs-status-tag tag-yellow">On Break</span>;
  return               <span className="cs-status-tag tag-red">Low Score</span>;
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

  // Map the local trend data from history
  const getMoodTrend = () => {
    if (data?.mentalStats?.history?.length > 0) {
      return data.mentalStats.history.map(h => ({
        value: h.moodScore,
        label: new Date(h.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      }));
    }
    // Fallback if no history
    const base = student.latestMoodScore || 5;
    return [
      { value: base - 0.5, label: '—' },
      { value: base + 0.2, label: '—' },
      { value: base - 0.3, label: '—' },
      { value: base + 0.5, label: '—' },
      { value: base, label: 'TODAY' }
    ];
  };

  const moodTrend = getMoodTrend();
  const rawAvg = moodTrend.length > 0 
    ? (moodTrend.reduce((acc, curr) => acc + (typeof curr.value === 'number' ? curr.value : 0), 0) / moodTrend.length)
    : (data?.mentalStats?.moodScore || student.latestMoodScore || 0);
  const displayAvg = rawAvg > 0 ? rawAvg.toFixed(1) : '—';

  return (
    <div className="cs-panel" id="student-report-print">
      <div className="cs-panel-header">
        <div className="cs-panel-identity">
          <div className="cs-panel-avatar-circle">{student.name?.split(' ').map(n => n[0]).join('')}</div>
          <div className="cs-panel-meta">
            <h3 className="cs-panel-name">{student.name || 'Anonymous Student'}</h3>
            <p className="cs-panel-subtitle-sm">
              Student ID: ID-{student._id?.slice(-4).toUpperCase()} • {student.latestMoodScore >= 7 ? 'Active Status' : 'Monitoring'}
            </p>
          </div>
        </div>
        <button className="cs-modal-close-btn" onClick={onClose}><X size={20} /></button>
      </div>

      <div className="cs-panel-scroll">
        {/* Mood Score Trend */}
        <div className="cs-modal-section">
          <div className="cs-section-header-flex">
            <h4 className="cs-modal-section-title">TREND AVERAGE</h4>
            <div className="cs-overall-score">
              <span className="cs-score-big">{displayAvg}</span><span className="cs-score-total">/10</span>
            </div>
          </div>
          
          <div className="cs-trend-chart">
            {moodTrend.map((item, i) => (
              <div key={i} className="cs-chart-col">
                <div className="cs-chart-bar-wrap" title={`${item.label}: ${item.value}`}>
                  <div 
                    className={`cs-chart-bar ${i === moodTrend.length - 1 ? 'current' : ''}`} 
                    style={{ height: `${(item.value / 10) * 100}%` }}
                  />
                </div>
                <span className="cs-chart-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Psychometric Test Scores */}
        <div className="cs-modal-section">
          <h4 className="cs-modal-section-title">PSYCHOMETRIC TEST SCORES</h4>
          {data?.psychometricScores?.length > 0 ? (
            <div className="cs-scores-list">
              {data.psychometricScores.map((item, idx) => (
                <div key={idx} className="cs-score-card">
                  <div className="cs-score-info">
                    <span className="cs-score-label">{item.label || item.type}</span>
                    <span className="cs-score-date">{item.date || 'No date recorded'}</span>
                  </div>
                  <span className="cs-score-val">{item.score || '—'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="cs-empty-info">No test results available yet.</p>
          )}
        </div>

        {/* Session History */}
        <div className="cs-modal-section">
          <h4 className="cs-modal-section-title">SESSION HISTORY</h4>
          {data?.sessionHistory?.length > 0 ? (
            <div className="cs-timeline">
              <div className="cs-timeline-line" />
              {data.sessionHistory.slice(0, 5).map((session, idx) => (
                <div key={idx} className="cs-timeline-item">
                  <div className={`cs-timeline-dot ${idx === 0 ? 'active' : ''}`} />
                  <div className="cs-timeline-content">
                    <div className="cs-timeline-header">
                      <span className="cs-timeline-title">{session.title || 'Counseling Session'}</span>
                      <span className="cs-timeline-date">
                        {new Date(session.scheduledAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    {session.notes && <p className="cs-timeline-note">"{session.notes}"</p>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="cs-empty-info">No session record available yet.</p>
          )}
        </div>
      </div>

      <div className="cs-modal-footer">
        <button className="cs-footer-btn-ghost" onClick={() => window.print()}>Download PDF</button>
        <button className="cs-footer-btn-primary" onClick={onClose}>Close File</button>
      </div>
    </div>
  );
};

/* ── Main component ─────────────────────────────────────── */
const CounsellorStudents = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState('All Students');
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 5;

  useEffect(() => {
    getCounsellorProfile()
      .then(r => setProfile(r.data.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const getFilteredStudents = () => {
    let filtered = (profile?.assignedStudents || []).filter(s =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s._id?.toLowerCase().includes(search.toLowerCase())
    );

    if (activeTab === 'Active') {
      filtered = filtered.filter(s => (s.latestMoodScore || 0) >= 7);
    } else if (activeTab === 'On Break') {
      filtered = filtered.filter(s => (s.latestMoodScore || 0) >= 4 && (s.latestMoodScore || 0) < 7);
    } else if (activeTab === 'Completed') {
      filtered = filtered.filter(s => (s.latestMoodScore || 0) < 4 && s.latestMoodScore != null);
    }
    return filtered;
  };

  const allFiltered = getFilteredStudents();
  const totalPages = Math.ceil(allFiltered.length / studentsPerPage);
  const displayedStudents = allFiltered.slice((currentPage - 1) * studentsPerPage, currentPage * studentsPerPage);

  const getInitials = (name = "") =>
    name.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  const tabs = [
    { name: 'All Students', count: profile?.assignedStudents?.length || 0 },
    { name: 'Active', count: (profile?.assignedStudents || []).filter(s => (s.latestMoodScore || 0) >= 7).length },
    { name: 'On Break', count: (profile?.assignedStudents || []).filter(s => (s.latestMoodScore || 0) >= 4 && (s.latestMoodScore || 0) < 7).length },
    { name: 'Completed', count: (profile?.assignedStudents || []).filter(s => (s.latestMoodScore || 0) < 4 && s.latestMoodScore != null).length },
  ];

  return (
    <CounsellorLayout>
      <div className="cs-page-container">
        <div className="cs-header-section">
          <h1 className="cs-main-title">Student List</h1>
          <p className="cs-main-subtitle">Manage student caseloads and monitor progress milestones.</p>
        </div>

        <div className="cs-controls-row">
          <div className="cs-search-wrapper">
            <Search size={18} className="cs-search-icon-fixed" />
            <input
              type="text"
              className="cs-main-search"
              placeholder="Search by student name, ID, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="cs-add-btn">
            <UserPlus size={18} />
            <span>Add Student</span>
          </button>
        </div>

        <div className="cs-filters-bar">
          <div className="cs-tabs">
            {tabs.map(tab => (
              <button
                key={tab.name}
                className={`cs-tab-item ${activeTab === tab.name ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab.name); setCurrentPage(1); }}
              >
                {tab.name} <span className="cs-tab-count">{tab.count}</span>
              </button>
            ))}
          </div>
          <button className="cs-more-filters">
            <SlidersHorizontal size={16} />
            <span>More Filters</span>
          </button>
        </div>

        <div className="cs-table-container">
          <table className="cs-student-table">
            <thead>
              <tr>
                <th>STUDENT NAME</th>
                <th>STUDENT ID</th>
                <th>STATUS</th>
                <th>LAST SESSION</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8"><div className="cs-spinner" /></td></tr>
              ) : displayedStudents.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-slate-400">No students found</td></tr>
              ) : (
                displayedStudents.map(s => (
                  <tr key={s._id} className={selected?._id === s._id ? 'row-active' : ''}>
                    <td>
                      <div className="cs-name-cell">
                        <div className="cs-letter-avatar" style={{ background: '#f1f5f9', color: '#64748b' }}>
                          {getInitials(s.name)}
                        </div>
                        <span className="cs-s-name">{s.name}</span>
                      </div>
                    </td>
                    <td className="cs-id-cell">ID-{s._id?.slice(-4).toUpperCase()}</td>
                    <td><MoodBadge score={s.latestMoodScore} /></td>
                    <td className="cs-session-cell">Oct 12, 2023</td>
                    <td className="text-right">
                      <button className="cs-view-file-btn" onClick={() => setSelected(s)}>
                        View File
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="cs-pagination-row">
          <span className="cs-pagination-info">
            Showing {(currentPage - 1) * studentsPerPage + 1}-{Math.min(currentPage * studentsPerPage, allFiltered.length)} of {allFiltered.length} students
          </span>
          <div className="cs-pagination-controls">
            <button
              className="cs-page-nav"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
            >
              <ChevronLeft size={18} />
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`cs-page-num ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="cs-page-nav"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {selected && (
        <div className="cs-panel-overlay" onClick={() => setSelected(null)}>
          <div className="cs-panel-drawer" onClick={e => e.stopPropagation()}>
            <StudentPanel student={selected} onClose={() => setSelected(null)} />
          </div>
        </div>
      )}
    </CounsellorLayout>
  );
};

export default CounsellorStudents;