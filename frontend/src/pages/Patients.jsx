import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', age: '', gender: 'Male', contact: '', medicalHistory: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/patients');
      setPatients(response.data);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.put(`/patients/${formData.id}`, formData);
      } else {
        await api.post('/patients', formData);
      }
      setShowModal(false);
      fetchPatients();
    } catch (error) {
      console.error("Error saving patient:", error);
    }
  };

  const handleEdit = (patient) => {
    setFormData(patient);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await api.delete(`/patients/${id}`);
        fetchPatients();
      } catch (error) {
        console.error("Error deleting patient:", error);
      }
    }
  };

  const openNewModal = () => {
    setFormData({ id: null, name: '', age: '', gender: 'Male', contact: '', medicalHistory: '' });
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Patients Management</h1>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="p-4 text-center">Loading patients...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Name</th>
                <th>Age/Gender</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(patient => (
                <tr key={patient.id}>
                  <td>#{patient.id}</td>
                  <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{patient.username || '-'}</td>
                  <td style={{ fontWeight: 500 }}>{patient.name}</td>
                  <td>{patient.age} / {patient.gender}</td>
                  <td>{patient.contact}</td>
                  <td>
                    <div className="flex gap-2">
                      <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleEdit(patient)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(patient.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {patients.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center" style={{ padding: '2rem' }}>No patients found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{formData.id ? 'Edit Patient' : 'Add New Patient'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" className="form-control" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="flex" style={{ gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Age</label>
                    <input type="number" className="form-control" required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Gender</label>
                    <select className="form-control" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Contact Details</label>
                  <input type="text" className="form-control" required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Medical History</label>
                  <textarea className="form-control" rows="3" value={formData.medicalHistory} onChange={e => setFormData({...formData, medicalHistory: e.target.value})}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
