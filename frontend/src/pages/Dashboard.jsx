import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Users, Calendar as CalendarIcon, Clock, Activity, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const parseSafeDate = (dateStr, timeStr) => {
  // timeStr usually comes as HH:mm:ss
  return new Date(`${dateStr}T${timeStr}`);
};

const MiniCalendar = ({ appointments }) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const days = Array.from({length: 14}).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  return (
    <div className="flex" style={{ gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
      {days.map((d, i) => {
        const dateStr = d.toISOString().split('T')[0];
        const dayApps = appointments.filter(a => a.date === dateStr && a.status === 'BOOKED');
        const hasApps = dayApps.length > 0;
        return (
          <div key={i} style={{ 
            minWidth: '65px', 
            padding: '0.5rem', 
            borderRadius: '0.5rem',
            border: hasApps ? '2px solid var(--primary)' : '1px solid var(--border)',
            backgroundColor: hasApps ? 'rgba(37, 99, 235, 0.05)' : 'var(--surface)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.toLocaleDateString('en-US', {weekday: 'short'})}</div>
            <div style={{ fontWeight: 'bold', margin: '0.25rem 0', fontSize: '1.25rem' }}>{d.getDate()}</div>
            {hasApps && <div style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 'bold' }}>{dayApps.length} apps</div>}
          </div>
        )
      })}
    </div>
  )
}

const Timer = ({ nextApp }) => {
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    if (!nextApp) return;
    const updateTimer = () => {
      const target = parseSafeDate(nextApp.date, nextApp.time);
      const now = new Date();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft('Happening Now');
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hrs}h ${mins}m ${secs}s`);
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextApp]);

  if (!nextApp) return <span className="text-secondary" style={{ fontSize: '1rem', fontWeight: 'normal' }}>No appointments scheduled for today</span>;
  return <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', fontFamily: 'monospace' }}>{timeLeft}</div>;
}

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user.roles.includes('ROLE_ADMIN');
  const isDoctor = user.roles.includes('ROLE_DOCTOR');
  const isPatient = user.roles.includes('ROLE_PATIENT');

  const [announcements, setAnnouncements] = useState([]);
  
  // Admin Data
  const [adminStats, setAdminStats] = useState({ daily: 0, weekly: 0, monthly: 0, chartData: [] });
  
  // Doctor/Patient Data
  const [appointments, setAppointments] = useState([]);
  const [nextAppointment, setNextAppointment] = useState(null);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const annRes = await api.get('/announcements');
        setAnnouncements(annRes.data.slice(0, 3));

        if (isAdmin) {
          const pRes = await api.get('/patients');
          const patients = pRes.data;
          const now = new Date();
          let d=0, w=0, m=0;
          
          // Generate last 7 days chart data
          const last7Days = Array.from({length: 7}).map((_, i) => {
            const dt = new Date();
            dt.setDate(dt.getDate() - (6 - i));
            return {
              name: dt.toLocaleDateString('en-US', { weekday: 'short' }),
              dateStr: dt.toISOString().split('T')[0],
              patients: 0
            };
          });
          
          patients.forEach(p => {
            if (!p.createdAt) return;
            const pDate = new Date(p.createdAt);
            const diffTime = Math.abs(now - pDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
            
            if (diffDays <= 1) d++;
            if (diffDays <= 7) w++;
            if (diffDays <= 30) m++;
            
            // Populate chart data
            const dateOnlyStr = p.createdAt.split('T')[0];
            const chartDay = last7Days.find(day => day.dateStr === dateOnlyStr);
            if (chartDay) chartDay.patients++;
          });
          
          setAdminStats({ daily: d, weekly: w, monthly: m, chartData: last7Days });
        } 
        
        if (isDoctor || isPatient) {
          let myApps = [];
          if (isDoctor) {
            // safely find doctor id
            const docsRes = await api.get('/doctors');
            const myProfile = docsRes.data.find(doc => doc.userId === user.id);
            if (myProfile) {
              const appRes = await api.get('/appointments');
              myApps = appRes.data.filter(a => a.doctor?.id === myProfile.id);
            } else {
              setProfileError("Profile unlinked. Contact admin to recreate account.");
            }
          } else if (isPatient) {
             const appRes = await api.get('/appointments');
             myApps = appRes.data.filter(a => a.patient?.userId === user.id);
          }

          // Sort by date and time
          myApps.sort((a, b) => parseSafeDate(a.date, a.time) - parseSafeDate(b.date, b.time));
          setAppointments(myApps);

          // Find next upcoming
          const now = new Date();
          const upcoming = myApps.filter(a => a.status === 'BOOKED' && parseSafeDate(a.date, a.time) > now);
          if (upcoming.length > 0) {
            setNextAppointment(upcoming[0]);
          }
        }

      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      }
    };
    
    fetchData();
  }, [user, isAdmin, isDoctor, isPatient]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {user.username}</h1>
      </div>

      {announcements.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 className="mb-4" style={{ color: 'var(--text)' }}>Latest Announcements</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {announcements.map(a => (
              <div key={a.id} style={{ 
                padding: '1rem', 
                borderLeft: a.category === 'IMPORTANT' ? '4px solid var(--danger)' : '4px solid var(--primary)', 
                backgroundColor: a.category === 'IMPORTANT' ? 'rgba(239, 68, 68, 0.05)' : 'var(--surface-hover)', 
                borderRadius: '0.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div className="flex items-center" style={{ gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h4 style={{ color: a.category === 'IMPORTANT' ? 'var(--danger)' : 'var(--primary)', margin: 0 }}>{a.title}</h4>
                    {a.category === 'IMPORTANT' && <span className="badge badge-danger" style={{ fontSize: '0.6rem' }}>IMPORTANT</span>}
                  </div>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>{a.message}</p>
                </div>
                <small className="text-secondary">{new Date(a.createdAt).toLocaleString()}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAdmin && (
        <>
          <h3 className="mb-4">Patient Growth Analytics</h3>
          <div className="dashboard-grid mb-4">
            <div className="card stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>
                <Users size={32} />
              </div>
              <div className="stat-content">
                <h3>New Today</h3>
                <p>{adminStats.daily}</p>
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary)' }}>
                <Users size={32} />
              </div>
              <div className="stat-content">
                <h3>New This Week</h3>
                <p>{adminStats.weekly}</p>
              </div>
            </div>
            <div className="card stat-card">
              <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' }}>
                <Activity size={32} />
              </div>
              <div className="stat-content">
                <h3>New This Month</h3>
                <p>{adminStats.monthly}</p>
              </div>
            </div>
          </div>
          
          <div className="card" style={{ height: '350px' }}>
            <h3 className="mb-4">Registration Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height="80%">
              <BarChart data={adminStats.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" />
                <YAxis stroke="var(--text-secondary)" allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: 'var(--surface-hover)'}}
                  contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '0.5rem' }}
                />
                <Bar dataKey="patients" fill="var(--primary)" radius={[4, 4, 0, 0]} name="New Patients" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {profileError && (
        <div className="card mb-4" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
          <h3>Profile Link Error</h3>
          <p>{profileError}</p>
        </div>
      )}

      {isDoctor && !profileError && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}><Clock className="inline mr-2" size={20} /> Next Appointment In</h3>
            <Timer nextApp={nextAppointment} />
            {nextAppointment && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem', width: '100%' }}>
                <strong>{nextAppointment.patient?.name}</strong> at {nextAppointment.time}
                {nextAppointment.emergency && <span className="badge badge-danger" style={{ display: 'block', marginTop: '0.25rem' }}>EMERGENCY</span>}
              </div>
            )}
          </div>
          <div className="card">
            <h3 className="mb-4"><CalendarIcon className="inline mr-2" size={20} /> Upcoming Schedule (14 Days)</h3>
            <MiniCalendar appointments={appointments} />
          </div>
        </div>
      )}

      {isPatient && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card">
            <h3 className="mb-4"><CalendarIcon className="inline mr-2" size={20} /> Upcoming Appointments</h3>
            {appointments.filter(a => a.status === 'BOOKED').length > 0 ? (
              <div className="flex" style={{ flexDirection: 'column', gap: '1rem' }}>
                {appointments.filter(a => a.status === 'BOOKED').slice(0, 5).map(a => (
                  <div key={a.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '0.5rem' }}>
                    <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <strong>Dr. {a.doctor?.name}</strong>
                      <span className="badge badge-warning">Upcoming</span>
                    </div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem' }}>
                      <Clock size={14} className="inline mr-1" /> {a.date} at {a.time}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
               <div className="text-center text-secondary" style={{ padding: '2rem 0' }}>No upcoming appointments.</div>
            )}
          </div>

          <div className="card">
            <h3 className="mb-4"><FileText className="inline mr-2" size={20} /> Medical History & Prescriptions</h3>
            {appointments.filter(a => a.status === 'COMPLETED').length > 0 ? (
               <div className="flex" style={{ flexDirection: 'column', gap: '1rem' }}>
               {appointments.filter(a => a.status === 'COMPLETED').map(a => (
                 <div key={a.id} style={{ padding: '1rem', backgroundColor: 'var(--surface-hover)', borderRadius: '0.5rem' }}>
                   <div className="flex" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                     <strong>Dr. {a.doctor?.name}</strong>
                     <span className="text-secondary" style={{ fontSize: '0.75rem' }}>{a.date}</span>
                   </div>
                   <div style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                     <strong style={{ color: 'var(--primary)' }}>Prescription Notes:</strong>
                     <p style={{ marginTop: '0.25rem', padding: '0.5rem', backgroundColor: 'var(--surface)', borderRadius: '0.25rem' }}>
                       {a.prescriptionNotes || 'No notes provided by doctor.'}
                     </p>
                   </div>
                 </div>
               ))}
             </div>
            ) : (
              <div className="text-center text-secondary" style={{ padding: '2rem 0' }}>No medical history available.</div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
