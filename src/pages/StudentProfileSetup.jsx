import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { updateProfile } from '../api/profileApi';
import { Check, GraduationCap, BookOpen, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import './StudentProfileSetup.css';

const AVATAR_COLORS = [
  '#1A2234', '#4F46E5', '#0891B2', '#059669',
  '#D97706', '#DC2626', '#9333EA', '#DB2777',
];

const UNIVERSITIES = [
  { id: 'university-a', name: 'University A', location: 'Main Campus' },
];

const COURSES = [
  'B.A. Psychology',
  'B.Sc. Computer Science',
  'B.Sc. Data Science',
  'B.Com. (Hons)',
  'B.A. English Literature',
  'B.A. Sociology',
  'B.Sc. Physics',
  'B.Sc. Mathematics',
  'B.Tech. Computer Engineering',
  'B.A. Economics',
  'M.A. Psychology',
  'M.Sc. Computer Science',
  'MBA',
  'Other',
];

const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i);

const getInitials = (name = '') =>
  name.trim().split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';

const StudentProfileSetup = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [step,   setStep]   = useState(1);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  const [form, setForm] = useState({
    institution:     'University A',
    course:          '',
    courseStartYear: String(new Date().getFullYear()),
    name:            user?.name || '',
    bio:             '',
    avatarColor:     AVATAR_COLORS[0],
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canProceed = () => {
    if (step === 1) return true;
    if (step === 2) return form.course.trim() !== '' && form.courseStartYear !== '';
    if (step === 3) return form.name.trim().length >= 2;
    return false;
  };

  const next = () => {
    if (step < 3) { setStep(s => s + 1); return; }
    handleSubmit();
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setSaving(true);
    setError('');
    try {
      const res = await updateProfile({
        name:            form.name.trim(),
        bio:             form.bio.trim(),
        avatarColor:     form.avatarColor,
        institution:     form.institution,
        course:          form.course,
        courseStartYear: Number(form.courseStartYear),
         profileComplete: true,
      });

      const d = res.data.data;

      // ─── CRITICAL FIX ───────────────────────────────────────────
      // Must set profileComplete: true here so ProtectedRoute stops
      // redirecting this student back to /profile/setup on every render.
      // Without this, the student would loop:
      //   /dashboard/student → ProtectedRoute sees profileComplete=false
      //   → /profile/setup → SetupRoute sees profileComplete=false → renders
      //   → student submits → navigate('/dashboard/student')
      //   → ProtectedRoute sees profileComplete=false (still!) → loop
      // ────────────────────────────────────────────────────────────
      updateUser({
        name:            d.name,
        avatarColor:     d.avatarColor,
        institution:     d.institution,
        course:          d.course,
        courseStartYear: d.courseStartYear,
        profileComplete: true,   // ← unlocks all student routes
      });

      navigate('/dashboard/student', { replace: true });
    } catch {
      setError('Something went wrong. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="sps-page">
      <div className="sps-card">

        {/* Progress dots */}
        <div className="sps-progress">
          {[1, 2, 3].map(n => (
            <div key={n} className={`sps-dot ${step >= n ? 'active' : ''}`} />
          ))}
        </div>

        {/* ── Step 1: Welcome ── */}
        {step === 1 && (
          <div className="sps-step-content">
            <div className="sps-icon-wrap sps-icon-purple">
              <Sparkles size={28} />
            </div>
            <h1 className="sps-title">Welcome to Vyannaid!</h1>
            <p className="sps-subtitle">
              Before we take you to your dashboard, let's set up your student profile.
              It takes less than a minute and helps us personalise your experience.
            </p>
            <div className="sps-welcome-list">
              <div className="sps-wl-item">
                <div className="sps-wl-icon"><GraduationCap size={18} /></div>
                <div>
                  <span className="sps-wl-title">Academic Identity</span>
                  <span className="sps-wl-desc">Connect you with students from your university and course</span>
                </div>
              </div>
              <div className="sps-wl-item">
                <div className="sps-wl-icon"><BookOpen size={18} /></div>
                <div>
                  <span className="sps-wl-title">Personalised Content</span>
                  <span className="sps-wl-desc">Unlock community features, events, and relevant resources</span>
                </div>
              </div>
              <div className="sps-wl-item">
                <div className="sps-wl-icon"><Check size={18} /></div>
                <div>
                  <span className="sps-wl-title">Counsellor Matching</span>
                  <span className="sps-wl-desc">Be matched with a counsellor from your institution</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Academic info ── */}
        {step === 2 && (
          <div className="sps-step-content">
            <div className="sps-icon-wrap sps-icon-blue">
              <GraduationCap size={28} />
            </div>
            <h1 className="sps-title">Your Academic Details</h1>
            <p className="sps-subtitle">This helps us connect you with the right counsellor and community.</p>

            <div className="sps-field">
              <label className="sps-label">University</label>
              <div className="sps-university-card">
                <div className="sps-univ-icon"><GraduationCap size={20} /></div>
                <div className="sps-univ-info">
                  <span className="sps-univ-name">University A</span>
                  <span className="sps-univ-sub">Main Campus</span>
                </div>
                <div className="sps-univ-check"><Check size={14} strokeWidth={3} /></div>
              </div>
              <p className="sps-field-hint">More universities will be added soon.</p>
            </div>

            <div className="sps-field">
              <label className="sps-label">Course / Programme <span className="sps-req">*</span></label>
              <select
                className={`sps-select ${form.course ? 'has-value' : ''}`}
                value={form.course}
                onChange={e => set('course', e.target.value)}
              >
                <option value="">Select your course…</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="sps-field">
              <label className="sps-label">
                <Calendar size={14} /> Year you started <span className="sps-req">*</span>
              </label>
              <select
                className={`sps-select ${form.courseStartYear ? 'has-value' : ''}`}
                value={form.courseStartYear}
                onChange={e => set('courseStartYear', e.target.value)}
              >
                {YEAR_OPTIONS.map(y => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
              </select>
              {form.courseStartYear && (
                <p className="sps-year-hint">
                  → You are currently in Year {new Date().getFullYear() - Number(form.courseStartYear) + 1}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: Personal info ── */}
        {step === 3 && (
          <div className="sps-step-content">
            <div className="sps-icon-wrap sps-icon-green">
              <Sparkles size={28} />
            </div>
            <h1 className="sps-title">Almost Done!</h1>
            <p className="sps-subtitle">Add a personal touch to your profile.</p>

            <div className="sps-avatar-row">
              <div className="sps-avatar" style={{ background: form.avatarColor }}>
                {getInitials(form.name)}
              </div>
              <div className="sps-swatches">
                {AVATAR_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`sps-swatch ${form.avatarColor === c ? 'active' : ''}`}
                    style={{ background: c }}
                    onClick={() => set('avatarColor', c)}
                  >
                    {form.avatarColor === c && <Check size={9} color="white" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="sps-field">
              <label className="sps-label">Full Name <span className="sps-req">*</span></label>
              <input
                className="sps-input"
                value={form.name}
                maxLength={60}
                placeholder="Your full name"
                onChange={e => set('name', e.target.value)}
              />
            </div>

            <div className="sps-field">
              <label className="sps-label">Short Bio <span className="sps-opt">(optional)</span></label>
              <textarea
                className="sps-input sps-textarea"
                value={form.bio}
                rows={2}
                maxLength={300}
                placeholder="A short note about yourself…"
                onChange={e => set('bio', e.target.value)}
              />
              <span className="sps-count">{form.bio.length} / 300</span>
            </div>

            <div className="sps-summary">
              <div className="sps-summary-row">
                <GraduationCap size={14} />
                <span>{form.institution} · {form.course || '—'}</span>
              </div>
              <div className="sps-summary-row">
                <Calendar size={14} />
                <span>
                  Started {form.courseStartYear} · Year {new Date().getFullYear() - Number(form.courseStartYear) + 1}
                </span>
              </div>
            </div>

            {error && <p className="sps-error">{error}</p>}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="sps-footer">
          {step > 1 && (
            <button className="sps-back-btn" onClick={() => setStep(s => s - 1)} disabled={saving}>
              Back
            </button>
          )}
          <button
            className="sps-next-btn"
            onClick={next}
            disabled={!canProceed() || saving}
          >
            {saving ? 'Saving…' : step === 3 ? 'Go to Dashboard' : 'Continue'}
            {!saving && <ArrowRight size={16} />}
          </button>
        </div>

      </div>
    </div>
  );
};

export default StudentProfileSetup;