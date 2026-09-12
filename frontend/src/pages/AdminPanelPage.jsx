import React, { useEffect, useState, useContext } from 'react';
import { apiFetch } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { ShieldCheck, UserPlus, Trash2, Edit, Eye, EyeOff } from 'lucide-react';

export const AdminPanelPage = () => {
  const { user: currentUser } = useContext(AuthContext);
  const { addToast } = useContext(NotificationContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Salesperson',
    region_id: 1
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/admin/users');
      setUsers(res.data || []);
    } catch (e) {
      addToast(e.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userForm)
      });
      addToast(`User ${userForm.name} created.`, 'success');
      setIsAddUserOpen(false);
      fetchUsers();
    } catch (e) {
      addToast(e.message, 'danger');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (currentUser && userId === currentUser.user_id) {
      addToast('You cannot change your own role while logged in as Admin.', 'warning');
      return;
    }
    try {
      await apiFetch(`/admin/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole })
      });
      addToast('User role updated.', 'success');
      fetchUsers();
    } catch (e) {
      addToast(e.message, 'danger');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (currentUser && userId === currentUser.user_id) {
      addToast('You cannot delete your own active Admin session account.', 'warning');
      return;
    }
    if (!window.confirm('Are you sure you want to revoke this user account?')) return;
    try {
      await apiFetch(`/admin/users/${userId}`, { method: 'DELETE' });
      addToast('User account removed.', 'success');
      fetchUsers();
    } catch (e) {
      addToast(e.message, 'danger');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="page-header">
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>User Management & Governance</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage user accounts, assign system roles, and configure regional access</span>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAddUserOpen(true)}>
          <UserPlus size={16} /> Register New User
        </button>
      </div>

      {/* Users Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>System Role</th>
                <th>Registered Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>Loading system accounts...</td></tr>
              ) : users.map(u => {
                const isCurrentUser = currentUser && u.user_id === currentUser.user_id;
                return (
                  <tr key={u.user_id}>
                    <td style={{ fontWeight: 700 }}>#{u.user_id}</td>
                    <td style={{ fontWeight: 700 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{u.name}</span>
                        {isCurrentUser && (
                          <span style={{
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(99, 102, 241, 0.15)',
                            color: 'var(--accent-primary)',
                            border: '1px solid rgba(99, 102, 241, 0.3)'
                          }}>
                            You
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="input-field"
                        style={{
                          width: '130px',
                          padding: '4px 8px',
                          fontSize: '0.8rem',
                          opacity: isCurrentUser ? 0.6 : 1,
                          cursor: isCurrentUser ? 'not-allowed' : 'pointer'
                        }}
                        value={u.role}
                        disabled={isCurrentUser}
                        title={isCurrentUser ? 'You cannot change your own role while logged in as Admin' : 'Change user role'}
                        onChange={e => handleRoleChange(u.user_id, e.target.value)}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Salesperson">Salesperson</option>
                      </select>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'System Default'}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(u.user_id)}
                        disabled={isCurrentUser}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isCurrentUser ? 'var(--text-muted)' : 'var(--accent-danger)',
                          cursor: isCurrentUser ? 'not-allowed' : 'pointer',
                          opacity: isCurrentUser ? 0.35 : 1
                        }}
                        title={isCurrentUser ? 'Cannot delete your own active Admin session account' : 'Delete User Account'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <div className="modal-overlay">
          <div className="glass-card modal-content" style={{ maxWidth: '420px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Register New User Account</h3>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Full Name</label>
                <input type="text" className="input-field" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Email Address</label>
                <input type="email" className="input-field" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field"
                    style={{ paddingRight: '40px' }}
                    value={userForm.password}
                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>System Role</label>
                <select className="input-field" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                  <option value="Admin">Admin (Full System Permissions)</option>
                  <option value="Manager">Manager</option>
                  <option value="Salesperson">Salesperson</option>
                </select>
              </div>
              {userForm.role === 'Salesperson' && (
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Assigned Region</label>
                  <select className="input-field" value={userForm.region_id} onChange={e => setUserForm({ ...userForm, region_id: parseInt(e.target.value) })}>
                    <option value="1">North India (Delhi NCR)</option>
                    <option value="2">West India (Mumbai & Pune)</option>
                    <option value="3">South India (Bengaluru)</option>
                    <option value="4">Central India (Hyderabad)</option>
                    <option value="5">East India (Kolkata)</option>
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddUserOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
