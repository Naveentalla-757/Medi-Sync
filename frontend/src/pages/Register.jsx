import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Activity } from 'lucide-react';

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PATIENT');
  
  // Extra fields
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [contact, setContact] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [availability, setAvailability] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const generatedUsername = fullName.trim().toLowerCase().replace(/\s+/g, '') + Math.floor(1000 + Math.random() * 9000);
    
    try {
      const payload = {
        username: generatedUsername,
        password,
        role,
        fullName,
        ...(role === 'PATIENT' ? { age: parseInt(age, 10), gender, contact } : {}),
        ...(role === 'DOCTOR' ? { specialization, availability } : {})
      };

      await api.post('/auth/register', payload);
      setSuccess(`Successfully created ${role} account! Username: ${generatedUsername}`);
      
      // Reset form
      setFullName('');
      setPassword('');
      setAge('');
      setGender('');
      setContact('');
      setSpecialization('');
      setAvailability('');
      setRole('PATIENT');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <div className="auth-header">
          <Activity size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h2>Add New User</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Create credentials for doctors and patients</p>
        </div>
        
        {error && <div className="mb-4 text-center text-danger p-3" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem'}}>{error}</div>}
        {success && <div className="mb-4 text-center p-3" style={{backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem', color: 'var(--primary)'}}>{success}</div>}
        
        <form onSubmit={handleRegister}>
          <div className="flex" style={{ gap: '1rem', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '1 1 calc(50% - 1rem)' }}>
              <label className="form-label">Full Name</label>
              <input type="text" className="form-control" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. John Doe" required />
            </div>
            <div className="form-group" style={{ flex: '1 1 calc(50% - 1rem)' }}>
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-control" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="PATIENT">Patient</option>
              <option value="DOCTOR">Doctor</option>
            </select>
          </div>

          <div style={{ padding: '1.5rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              {role === 'PATIENT' ? 'Patient Details' : 'Doctor Details'}
            </h4>
            
            {role === 'PATIENT' && (
              <div className="flex" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 calc(33% - 1rem)' }}>
                  <label className="form-label">Age</label>
                  <input type="number" className="form-control" value={age} onChange={(e) => setAge(e.target.value)} required />
                </div>
                <div className="form-group" style={{ flex: '1 1 calc(33% - 1rem)' }}>
                  <label className="form-label">Gender</label>
                  <select className="form-control" value={gender} onChange={(e) => setGender(e.target.value)} required>
                    <option value="">--Select--</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 calc(33% - 1rem)' }}>
                  <label className="form-label">Contact</label>
                  <input type="text" className="form-control" value={contact} onChange={(e) => setContact(e.target.value)} required />
                </div>
              </div>
            )}

            {role === 'DOCTOR' && (
              <div className="flex" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 100%' }}>
                  <label className="form-label">Specialization</label>
                  <input type="text" className="form-control" value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="e.g. Cardiologist" required />
                </div>
                <div className="form-group" style={{ flex: '1 1 100%' }}>
                  <label className="form-label">Availability</label>
                  <input type="text" className="form-control" value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="e.g. Mon-Fri 9AM-5PM" required />
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
