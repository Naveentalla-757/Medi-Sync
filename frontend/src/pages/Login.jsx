import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Activity } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/login', { username, password });
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Activity size={48} color="var(--primary)" style={{ margin: '0 auto 1rem' }} />
          <h2>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to MediSync</p>
        </div>
        
        {error && <div className="mb-4 text-center text-danger p-3" style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem'}}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-control" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-4 text-center text-secondary" style={{ color: 'var(--text-secondary)' }}>
          Contact Admin to get your account credentials.
        </div>
      </div>
    </div>
  );
};

export default Login;
