import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { getAllQuizzes, getStudentResults } from '../services/api';
import { LoadingSpinner, Alert, EmptyState, StatCard } from '../components/shared/UI';

const StudentDashboard = ({ onNavigate, onStartQuiz }) => {
  const { currentUser } = useApp();
  const [quizzes, setQuizzes] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('quizzes');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [qRes, rRes] = await Promise.all([
        getAllQuizzes(search),
        getStudentResults(currentUser.uid),
      ]);
      setQuizzes(qRes.data.data);
      setResults(rRes.data.data);
    } catch {
      setError('Failed to load data. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [currentUser.uid, search]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const attemptedIds = new Set(results.map(r => r.quizId));
  const avgScore = results.length
    ? (results.reduce((s, r) => s + r.score, 0) / results.length).toFixed(1)
    : null;

  if (loading && quizzes.length === 0) return <LoadingSpinner text="Loading your dashboard..." />;

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div className="page-header">
        <div>
          <div className="page-title">
            {currentUser.name ? `Hello, ${currentUser.name} 👋` : 'Student Dashboard 👨‍🎓'}
          </div>
          <div className="page-subtitle">
            UID: <span className="font-mono">{currentUser.uid}</span>
          </div>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Stats */}
      <div className="stats-grid mb-6">
        <StatCard icon="📝" iconClass="indigo" value={quizzes.length} label="Available Quizzes" />
        <StatCard icon="✅" iconClass="green" value={results.length} label="Completed" />
        <StatCard icon="📊" iconClass="amber" value={avgScore ? `${avgScore}%` : '—'} label="Avg Score" />
        <StatCard icon="⏳" iconClass="rose" value={quizzes.length - attemptedIds.size} label="Remaining" />
      </div>

      {/* Tabs */}
      <div className="tabs mb-6">
        <button className={`tab ${activeTab === 'quizzes' ? 'active' : ''}`} onClick={() => setActiveTab('quizzes')}>
          Available Quizzes
        </button>
        <button className={`tab ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>
          My Results {results.length > 0 && `(${results.length})`}
        </button>
      </div>

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <>
          <div className="search-bar mb-6" style={{ maxWidth: 400 }}>
            <span style={{ color: 'var(--slate-400)' }}>🔍</span>
            <input
              placeholder="Search by title, subject, or teacher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)', fontSize: '1rem' }}
              >
                ✕
              </button>
            )}
          </div>

          {quizzes.length === 0 ? (
            <div className="card">
              <EmptyState
                icon="📭"
                title={search ? 'No quizzes match your search' : 'No quizzes available'}
                description={search ? 'Try a different search term.' : 'Check back later for new quizzes!'}
              />
            </div>
          ) : (
            <div className="quiz-grid">
              {quizzes.map(q => {
                const attempted = attemptedIds.has(q.quizId);
                const myResult = results.find(r => r.quizId === q.quizId);
                return (
                  <div key={q.quizId} className="quiz-card" style={{ cursor: attempted ? 'default' : 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div className="quiz-card-title">{q.title}</div>
                      {attempted ? (
                        <span className="badge badge-green">✓ Done</span>
                      ) : (
                        <span className="badge badge-indigo">New</span>
                      )}
                    </div>
                    <div className="quiz-card-meta">
                      <span>📚 {q.subject}</span>
                      <span>👨‍🏫 {q.teacherName}</span>
                      <span>❓ {q.questions?.length || '?'} Qs</span>
                      {q.timeLimitMinutes > 0 && <span>⏱️ {q.timeLimitMinutes}m</span>}
                    </div>
                    {attempted && myResult && (
                      <div style={{
                        marginTop: 12, padding: '10px 12px',
                        background: myResult.score >= 80 ? '#d1fae5' : myResult.score >= 50 ? '#fef3c7' : '#ffe4e6',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)' }}>Your score</span>
                        <span style={{
                          fontWeight: 800, fontSize: '1.1rem',
                          color: myResult.score >= 80 ? 'var(--emerald-600)' : myResult.score >= 50 ? 'var(--amber-600)' : 'var(--rose-500)'
                        }}>
                          {myResult.score}%
                        </span>
                      </div>
                    )}
                    <div className="quiz-card-footer">
                      <div className="text-muted text-sm">
                        {new Date(q.createdAt).toLocaleDateString()}
                      </div>
                      {!attempted ? (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => onStartQuiz(q.quizId)}
                        >
                          Start Quiz →
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setActiveTab('results')}
                        >
                          View Result
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div>
          {results.length === 0 ? (
            <div className="card">
              <EmptyState
                icon="🎯"
                title="No results yet"
                description="Complete a quiz to see your results here!"
                action={<button className="btn btn-primary" onClick={() => setActiveTab('quizzes')}>Browse Quizzes</button>}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {results.map(r => (
                <div key={r._id} className="card">
                  <div className="card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-800)', marginBottom: 4 }}>
                          {r.quizTitle}
                        </div>
                        <div className="text-muted text-sm" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                          <span>📚 {r.subject}</span>
                          <span>👨‍🏫 {r.teacherName}</span>
                          <span>✅ {r.correctAnswers}/{r.totalQuestions} correct</span>
                          {r.timeTakenSeconds > 0 && (
                            <span>⏱️ {Math.floor(r.timeTakenSeconds / 60)}m {r.timeTakenSeconds % 60}s</span>
                          )}
                          <span>🗓️ {new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div style={{
                        padding: '8px 20px',
                        borderRadius: 'var(--radius-md)',
                        background: r.score >= 80 ? '#d1fae5' : r.score >= 50 ? '#fef3c7' : '#ffe4e6',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: '1.6rem', fontWeight: 800,
                          color: r.score >= 80 ? 'var(--emerald-600)' : r.score >= 50 ? 'var(--amber-600)' : 'var(--rose-500)'
                        }}>
                          {r.score}%
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600 }}>SCORE</div>
                      </div>
                    </div>
                    {/* Score bar */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ height: 6, background: 'var(--slate-100)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${r.score}%`,
                          background: r.score >= 80 ? 'var(--emerald-400)' : r.score >= 50 ? 'var(--amber-400)' : 'var(--rose-400)',
                          borderRadius: 99, transition: 'width 0.8s ease'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
