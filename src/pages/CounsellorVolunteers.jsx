import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageSquare, CheckCircle2, X, Clock, UserCheck, AlertCircle, Trash2 } from 'lucide-react';
import CounsellorLayout from '../components/CounsellorDashboard/CounsellorLayout';
import { listVolunteerApplications, counsellorReviewVolunteer, removeVolunteer } from '../api/volunteerApi';
import './CounsellorVolunteers.css';

const TAB_TYPES = ['Assigned to Me', 'My Volunteers'];

const CounsellorVolunteers = () => {
  const navigate = useNavigate();
  const [tab,          setTab]          = useState('Assigned to Me');
  const [volunteers,   setVolunteers]   = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState('');
  const [toast,        setToast]        = useState(null);
  const [reviewModal,  setReviewModal]  = useState(null); // { appId, name }
  const [notes,        setNotes]        = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const status = tab === 'Assigned to Me' ? 'assigned' : 'approved';
      const res = await listVolunteerApplications(status);
      setVolunteers(res.data.data ?? []);
    } catch (e) {
      showToast('Skill to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [tab]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleReview = async (status) => {
    try {
      await counsellorReviewVolunteer(reviewModal._id, { 
        status, 
        adminNotes: notes 
      });
      showToast(`Volunteer ${status} successfully!`);
      setReviewModal(null);
      setNotes('');
      fetchData();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to review', 'error');
    }
  };

  const [detailModal, setDetailModal] = useState(null);

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove ${name} from your volunteers?`)) return;
    try {
      await removeVolunteer(id);
      showToast('Volunteer removed.');
      fetchData();
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to remove', 'error');
    }
  };

  const handleChat = (volunteerId) => {
    navigate('/dashboard/counsellor/messages', { state: { otherUserId: volunteerId } });
  };

  const filtered = volunteers.filter(v =>
    v.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    v.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CounsellorLayout>
      <div className="cv-page">
        {/* Toast */}
        {toast && (
          <div className={`cv-toast cv-toast-${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
            {toast.msg}
          </div>
        )}

        {/* Review Modal (Enhanced with ALL Details) */}
        {reviewModal && (
          <div className="cv-modal-backdrop" onClick={() => setReviewModal(null)}>
            <div className="cv-modal cv-modal-wide" onClick={e => e.stopPropagation()}>
              <div className="cv-modal-header">
                <h3>Application Review</h3>
                <button className="cv-close-btn" onClick={() => setReviewModal(null)}><X size={20} /></button>
              </div>

              <div className="cv-detail-scroll">
                <div className="cv-detail-section">
                  <h4>Applicant Profile</h4>
                  <div className="cv-detail-grid">
                    <div className="cv-detail-item"><label>Full Name:</label> <span>{reviewModal.fullName}</span></div>
                    <div className="cv-detail-item"><label>Email:</label> <span>{reviewModal.email}</span></div>
                    <div className="cv-detail-item"><label>Phone:</label> <span>{reviewModal.phone}</span></div>
                    <div className="cv-detail-item"><label>Age/Gender:</label> <span>{reviewModal.age} / {reviewModal.gender}</span></div>
                    <div className="cv-detail-item"><label>Location:</label> <span>{reviewModal.location}</span></div>
                    <div className="cv-detail-item"><label>College/Dept:</label> <span>{reviewModal.collegeDept}</span></div>
                    <div className="cv-detail-item"><label>Degree/Field:</label> <span>{reviewModal.degree} - {reviewModal.fieldOfStudy}</span></div>
                    <div className="cv-detail-item"><label>Year of Study:</label> <span>{reviewModal.yearOfStudy}</span></div>
                  </div>
                </div>

                <div className="cv-detail-section">
                  <h4>Motivations & Interest</h4>
                  <div className="cv-detail-block">
                    <label>Why do you want to volunteer?</label>
                    <p>{reviewModal.whyVolunteer}</p>
                  </div>
                  <div className="cv-detail-block">
                    <label>What is your motivation?</label>
                    <p>{reviewModal.motivation}</p>
                  </div>
                </div>

                <div className="cv-detail-section">
                  <h4>Experience & Skills</h4>
                  <div className="cv-detail-item"><label>Experience Types:</label> <span>{reviewModal.experienceTypes?.join(', ') || 'None'}</span></div>
                  {reviewModal.experienceDescription && (
                    <div className="cv-detail-block">
                      <label>Experience Details</label>
                      <p>{reviewModal.experienceDescription}</p>
                    </div>
                  )}
                  <div className="cv-detail-item"><label>Qualities:</label> <span>{reviewModal.qualities?.join(', ') || 'None'}</span></div>
                </div>

                <div className="cv-detail-section">
                  <h4>Availability</h4>
                  <div className="cv-detail-grid">
                    <div className="cv-detail-item"><label>Hours per week:</label> <span>{reviewModal.hoursPerWeek} hrs</span></div>
                    <div className="cv-detail-item"><label>Preferred Times:</label> <span>{reviewModal.preferredTime?.join(', ') || 'Any'}</span></div>
                    <div className="cv-detail-item"><label>Attended Workshops:</label> <span>{reviewModal.attendedWorkshops?.toUpperCase()}</span></div>
                  </div>
                </div>

                <div className="cv-detail-section">
                  <h4>Acknowledgments & Agreements</h4>
                  <div className="cv-ack-list">
                    <div className={`cv-ack-item ${reviewModal.understandsRole ? 'ok' : 'nok'}`}>
                      {reviewModal.understandsRole ? <CheckCircle2 size={16} /> : <X size={16} />} Understands non-therapist role
                    </div>
                    <div className={`cv-ack-item ${reviewModal.willingToEscalate ? 'ok' : 'nok'}`}>
                      {reviewModal.willingToEscalate ? <CheckCircle2 size={16} /> : <X size={16} />} Willing to escalate serious cases
                    </div>
                    <div className={`cv-ack-item ${reviewModal.agreesToConfidentiality ? 'ok' : 'nok'}`}>
                      {reviewModal.agreesToConfidentiality ? <CheckCircle2 size={16} /> : <X size={16} />} Agrees to confidentiality
                    </div>
                    <div className={`cv-ack-item ${reviewModal.treatsWithRespect ? 'ok' : 'nok'}`}>
                      {reviewModal.treatsWithRespect ? <CheckCircle2 size={16} /> : <X size={16} />} Agrees to treat users with respect
                    </div>
                    <div className={`cv-ack-item ${reviewModal.understandsGuidelines ? 'ok' : 'nok'}`}>
                      {reviewModal.understandsGuidelines ? <CheckCircle2 size={16} /> : <X size={16} />} Understands platform guidelines
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="cv-form-group">
                <label>Reviewer Notes / Feedback</label>
                <textarea 
                  placeholder="Decision notes for the admin/volunteer..." 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              <div className="cv-modal-actions">
                <button className="cv-modal-reject" onClick={() => handleReview('rejected')}>Reject Application</button>
                <button className="cv-modal-approve" onClick={() => handleReview('approved')}>Approve Volunteer</button>
              </div>
            </div>
          </div>
        )}

        {/* View Detail Modal (Same structure for consistency) */}
        {detailModal && (
          <div className="cv-modal-backdrop" onClick={() => setDetailModal(null)}>
            <div className="cv-modal cv-modal-wide" onClick={e => e.stopPropagation()}>
              <div className="cv-modal-header">
                <h3>Volunteer Details</h3>
                <button className="cv-close-btn" onClick={() => setDetailModal(null)}><X size={20} /></button>
              </div>
              <div className="cv-detail-scroll">
                {/* Reusing sections for approved volunteers */}
                <div className="cv-detail-section">
                  <h4>Profile</h4>
                  <div className="cv-detail-grid">
                    <div className="cv-detail-item"><label>Name:</label> <span>{detailModal.fullName}</span></div>
                    <div className="cv-detail-item"><label>Email:</label> <span>{detailModal.email}</span></div>
                    <div className="cv-detail-item"><label>Field:</label> <span>{detailModal.fieldOfStudy}</span></div>
                  </div>
                </div>
                <div className="cv-detail-section">
                  <h4>Original Application Responses</h4>
                  <div className="cv-detail-block"><label>Why Volunteer?</label><p>{detailModal.whyVolunteer}</p></div>
                  <div className="cv-detail-block"><label>Motivation</label><p>{detailModal.motivation}</p></div>
                  <div className="cv-detail-item"><label>Hours Committed:</label> <span>{detailModal.hoursPerWeek} hrs / week</span></div>
                </div>
              </div>
              <div className="cv-modal-actions">
                <button className="cv-modal-reject" style={{ background: '#f1f5f9' }} onClick={() => setDetailModal(null)}>Close</button>
              </div>
            </div>
          </div>
        )}

        <div className="cv-header">
          <h1 className="cv-title">Volunteers</h1>
          <p className="cv-sub">Manage and support the peer volunteer team</p>
        </div>

        <div className="cv-toolbar">
          <div className="cv-tabs">
            {TAB_TYPES.map(t => (
              <button
                key={t}
                className={`cv-tab ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="cv-search-wrap">
            <Search size={15} className="cv-search-icon" />
            <input
              className="cv-search"
              placeholder="Search volunteers…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="cv-main-grid">
          {loading ? (
            <div className="cv-loading"><div className="cv-spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="cv-empty">
              <AlertCircle size={40} />
              <p>No volunteers found in this section.</p>
            </div>
          ) : (
            <div className="cv-list">
              {filtered.map(v => (
                <div key={v._id} className="cv-item-card">
                  <div className="cv-card-header">
                    <div className="cv-avatar">{v.fullName?.charAt(0).toUpperCase()}</div>
                    <div className="cv-info">
                      <h3 className="cv-v-name">{v.fullName}</h3>
                      <p className="cv-v-email">{v.email}</p>
                    </div>
                  </div>
                  
                  <div className="cv-card-details">
                    <div className="cv-detail-row">
                      <span>Field:</span>
                      <strong>{v.fieldOfStudy}</strong>
                    </div>
                    <div className="cv-detail-row">
                      <span>Applied:</span>
                      <strong>{new Date(v.createdAt).toLocaleDateString()}</strong>
                    </div>
                  </div>

                  <div className="cv-card-actions">
                    {tab === 'Assigned to Me' ? (
                      <button className="cv-action-primary" onClick={() => setReviewModal(v)}>
                        <UserCheck size={18} /> Review Application
                      </button>
                    ) : (
                      <>
                        <button className="cv-action-chat" onClick={() => handleChat(v.userId._id)}>
                          <MessageSquare size={18} /> Chat
                        </button>
                        <button className="cv-action-danger" onClick={() => setDetailModal(v)}>
                          <Search size={18} /> Details
                        </button>
                        <button className="cv-action-danger" onClick={() => handleRemove(v._id, v.fullName)}>
                          <Trash2 size={18} /> Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CounsellorLayout>
  );
};

export default CounsellorVolunteers;
