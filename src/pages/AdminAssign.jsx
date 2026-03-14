import React, { useEffect, useState } from 'react';
import { Search, UserCheck, X, CheckCircle2, ChevronDown } from 'lucide-react';
import AdminLayout from '../components/AdminDashboard/AdminLayout';
import { getAllUsers, assignStudentToCounsellor, unassignStudentFromCounsellor } from '../api/adminApi';
import './AdminAssign.css';

const AdminAssign = () => {
  const [counsellors, setCounsellors] = useState([]);
  const [students,    setStudents]    = useState([]);
  const [loading,     setLoading]     = useState(true);

  const [selectedCounsellor, setSelectedCounsellor] = useState(null);
  const [studentSearch,      setStudentSearch]      = useState('');
  const [assigning,          setAssigning]          = useState(null); // studentId being processed
  const [toast,              setToast]              = useState(null);
  const [dropdownOpen,       setDropdownOpen]       = useState(false);

  // counsellor → Set of assigned studentIds (local cache)
  const [assignments, setAssignments] = useState({});

  useEffect(() => {
    Promise.all([getAllUsers('counsellor'), getAllUsers('student')])
      .then(([c, s]) => {
        setCounsellors(c.data.data ?? []);
        setStudents(s.data.data ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const isAssigned = (counsellorId, studentId) => {
    return assignments[counsellorId]?.has(studentId);
  };

  const handleAssign = async (studentId) => {
    if (!selectedCounsellor) return;
    setAssigning(studentId);
    try {
      await assignStudentToCounsellor(selectedCounsellor._id, studentId);
      setAssignments(prev => ({
        ...prev,
        [selectedCounsellor._id]: new Set([...(prev[selectedCounsellor._id] ?? []), studentId])
      }));
      showToast('Student assigned successfully!');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to assign student', 'error');
    } finally {
      setAssigning(null);
    }
  };

  const handleUnassign = async (studentId) => {
    if (!selectedCounsellor) return;
    setAssigning(studentId);
    try {
      await unassignStudentFromCounsellor(selectedCounsellor._id, studentId);
      setAssignments(prev => {
        const next = new Set(prev[selectedCounsellor._id] ?? []);
        next.delete(studentId);
        return { ...prev, [selectedCounsellor._id]: next };
      });
      showToast('Student unassigned.');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to unassign student', 'error');
    } finally {
      setAssigning(null);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.email?.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="aa-page">

        {/* Toast */}
        {toast && (
          <div className={`aa-toast aa-toast-${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
            {toast.msg}
          </div>
        )}

        <div className="aa-header">
          <h1 className="aa-title">Assign Students</h1>
          <p className="aa-sub">Select a counsellor, then assign students to them.</p>
        </div>

        {loading ? (
          <div className="aa-loading"><div className="aa-spinner" /></div>
        ) : (
          <>
            {/* Counsellor picker */}
            <div className="aa-section">
              <label className="aa-label">1. Choose a Counsellor</label>
              <div className="aa-dropdown" onClick={() => setDropdownOpen(p => !p)}>
                {selectedCounsellor ? (
                  <div className="aa-dropdown-selected">
                    <div className="aa-avatar">{selectedCounsellor.name?.charAt(0).toUpperCase()}</div>
                    <span>{selectedCounsellor.name}</span>
                    <span className="aa-email-badge">{selectedCounsellor.email}</span>
                  </div>
                ) : (
                  <span className="aa-dropdown-placeholder">Select counsellor…</span>
                )}
                <ChevronDown size={16} className={`aa-chevron ${dropdownOpen ? 'open' : ''}`} />
              </div>
              {dropdownOpen && (
                <div className="aa-dropdown-list">
                  {counsellors.length === 0 && (
                    <div className="aa-dropdown-empty">No counsellors available.</div>
                  )}
                  {counsellors.map(c => (
                    <div
                      key={c._id}
                      className={`aa-dropdown-item ${selectedCounsellor?._id === c._id ? 'selected' : ''}`}
                      onClick={() => { setSelectedCounsellor(c); setDropdownOpen(false); }}
                    >
                      <div className="aa-avatar sm">{c.name?.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="aa-item-name">{c.name}</div>
                        <div className="aa-item-email">{c.email}</div>
                      </div>
                      {selectedCounsellor?._id === c._id && <CheckCircle2 size={16} className="aa-check" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Student list */}
            {selectedCounsellor && (
              <div className="aa-section">
                <label className="aa-label">2. Assign Students to <strong>{selectedCounsellor.name}</strong></label>

                <div className="aa-search-row">
                  <Search size={16} className="aa-search-icon" />
                  <input
                    className="aa-search"
                    placeholder="Search by name or email…"
                    value={studentSearch}
                    onChange={e => setStudentSearch(e.target.value)}
                  />
                </div>

                <div className="aa-student-list">
                  {filteredStudents.length === 0 && (
                    <div className="aa-empty">No students found.</div>
                  )}
                  {filteredStudents.map(s => {
                    const assigned = isAssigned(selectedCounsellor._id, s._id);
                    const busy     = assigning === s._id;
                    return (
                      <div key={s._id} className={`aa-student-row ${assigned ? 'assigned' : ''}`}>
                        <div className="aa-avatar">{s.name?.charAt(0).toUpperCase()}</div>
                        <div className="aa-user-info">
                          <span className="aa-user-name">{s.name}</span>
                          <span className="aa-user-email">{s.email}</span>
                        </div>
                        {assigned
                          ? <span className="aa-assigned-badge"><CheckCircle2 size={13} /> Assigned</span>
                          : null}
                        <button
                          className={`aa-action-btn ${assigned ? 'unassign' : 'assign'}`}
                          disabled={busy}
                          onClick={() => assigned ? handleUnassign(s._id) : handleAssign(s._id)}
                        >
                          {busy ? <span className="aa-mini-spin" /> : assigned ? <><X size={14} /> Remove</> : <><UserCheck size={14} /> Assign</>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAssign;