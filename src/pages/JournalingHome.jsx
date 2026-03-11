import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
import { Plus, ChevronLeft, ChevronRight, BookOpen, Calendar, List, X, ArrowLeft } from 'lucide-react';
import { getJournalEntries, getJournalCalendar, deleteJournalEntry } from '../api/journalApi';
import './JournalingHome.css';

/* ─── helpers ─────────────────────────────────────────────── */
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const DAILY_PROMPT = "What are three things you are grateful for today?";
const DAILY_PROMPT_SUB = "Taking a moment to acknowledge the good in your life can significantly boost your mood.";

const SUGGESTED_PROMPTS = [
  { id: 1, text: "Describe a moment today when you felt fully present." },
  { id: 2, text: "What is a recent challenge that ended up teaching you a valuable lesson?" },
  { id: 3, text: "If you could speak to yourself from five years ago, what advice would you give?" },
  { id: 4, text: "Write about a time you surprised yourself with your own strength." }
];

function groupByDay(entries) {
  const map = {};
  for (const e of entries) {
    const key = new Date(e.createdAt).toISOString().slice(0, 10);
    if (!map[key]) map[key] = [];
    map[key].push(e);
  }
  // Sort days descending
  return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]));
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function formatUpdated(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function calculateStreak(entries) {
  if (!entries || entries.length === 0) return 0;

  // Get unique dates with entries, sorted descending
  const dates = [...new Set(entries.map(e => e.createdAt.slice(0, 10)))].sort((a, b) => b.localeCompare(a));

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // If the latest entry isn't today or yesterday, streak is broken
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  let streak = 1;
  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    const next = new Date(dates[i + 1]);
    const diffTime = Math.abs(current - next);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/* ─── Calendar sub-component ─────────────────────────────── */
const JournalCalendar = ({ year, month, activeDays, onDayClick, onMonthChange }) => {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const today = new Date();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const activeSet = new Set(activeDays.map(a => new Date(a.date + 'T00:00:00').getDate()));

  return (
    <div className="jh-calendar">
      <div className="jh-cal-header">
        <div className="jh-cal-info">
          <span className="jh-cal-month">{MONTHS[month - 1]}</span>
          <span className="jh-cal-year">{year}</span>
        </div>
        <div className="jh-cal-actions">
          <button className="jh-cal-nav-btn" onClick={() => onMonthChange(-1)} aria-label="Previous month">
            <ChevronLeft size={18} />
          </button>
          <button className="jh-cal-nav-btn" onClick={() => onMonthChange(1)} aria-label="Next month">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div className="jh-cal-grid">
        {DAYS.map(d => <div key={d} className="jh-cal-weekday">{d[0]}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="jh-cal-day jh-cal-day-empty" />;
          const isToday = day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
          const hasEntry = activeSet.has(day);
          return (
            <button
              key={day}
              className={`jh-cal-day ${isToday ? 'is-today' : ''} ${hasEntry ? 'has-entry' : ''}`}
              onClick={() => hasEntry && onDayClick(day)}
              disabled={!hasEntry && !isToday}
            >
              <span className="jh-cal-day-number">{day}</span>
              {hasEntry && <span className="jh-cal-entry-dot" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Main Page ───────────────────────────────────────────── */
const JournalingHome = () => {
  const navigate = useNavigate();
  const now = new Date();

  const [view, setView] = useState('list');   // 'list' | 'calendar'
  const [entries, setEntries] = useState([]);
  const [calDays, setCalDays] = useState([]);
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth() + 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getJournalEntries();
      setEntries(res.data.data);
    } catch {
      setError('Could not load entries.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCalendar = useCallback(async () => {
    try {
      const res = await getJournalCalendar(calYear, calMonth);
      setCalDays(res.data.data);
    } catch {
      setCalDays([]);
    }
  }, [calYear, calMonth]);

  useEffect(() => { loadEntries(); }, [loadEntries]);
  useEffect(() => { loadCalendar(); }, [loadCalendar]);

  const handleMonthChange = (delta) => {
    let m = calMonth + delta;
    let y = calYear;
    if (m < 1) { m = 12; y -= 1; }
    if (m > 12) { m = 1; y += 1; }
    setCalMonth(m);
    setCalYear(y);
  };

  const handleCalDayClick = (day) => {
    const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const match = entries.find(e => e.createdAt.slice(0, 10) === dateStr);
    if (match) navigate(`/dashboard/journaling/${match._id}`);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this journal entry?')) return;
    setDeleting(id);
    try {
      await deleteJournalEntry(id);
      setEntries(prev => prev.filter(en => en._id !== id));
      loadCalendar();
    } catch {
      alert('Could not delete entry.');
    } finally {
      setDeleting(null);
    }
  };

  const grouped = groupByDay(entries);
  const totalWords = entries.reduce((sum, e) => sum + (e.wordCount || 0), 0);
  const streak = calculateStreak(entries);

  // Check if an entry already exists for today
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayEntry = entries.find(e => e.createdAt.slice(0, 10) === todayStr);

  const handleNewEntry = (promptState) => {
    if (todayEntry) {
      // Already has an entry today — open it for editing
      navigate(`/dashboard/journaling/${todayEntry._id}`);
    } else {
      navigate('/dashboard/journaling/new', promptState ? { state: promptState } : undefined);
    }
  };

  return (
    <DashboardLayout>
      <div className="jh-page">
        {/* ── Hero / Header ── */}
        <div className="jh-hero">
          <button className="jh-back-btn" onClick={() => navigate('/dashboard/activities')}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <div className="jh-hero-content">
            <h1 className="jh-hero-title">Mindful Journal</h1>
            <div className="jh-hero-stats-bar">
              <div className="jh-stat-item">
                <span className="jh-stat-value">{streak}</span>
                <span className="jh-stat-label">Day Streak</span>
              </div>
              <div className="jh-stat-divider"></div>
              <div className="jh-stat-item">
                <span className="jh-stat-value">{entries.length}</span>
                <span className="jh-stat-label">Reflections</span>
              </div>
              <div className="jh-stat-divider"></div>
              <div className="jh-stat-item">
                <span className="jh-stat-value">{totalWords.toLocaleString()}</span>
                <span className="jh-stat-label">Words</span>
              </div>
            </div>
          </div>
          <button className="jh-hero-btn" onClick={() => handleNewEntry(null)}>
            <Plus size={18} strokeWidth={2.5} />
            {todayEntry ? 'Edit Today\'s Entry' : 'Write a New Entry'}
          </button>
        </div>

        {/* ── Daily & Suggested Prompts ── */}
        <div className="jh-prompts-section">
          {/* Main Daily Prompt */}
          <div className="jh-daily-prompt-card">
            <div className="jh-dp-content">
              <span className="jh-dp-tag">DAILY INSPIRATION</span>
              <h2 className="jh-dp-text">{DAILY_PROMPT}</h2>
              <p className="jh-dp-subtext">{DAILY_PROMPT_SUB}</p>

              <button
                className="jh-dp-cta-btn"
                onClick={() => handleNewEntry({ selectedPrompt: DAILY_PROMPT })}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="16" y2="6"></line><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="18" x2="12" y2="18"></line></svg>
                <span>Start Writing</span>
              </button>
            </div>
            <div className="jh-dp-icon-wrapper">
              <div className="jh-dp-icon-circle">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1.45.62 2.84 1.5 3.5.76.76 1.23 1.52 1.41 2.5"></path></svg>
              </div>
            </div>
          </div>

          {/* Suggested Prompts (Horizontal Scroll) */}
          <div className="jh-suggested-prompts-wrapper">
            <h3 className="jh-sp-title">DEEP REFLECTIONS</h3>
            <div className="jh-sp-scroll">
              {SUGGESTED_PROMPTS.map(p => (
                <div
                  key={p.id}
                  className="jh-sp-card"
                  onClick={() => handleNewEntry({ selectedPrompt: p.text })}
                >
                  <p className="jh-sp-text">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs & Content Area ── */}
        <div className="jh-content-area">
          <div className="jh-tabs">
            <button className={`jh-tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
              <List size={16} /> Entries
            </button>
            <button className={`jh-tab ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>
              <Calendar size={16} /> Calendar
            </button>
          </div>

          <div className="jh-content">
            {/* ── Calendar View ── */}
            {view === 'calendar' && (
              <div className="jh-calendar-wrapper fade-in">
                <JournalCalendar
                  year={calYear}
                  month={calMonth}
                  activeDays={calDays}
                  onDayClick={handleCalDayClick}
                  onMonthChange={handleMonthChange}
                />
              </div>
            )}

            {/* ── List View ── */}
            {view === 'list' && (
              <div className="jh-list fade-in">
                {loading && <div className="jh-loading-pulse">Loading your reflections…</div>}
                {!loading && error && <div className="jh-empty jh-error">{error}</div>}

                {!loading && !error && entries.length === 0 && (
                  <div className="jh-empty-state">
                    <div className="jh-empty-illustration">
                      <div className="jh-empty-circle">
                        <BookOpen size={40} />
                      </div>
                      <div className="jh-empty-dots">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                    <div className="jh-empty-text">
                      <h3>Begin Your Journey</h3>
                      <p>Your mindful reflections will appear here. Why not start with your first entry today?</p>
                    </div>
                    <button className="jh-empty-cta" onClick={() => handleNewEntry(null)}>
                      <Plus size={18} />
                      <span>Create Your First Entry</span>
                    </button>
                  </div>
                )}

                {!loading && grouped.map(([dateStr, dayEntries]) => (
                  <div key={dateStr} className="jh-day-group">
                    <div className="jh-day-header">
                      <span className="jh-day-date">{formatDayLabel(dateStr)}</span>
                      <span className="jh-day-line"></span>
                    </div>

                    <div className="jh-cards-grid">
                      {dayEntries.map(entry => (
                        <div
                          key={entry._id}
                          className="jh-card"
                          onClick={() => navigate(`/dashboard/journaling/${entry._id}`)}
                        >
                          <div className="jh-card-header">
                            <h3 className="jh-card-title">{entry.title || 'Untitled Entry'}</h3>
                            <span className="jh-card-time">{formatTime(entry.createdAt)}</span>
                          </div>

                          <p className="jh-card-preview">
                            {entry.body.slice(0, 140)}{entry.body.length > 140 ? '…' : ''}
                          </p>

                          <div className="jh-card-footer">
                            <div className="jh-card-tags">
                              {entry.tags && entry.tags.length > 0 ? (
                                entry.tags.map(tag => (
                                  <span key={tag} className="jh-card-tag">#{tag}</span>
                                ))
                              ) : (
                                <span className="jh-card-no-tags">No tags</span>
                              )}
                            </div>

                            <div className="jh-card-meta">
                              {entry.wordCount > 0 && <span className="jh-card-words">{entry.wordCount} words</span>}
                              <button
                                className="jh-card-delete"
                                disabled={deleting === entry._id}
                                onClick={(e) => handleDelete(e, entry._id)}
                                aria-label="Delete entry"
                              >
                                {deleting === entry._id ? '…' : <X size={14} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default JournalingHome;