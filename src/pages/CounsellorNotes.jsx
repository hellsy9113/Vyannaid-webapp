import React, { useEffect, useState, useMemo } from 'react';
import { Search, Plus, Save, Trash2, Lock, Calendar, MoreVertical, ChevronLeft, ChevronRight, FileText, Users, ShieldCheck } from 'lucide-react';
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
  const [students, setStudents] = useState([]);
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [selNote, setSelNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [selStudentId, setSelStudentId] = useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profRes = await getCounsellorProfile();
        const stds = profRes.data.data?.assignedStudents || [];
        setStudents(stds);

        const notesRes = await getCounsellorNotes();
        setNotes(notesRes.data.data || []);
      } catch (err) {
        console.error(err);
        showToast('Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const mappedNotes = useMemo(() => {
    return notes.map(n => {
      const student = students.find(s => s._id === n.studentId);
      return {
        ...n,
        studentName: student ? student.name : 'Unknown Student',
        studentInitials: student ? student.name.split(' ').map(nm => nm[0]).join('').toUpperCase() : '??'
      };
    });
  }, [notes, students]);

  const filteredNotes = useMemo(() => {
    let filtered = mappedNotes.filter(n =>
      n.studentName.toLowerCase().includes(search.toLowerCase()) ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    );
    return filtered;
  }, [mappedNotes, search]);

  const stats = useMemo(() => {
    const now = new Date();
    const studentsWithNotes = new Set(notes.map(n => n.studentId)).size;
    const thisMonth = notes.filter(n => {
      const d = new Date(n.createdAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    return {
      thisMonth,
      total: notes.length,
      studentsCount: studentsWithNotes
    };
  }, [notes]);

  const handleOpenNote = (note) => {
    setSelNote(note);
    setNoteTitle(note.title || '');
    setNoteText(note.content || '');
    setSelStudentId(note.studentId);
    setShowEditor(true);
  };

  const handleNewNote = () => {
    setSelNote(null);
    setNoteTitle('');
    setNoteText('');
    setSelStudentId('');
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!selStudentId || !noteText.trim()) {
      showToast('Please select a student and enter content.');
      return;
    }
    setSaving(true);
    try {
      if (selNote?._id) {
        const r = await updateNote(selNote._id, { title: noteTitle, content: noteText });
        setNotes(ns => ns.map(n => n._id === selNote._id ? r.data.data : n));
        showToast('Note updated.');
      } else {
        const r = await createNote({ studentId: selStudentId, title: noteTitle, content: noteText });
        setNotes(ns => [r.data.data, ...ns]);
        showToast('Note saved.');
      }
      setShowEditor(false);
    } catch { showToast('Failed to save note.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (e, noteId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteNote(noteId);
      setNotes(ns => ns.filter(n => n._id !== noteId));
      if (selNote?._id === noteId) setShowEditor(false);
      showToast('Note deleted.');
    } catch { showToast('Failed to delete.'); }
  };

  return (
    <CounsellorLayout>
      <div className="rep-container">
        {toast && <div className="cn-toast">{toast}</div>}

        <div className="rep-header">
          <div>
            <h1 className="rep-title">Notes Repository</h1>
            <p className="rep-subtitle">Manage and organize {notes.length} student session records</p>
          </div>
          <button className="rep-create-btn" onClick={handleNewNote}>
            <Plus size={18} /> Create New Entry
          </button>
        </div>

        <div className="rep-controls">
          <div className="rep-search-wrapper">
            <Search className="rep-search-icon" size={18} />
            <input
              type="text"
              className="rep-search-input"
              placeholder="Search by student name, date, or keywords..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span className="rep-search-kbd">⌘ K</span>
          </div>
        </div>

        <div className="rep-filter-chips">
          <button className="rep-chip active">All Notes</button>
        </div>

        <div className="rep-card">
          <div className="rep-table-wrapper">
            <table className="rep-table">
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>SESSION DATE</th>
                  <th>SUMMARY</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="rep-loading-cell"><div className="cn-spinner" /></td></tr>
                ) : filteredNotes.length === 0 ? (
                  <tr><td colSpan="5" className="rep-empty-cell">No notes found.</td></tr>
                ) : (
                  filteredNotes.map(n => (
                    <tr key={n._id} onClick={() => handleOpenNote(n)}>
                      <td>
                        <div className="rep-student-info">
                          <div className="rep-avatar">{n.studentInitials}</div>
                          <span className="rep-student-name">{n.studentName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="rep-date-info">
                          <span>{new Date(n.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          <span className="rep-time-mini">{new Date(n.updatedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td>
                        <div className="rep-summary-text">
                          <span className="rep-note-title">{n.title || 'Untitled'}</span>
                          <p className="rep-note-preview">{n.content.slice(0, 100)}...</p>
                        </div>
                      </td>
                      <td>
                        <div className="rep-actions">
                          <button className="rep-action-btn" onClick={(e) => handleDelete(e, n._id)}>
                            <Trash2 size={16} />
                          </button>
                          <button className="rep-action-btn">
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="rep-footer">
            <span className="rep-pagination-info">Showing 1 to {filteredNotes.length} of {notes.length} entries</span>
            <div className="rep-pagination-btns">
              <button className="rep-pag-btn"><ChevronLeft size={16} /> Previous</button>
              <button className="rep-pag-btn next">Next <ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        <div className="rep-stats-grid">
          <div className="rep-stat-card">
            <span className="stat-label">THIS MONTH</span>
            <div className="stat-value-group">
              <span className="stat-number">{stats.thisMonth}</span>
            </div>
            <p className="stat-desc">Notes recorded this month</p>
          </div>
          <div className="rep-stat-card">
            <span className="stat-label">TOTAL RECORDS</span>
            <div className="stat-value-group">
              <span className="stat-number">{stats.total}</span>
            </div>
            <p className="stat-desc">Total notes in repository</p>
          </div>
          <div className="rep-stat-card">
            <span className="stat-label">STUDENTS COVERED</span>
            <div className="stat-value-group">
              <span className="stat-number">{stats.studentsCount}</span>
            </div>
            <p className="stat-desc">Unique students with sessions</p>
          </div>
        </div>

        {/* Note Editor Drawer */}
        {showEditor && (
          <div className="rep-drawer-overlay" onClick={() => setShowEditor(false)}>
            <div className="rep-drawer" onClick={e => e.stopPropagation()}>
              <div className="rep-drawer-header">
                <div className="rep-drawer-title-group">
                  <FileText size={20} />
                  <h2>{selNote ? 'Edit Entry' : 'New Entry'}</h2>
                </div>
                <button className="rep-close-btn" onClick={() => setShowEditor(false)}>&times;</button>
              </div>
              
              <div className="rep-drawer-body">
                <div className="rep-field">
                  <label>Student</label>
                  {!selNote ? (
                    <select 
                      className="rep-input" 
                      value={selStudentId} 
                      onChange={e => setSelStudentId(e.target.value)}
                    >
                      <option value="">Select a student...</option>
                      {students.map(s => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="rep-static-field">{filteredNotes.find(n => n._id === selNote._id)?.studentName}</div>
                  )}
                </div>

                <div className="rep-field">
                  <label>Title</label>
                  <input 
                    className="rep-input" 
                    placeholder="Brief summary title..." 
                    value={noteTitle}
                    onChange={e => setNoteTitle(e.target.value)}
                  />
                </div>

                <div className="rep-field flex-1">
                  <label>Notes Content</label>
                  <textarea 
                    className="rep-textarea" 
                    placeholder="Write detailed session notes here..."
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                  />
                </div>
              </div>

              <div className="rep-drawer-footer">
                <div className="rep-privacy-info">
                  <Lock size={14} /> Private & Encrypted
                </div>
                <div className="rep-drawer-actions">
                  <button className="rep-cancel-btn" onClick={() => setShowEditor(false)}>Cancel</button>
                  <button className="rep-save-btn" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Entry'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CounsellorLayout>
  );
};

export default CounsellorNotes;