import React, { useState } from 'react';
import { UserPlus, Eye, EyeOff, CheckCircle2, X } from 'lucide-react';
import AdminLayout from '../components/AdminDashboard/AdminLayout';
import { createStaffUser } from '../api/adminApi';
import './AdminCreateStaff.css';

const AdminCreateStaff = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'counsellor',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [toast,    setToast]    = useState(null);
  const [errors,   setErrors]   = useState({});

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())           e.name     = 'Name is required';
    if (!form.email.trim())          e.email    = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 6)    e.password = 'Minimum 6 characters';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    try {
      await createStaffUser(form);
      showToast(`${form.role.charAt(0).toUpperCase() + form.role.slice(1)} account created for ${form.name}!`);
      setForm({ name: '', email: '', password: '', role: 'counsellor' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create account', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="acs-page">

        {toast && (
          <div className={`acs-toast acs-toast-${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
            {toast.msg}
          </div>
        )}

        <div className="acs-header">
          <h1 className="acs-title">Create Staff Account</h1>
          <p className="acs-sub">Create counsellor or admin accounts for University A.</p>
        </div>

        <div className="acs-card">
          {/* Role selector */}
          <div className="acs-role-toggle">
            {['counsellor', 'admin'].map(r => (
              <button
                key={r}
                className={`acs-role-btn ${form.role === r ? 'active' : ''}`}
                onClick={() => setForm(prev => ({ ...prev, role: r }))}
              >
                {r === 'counsellor' ? '🧑‍⚕️' : '🛡️'} {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <div className="acs-form">
            <div className={`acs-field ${errors.name ? 'error' : ''}`}>
              <label>Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Dr. Sarah Khan"
                autoComplete="off"
              />
              {errors.name && <span className="acs-error">{errors.name}</span>}
            </div>

            <div className={`acs-field ${errors.email ? 'error' : ''}`}>
              <label>Email Address</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="e.g. sarah@university-a.edu"
                autoComplete="off"
              />
              {errors.email && <span className="acs-error">{errors.email}</span>}
            </div>

            <div className={`acs-field ${errors.password ? 'error' : ''}`}>
              <label>Temporary Password</label>
              <div className="acs-pass-wrap">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                />
                <button className="acs-eye" type="button" onClick={() => setShowPass(p => !p)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="acs-error">{errors.password}</span>}
            </div>

            <div className="acs-info-box">
              <strong>Note:</strong> The staff member will log in with these credentials. They should change their password after first login.
            </div>

            <button
              className="acs-submit"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? <span className="acs-mini-spin" /> : <UserPlus size={18} />}
              {loading ? 'Creating…' : `Create ${form.role.charAt(0).toUpperCase() + form.role.slice(1)} Account`}
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminCreateStaff;