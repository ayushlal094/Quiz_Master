import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { getTeacherDashboard, toggleQuizStatus } from '../services/api';
import { LoadingSpinner, Alert, EmptyState, StatCard } from '../components/shared/UI';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

const TeacherDashboard = ({ onNavigate }) => {
  const { currentUser } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [toggling, setToggling] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTeacherDashboard(currentUser.teacherId);
      setData(res.data.data);
    } catch {
      setError('Failed to load dashboard. Is the server running?');
    } finally {
      setLoading(false);
    }
  }, [currentUser.teacherId]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (quizId) => {
    setToggling(quizId);
    try {
      await toggleQuizStatus(quizId);
      await load();
    } catch {
      setError('Failed to toggle quiz status.');
    } finally {
      setToggling(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const chartData = (data?.quizzes || [])
    .filter(q => q.averageScore !== null)
    .map(q => ({ name: q.title.length > 14 ? q.title.slice(0, 14) + '…' : q.title, avg: parseFloat(q.averageScore) }));

  const quizResults = selectedQuiz
    ? (data?.results || []).filter(r => r.quizId === selectedQuiz)
    : [];

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="page-title">Welcome back, {currentUser.fullName} 👋</div>
          <div className="page-subtitle">{currentUser.subjectName} · Teacher Dashboard</div>
          <div className="text-muted text-sm" style={{ marginTop: 6 }}>
            Teacher ID: <span className="font-mono">{currentUser.teacherId}</span>
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => onNavigate('create-quiz')}>
          + Create New Quiz
        </button>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Stats */}
      <div className="stats-grid mb-6">
        <StatCard icon="📝" iconClass="indigo" value={data?.totalQuizzes ?? 0} label="Total Quizzes" />
        <StatCard icon="👥" iconClass="green" value={data?.totalAttempts ?? 0} label="Total Attempts" />
        <StatCard icon="📊" iconClass="amber" value={data?.overallAvg ? `${data.overallAvg}%` : '—'} label="Class Average" />
        <StatCard icon="🏆" iconClass="rose" value={data?.rankings?.length ?? 0} label="Students" />
      </div>

      {/* Tabs */}
      <div className="tabs mb-6">
        {['overview', 'quizzes', 'students', 'analytics'].map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
          {/* Recent Quizzes */}
          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>Recent Quizzes</div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('quizzes')}>View all</button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {(data?.quizzes || []).slice(0, 4).length === 0 ? (
                <EmptyState icon="📝" title="No quizzes yet" description="Create your first quiz!" />
              ) : (
                (data?.quizzes || []).slice(0, 4).map(q => (
                  <div key={q.quizId} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '14px 20px', borderBottom: '1px solid var(--slate-100)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--slate-800)' }}>{q.title}</div>
                      <div className="text-muted text-sm">{q.totalQuestions} questions · {q.totalAttempts} attempts</div>
                    </div>
                    <span className={`badge ${q.isActive ? 'badge-green' : 'badge-slate'}`}>
                      {q.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Students */}
          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>Top Students 🏆</div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('students')}>View all</button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              {(data?.rankings || []).slice(0, 5).length === 0 ? (
                <EmptyState icon="🎓" title="No attempts yet" />
              ) : (
                (data?.rankings || []).slice(0, 5).map(r => (
                  <div key={r.studentUid} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 20px', borderBottom: '1px solid var(--slate-100)'
                  }}>
                    <div className={`rank-badge rank-${r.rank <= 3 ? r.rank : 'other'}`}>
                      {r.rank <= 3 ? ['🥇','🥈','🥉'][r.rank-1] : r.rank}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {r.studentName || r.studentUid}
                      </div>
                      <div className="text-muted text-sm font-mono">{r.studentUid}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--indigo-600)', fontSize: '1rem' }}>
                      {r.avgScore}%
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quizzes Tab */}
      {activeTab === 'quizzes' && (
        <div>
          {(data?.quizzes || []).length === 0 ? (
            <div className="card">
              <EmptyState
                icon="📝" title="No quizzes created yet"
                description="Create your first quiz to get started!"
                action={<button className="btn btn-primary" onClick={() => onNavigate('create-quiz')}>+ Create Quiz</button>}
              />
            </div>
          ) : (
            <div className="quiz-grid">
              {(data?.quizzes || []).map(q => (
                <div key={q.quizId} className="quiz-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div className="quiz-card-title">{q.title}</div>
                    <span className={`badge ${q.isActive ? 'badge-green' : 'badge-slate'}`}>
                      {q.isActive ? 'Active' : 'Off'}
                    </span>
                  </div>
                  <div className="quiz-card-meta">
                    <span>📚 {q.subject}</span>
                    <span>❓ {q.totalQuestions} Qs</span>
                    <span>👥 {q.totalAttempts} attempts</span>
                    {q.averageScore !== null && <span>📊 Avg: {q.averageScore}%</span>}
                  </div>
                  <div className="quiz-card-footer">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => { setSelectedQuiz(q.quizId); setActiveTab('students'); }}
                    >
                      View Results
                    </button>
                    <button
                      className={`btn btn-sm ${q.isActive ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggle(q.quizId)}
                      disabled={toggling === q.quizId}
                    >
                      {toggling === q.quizId ? '...' : q.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div>
          {/* Quiz filter */}
          <div style={{ marginBottom: 20 }}>
            <select
              className="form-select"
              style={{ maxWidth: 320 }}
              value={selectedQuiz || ''}
              onChange={e => setSelectedQuiz(e.target.value || null)}
            >
              <option value="">All Quizzes — Rankings</option>
              {(data?.quizzes || []).map(q => (
                <option key={q.quizId} value={q.quizId}>{q.title}</option>
              ))}
            </select>
          </div>

          <div className="card">
            {selectedQuiz ? (
              <>
                <div className="card-header">
                  <div style={{ fontWeight: 700 }}>
                    Results: {(data?.quizzes || []).find(q => q.quizId === selectedQuiz)?.title}
                  </div>
                  {quizResults.length > 0 && (
                    <div className="badge badge-indigo">
                      Avg: {(quizResults.reduce((s, r) => s + r.score, 0) / quizResults.length).toFixed(1)}%
                    </div>
                  )}
                </div>
                {quizResults.length === 0 ? (
                  <EmptyState icon="📭" title="No attempts for this quiz yet" />
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Student</th>
                        <th>UID</th>
                        <th>Score</th>
                        <th>Correct</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...quizResults]
                        .sort((a, b) => b.score - a.score)
                        .map((r, idx) => (
                          <tr key={r._id}>
                            <td>
                              <div className={`rank-badge rank-${idx < 3 ? idx + 1 : 'other'}`} style={{ display: 'inline-flex' }}>
                                {idx < 3 ? ['🥇','🥈','🥉'][idx] : idx + 1}
                              </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>{r.studentName || '—'}</td>
                            <td><span className="font-mono text-sm">{r.studentUid}</span></td>
                            <td>
                              <span style={{
                                fontWeight: 700,
                                color: r.score >= 80 ? 'var(--emerald-600)' : r.score >= 50 ? 'var(--amber-600)' : 'var(--rose-500)'
                              }}>
                                {r.score}%
                              </span>
                            </td>
                            <td>{r.correctAnswers}/{r.totalQuestions}</td>
                            <td className="text-muted text-sm">
                              {r.timeTakenSeconds > 0 ? `${Math.floor(r.timeTakenSeconds / 60)}m ${r.timeTakenSeconds % 60}s` : '—'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </>
            ) : (
              <>
                <div className="card-header">
                  <div style={{ fontWeight: 700 }}>Overall Student Rankings</div>
                </div>
                {(data?.rankings || []).length === 0 ? (
                  <EmptyState icon="🏆" title="No student data yet" />
                ) : (
                  <table className="data-table">
                    <thead>
                      <tr><th>Rank</th><th>Student</th><th>UID</th><th>Avg Score</th><th>Attempts</th></tr>
                    </thead>
                    <tbody>
                      {(data?.rankings || []).map(r => (
                        <tr key={r.studentUid}>
                          <td>
                            <div className={`rank-badge rank-${r.rank <= 3 ? r.rank : 'other'}`} style={{ display: 'inline-flex' }}>
                              {r.rank <= 3 ? ['🥇','🥈','🥉'][r.rank - 1] : r.rank}
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{r.studentName || '—'}</td>
                          <td><span className="font-mono text-sm">{r.studentUid}</span></td>
                          <td>
                            <span style={{
                              fontWeight: 700,
                              color: r.avgScore >= 80 ? 'var(--emerald-600)' : r.avgScore >= 50 ? 'var(--amber-600)' : 'var(--rose-500)'
                            }}>
                              {r.avgScore}%
                            </span>
                          </td>
                          <td>{r.attempts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div style={{ display: 'grid', gap: 24 }}>
          <div className="card">
            <div className="card-header">
              <div style={{ fontWeight: 700 }}>Average Score per Quiz</div>
            </div>
            <div className="card-body">
              {chartData.length === 0 ? (
                <EmptyState icon="📊" title="No data yet" description="Scores will appear after students attempt quizzes." />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--slate-100)" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--slate-500)', fontFamily: 'Sora' }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: 'var(--slate-500)', fontFamily: 'Sora' }} unit="%" />
                    <Tooltip
                      formatter={(v) => [`${v}%`, 'Avg Score']}
                      contentStyle={{ fontFamily: 'Sora', fontSize: 13, borderRadius: 8, border: '1px solid var(--slate-200)' }}
                    />
                    <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={i % 3 === 0 ? '#6366f1' : i % 3 === 1 ? '#818cf8' : '#a5b4fc'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Per-quiz attempt counts */}
          <div className="card">
            <div className="card-header"><div style={{ fontWeight: 700 }}>Quiz Participation</div></div>
            <div className="card-body" style={{ padding: 0 }}>
              {(data?.quizzes || []).length === 0 ? (
                <EmptyState icon="📝" title="No quizzes yet" />
              ) : (
                (data?.quizzes || []).map(q => {
                  const pct = data.totalAttempts > 0 ? (q.totalAttempts / Math.max(...(data.quizzes || []).map(x => x.totalAttempts), 1)) * 100 : 0;
                  return (
                    <div key={q.quizId} style={{ padding: '14px 20px', borderBottom: '1px solid var(--slate-100)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{q.title}</span>
                        <span className="text-muted text-sm">{q.totalAttempts} attempts</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--slate-100)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--indigo-400)', borderRadius: 99, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
