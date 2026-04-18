import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { registerTeacher, loginStudent } from '../services/api';
import { Alert } from '../components/shared/UI';

const HomePage = ({ onNavigate }) => {
  const { loginAsTeacher, loginAsStudent } = useApp();
  const [view, setView] = useState('home'); // home | teacher-login | student-login
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Teacher form
  const [teacherForm, setTeacherForm] = useState({ fullName: '', subjectName: '' });
  // Student form
  const [studentForm, setStudentForm] = useState({ uid: '', name: '' });

  const handleTeacherSubmit = async () => {
    if (!teacherForm.fullName.trim() || !teacherForm.subjectName.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await registerTeacher(teacherForm);
      loginAsTeacher(res.data.data);
      onNavigate('teacher-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSubmit = async () => {
    if (!studentForm.uid.trim()) {
      setError('Please enter your UID.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await loginStudent(studentForm);
      loginAsStudent(res.data.data);
      onNavigate('student-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => { setView('home'); setError(''); };

  if (view === 'teacher-login') {
    return (
      <div style={{ maxWidth: 460, margin: '60px auto', padding: '0 24px' }}>
        <button className="btn btn-ghost btn-sm mb-4" onClick={goBack}>← Back</button>
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>👨‍🏫</div>
              <div className="modal-title">Teacher Registration</div>
              <div className="text-muted text-sm mt-1">Enter your details to create or access your account</div>
            </div>
          </div>
          <div className="card-body">
            <Alert type="error" message={error} onClose={() => setError('')} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Dr. Sarah Johnson"
                  value={teacherForm.fullName}
                  onChange={e => setTeacherForm(p => ({ ...p, fullName: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleTeacherSubmit()}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Subject Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Mathematics, Physics..."
                  value={teacherForm.subjectName}
                  onChange={e => setTeacherForm(p => ({ ...p, subjectName: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleTeacherSubmit()}
                />
              </div>
              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={handleTeacherSubmit}
                disabled={loading}
                style={{ marginTop: 8 }}
              >
                {loading ? '⏳ Setting up...' : '🚀 Enter Dashboard'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'student-login') {
    return (
      <div style={{ maxWidth: 460, margin: '60px auto', padding: '0 24px' }}>
        <button className="btn btn-ghost btn-sm mb-4" onClick={goBack}>← Back</button>
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>👨‍🎓</div>
              <div className="modal-title">Student Login</div>
              <div className="text-muted text-sm mt-1">Enter your unique ID to access quizzes</div>
            </div>
          </div>
          <div className="card-body">
            <Alert type="error" message={error} onClose={() => setError('')} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Student UID</label>
                <input
                  className="form-input font-mono"
                  placeholder="e.g. STU2024001"
                  value={studentForm.uid}
                  onChange={e => setStudentForm(p => ({ ...p, uid: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleStudentSubmit()}
                  style={{ letterSpacing: '0.05em' }}
                />
                <span className="text-muted text-sm">Your UID will be created automatically if new</span>
              </div>
              <div className="form-group">
                <label className="form-label">Your Name <span style={{ color: 'var(--slate-400)' }}>(optional)</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. Alex Kumar"
                  value={studentForm.name}
                  onChange={e => setStudentForm(p => ({ ...p, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleStudentSubmit()}
                />
              </div>
              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={handleStudentSubmit}
                disabled={loading}
                style={{ marginTop: 8 }}
              >
                {loading ? '⏳ Logging in...' : '🎯 Start Learning'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero">
      <div
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--indigo-50)', color: 'var(--indigo-600)',
          padding: '6px 16px', borderRadius: 'var(--radius-full)',
          fontSize: '0.82rem', fontWeight: 600, marginBottom: 24,
          border: '1px solid var(--indigo-200)'
        }}
      >
        ✨ Online Quiz Platform
      </div>
      <h1 className="hero-title">
        Smarter Quizzes,<br />
        <span>Instant Results</span>
      </h1>
      <p className="hero-sub">
        Create, attempt, and evaluate quizzes with real-time analytics. Designed for teachers and students alike.
      </p>
      <div className="role-cards">
        <div className="role-card teacher-card" onClick={() => setView('teacher-login')}>
          <div className="role-emoji">👨‍🏫</div>
          <div className="role-title">I'm a Teacher</div>
          <div className="role-desc">Create quizzes, track student progress, and view analytics & rankings.</div>
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--amber-600)', fontSize: '0.85rem', fontWeight: 600 }}>
            Get Started →
          </div>
        </div>
        <div className="role-card student-card" onClick={() => setView('student-login')}>
          <div className="role-emoji">👨‍🎓</div>
          <div className="role-title">I'm a Student</div>
          <div className="role-desc">Attempt quizzes, get instant scores, and review your answers.</div>
          <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--indigo-600)', fontSize: '0.85rem', fontWeight: 600 }}>
            Start Quiz →
          </div>
        </div>
      </div>
      <div style={{ marginTop: 56, display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
        {[['📝', 'Easy to create'], ['⚡', 'Instant evaluation'], ['📊', 'Rich analytics'], ['🏆', 'Student rankings']].map(([icon, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--slate-500)', fontSize: '0.88rem', fontWeight: 500 }}>
            <span>{icon}</span><span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
