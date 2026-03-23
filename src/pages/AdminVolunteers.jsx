import React, { useEffect, useState } from 'react';
import { Search, UserPlus, ShieldCheck, GraduationCap, UserCheck, ChevronDown, X, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import AdminLayout from '../components/AdminDashboard/AdminLayout';
import { listVolunteerApplications, assignVolunteerToCounsellor, removeVolunteer } from '../api/volunteerApi';
import { getAllUsers } from '../api/adminApi';
import './AdminVolunteers.css';

const STATUS_TABS = ['pending', 'assigned', 'approved', 'rejected'];

const statusBadge = (status) => {
  const map = {
    pending:  { label: 'Pending',  cls: 'orange' },
    assigned: { label: 'Assigned', cls: 'blue'   },
    approved: { label: 'Approved', cls: 'green'  },
    rejected: { label: 'Rejected', cls: 'red'    },
  };
  const s = map[status] ?? { label: status, cls: 'grey' };
  return <span className={`av-badge av-badge-${s.cls}`}>{s.label}</span>;
};

const AdminVolunteers = () => {
  const [applications, setApplications] = useState([]);
  const [counsellors,  setCounsellors]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState('pending');
  const [search,       setSearch]       = useState('');
  const [toast,        setToast]        = useState(null);
  const [assignModal,  setAssignModal]  = useState(null); // { appId, name }
  const [detailModal,  setDetailModal]  = useState(null); // application object
  const [selectedC,    setSelectedC]    = useState('');
  const [notes,        setNotes]        = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, counRes] = await Promise.all([
        listVolunteerApplications(tab),
        getAllUsers('counsellor')
      ]);
      setApplications(appRes.data.data ?? []);
      setCounsellors(counRes.data.data ?? []);
    } catch (e) {
      showToast('Score to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [tab]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAssign = async () => {
    if (!selectedC) return showToast('Please select a counsellor', 'error');
    try {
      await assignVolunteerToCounsellor(assignModal._id, { 
        assignedCounsellorId: selectedC,
        adminNotes: notes 
      });
      showToast('Assigned successfully!');
      setAssignModal(null);
      setSelectedC('');
      setNotes('');
      fetchData();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to assign', 'error');
    }
  };

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} as a volunteer?`)) return;
    try {
      await removeVolunteer(id);
      showToast('Volunteer removed.');
      fetchData();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to remove', 'error');
    }
  };

  const filtered = applications.filter(a =>
    a.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="av-page">
        {/* Toast */}
        {toast && (
          <div className={`av-toast av-toast-${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
            {toast.msg}
          </div>
        )}

        {/* Assign Modal */}
        {assignModal && (
          <div className="av-modal-backdrop" onClick={() => setAssignModal(null)}>
            <div className="av-modal" onClick={e => e.stopPropagation()}>
              <h3>Assign to Counsellor</h3>
              <p>Assign <strong>{assignModal.fullName}</strong>'s application to a counsellor for review.</p>
              
              <div className="av-form-group">
                <label>Select Counsellor</label>
                <select value={selectedC} onChange={e => setSelectedC(e.target.value)}>
                  <option value="">Choose a counsellor...</option>
                  {counsellors.map(c => (
                    <option key={c._id} value={c._id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="av-form-group">
                <label>Notes for Counsellor (Optional)</label>
                <textarea 
                  placeholder="Additional context..." 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div className="av-modal-actions">
                <button className="av-modal-cancel" onClick={() => setAssignModal(null)}>Cancel</button>
                <button className="av-modal-confirm" onClick={handleAssign}>Assign Now</button>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {detailModal && (
          <div className="av-modal-backdrop" onClick={() => setDetailModal(null)}>
            <div className="av-modal av-modal-wide" onClick={e => e.stopPropagation()}>
              <div className="av-modal-header">
                <h3>Application Details</h3>
                <button className="av-close-btn" onClick={() => setDetailModal(null)}><X size={20} /></button>
              </div>
              
              <div className="av-detail-scroll">
                <div className="av-detail-section">
                  <h4>Personal & Education</h4>
                  <div className="av-detail-grid">
                    <div className="av-detail-item"><label>Name:</label> <span>{detailModal.fullName}</span></div>
                    <div className="av-detail-item"><label>Email:</label> <span>{detailModal.email}</span></div>
                    <div className="av-detail-item"><label>Phone:</label> <span>{detailModal.phone}</span></div>
                    <div className="av-detail-item"><label>Age/Gender:</label> <span>{detailModal.age} / {detailModal.gender}</span></div>
                    <div className="av-detail-item"><label>Location:</label> <span>{detailModal.location}</span></div>
                    <div className="av-detail-item"><label>College/Dept:</label> <span>{detailModal.collegeDept}</span></div>
                    <div className="av-detail-item"><label>Field of Study:</label> <span>{detailModal.fieldOfStudy} ({detailModal.degree})</span></div>
                    <div className="av-detail-item"><label>Year:</label> <span>{detailModal.yearOfStudy}</span></div>
                  </div>
                </div>

                <div className="av-detail-section">
                  <h4>Motivation & Interest</h4>
                  <div className="av-detail-block">
                    <label>Why do you want to volunteer?</label>
                    <p>{detailModal.whyVolunteer}</p>
                  </div>
                  <div className="av-detail-block">
                    <label>What is your motivation?</label>
                    <p>{detailModal.motivation}</p>
                  </div>
                </div>

                <div className="av-detail-section">
                  <h4>Experience & Skills</h4>
                  <div className="av-detail-item"><label>Experience Types:</label> <span>{detailModal.experienceTypes?.join(', ') || 'None'}</span></div>
                  <div className="av-detail-block">
                    <label>Experience Description:</label>
                    <p>{detailModal.experienceDescription || 'No description provided.'}</p>
                  </div>
                  <div className="av-detail-item"><label>Qualities:</label> <span>{detailModal.qualities?.join(', ') || 'None'}</span></div>
                </div>

                <div className="av-detail-section">
                  <h4>Availability & Commitments</h4>
                  <div className="av-detail-item"><label>Hours per week:</label> <span>{detailModal.hoursPerWeek}</span></div>
                  <div className="av-detail-item"><label>Preferred Time:</label> <span>{detailModal.preferredTime?.join(', ') || 'None'}</span></div>
                  <div className="av-detail-item"><label>Attended Workshops:</label> <span>{detailModal.attendedWorkshops}</span></div>
                </div>

                <div className="av-detail-section">
                  <h4>Acknowledgments</h4>
                  <div className="av-ack-item">{detailModal.understandsRole ? <CheckCircle2 size={14} className="text-green" /> : <X size={14} className="text-red" />} Understands volunteer scope</div>
                  <div className="av-ack-item">{detailModal.willingToEscalate ? <CheckCircle2 size={14} className="text-green" /> : <X size={14} className="text-red" />} Willing to escalate</div>
                  <div className="av-ack-item">{detailModal.agreesToConfidentiality ? <CheckCircle2 size={14} className="text-green" /> : <X size={14} className="text-red" />} Agrees to confidentiality</div>
                  <div className="av-ack-item">{detailModal.treatsWithRespect ? <CheckCircle2 size={14} className="text-green" /> : <X size={14} className="text-red" />} Agrees to treat users with respect</div>
                  <div className="av-ack-item">{detailModal.understandsGuidelines ? <CheckCircle2 size={14} className="text-green" /> : <X size={14} className="text-red" />} Understands guidelines</div>
                </div>
              </div>

              <div className="av-modal-actions">
                <button className="av-modal-cancel" onClick={() => setDetailModal(null)}>Close</button>
                {detailModal.status === 'pending' && (
                  <button className="av-modal-confirm" onClick={() => { setAssignModal(detailModal); setDetailModal(null); }}>
                    Proceed to Assign
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="av-header">
          <h1 className="av-title">Volunteer Applications</h1>
          <p className="av-sub">Review and assign student volunteer applications</p>
        </div>

        <div className="av-toolbar">
          <div className="av-tabs">
            {STATUS_TABS.map(t => (
              <button
                key={t}
                className={`av-tab ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="av-search-wrap">
            <Search size={15} className="av-search-icon" />
            <input
              className="av-search"
              placeholder="Search volunteers…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="av-card">
          {loading ? (
            <div className="av-loading"><div className="av-spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="av-empty">No applications found in this category.</div>
          ) : (
            <table className="av-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Field of Study</th>
                  <th>Status</th>
                  <th>Assigned to</th>
                  <th>Applied On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a._id}>
                    <td>
                      <div className="av-name-cell">
                        <div className="av-avatar">{a.fullName?.charAt(0).toUpperCase()}</div>
                        <div className="av-identity">
                          <span className="av-user-name">{a.fullName}</span>
                          <span className="av-user-email">{a.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="av-field">{a.fieldOfStudy}</td>
                    <td>{statusBadge(a.status)}</td>
                    <td className="av-assigned">
                      {a.assignedCounsellorId ? (
                        <div className="av-c-info">
                          <span>{a.assignedCounsellorId.name}</span>
                        </div>
                      ) : '—'}
                    </td>
                    <td className="av-date">
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="av-actions-row">
                        {a.status === 'pending' && (
                          <button 
                            className="av-action-btn primary" 
                            title="Assign to Counsellor"
                            onClick={() => setAssignModal(a)}
                          >
                            <UserPlus size={16} />
                          </button>
                        )}
                        {a.status === 'approved' && (
                          <button 
                            className="av-action-btn danger" 
                            title="Remove Volunteer"
                            onClick={() => handleRemove(a._id, a.fullName)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                        <button 
                          className="av-action-btn ghost" 
                          title="View Details"
                          onClick={() => setDetailModal(a)}
                        >
                          <Clock size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminVolunteers;
