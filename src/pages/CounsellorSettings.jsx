import React, { useEffect, useState } from 'react';
import { 
  User, 
  Bell, 
  Calendar, 
  Shield, 
  Camera, 
  Lock, 
  MessageSquare, 
  Mail, 
  Trash2, 
  Plus, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
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
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('General');
  const [form, setForm] = useState({ bio: '', specialization: '', availability: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    getCounsellorProfile()
      .then(r => {
        const p = r.data.data;
        setProfile(p);
        setForm({ 
          bio: p.bio || '', 
          specialization: p.specialization || '', 
          availability: p.availability || [] 
        });
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
      setIsEditingSchedule(false);
    } catch { showToast('Failed to save. Please try again.'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <CounsellorLayout>
      <div className="cset-loading"><div className="cset-spinner" /></div>
    </CounsellorLayout>
  );

  const renderGeneral = () => (
    <>
      <div className="cset-card">
        <div className="cset-profile-mgmt">
          <div className="cset-profile-left">
            <div className="cset-avatar-wrap">
              <div className="cset-avatar-img" style={{background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#1a2234'}}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="cset-avatar-edit">
                <Camera size={16} />
              </div>
            </div>
            <div>
              <h2 className="cset-pinfo-name">{user?.name}</h2>
              <p className="cset-pinfo-title">
                {form.specialization.split(',')[0] || 'Professional Counselor'} • {user?.institution || 'Institution'}
              </p>
              <div className="cset-tags">
                {(form.specialization || 'General, Counseling').split(',').map((tag, idx) => (
                  <span key={idx} className="cset-tag">{tag.trim()}</span>
                ))}
              </div>
            </div>
          </div>
          <button className="cset-update-btn" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>

        <div className="cset-form-grid">
          <div className="cset-field">
            <label>Name</label>
            <input className="cset-input" value={user?.name} readOnly style={{background: '#f8fafc', color: '#64748b'}} />
          </div>
          <div className="cset-field">
            <label>Email Address</label>
            <input className="cset-input" value={user?.email} readOnly style={{background: '#f8fafc', color: '#64748b'}} />
          </div>
          <div className="cset-field full">
            <label>Specializations (comma separated)</label>
            <input 
              className="cset-input" 
              placeholder="Anxiety, Stress, Career Growth..." 
              value={form.specialization}
              onChange={e => set('specialization', e.target.value)}
            />
          </div>
          <div className="cset-field full">
            <label>Bio / Professional Summary</label>
            <textarea 
              className="cset-textarea" 
              rows={4} 
              placeholder="Tell students about your expertise..."
              value={form.bio}
              onChange={e => set('bio', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="cset-card cset-card-danger">
        <h3 className="cset-danger-title">Delete Account</h3>
        <p className="cset-danger-text">
          Once you delete your account, all data including patient session history will be archived according to regulatory requirements but your access will be removed.
        </p>
        <button className="cset-deactivate-btn">Deactivate Account</button>
      </div>
    </>
  );

  const renderNotifications = () => (
    <div className="cset-card">
      <h3 className="cset-card-title"><Bell size={18} /> Notification Preferences</h3>
      <div className="cset-preference-item">
        <div className="cset-pref-info">
          <h4>Email Alerts</h4>
          <p>Receive session reminders and system updates</p>
        </div>
        <div className="cset-toggle active"><div className="cset-toggle-circle"></div></div>
      </div>
      <div className="cset-preference-item">
        <div className="cset-pref-info">
          <h4>SMS Notifications</h4>
          <p>Urgent cancellation notices via text</p>
        </div>
        <div className="cset-toggle"><div className="cset-toggle-circle"></div></div>
      </div>
    </div>
  );

  const renderSchedule = () => (
    <div className="cset-card">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
        <h3 className="cset-card-title" style={{margin: 0}}><Calendar size={18} /> Schedule Availability</h3>
        <span style={{fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
          <Clock size={14} /> Default View
        </span>
      </div>

      {!isEditingSchedule ? (
        <>
          <div className="cset-schedule-grid">
            {DAYS.map(day => {
              const slots = form.availability.filter(s => s.day === day);
              return (
                <div key={day} className="cset-day-card">
                  <span className="cset-day-name">{day}</span>
                  {slots.length > 0 ? (
                    slots.map((s, i) => (
                      <div key={i} className="cset-day-time">{s.startTime} - {s.endTime}</div>
                    ))
                  ) : (
                    <span className="cset-day-unavailable">Unavailable</span>
                  )}
                </div>
              );
            })}
          </div>
          <button className="cset-full-width-btn" onClick={() => setIsEditingSchedule(true)}>
            Edit Weekly Calendar
          </button>
        </>
      ) : (
        <div className="cset-granular-editor">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <p className="cset-avail-desc">Configure your specific time slots for each day.</p>
            <button className="cset-add-slot-btn" onClick={addSlot} style={{background: '#eef2ff', color: '#6366f1', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
              <Plus size={14} /> Add Slot
            </button>
          </div>

          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem'}}>
            {form.availability.length === 0 ? (
              <p style={{textAlign: 'center', color: '#94a3b8', padding: '2rem'}}>No slots added yet.</p>
            ) : (
              form.availability.map((slot, i) => (
                <div key={i} style={{display: 'flex', gap: '1rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0'}}>
                  <select 
                    value={slot.day} 
                    onChange={e => updateSlot(i, 'day', e.target.value)}
                    style={{padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', flex: 1}}
                  >
                    {DAYS.map(d => <option key={d}>{d}</option>)}
                  </select>
                  <input 
                    type="time" 
                    value={slot.startTime} 
                    onChange={e => updateSlot(i, 'startTime', e.target.value)} 
                    style={{padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                  />
                  <span>to</span>
                  <input 
                    type="time" 
                    value={slot.endTime}   
                    onChange={e => updateSlot(i, 'endTime',   e.target.value)} 
                    style={{padding: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0'}}
                  />
                  <button onClick={() => removeSlot(i)} style={{background: '#fff', border: '1px solid #fee2e2', color: '#ef4444', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer'}}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{display: 'flex', gap: '1rem'}}>
            <button className="cset-full-width-btn" onClick={() => setIsEditingSchedule(false)} style={{flex: 1}}>
              Cancel
            </button>
            <button className="cset-update-btn" onClick={handleSave} disabled={saving} style={{flex: 1}}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderSecurity = () => (
    <div className="cset-card">
      <h3 className="cset-card-title"><Shield size={18} /> Account Security</h3>
      
      <div className="cset-security-item">
        <div className="cset-sec-left">
          <div className="cset-sec-icon success"><ShieldCheck size={20} /></div>
          <div>
            <h4 style={{margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: '#1a2234'}}>Two-Factor Authentication</h4>
            <p style={{margin: 0, fontSize: '0.875rem', color: '#64748b'}}>Enhanced protection for patient confidentiality</p>
          </div>
        </div>
        <span className="cset-status-badge">Active</span>
      </div>

      <div className="cset-security-item">
        <div className="cset-sec-left">
          <div className="cset-sec-icon"><Lock size={20} /></div>
          <div>
            <h4 style={{margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: '#1a2234'}}>Password</h4>
            <p style={{margin: 0, fontSize: '0.875rem', color: '#64748b'}}>Last changed 3 months ago</p>
          </div>
        </div>
        <a href="#" className="cset-sec-link">Change</a>
      </div>
    </div>
  );

  return (
    <CounsellorLayout>
      <div className="cset-page">
        {toast && <div className="cset-toast">{toast}</div>}

        <div className="cset-header-wrap">
          <h1 className="cset-title">Settings</h1>
          <p className="cset-subtitle">Manage your profile, schedule, and security preferences.</p>
        </div>

        <div className="cset-tabs">
          {['General', 'Notifications', 'Schedule', 'Security'].map(tab => (
            <button 
              key={tab} 
              className={`cset-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="cset-content">
          {activeTab === 'General' && renderGeneral()}
          {activeTab === 'Notifications' && renderNotifications()}
          {activeTab === 'Schedule' && renderSchedule()}
          {activeTab === 'Security' && renderSecurity()}
        </div>

        <div style={{textAlign: 'center', marginTop: '3rem', fontSize: '0.75rem', color: '#94a3b8'}}>
          © 2024 Counselor Portal. All healthcare data is encrypted following HIPAA guidelines.
        </div>
      </div>
    </CounsellorLayout>
  );
};

export default CounsellorSettings;