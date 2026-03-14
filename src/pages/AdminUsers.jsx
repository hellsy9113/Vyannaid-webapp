import React, { useEffect, useState } from 'react';
import { Search, Trash2, Shield, GraduationCap, UserCheck, ChevronDown, X, CheckCircle2 } from 'lucide-react';
import AdminLayout from '../components/AdminDashboard/AdminLayout';
import { getAllUsers, changeUserRole, deleteUser } from '../api/adminApi';
import './AdminUsers.css';

const ROLE_TABS = ['all', 'student', 'counsellor', 'admin'];

const roleBadge = (role) => {
  const map = {
    student:    { label: 'Student',    cls: 'green'  },
    counsellor: { label: 'Counsellor', cls: 'purple' },
    admin:      { label: 'Admin',      cls: 'yellow' },
  };
  const r = map[role] ?? { label: role, cls: 'grey' };
  return <span className={`au-badge au-badge-${r.cls}`}>{r.label}</span>;
};

const AdminUsers = () => {
  const [users,    setUsers]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState('all');
  const [search,   setSearch]   = useState('');
  const [toast,    setToast]    = useState(null);
  const [confirm,  setConfirm]  = useState(null); // { userId, name }
  const [roleMenu, setRoleMenu] = useState(null);  // userId with open dropdown

  const fetchUsers = (role) => {
    setLoading(true);
    getAllUsers(role === 'all' ? undefined : role)
      .then(r => setUsers(r.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(tab); }, [tab]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleRoleChange = async (userId, newRole) => {
    setRoleMenu(null);
    try {
      await changeUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      showToast('Role updated successfully!');
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await deleteUser(confirm.userId);
      setUsers(prev => prev.filter(u => u._id !== confirm.userId));
      showToast(`${confirm.name} removed.`);
    } catch (e) {
      showToast(e.response?.data?.message || 'Failed to delete user', 'error');
    } finally {
      setConfirm(null);
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="au-page">

        {/* Toast */}
        {toast && (
          <div className={`au-toast au-toast-${toast.type}`}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
            {toast.msg}
          </div>
        )}

        {/* Delete confirm modal */}
        {confirm && (
          <div className="au-modal-backdrop" onClick={() => setConfirm(null)}>
            <div className="au-modal" onClick={e => e.stopPropagation()}>
              <h3>Remove User</h3>
              <p>Are you sure you want to permanently remove <strong>{confirm.name}</strong>? This action cannot be undone.</p>
              <div className="au-modal-actions">
                <button className="au-modal-cancel" onClick={() => setConfirm(null)}>Cancel</button>
                <button className="au-modal-confirm" onClick={handleDelete}>Remove</button>
              </div>
            </div>
          </div>
        )}

        <div className="au-header">
          <h1 className="au-title">Users</h1>
          <p className="au-sub">Manage all users in University A</p>
        </div>

        {/* Role tabs + search */}
        <div className="au-toolbar">
          <div className="au-tabs">
            {ROLE_TABS.map(t => (
              <button
                key={t}
                className={`au-tab ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
          <div className="au-search-wrap">
            <Search size={15} className="au-search-icon" />
            <input
              className="au-search"
              placeholder="Search users…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="au-card">
          {loading ? (
            <div className="au-loading"><div className="au-spinner" /></div>
          ) : filtered.length === 0 ? (
            <div className="au-empty">No users found.</div>
          ) : (
            <table className="au-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="au-name-cell">
                        <div className="au-avatar">{u.name?.charAt(0).toUpperCase()}</div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="au-email">{u.email}</td>
                    <td>
                      <div className="au-role-wrap" style={{ position: 'relative' }}>
                        {roleBadge(u.role)}
                        <button
                          className="au-role-change"
                          title="Change role"
                          onClick={() => setRoleMenu(roleMenu === u._id ? null : u._id)}
                        >
                          <ChevronDown size={13} />
                        </button>
                        {roleMenu === u._id && (
                          <div className="au-role-menu">
                            {['student', 'counsellor', 'admin'].filter(r => r !== u.role).map(r => (
                              <button key={r} className="au-role-opt" onClick={() => handleRoleChange(u._id, r)}>
                                Set as {r}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="au-date">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      <button
                        className="au-delete-btn"
                        title="Remove user"
                        onClick={() => setConfirm({ userId: u._id, name: u.name })}
                      >
                        <Trash2 size={15} />
                      </button>
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

export default AdminUsers;