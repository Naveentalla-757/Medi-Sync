import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { CalendarX, CheckCircle, XCircle } from 'lucide-react';

const Leaves = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.roles.includes('ROLE_ADMIN');
  const isDoctor = user?.roles.includes('ROLE_DOCTOR');
  
  const [leaves, setLeaves] = useState([]);
  const [doctorProfile, setDoctorProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    reason: ''
  });

  const fetchData = async () => {
    try {
      if (isAdmin) {
        const res = await api.get('/leaves');
        setLeaves(res.data);
      } else if (isDoctor) {
        // Need to find this doctor's profile first
        const docsRes = await api.get('/doctors');
        const myProfile = docsRes.data.find(d => d.userId === user.id);
        if (myProfile) {
          setDoctorProfile(myProfile);
          const res = await api.get(`/leaves/doctor/${myProfile.id}`);
          setLeaves(res.data);
        } else {
          setProfileError("Your profile is not fully linked. Please contact the Admin to recreate your account.");
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin, isDoctor, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorProfile) return alert("Doctor profile not linked. Please contact admin.");
    try {
      await api.post('/leaves', {
        doctor: { id: doctorProfile.id },
        ...formData
      });
      setFormData({ startDate: '', endDate: '', reason: '' });
      fetchData();
      alert('Leave requested successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to request leave');
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await api.put(`/leaves/${id}/status`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const getBadge = (status) => {
    if(status === 'APPROVED') return <span className="badge badge-success">Approved</span>;
    if(status === 'REJECTED') return <span className="badge badge-danger">Rejected</span>;
    return <span className="badge badge-warning">Pending</span>;
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title"><CalendarX className="inline mr-2" /> Leave Management</h1>
      </div>

      {profileError && (
        <div className="card mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
          <h3>Profile Error</h3>
          <p>{profileError}</p>
        </div>
      )}

      {isDoctor && !profileError && (
        <div className="card mb-4" style={{ marginBottom: '2rem' }}>
          <h3>Request Time Off</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <div className="flex" style={{ gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Start Date</label>
                <input type="date" className="form-control" min={new Date().toISOString().split('T')[0]} required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">End Date</label>
                <input type="date" className="form-control" min={formData.startDate || new Date().toISOString().split('T')[0]} required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Reason for leave</label>
              <textarea className="form-control" rows="2" required value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Submit Request</button>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              {isAdmin && <th>Doctor</th>}
              <th>Date Range</th>
              <th>Reason</th>
              <th>Status</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {leaves.map(l => (
              <tr key={l.id}>
                <td>#{l.id}</td>
                {isAdmin && <td>{l.doctor?.name}</td>}
                <td>{l.startDate} to {l.endDate}</td>
                <td>{l.reason}</td>
                <td>{getBadge(l.status)}</td>
                {isAdmin && (
                  <td>
                    {l.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--secondary)' }} onClick={() => handleStatus(l.id, 'APPROVED')}>
                          <CheckCircle size={16} />
                        </button>
                        <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }} onClick={() => handleStatus(l.id, 'REJECTED')}>
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {leaves.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? "6" : "5"} className="text-center" style={{ padding: '2rem' }}>No leave requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaves;
