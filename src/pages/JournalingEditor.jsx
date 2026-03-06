import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/StudentDashboard/DashboardLayout';
import { Save, ArrowLeft, Tag, X } from 'lucide-react';
import {
  createJournalEntry,
  getJournalEntry,
  updateJournalEntry
} from '../api/journalApi';
import './JournalingEditor.css';

/* ─── Character limit ────────────────────────────────────── */
const CHAR_LIMIT = 3000;

/* ─── Tag input ──────────────────────────────────────────── */
const TagInput = ({ tags, onChange }) => {
  const [input, setInput] = useState('');

  const add = () => {
    const t = input.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 5) {
      onChange([...tags, t]);
    }
    setInput('');
  };

  const remove = (tag) => onChange(tags.filter(t => t !== tag));

  return (
    <div className="je-tag-area">
      <div className="je-tags">
        {tags.map(t => (
          <span key={t} className="je-tag">
            #{t}
            <button className="je-tag-remove" onClick={() => remove(t)}><X size={11}/></button>
          </span>
        ))}
        {tags.length < 5 && (
          <input
            className="je-tag-input"
            placeholder="Add tag…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
            onBlur={add}
            maxLength={30}
          />
        )}
      </div>
    </div>
  );
};

/* ─── Main Editor ────────────────────────────────────────── */
const JournalingEditor = () => {
  const navigate        = useNavigate();
  const location        = useLocation();
  const { id }          = useParams();           // present when editing
  const isEdit          = Boolean(id);

  const selectedPrompt  = location.state?.selectedPrompt;

  const [title,   setTitle]   = useState('');
  const [body,    setBody]    = useState('');
  const [tags,    setTags]    = useState([]);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [toast,   setToast]   = useState(null); // { type: 'warn' | 'limit', msg: string }

  const toastTimerRef = useRef(null);

  // Timestamps for display
  const [createdAt,  setCreatedAt]  = useState(null);
  const [updatedAt,  setUpdatedAt]  = useState(null);

  const bodyRef = useRef(null);

  // ── Cleanup toast timer on unmount ──
  useEffect(() => {
    return () => clearTimeout(toastTimerRef.current);
  }, []);

  // ── Show toast when approaching or hitting the char limit ──
  const prevLengthRef = useRef(0);
  useEffect(() => {
    const prev = prevLengthRef.current;
    const curr = body.length;
    prevLengthRef.current = curr;

    const showToast = (type, msg) => {
      clearTimeout(toastTimerRef.current);
      setToast({ type, msg });
      toastTimerRef.current = setTimeout(() => setToast(null), 4000);
    };

    // Hit limit — only fire once when crossing 3000
    if (curr >= CHAR_LIMIT && prev < CHAR_LIMIT) {
      showToast('limit', 'Character limit reached — 3000 / 3000');
    }
    // Warning zone — only fire once when crossing 2700
    else if (curr >= CHAR_LIMIT * 0.9 && prev < CHAR_LIMIT * 0.9) {
      showToast('warn', `Almost there — ${CHAR_LIMIT - curr} characters left`);
    }
  }, [body]);

  // ── Load existing entry when editing ──
  useEffect(() => {
    if (!isEdit) return;
    getJournalEntry(id)
      .then(res => {
        const e = res.data.data;
        setTitle(e.title === 'Untitled Entry' ? '' : e.title);
        setBody(e.body);
        setTags(e.tags || []);
        setCreatedAt(e.createdAt);
        setUpdatedAt(e.updatedAt);
      })
      .catch(() => setError('Could not load entry.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);



  const handleSave = async () => {
    if (!body.trim()) {
      setError('Write something before saving.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: title.trim() || 'Untitled Entry',
        body:  body.trim(),
        tags,
        prompt: selectedPrompt || undefined
      };

      if (isEdit) {
        await updateJournalEntry(id, payload);
      } else {
        await createJournalEntry(payload);
      }

      // Redirect to journaling home after save
      navigate('/dashboard/journaling', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  // ── Keyboard shortcut Ctrl/Cmd + S ──
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, body, tags]);

  const now = new Date();
  const displayDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : `${now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;

  const displayTime = createdAt
    ? new Date(createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="je-loading">Loading entry…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="je-page">

        {/* ── Top Bar ── */}
        <header className="je-topbar">
          <button className="je-back-btn" onClick={() => navigate('/dashboard/journaling')}>
            <ArrowLeft size={18} />
          </button>

          <div className="je-save-area">
            {error && <span className="je-error-inline">{error}</span>}
            <button
              className="je-save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={15} />
              {saving ? 'Saving…' : isEdit ? 'Save' : 'Save Entry'}
            </button>
          </div>
        </header>

        {/* ── Metadata row ── */}
        <div className="je-meta-row">
          <span className="je-date">{displayDate}</span>
          <span className="je-time">{displayTime}</span>
          {updatedAt && updatedAt !== createdAt && (
            <span className="je-edited-badge">
              Edited {new Date(updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          <span className={`je-wordcount ${body.length >= CHAR_LIMIT ? 'je-wordcount-limit' : body.length >= CHAR_LIMIT * 0.9 ? 'je-wordcount-warn' : ''}`}>
            {body.length} / {CHAR_LIMIT}
          </span>
        </div>

        {/* ── Writing area ── */}
        <div className="je-writing-area">
          <input
            className="je-title-input"
            placeholder="Untitled Entry"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={200}
          />

          {selectedPrompt && !isEdit && (
            <div className="je-prompt-bubble">
              <span className="je-prompt-label">PROMPT</span>
              <p>{selectedPrompt}</p>
            </div>
          )}

          <textarea
            ref={bodyRef}
            className={`je-body-textarea ${body.length >= CHAR_LIMIT ? 'at-limit' : ''}`}
            placeholder="Start writing here… let your thoughts flow freely."
            value={body}
            onChange={e => setBody(e.target.value)}
            maxLength={CHAR_LIMIT}
            spellCheck
          />
        </div>

        {/* ── Tags ── */}
        <div className="je-tags-row">
          <Tag size={14} className="je-tag-icon" />
          <TagInput tags={tags} onChange={setTags} />
        </div>

      </div>

      {/* ── Char limit toast ── */}
      {toast && (
        <div className={`je-toast je-toast-${toast.type}`} onClick={() => setToast(null)}>
          <span className="je-toast-icon">{toast.type === 'limit' ? '🚫' : '⚠️'}</span>
          <span className="je-toast-msg">{toast.msg}</span>
          <button className="je-toast-close" onClick={() => setToast(null)}>✕</button>
        </div>
      )}

    </DashboardLayout>
  );
};

export default JournalingEditor;