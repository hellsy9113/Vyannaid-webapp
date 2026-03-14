import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { useAuth } from '../../src/auth/AuthContext';
import CounsellorLayout from '../components/CounsellorDashboard/CounsellorLayout';
import {
  getCounsellorProfile,
  updateCounsellorProfile
} from '../api/counsellorApi';
import './CounsellorSettings.css';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

const CounsellorSettings = () => {
  const { user } = useAuth();
  const [profile,  setProfile]  = useState(null);
  const [form,     setForm]     = useState({ bio: '', specialization: '', availability: [] });
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState('');

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    getCounsellorProfile()
      .then(r => {
        const p = r.data.data;
        setProfile(p);
        setForm({ bio: p.bio || '', specialization: p.specialization || '', availability: p.availability || [] });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const addSlot = () => setForm(f => ({
    ...f,
    availability: [...f.availability, { day: 'Monday', startTime: '09:00', endTime: '11:00' }]
  }));

  const updateSlot = (i, k, v) => setForm(f => ({
    ...f,
    availability: f.availability.map((s, idx) => idx === i ? { ...s, [k]: v } : s)
  }));

  const removeSlot = (i) => setForm(f => ({
    ...f,
    availability: f.availability.filter((_, idx) => idx !== i)
  }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await updateCounsellorProfile(form);
      setProfile(r.data.data);
      showToast('Profile updated successfully!');
    } catch { showToast('Failed to save. Please try again.'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <CounsellorLayout>
      <div className="cset-loading"><div className="cset-spinner" /></div>
    </CounsellorLayout>
  );

  return (
    <CounsellorLayout>
      <div className="cset-page">
        {toast && <div className="cset-toast">{toast}</div>}

        <div className="cset-header">
          <h1 className="cset-title">Settings</h1>
          <button className="cset-save-btn" onClick={handleSave} disabled={saving}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {/* Profile section */}
        <div className="cset-card">
          <div className="cset-card-header">
            <div className="cset-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <p className="cset-uname">{user?.name}</p>
              <p className="cset-uemail">{user?.email}</p>
              <span className="cset-role-pill">Counsellor</span>
            </div>
          </div>

          <div className="cset-fields">
            <div className="cset-field">
              <label>Specialization</label>
              <input
                value={form.specialization}
                onChange={e => set('specialization', e.target.value)}
                placeholder="e.g. Anxiety, Academic Stress, Grief Counselling"
              />
            </div>
            <div className="cset-field">
              <label>Bio <span>(visible to students)</span></label>
              <textarea
                rows={4}
                value={form.bio}
                onChange={e => set('bio', e.target.value)}
                placeholder="Tell students about your approach and experience…"
              />
            </div>
          </div>
        </div>

        {/* Institution section (read-only — set by admin) */}
        <div className="cset-card">
          <h3 className="cset-section-title">Institution</h3>
          <div className="cset-inst-grid">
            <div className="cset-inst-item">
              <span className="cset-inst-label">College / University</span>
              <span className="cset-inst-value">{user?.institution || '—'}</span>
            </div>
            <div className="cset-inst-item">
              <span className="cset-inst-label">Role</span>
              <span className="cset-inst-value">Counsellor</span>
            </div>
            <div className="cset-inst-item">
              <span className="cset-inst-label">Students Assigned</span>
              <span className="cset-inst-value">{profile?.assignedStudents?.length ?? 0}</span>
            </div>
            <div className="cset-inst-item">
              <span className="cset-inst-label">Account Status</span>
              <span className={`cset-status-pill ${profile?.isActive ? 'active' : 'inactive'}`}>
                {profile?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <p className="cset-inst-note">
            Institution details and student assignments are managed by your college admin.
          </p>
        </div>

        {/* Availability */}
        <div className="cset-card">
          <div className="cset-avail-header">
            <h3 className="cset-section-title">Weekly Availability</h3>
            <button className="cset-add-slot-btn" onClick={addSlot}>
              <Plus size={14} /> Add Slot
            </button>
          </div>
          <p className="cset-avail-desc">
            Set your weekly availability so students know when to book sessions with you.
          </p>

          {form.availability.length === 0 ? (
            <div className="cset-no-avail">
              No availability slots set.<br />
              <button onClick={addSlot}>+ Add your first slot</button>
            </div>
          ) : (
            <div className="cset-slot-list">
              {form.availability.map((slot, i) => (
                <div key={i} className="cset-slot-row">
                  <select value={slot.day} onChange={e => updateSlot(i, 'day', e.target.value)}>
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <input type="time" value={slot.startTime} onChange={e => updateSlot(i, 'startTime', e.target.value)} />
                  <span className="cset-to">to</span>
                  <input type="time" value={slot.endTime}   onChange={e => updateSlot(i, 'endTime',   e.target.value)} />
                  <button className="cset-del-slot" onClick={() => removeSlot(i)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </CounsellorLayout>
  );
};

export default CounsellorSettings;