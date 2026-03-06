import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
import { Plus, ChevronLeft, ChevronRight, BookOpen, Calendar, List } from 'lucide-react';
import { getJournalEntries, getJournalCalendar, deleteJournalEntry } from '../api/journalApi';
import './JournalingHome.css';

/* ─── helpers ─────────────────────────────────────────────── */
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

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
  const today     = new Date(); today.setHours(0,0,0,0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.getTime() === today.getTime())     return 'Today';
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
        <button className="jh-cal-nav" onClick={() => onMonthChange(-1)}><ChevronLeft size={16}/></button>
        <span className="jh-cal-title">{MONTHS[month - 1]} {year}</span>
        <button className="jh-cal-nav" onClick={() => onMonthChange(1)}><ChevronRight size={16}/></button>
      </div>
      <div className="jh-cal-grid">
        {DAYS.map(d => <div key={d} className="jh-cal-dayname">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} className="jh-cal-cell empty" />;
          const isToday = day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();
          const hasEntry = activeSet.has(day);
          return (
            <div
              key={day}
              className={`jh-cal-cell ${isToday ? 'today' : ''} ${hasEntry ? 'has-entry' : ''}`}
              onClick={() => hasEntry && onDayClick(day)}
              title={hasEntry ? 'Has entries' : ''}
            >
              {day}
              {hasEntry && <span className="jh-cal-dot" />}
            </div>
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

  const [view, setView]           = useState('list');   // 'list' | 'calendar'
  const [entries, setEntries]     = useState([]);
  const [calDays, setCalDays]     = useState([]);
  const [calYear, setCalYear]     = useState(now.getFullYear());
  const [calMonth, setCalMonth]   = useState(now.getMonth() + 1);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [deleting, setDeleting]   = useState(null);

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
    if (m < 1)  { m = 12; y -= 1; }
    if (m > 12) { m = 1;  y += 1; }
    setCalMonth(m);
    setCalYear(y);
  };

  const handleCalDayClick = (day) => {
    const dateStr = `${calYear}-${String(calMonth).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const match = entries.find(e => e.createdAt.slice(0,10) === dateStr);
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

        {/* ── Header ── */}
        <div className="jh-header">
          <div>
            <h1 className="jh-title">Journal</h1>
            <p className="jh-subtitle">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} · {totalWords.toLocaleString()} words written
            </p>
          </div>
          <div className="jh-header-actions">
            <div className="jh-view-toggle">
              <button className={`jh-view-btn ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>
                <List size={16} />
              </button>
              <button className={`jh-view-btn ${view === 'calendar' ? 'active' : ''}`} onClick={() => setView('calendar')}>
                <Calendar size={16} />
              </button>
            </div>
            <button className="jh-new-btn" onClick={() => handleNewEntry(null)}>
              <Plus size={16} /> {todayEntry ? 'Edit Today\'s Entry' : 'New Entry'}
            </button>
          </div>
        </div>

        {/* ── Prompt of the Day ── */}
        <div className="jh-prompt-card" onClick={() => handleNewEntry({ selectedPrompt: "How has your perspective on a personal challenge shifted over the past week?" })}>
          <span className="jh-prompt-tag">PROMPT OF THE DAY</span>
          <p className="jh-prompt-text">"How has your perspective on a personal challenge shifted over the past week?"</p>
          <span className="jh-prompt-cta">Respond →</span>
        </div>

        {/* ── Calendar View ── */}
        {view === 'calendar' && (
          <JournalCalendar
            year={calYear}
            month={calMonth}
            activeDays={calDays}
            onDayClick={handleCalDayClick}
            onMonthChange={handleMonthChange}
          />
        )}

        {/* ── List View ── */}
        {view === 'list' && (
          <div className="jh-list">
            {loading && <p className="jh-empty">Loading entries…</p>}
            {!loading && error && <p className="jh-empty jh-error">{error}</p>}
            {!loading && !error && entries.length === 0 && (
              <div className="jh-empty-state">
                <BookOpen size={40} strokeWidth={1.2} />
                <p>No entries yet. Start your first journal entry.</p>
                <button className="jh-new-btn" onClick={() => handleNewEntry(null)}>
                  <Plus size={16} /> Write something
                </button>
              </div>
            )}
            {!loading && grouped.map(([dateStr, dayEntries]) => (
              <div key={dateStr} className="jh-day-group">
                <div className="jh-day-label">
                  <span>{formatDayLabel(dateStr)}</span>
                  <span className="jh-day-count">{dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'}</span>
                </div>
                {dayEntries.map(entry => (
                  <div
                    key={entry._id}
                    className="jh-entry-card"
                    onClick={() => navigate(`/dashboard/journaling/${entry._id}`)}
                  >
                    <div className="jh-entry-top">
                      <h3 className="jh-entry-title">{entry.title || 'Untitled Entry'}</h3>
                      <div className="jh-entry-meta">
                        <span className="jh-entry-time">{formatTime(entry.createdAt)}</span>
                        {entry.updatedAt !== entry.createdAt && (
                          <span className="jh-entry-edited">edited {formatUpdated(entry.updatedAt)}</span>
                        )}
                      </div>
                    </div>
                    <p className="jh-entry-preview">
                      {entry.body.slice(0, 140)}{entry.body.length > 140 ? '…' : ''}
                    </p>
                    <div className="jh-entry-footer">
                      {entry.tags?.length > 0 && (
                        <div className="jh-entry-tags">
                          {entry.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="jh-tag">#{tag}</span>
                          ))}
                        </div>
                      )}
                      <span className="jh-entry-words">{entry.wordCount || 0} words</span>
                      <button
                        className="jh-delete-btn"
                        disabled={deleting === entry._id}
                        onClick={(e) => handleDelete(e, entry._id)}
                      >
                        {deleting === entry._id ? '…' : '✕'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default JournalingHome;