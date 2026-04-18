import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Activity, Settings, X } from 'lucide-react';
import api from '../api/axios';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/change-password', { newPassword });
      setMsg(res.data.message || 'Password updated successfully!');
      setNewPassword('');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to update password');
    }
  };

  if (!user) return null; // Don't show navbar on login/register pages

  return (
    <>
      <nav className="navbar">
        <div className="nav-brand">
          <Activity size={24} />
          MediSync
        </div>
        <div className="nav-links">
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
          {user.roles.includes('ROLE_ADMIN') && (
            <>
              <Link to="/patients" className="nav-link">Patients</Link>
              <Link to="/doctors" className="nav-link">Doctors</Link>
              <Link to="/announcements" className="nav-link">Announcements</Link>
              <Link to="/register" className="nav-link">Add User</Link>
            </>
          )}
          <Link to="/appointments" className="nav-link">Appointments</Link>

          <button className="btn btn-outline" style={{ padding: '0.5rem', color: 'var(--text-secondary)' }} onClick={() => setShowSettings(true)} title="Settings">
            <Settings size={18} />
          </button>
          <button className="btn btn-outline" onClick={handleLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </nav>

      {showSettings && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Account Settings</h3>
              <button className="close-btn" onClick={() => setShowSettings(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div className="modal-body">
                {msg && <div className="mb-4 text-center p-2" style={{backgroundColor: 'var(--surface-hover)', borderRadius: '0.25rem'}}>{msg}</div>}
                <div className="form-group">
                  <label className="form-label">Username</label>
                  <input type="text" className="form-control" readOnly value={user.username} disabled />
                  <small className="text-secondary">Username cannot be changed.</small>
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-control" required minLength="6" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowSettings(false)}>Close</button>
                <button type="submit" className="btn btn-primary">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
