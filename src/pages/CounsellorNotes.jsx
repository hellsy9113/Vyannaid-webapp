import React, { useEffect, useState } from 'react';
import { Search, Plus, Save, Trash2, Lock, Calendar } from 'lucide-react';
import CounsellorLayout from '../components/CounsellorDashboard/CounsellorLayout';
import {
  getCounsellorProfile,
  getCounsellorNotes,
  createNote,
  updateNote,
  deleteNote
} from '../api/counsellorApi';
import './CounsellorNotes.css';

const CounsellorNotes = () => {
  const [students,  setStudents]  = useState([]);
  const [notes,     setNotes]     = useState([]);
  const [selStudent, setSelStudent] = useState(null);
  const [selNote,    setSelNote]  = useState(null);
  const [noteText,   setNoteText] = useState('');
  const [noteTitle,  setNoteTitle] = useState('');
  const [search,    setSearch]    = useState('');
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [toast,     setToast]     = useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    getCounsellorProfile()
      .then(r => setStudents(r.data.data?.assignedStudents || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selStudent) { setNotes([]); return; }
    getCounsellorNotes(selStudent._id)
      .then(r => setNotes(r.data.data || []))
      .catch(() => setNotes([]));
    setSelNote(null); setNoteText(''); setNoteTitle('');
  }, [selStudent]);

  const openNote = (note) => {
    setSelNote(note);
    setNoteTitle(note.title || '');
    setNoteText(note.content || '');
  };

  const newNote = () => {
    setSelNote({ _id: null });
    setNoteTitle('');
    setNoteText('');
  };

  const handleSave = async () => {
    if (!selStudent || !noteText.trim()) return;
    setSaving(true);
    try {
      if (selNote?._id) {
        const r = await updateNote(selNote._id, { title: noteTitle, content: noteText });
        setNotes(ns => ns.map(n => n._id === selNote._id ? r.data.data : n));
        showToast('Note updated.');
      } else {
        const r = await createNote({ studentId: selStudent._id, title: noteTitle, content: noteText });
        setNotes(ns => [r.data.data, ...ns]);
        setSelNote(r.data.data);
        showToast('Note saved.');
      }
    } catch { showToast('Failed to save note.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selNote?._id || !window.confirm('Delete this note?')) return;
    try {
      await deleteNote(selNote._id);
      setNotes(ns => ns.filter(n => n._id !== selNote._id));
      setSelNote(null); setNoteText(''); setNoteTitle('');
      showToast('Note deleted.');
    } catch { showToast('Failed to delete.'); }
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CounsellorLayout>
      <div className="cn-page">
        {toast && <div className="cn-toast">{toast}</div>}

        {/* Column 1: student selector */}
        <div className="cn-col cn-students-col">
          <div className="cn-col-header">
            <h3 className="cn-col-title">Students</h3>
          </div>
          <div className="cn-search">
            <Search size={14} />
            <input placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="cn-student-list">
            {loading ? <div className="cn-load"><div className="cn-spinner" /></div> :
              filteredStudents.map(s => (
                <button
                  key={s._id}
                  className={`cn-student-btn ${selStudent?._id === s._id ? 'active' : ''}`}
                  onClick={() => setSelStudent(s)}
                >
                  <span className="cn-s-avatar">{s.name?.charAt(0).toUpperCase()}</span>
                  <span className="cn-s-name">{s.name}</span>
                </button>
              ))
            }
          </div>
        </div>

        {/* Column 2: note list */}
        <div className="cn-col cn-notes-col">
          <div className="cn-col-header">
            <h3 className="cn-col-title">
              {selStudent ? `${selStudent.name}'s Notes` : 'Notes'}
            </h3>
            {selStudent && (
              <button className="cn-add-btn" onClick={newNote}><Plus size={14} /> New</button>
            )}
          </div>

          {!selStudent ? (
            <div className="cn-placeholder">Select a student to view notes.</div>
          ) : notes.length === 0 ? (
            <div className="cn-placeholder">
              No notes yet.<br />
              <button onClick={newNote}>+ Create first note</button>
            </div>
          ) : (
            <div className="cn-note-list">
              {notes.map(n => (
                <button
                  key={n._id}
                  className={`cn-note-item ${selNote?._id === n._id ? 'active' : ''}`}
                  onClick={() => openNote(n)}
                >
                  <div className="cn-ni-title">{n.title || 'Untitled note'}</div>
                  <div className="cn-ni-meta">
                    <Calendar size={11} />
                    {new Date(n.updatedAt || n.createdAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </div>
                  <div className="cn-ni-preview">{n.content?.slice(0, 60)}…</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Column 3: note editor */}
        <div className="cn-col cn-editor-col">
          {!selNote ? (
            <div className="cn-editor-placeholder">
              <Lock size={28} />
              <p>Select or create a note.</p>
              <span className="cn-priv-notice">All notes are private to you only.</span>
            </div>
          ) : (
            <div className="cn-editor">
              <div className="cn-editor-header">
                <input
                  className="cn-title-input"
                  placeholder="Note title…"
                  value={noteTitle}
                  onChange={e => setNoteTitle(e.target.value)}
                />
                <div className="cn-editor-actions">
                  <button className="cn-save-btn" onClick={handleSave} disabled={saving}>
                    <Save size={14} /> {saving ? 'Saving…' : 'Save'}
                  </button>
                  {selNote._id && (
                    <button className="cn-del-btn" onClick={handleDelete}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <textarea
                className="cn-textarea"
                placeholder="Write your session notes here… These are confidential and only visible to you."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
              />
              <div className="cn-priv-footer">
                <Lock size={12} /> Private note — not visible to student or admin
              </div>
            </div>
          )}
        </div>
      </div>
    </CounsellorLayout>
  );
};

export default CounsellorNotes;