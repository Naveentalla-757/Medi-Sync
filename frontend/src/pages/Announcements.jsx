import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Megaphone, Trash2 } from 'lucide-react';

const Announcements = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.roles.includes('ROLE_ADMIN');
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState('NORMAL');

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', { title, message, category });
      setTitle('');
      setMessage('');
      setCategory('NORMAL');
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
      alert('Failed to post announcement');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title"><Megaphone className="inline mr-2" /> Global Announcements</h1>
      </div>

      {isAdmin && (
        <div className="card mb-4" style={{ marginBottom: '2rem' }}>
          <h3>Post New Announcement</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            <div className="flex" style={{ gap: '1rem' }}>
              <div className="form-group" style={{ flex: 2 }}>
                <input type="text" className="form-control" placeholder="Announcement Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="NORMAL">Normal</option>
                  <option value="IMPORTANT">Important</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <textarea className="form-control" rows="3" placeholder="Announcement Message..." required value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
            </div>
            <button type="submit" className="btn btn-primary">Broadcast Message</button>
          </form>
        </div>
      )}

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr' }}>
        {announcements.map((a) => (
          <div key={a.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', borderLeft: a.category === 'IMPORTANT' ? '4px solid var(--danger)' : '1px solid var(--border)' }}>
            <div>
              <div className="flex items-center" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
                <h3 style={{ color: a.category === 'IMPORTANT' ? 'var(--danger)' : 'var(--primary)', margin: 0 }}>{a.title}</h3>
                {a.category === 'IMPORTANT' && <span className="badge badge-danger" style={{ fontSize: '0.6rem' }}>IMPORTANT</span>}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {new Date(a.createdAt).toLocaleString()}
              </p>
              <p>{a.message}</p>
            </div>
            {isAdmin && (
              <button className="btn btn-outline" style={{ color: 'var(--danger)', height: 'fit-content' }} onClick={() => handleDelete(a.id)}>
                <Trash2 size={18} />
              </button>
            )}
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="card text-center text-secondary">No announcements available.</div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
