import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { registerTeacher, claimTeacherId, loginTeacher, registerStudent, loginStudent } from '../services/api';
import { Alert } from '../components/shared/UI';

const getRequestErrorMessage = (err, fallbackMessage) => {
  const payload = err?.response?.data;
  const apiMessage =
    typeof payload === 'string'
      ? payload
      : payload?.message;
  if (apiMessage) return apiMessage;

  if (err?.code === 'ECONNABORTED') {
    return 'Request timed out. Please check if backend server and MongoDB are running.';
  }

  if (err?.message && /ETIMEDOUT|ENOTFOUND|ECONNREFUSED|Network Error/i.test(err.message)) {
    return 'Cannot reach backend/database. Start the server and verify Mongo URI in server/.env (MONGO_URI or MONGODB_URI).';
  }

  return fallbackMessage;
};

const HomePage = ({ onNavigate }) => {
  const { loginAsTeacher, loginAsStudent } = useApp();
  const [view, setView] = useState('home'); // home | teacher-login | student-login
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teacherMode, setTeacherMode] = useState('existing'); // existing | new
  const [studentMode, setStudentMode] = useState('existing'); // existing | new

  const [existingTeacherForm, setExistingTeacherForm] = useState(() => ({
    teacherId: localStorage.getItem('lastTeacherId') || '',
  }));
  const [newTeacherForm, setNewTeacherForm] = useState({
    teacherId: '',
    fullName: '',
    subjectName: '',
  });
  const [claimTeacherForm, setClaimTeacherForm] = useState({
    teacherId: '',
    fullName: '',
    subjectName: '',
  });
  const [existingStudentForm, setExistingStudentForm] = useState(() => ({
    uid: localStorage.getItem('lastStudentUid') || '',
  }));
  const [newStudentForm, setNewStudentForm] = useState({
    uid: '',
    name: '',
  });

  const handleExistingTeacherSubmit = async () => {
    const teacherId = existingTeacherForm.teacherId.trim();
    if (!teacherId) {
      setError('Enter your Teacher ID.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await loginTeacher({ teacherId });
      loginAsTeacher(res.data.data);
      localStorage.setItem('lastTeacherId', res.data.data.teacherId || '');
      onNavigate('teacher-dashboard');
    } catch (err) {
      setError(getRequestErrorMessage(err, 'Teacher login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleClaimTeacherId = async () => {
    const teacherId = claimTeacherForm.teacherId.trim();
    const fullName = claimTeacherForm.fullName.trim();
    const subjectName = claimTeacherForm.subjectName.trim();

    if (!teacherId || !fullName || !subjectName) {
      setError('For first-time setup, enter Teacher ID, full name, and subject name.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await claimTeacherId({ teacherId, fullName, subjectName });
      loginAsTeacher(res.data.data);
      localStorage.setItem('lastTeacherId', res.data.data.teacherId || '');
      onNavigate('teacher-dashboard');
    } catch (err) {
      setError(getRequestErrorMessage(err, 'Could not set Teacher ID. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleNewTeacherSubmit = async () => {
    const teacherId = newTeacherForm.teacherId.trim();
    const fullName = newTeacherForm.fullName.trim();
    const subjectName = newTeacherForm.subjectName.trim();

    if (!teacherId || !fullName || !subjectName) {
      setError('Please fill in Teacher ID, full name, and subject name.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await registerTeacher({ teacherId, fullName, subjectName });
      loginAsTeacher(res.data.data);
      localStorage.setItem('lastTeacherId', res.data.data.teacherId || '');
      onNavigate('teacher-dashboard');
    } catch (err) {
      const statusCode = err?.response?.status;
      const apiMessage = err?.response?.data?.message || '';

      // Backward-compatible fallback: older backend returns 409 and asks for "Set Teacher ID" first.
      if (
        statusCode === 409 &&
        /account already exists for this name\/subject|set teacher id first/i.test(apiMessage)
      ) {
        try {
          const claimRes = await claimTeacherId({ teacherId, fullName, subjectName });
          loginAsTeacher(claimRes.data.data);
          localStorage.setItem('lastTeacherId', claimRes.data.data.teacherId || '');
          onNavigate('teacher-dashboard');
          return;
        } catch (claimErr) {
          setError(getRequestErrorMessage(claimErr, 'Could not auto-claim Teacher ID. Please try again.'));
          return;
        }
      }

      setError(getRequestErrorMessage(err, 'Teacher registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleExistingStudentSubmit = async () => {
    const uid = existingStudentForm.uid.trim();
    if (!uid) {
      setError('Enter your Student UID.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await loginStudent({ uid });
      loginAsStudent(res.data.data);
      localStorage.setItem('lastStudentUid', res.data.data.uid || '');
      onNavigate('student-dashboard');
    } catch (err) {
      setError(getRequestErrorMessage(err, 'Student login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleNewStudentSubmit = async () => {
    const uid = newStudentForm.uid.trim();
    const name = newStudentForm.name.trim();
    if (!uid || !name) {
      setError('Please fill in Student UID and name.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await registerStudent({ uid, name });
      loginAsStudent(res.data.data);
      localStorage.setItem('lastStudentUid', res.data.data.uid || '');
      onNavigate('student-dashboard');
    } catch (err) {
      setError(getRequestErrorMessage(err, 'Student registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setView('home');
    setError('');
    setLoading(false);
  };

  if (view === 'teacher-login') {
    return (
      <div style={{ maxWidth: 460, margin: '60px auto', padding: '0 24px' }}>
        <button className="btn btn-ghost btn-sm mb-4" onClick={goBack}>Back</button>
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontSize: '1.2rem', marginBottom: 8 }}>Teacher Access</div>
              <div className="modal-title">
                {teacherMode === 'existing' ? 'Existing Teacher Login' : 'New Teacher Registration'}
              </div>
              <div className="text-muted text-sm mt-1">
                {teacherMode === 'existing'
                  ? 'Sign in by Teacher ID. Old accounts can set an ID once below.'
                  : 'Create your account with your own Teacher ID for future logins.'}
              </div>
            </div>
          </div>

          <div className="card-body">
            <Alert type="error" message={error} onClose={() => setError('')} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <button
                className={`btn ${teacherMode === 'existing' ? 'btn-primary' : 'btn-secondary'}`}
                type="button"
                onClick={() => {
                  setTeacherMode('existing');
                  setError('');
                }}
              >
                Existing Teacher
              </button>
              <button
                className={`btn ${teacherMode === 'new' ? 'btn-primary' : 'btn-secondary'}`}
                type="button"
                onClick={() => {
                  setTeacherMode('new');
                  setError('');
                }}
              >
                New Teacher
              </button>
            </div>

            {teacherMode === 'existing' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Teacher ID</label>
                  <input
                    className="form-input font-mono"
                    placeholder="e.g. AYUSH_MATHS_01"
                    value={existingTeacherForm.teacherId}
                    onChange={(e) =>
                      setExistingTeacherForm((p) => ({ ...p, teacherId: e.target.value.toUpperCase() }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleExistingTeacherSubmit()}
                  />
                  <span className="text-muted text-sm">
                    Use the same ID every time to open your existing account.
                  </span>
                </div>

                <button
                  className="btn btn-primary btn-lg btn-block"
                  onClick={handleExistingTeacherSubmit}
                  disabled={loading}
                  style={{ marginTop: 8 }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: 12, marginTop: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 10 }}>First time existing account setup</div>
                  <div className="text-muted text-sm" style={{ marginBottom: 12 }}>
                    If your old account does not have a Teacher ID, set it once here.
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">New Teacher ID</label>
                      <input
                        className="form-input font-mono"
                        placeholder="e.g. AYUSH_MATHS_01"
                        value={claimTeacherForm.teacherId}
                        onChange={(e) =>
                          setClaimTeacherForm((p) => ({ ...p, teacherId: e.target.value.toUpperCase() }))
                        }
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Ayush"
                        value={claimTeacherForm.fullName}
                        onChange={(e) => setClaimTeacherForm((p) => ({ ...p, fullName: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Subject Name</label>
                      <input
                        className="form-input"
                        placeholder="e.g. Maths"
                        value={claimTeacherForm.subjectName}
                        onChange={(e) => setClaimTeacherForm((p) => ({ ...p, subjectName: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleClaimTeacherId()}
                      />
                    </div>
                    <button
                      className="btn btn-secondary btn-lg btn-block"
                      onClick={handleClaimTeacherId}
                      disabled={loading}
                    >
                      {loading ? 'Setting Teacher ID...' : 'Set Teacher ID Once'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Teacher ID</label>
                  <input
                    className="form-input font-mono"
                    placeholder="e.g. AYUSH_MATHS_01"
                    value={newTeacherForm.teacherId}
                    onChange={(e) =>
                      setNewTeacherForm((p) => ({ ...p, teacherId: e.target.value.toUpperCase() }))
                    }
                    onKeyDown={(e) => e.key === 'Enter' && handleNewTeacherSubmit()}
                  />
                  <span className="text-muted text-sm">
                    Allowed: letters, numbers, underscore, hyphen (3-40 chars).
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Ayush"
                    value={newTeacherForm.fullName}
                    onChange={(e) => setNewTeacherForm((p) => ({ ...p, fullName: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleNewTeacherSubmit()}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Subject Name</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Maths"
                    value={newTeacherForm.subjectName}
                    onChange={(e) => setNewTeacherForm((p) => ({ ...p, subjectName: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleNewTeacherSubmit()}
                  />
                </div>

                <button
                  className="btn btn-primary btn-lg btn-block"
                  onClick={handleNewTeacherSubmit}
                  disabled={loading}
                  style={{ marginTop: 8 }}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (view === 'student-login') {
    return (
      <div style={{ maxWidth: 460, margin: '60px auto', padding: '0 24px' }}>
        <button className="btn btn-ghost btn-sm mb-4" onClick={goBack}>Back</button>
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ fontSize: '1.2rem', marginBottom: 8 }}>Student Access</div>
              <div className="modal-title">
                {studentMode === 'existing' ? 'Existing Student Login' : 'New Student Registration'}
              </div>
              <div className="text-muted text-sm mt-1">
                {studentMode === 'existing'
                  ? 'Sign in using your Student UID only.'
                  : 'Create a student account with your own UID.'}
              </div>
            </div>
          </div>
          <div className="card-body">
            <Alert type="error" message={error} onClose={() => setError('')} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              <button
                className={`btn ${studentMode === 'existing' ? 'btn-primary' : 'btn-secondary'}`}
                type="button"
                onClick={() => {
                  setStudentMode('existing');
                  setError('');
                }}
              >
                Existing Student
              </button>
              <button
                className={`btn ${studentMode === 'new' ? 'btn-primary' : 'btn-secondary'}`}
                type="button"
                onClick={() => {
                  setStudentMode('new');
                  setError('');
                }}
              >
                New Student
              </button>
            </div>

            {studentMode === 'existing' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Student UID</label>
                  <input
                    className="form-input font-mono"
                    placeholder="e.g. STU_AYUSH_01"
                    value={existingStudentForm.uid}
                    onChange={(e) => setExistingStudentForm((p) => ({ ...p, uid: e.target.value.toUpperCase() }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleExistingStudentSubmit()}
                    style={{ letterSpacing: '0.05em' }}
                  />
                  <span className="text-muted text-sm">Use the same UID every time to sign in.</span>
                </div>
                <button
                  className="btn btn-primary btn-lg btn-block"
                  onClick={handleExistingStudentSubmit}
                  disabled={loading}
                  style={{ marginTop: 8 }}
                >
                  {loading ? 'Logging in...' : 'Log In'}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Student UID</label>
                  <input
                    className="form-input font-mono"
                    placeholder="e.g. STU_AYUSH_01"
                    value={newStudentForm.uid}
                    onChange={(e) => setNewStudentForm((p) => ({ ...p, uid: e.target.value.toUpperCase() }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleNewStudentSubmit()}
                    style={{ letterSpacing: '0.05em' }}
                  />
                  <span className="text-muted text-sm">
                    Allowed: letters, numbers, underscore, hyphen (3-40 chars).
                  </span>
                </div>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Alex Kumar"
                    value={newStudentForm.name}
                    onChange={(e) => setNewStudentForm((p) => ({ ...p, name: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleNewStudentSubmit()}
                  />
                </div>
                <button
                  className="btn btn-primary btn-lg btn-block"
                  onClick={handleNewStudentSubmit}
                  disabled={loading}
                  style={{ marginTop: 8 }}
                >
                  {loading ? 'Creating account...' : 'Create Student Account'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero">
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--indigo-50)',
          color: 'var(--indigo-600)',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.82rem',
          fontWeight: 600,
          marginBottom: 24,
          border: '1px solid var(--indigo-200)',
        }}
      >
        Online Quiz Platform
      </div>
      <h1 className="hero-title">
        Smarter Quizzes,
        <br />
        <span>Instant Results</span>
      </h1>
      <p className="hero-sub">
        Create, attempt, and evaluate quizzes with real-time analytics. Designed for teachers and students alike.
      </p>
      <div className="role-cards">
        <div
          className="role-card teacher-card"
          onClick={() => {
            setTeacherMode('existing');
            setView('teacher-login');
            setError('');
          }}
        >
          <div className="role-title">I am a Teacher</div>
          <div className="role-desc">Create quizzes, track student progress, and view analytics and rankings.</div>
          <div
            style={{
              marginTop: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--amber-600)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            Get Started
          </div>
        </div>
        <div className="role-card student-card" onClick={() => setView('student-login')}>
          <div className="role-title">I am a Student</div>
          <div className="role-desc">Attempt quizzes, get instant scores, and review your answers.</div>
          <div
            style={{
              marginTop: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              color: 'var(--indigo-600)',
              fontSize: '0.85rem',
              fontWeight: 600,
            }}
          >
            Start Quiz
          </div>
        </div>
      </div>
      <div style={{ marginTop: 56, display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
        {[
          ['Easy to create'],
          ['Instant evaluation'],
          ['Rich analytics'],
          ['Student rankings'],
        ].map(([label]) => (
          <div
            key={label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: 'var(--slate-500)',
              fontSize: '0.88rem',
              fontWeight: 500,
            }}
          >
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
