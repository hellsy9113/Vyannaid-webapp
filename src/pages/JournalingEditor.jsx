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
const QUICK_TAGS = ['gratitude', 'reflection', 'mood', 'goals', 'milestone', 'clarity'];

/* ─── Tag input ──────────────────────────────────────────── */
const TagInput = ({ tags, onChange }) => {
  const [input, setInput] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);
  const inputRef = useRef(null);

  const add = (text) => {
    const t = (text || input).trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t) && tags.length < 5) {
      onChange([...tags, t]);
    }
    setInput('');
    if (!text) setIsExpanding(false);
  };

  const remove = (tag) => onChange(tags.filter(t => t !== tag));

  return (
    <div className="je-tag-container">
      <div className="je-tag-header">
        <div className="je-tag-label">
          <Tag size={14} />
          <span>Themes & Tags</span>
        </div>
        <span className="je-tag-count">{tags.length}/5</span>
      </div>

      <div className="je-tags-display">
        {tags.map(t => (
          <span key={t} className="je-tag-pill">
            <span className="je-tag-hash">#</span>
            {t}
            <button className="je-tag-remove" onClick={() => remove(t)} aria-label={`Remove ${t}`}>
              <X size={12} />
            </button>
          </span>
        ))}

        {tags.length < 5 && (
          <div className={`je-tag-input-wrapper ${isExpanding ? 'is-active' : ''}`}>
            {!isExpanding ? (
              <button
                className="je-tag-add-trigger"
                onClick={() => {
                  setIsExpanding(true);
                  setTimeout(() => inputRef.current?.focus(), 10);
                }}
              >
                + Add tag
              </button>
            ) : (
              <input
                ref={inputRef}
                className="je-tag-field"
                placeholder="type and press enter..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    add();
                  } else if (e.key === 'Escape') {
                    setIsExpanding(false);
                    setInput('');
                  }
                }}
                onBlur={() => {
                  if (!input.trim()) setIsExpanding(false);
                  else add();
                }}
                maxLength={25}
              />
            )}
          </div>
        )}
      </div>

      <div className="je-quick-tags">
        <span className="je-quick-label">Suggestions:</span>
        <div className="je-quick-list">
          {QUICK_TAGS.filter(qt => !tags.includes(qt)).map(qt => (
            <button
              key={qt}
              className="je-quick-tag-btn"
              onClick={() => add(qt)}
              disabled={tags.length >= 5}
            >
              #{qt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Editor ────────────────────────────────────────── */
const JournalingEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();           // present when editing
  const isEdit = Boolean(id);

  const selectedPrompt = location.state?.selectedPrompt;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [toast, setToast] = useState(null); // { type: 'warn' | 'limit', msg: string }

  const toastTimerRef = useRef(null);

  // Timestamps for display
  const [createdAt, setCreatedAt] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

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
        body: body.trim(),
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
        <div className="je-loading">
          <div className="je-loading-spinner"></div>
          <span>Preparing your space…</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="je-page fade-in">

        {/* ── Top Bar ── */}
        <header className="je-topbar">
          <div className="je-topbar-left">
            <button className="je-icon-btn" onClick={() => navigate('/dashboard/journaling')} aria-label="Go back">
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <div className="je-meta-info">
              <span className="je-date">{displayDate}</span>
              {updatedAt && updatedAt !== createdAt && (
                <span className="je-edited-dot" title={`Edited ${new Date(updatedAt).toLocaleDateString()}`}></span>
              )}
            </div>
          </div>

          <div className="je-topbar-right">
            <span className={`je-wordcount ${body.length >= CHAR_LIMIT ? 'je-wordcount-limit' : body.length >= CHAR_LIMIT * 0.9 ? 'je-wordcount-warn' : ''}`}>
              {body.length} / {CHAR_LIMIT}
            </span>
            {error && <span className="je-error-inline">{error}</span>}
            <button
              className="je-save-btn"
              onClick={handleSave}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Complete Entry'}
            </button>
          </div>
        </header>

        {/* ── Writing Area ── */}
        <div className="je-writing-container">
          <input
            className="je-title-input"
            placeholder="Give your thoughts a title…"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={200}
          />

          {selectedPrompt && !isEdit && (
            <div className="je-prompt-bubble">
              <div className="je-prompt-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="M4.93 4.93l2.83 2.83"></path><path d="M16.24 16.24l2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="M4.93 19.07l2.83-2.83"></path><path d="M16.24 7.76l2.83-2.83"></path></svg>
              </div>
              <div className="je-prompt-content">
                <span className="je-prompt-label">Daily Inspiration</span>
                <p>{selectedPrompt}</p>
              </div>
            </div>
          )}

          <textarea
            ref={bodyRef}
            className={`je-body-textarea ${body.length >= CHAR_LIMIT ? 'at-limit' : ''}`}
            placeholder="Start writing here. This space is just for you…"
            value={body}
            onChange={e => setBody(e.target.value)}
            maxLength={CHAR_LIMIT}
            spellCheck
          />

          {/* ── Tags (Modern Section) ── */}
          <div className="je-tags-section">
            <TagInput tags={tags} onChange={setTags} />
          </div>
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