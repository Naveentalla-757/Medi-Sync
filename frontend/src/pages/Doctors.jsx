import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Doctors = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.roles.includes('ROLE_ADMIN');
  
  const [doctors, setDoctors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', specialization: '', availability: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/doctors/${formData.id}`, formData);
      } else {
        await api.post('/doctors', formData);
      }
      setShowModal(false);
      fetchDoctors();
    } catch (error) {
      console.error("Error saving doctor:", error);
    }
  };

  const handleEdit = (doctor) => {
    setFormData(doctor);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await api.delete(`/doctors/${id}`);
        fetchDoctors();
      } catch (error) {
        console.error("Error deleting doctor:", error);
      }
    }
  };

  const openNewModal = () => {
    setFormData({ id: null, name: '', specialization: '', availability: '' });
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Doctors Directory</h1>
      </div>

      <div className="dashboard-grid">
        {loading ? (
          <div className="p-4">Loading doctors...</div>
        ) : (
          doctors.map(doctor => (
            <div key={doctor.id} className="card">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{doctor.name}</h3>
                  <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>@{doctor.username || 'N/A'}</div>
                  <span className="badge badge-success mt-2">{doctor.specialization}</span>
                </div>
              </div>
              <p className="text-secondary mb-4" style={{ fontSize: '0.875rem' }}>
                <strong>Availability:</strong> <br/>
                {doctor.availability || 'Contact for availability'}
              </p>
              
              {isAdmin && (
                <div className="flex gap-2" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => handleEdit(doctor)}>
                    <Edit2 size={14} /> Edit
                  </button>
                  <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(doctor.id)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        {doctors.length === 0 && !loading && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <p className="text-secondary">No doctors available in the directory.</p>
          </div>
        )}
      </div>

      {showModal && isAdmin && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{formData.id ? 'Edit Doctor' : 'Add New Doctor'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Doctor Name</label>
                  <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Specialization</label>
                  <input type="text" className="form-control" required value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Availability Schedule</label>
                  <input type="text" className="form-control" placeholder="e.g. Mon-Fri 9AM-5PM" required value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Doctor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
