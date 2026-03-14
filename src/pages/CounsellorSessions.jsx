import React, { useEffect, useState } from 'react';
import {
  CalendarDays, Plus, Clock, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, AlertCircle, Edit3, Trash2
} from 'lucide-react';
import CounsellorLayout from '../components/CounsellorDashboard/CounsellorLayout';
import {
  getCounsellorProfile,
  getCounsellorSessions,
  createSession,
  updateSession,
  deleteSession
} from '../api/counsellorApi';
import './CounsellorSessions.css';

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

/* ── Status icon ───────────────────────────────────────── */
const StatusIcon = ({ status }) => {
  if (status === 'completed') return <CheckCircle2 size={15} className="si-green" />;
  if (status === 'cancelled') return <XCircle      size={15} className="si-red"   />;
  if (status === 'no-show')   return <AlertCircle  size={15} className="si-yellow"/>;
  return <Clock size={15} className="si-blue" />;
};

/* ── Mini calendar ─────────────────────────────────────── */
const MiniCalendar = ({ sessions, onDayClick, selectedDate }) => {
  const [cur, setCur] = useState(new Date());

  const year  = cur.getFullYear();
  const month = cur.getMonth();
  const first = new Date(year, month, 1).getDay();
  const days  = new Date(year, month + 1, 0).getDate();

  const hasSessions = (d) => sessions.some(s => {
    const sd = new Date(s.scheduledAt);
    return sd.getFullYear() === year && sd.getMonth() === month && sd.getDate() === d;
  });

  const isSelected = (d) => {
    if (!selectedDate) return false;
    const sd = new Date(selectedDate);
    return sd.getFullYear() === year && sd.getMonth() === month && sd.getDate() === d;
  };

  const isToday = (d) => {
    const t = new Date();
    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === d;
  };

  return (
    <div className="cal-wrap">
      <div className="cal-nav">
        <button onClick={() => setCur(new Date(year, month - 1, 1))}><ChevronLeft size={16} /></button>
        <span className="cal-month">{MONTHS[month]} {year}</span>
        <button onClick={() => setCur(new Date(year, month + 1, 1))}><ChevronRight size={16} /></button>
      </div>
      <div className="cal-grid">
        {DAYS.map(d => <span key={d} className="cal-day-hdr">{d}</span>)}
        {Array.from({ length: first }).map((_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: days }, (_, i) => i + 1).map(d => (
          <button
            key={d}
            className={`cal-day ${isToday(d) ? 'today' : ''} ${isSelected(d) ? 'selected' : ''}`}
            onClick={() => onDayClick(new Date(year, month, d))}
          >
            {d}
            {hasSessions(d) && <span className="cal-dot" />}
          </button>
        ))}
      </div>
    </div>
  );
};

/* ── Session form modal ────────────────────────────────── */
const SessionModal = ({ students, initial, onSave, onClose }) => {
  const [form, setForm] = useState(
    initial || { studentId: '', scheduledAt: '', durationMinutes: 50, type: 'video', notes: '' }
  );
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.studentId || !form.scheduledAt) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch { /* toast handled above */ }
    finally { setSaving(false); }
  };

  return (
    <div className="sm-backdrop" onClick={onClose}>
      <div className="sm-modal" onClick={e => e.stopPropagation()}>
        <div className="sm-header">
          <h3>{initial ? 'Edit Session' : 'Schedule New Session'}</h3>
          <button onClick={onClose}><XCircle size={20} /></button>
        </div>

        <div className="sm-body">
          <label className="sm-label">Student</label>
          <select className="sm-select" value={form.studentId} onChange={e => set('studentId', e.target.value)}>
            <option value="">Select a student…</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          <label className="sm-label">Date & Time</label>
          <input className="sm-input" type="datetime-local" value={form.scheduledAt}
            onChange={e => set('scheduledAt', e.target.value)} />

          <div className="sm-row">
            <div>
              <label className="sm-label">Duration (min)</label>
              <input className="sm-input" type="number" min={15} max={180} step={5}
                value={form.durationMinutes} onChange={e => set('durationMinutes', +e.target.value)} />
            </div>
            <div>
              <label className="sm-label">Session Type</label>
              <select className="sm-select" value={form.type} onChange={e => set('type', e.target.value)}>
                <option value="video">Video</option>
                <option value="chat">Chat</option>
                <option value="in-person">In-Person</option>
                <option value="phone">Phone</option>
              </select>
            </div>
          </div>

          <label className="sm-label">Notes (optional)</label>
          <textarea className="sm-textarea" rows={3} placeholder="Pre-session notes…"
            value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>

        <div className="sm-footer">
          <button className="sm-cancel" onClick={onClose}>Cancel</button>
          <button className="sm-save" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : initial ? 'Update Session' : 'Schedule Session'}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Main page ─────────────────────────────────────────── */
const CounsellorSessions = () => {
  const [sessions,  setSessions]  = useState([]);
  const [students,  setStudents]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selDate,   setSelDate]   = useState(null);
  const [modal,     setModal]     = useState(false);
  const [editItem,  setEditItem]  = useState(null);
  const [statusFilter, setFilter] = useState('');
  const [toast,     setToast]     = useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const load = () => {
    setLoading(true);
    Promise.all([getCounsellorSessions(), getCounsellorProfile()])
      .then(([sRes, pRes]) => {
        setSessions(sRes.data.data || []);
        setStudents(pRes.data.data?.assignedStudents || []);
      })
      .catch(() => showToast('Failed to load sessions.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async (form) => {
    if (editItem) {
      await updateSession(editItem._id, form);
      showToast('Session updated.');
    } else {
      await createSession(form);
      showToast('Session scheduled!');
    }
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel this session?')) return;
    try { await deleteSession(id); showToast('Session cancelled.'); load(); }
    catch { showToast('Failed to cancel.'); }
  };

  /* Filtered view */
  const displayed = sessions.filter(s => {
    if (statusFilter && s.status !== statusFilter) return false;
    if (selDate) {
      const d = new Date(s.scheduledAt);
      return d.toDateString() === selDate.toDateString();
    }
    return true;
  });

  return (
    <CounsellorLayout>
      <div className="css-page">
        {toast && <div className="css-toast">{toast}</div>}

        <div className="css-layout">

          {/* ── Left: calendar + filters ── */}
          <div className="css-left">
            <div className="css-card">
              <MiniCalendar sessions={sessions} onDayClick={setSelDate} selectedDate={selDate} />
              {selDate && (
                <button className="css-clear-date" onClick={() => setSelDate(null)}>
                  Show all sessions
                </button>
              )}
            </div>

            <div className="css-card">
              <h4 className="css-filter-title">Filter by Status</h4>
              {['', 'scheduled', 'completed', 'cancelled', 'no-show'].map(s => (
                <button
                  key={s}
                  className={`css-filter-btn ${statusFilter === s ? 'active' : ''}`}
                  onClick={() => setFilter(s)}
                >
                  {s || 'All Sessions'}
                </button>
              ))}
            </div>

            <div className="css-card css-avail-card">
              <h4 className="css-filter-title">Quick Stats</h4>
              <div className="css-qs-grid">
                <div className="css-qs-item"><span>{sessions.filter(s=>s.status==='scheduled').length}</span><small>Upcoming</small></div>
                <div className="css-qs-item"><span>{sessions.filter(s=>s.status==='completed').length}</span><small>Completed</small></div>
                <div className="css-qs-item"><span>{sessions.filter(s=>s.status==='cancelled').length}</span><small>Cancelled</small></div>
                <div className="css-qs-item"><span>{sessions.filter(s=>s.status==='no-show').length}</span><small>No-Shows</small></div>
              </div>
            </div>
          </div>

          {/* ── Right: session list ── */}
          <div className="css-right">
            <div className="css-header">
              <div>
                <h1 className="css-title">Sessions</h1>
                <p className="css-sub">
                  {selDate ? `Sessions on ${selDate.toLocaleDateString('en-GB', {weekday:'long',day:'numeric',month:'long'})}` : 'All sessions'}
                  {statusFilter && ` · ${statusFilter}`}
                </p>
              </div>
              <button className="css-new-btn" onClick={() => { setEditItem(null); setModal(true); }}>
                <Plus size={16} /> New Session
              </button>
            </div>

            {loading ? (
              <div className="css-loading"><div className="css-spinner" /></div>
            ) : displayed.length === 0 ? (
              <div className="css-empty">
                <CalendarDays size={36} />
                <p>No sessions {selDate ? 'on this day' : 'found'}.</p>
                <button onClick={() => { setEditItem(null); setModal(true); }}>Schedule one →</button>
              </div>
            ) : (
              <div className="css-list">
                {displayed.map(s => (
                  <div key={s._id} className="css-session-card">
                    <div className="css-sc-left">
                      <StatusIcon status={s.status} />
                      <div className="css-sc-info">
                        <span className="css-sc-name">{s.studentName || '—'}</span>
                        <span className="css-sc-meta">
                          {new Date(s.scheduledAt).toLocaleString('en-GB', {
                            weekday:'short', day:'numeric', month:'short',
                            hour:'2-digit', minute:'2-digit'
                          })} · {s.durationMinutes ?? 50}min · {s.type || 'video'}
                        </span>
                        {s.notes && <span className="css-sc-notes">{s.notes}</span>}
                      </div>
                    </div>
                    <div className="css-sc-actions">
                      <span className={`css-pill css-pill-${s.status}`}>{s.status}</span>
                      <button className="css-icon-btn" onClick={() => { setEditItem(s); setModal(true); }}><Edit3 size={14} /></button>
                      <button className="css-icon-btn css-icon-red" onClick={() => handleDelete(s._id)}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {modal && (
        <SessionModal
          students={students}
          initial={editItem}
          onSave={handleSave}
          onClose={() => setModal(false)}
        />
      )}
    </CounsellorLayout>
  );
};

export default CounsellorSessions;