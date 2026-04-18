import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Appointments from './pages/Appointments';
import Announcements from './pages/Announcements';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <Register />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/patients" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_DOCTOR']}>
                <Patients />
              </ProtectedRoute>
            } />
            
            <Route path="/doctors" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_PATIENT', 'ROLE_DOCTOR']}>
                <Doctors />
              </ProtectedRoute>
            } />
            
            <Route path="/appointments" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ROLE_PATIENT', 'ROLE_DOCTOR']}>
                <Appointments />
              </ProtectedRoute>
            } />
            
            <Route path="/announcements" element={
              <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
                <Announcements />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
