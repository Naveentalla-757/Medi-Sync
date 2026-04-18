import React, { useState, useEffect, useContext } from 'react';
import api from '../api/axios';
import { Plus, X, Check, XCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Appointments = () => {
  const { user } = useContext(AuthContext);
  const isPatient = user?.roles.includes('ROLE_PATIENT');
  const isAdmin = user?.roles.includes('ROLE_ADMIN');
  const isDoctor = user?.roles.includes('ROLE_DOCTOR');
  const isAdminOrDoctor = isAdmin || isDoctor;

  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [activeAppointment, setActiveAppointment] = useState(null);
  const [notes, setNotes] = useState('');
  
  const [formData, setFormData] = useState({ 
    patientId: '', 
    doctorId: '', 
    date: '', 
    time: '',
    symptoms: '',
    emergency: false
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, docRes] = await Promise.all([
        api.get('/appointments').catch(() => ({data: []})),
        api.get('/doctors').catch(() => ({data: []}))
      ]);
      let allApps = appRes.data;
      if (isPatient) {
        allApps = allApps.filter(a => a.patient?.userId === user.id);
      } else if (isDoctor) {
        allApps = allApps.filter(a => a.doctor?.userId === user.id);
      }
      setAppointments(allApps);
      setDoctors(docRes.data);

      if (isAdminOrDoctor) {
        const patRes = await api.get('/patients').catch(() => ({data: []}));
        setPatients(patRes.data);
      } else if (isPatient) {
        const patRes = await api.get('/patients').catch(() => ({data: []}));
        const myProfile = patRes.data.find(p => p.userId === user.id);
        if (myProfile) {
          setFormData(prev => ({ ...prev, patientId: myProfile.id }));
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientId) {
      alert("Error: Your clinical profile is not fully linked to your account. Please contact the Admin to recreate your account.");
      return;
    }
    try {
      const payload = {
        patient: { id: formData.patientId },
        doctor: { id: formData.doctorId },
        date: formData.date,
        time: formData.time + ":00", // Backend LocalTime usually requires seconds
        symptoms: formData.symptoms,
        emergency: formData.emergency
      };
      
      await api.post('/appointments', payload);
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert(error.response?.data?.message || error.response?.data?.error || "Failed to book appointment. Please check inputs.");
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      fetchData();
    } catch (error) {
      console.error("Error updating appointment:", error);
    }
  };

  const saveNotes = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/appointments/${activeAppointment.id}`, { prescriptionNotes: notes });
      setShowNotesModal(false);
      fetchData();
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const openNewModal = () => {
    setFormData(prev => ({ 
      patientId: isPatient ? prev.patientId : '', 
      doctorId: '', 
      date: '', 
      time: '', 
      symptoms: '', 
      emergency: false 
    }));
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'COMPLETED': return <span className="badge badge-success">Completed</span>;
      case 'CANCELLED': return <span className="badge badge-danger">Cancelled</span>;
      default: return <span className="badge badge-warning">Booked</span>;
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Appointments</h1>
        {!isDoctor && (
          <button className="btn btn-primary" onClick={openNewModal}>
            <Plus size={16} /> Book Appointment
          </button>
        )}
      </div>

      <div className="table-container">
        {loading ? (
          <div className="p-4 text-center">Loading appointments...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Symptoms</th>
                <th>Status</th>
                <th>Notes</th>
                {isAdminOrDoctor && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => (
                <tr key={app.id} style={{ backgroundColor: app.emergency ? 'rgba(239, 68, 68, 0.05)' : '' }}>
                  <td>
                    #{app.id} 
                    {app.emergency && <span className="badge badge-danger" style={{ marginLeft: '0.5rem', fontSize: '0.6rem' }}>EMERGENCY</span>}
                  </td>
                  <td style={{ fontWeight: 500 }}>{app.patient?.name}</td>
                  <td>{app.doctor?.name} ({app.doctor?.specialization})</td>
                  <td>{app.date} at {app.time}</td>
                  <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.symptoms}>
                    {app.symptoms || '-'}
                  </td>
                  <td>{getStatusBadge(app.status)}</td>
                  <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.prescriptionNotes}>
                    {app.prescriptionNotes || '-'}
                  </td>
                  {isAdminOrDoctor && (
                    <td>
                      <div className="flex gap-2">
                        {app.status === 'BOOKED' && (
                          <>
                            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--secondary)' }} onClick={() => handleStatusUpdate(app.id, 'COMPLETED')} title="Mark Completed">
                              <Check size={16} />
                            </button>
                            <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', color: 'var(--danger)' }} onClick={() => handleStatusUpdate(app.id, 'CANCELLED')} title="Cancel">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {app.status === 'COMPLETED' && (
                          <button className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => { setActiveAppointment(app); setNotes(app.prescriptionNotes || ''); setShowNotesModal(true); }}>
                            Add Notes
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {appointments.length === 0 && (
                <tr>
                  <td colSpan={isAdminOrDoctor ? "6" : "5"} className="text-center" style={{ padding: '2rem' }}>No appointments found.</td>
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
              <h3>Book New Appointment</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {isAdminOrDoctor ? (
                  <div className="form-group">
                    <label className="form-label">Select Patient</label>
                    <select className="form-control" required value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})}>
                      <option value="">-- Choose Patient --</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                ) : null}
                
                <div className="form-group">
                  <label className="form-label">Select Doctor</label>
                  <select className="form-control" required value={formData.doctorId} onChange={e => setFormData({...formData, doctorId: e.target.value})}>
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                    ))}
                  </select>
                  {formData.doctorId && (
                    <small className="text-secondary" style={{ display: 'block', marginTop: '0.5rem' }}>
                      <strong>Availability:</strong> {doctors.find(d => d.id == formData.doctorId)?.availability || 'Not specified'}
                    </small>
                  )}
                </div>
                
                <div className="flex" style={{ gap: '1rem' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" required min={new Date().toISOString().split('T')[0]} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Time</label>
                    <input type="time" className="form-control" required value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Symptoms</label>
                  <textarea className="form-control" rows="2" placeholder="Describe your symptoms briefly..." value={formData.symptoms} onChange={e => setFormData({...formData, symptoms: e.target.value})}></textarea>
                </div>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input type="checkbox" id="emergency" checked={formData.emergency} onChange={e => setFormData({...formData, emergency: e.target.checked})} style={{ width: '1.2rem', height: '1.2rem' }} />
                  <label htmlFor="emergency" style={{ color: 'var(--danger)', fontWeight: 600, cursor: 'pointer' }}>Mark as Emergency</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Book Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNotesModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Prescription / Notes</h3>
              <button className="close-btn" onClick={() => setShowNotesModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={saveNotes}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Medical Notes</label>
                  <textarea className="form-control" rows="5" required value={notes} onChange={e => setNotes(e.target.value)}></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowNotesModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Notes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
