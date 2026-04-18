import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { createQuiz } from '../services/api';
import { Alert } from '../components/shared/UI';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const defaultQuestion = () => ({
  questionText: '',
  options: ['', '', '', ''],
  correctOption: null,
});

const CreateQuizPage = ({ onNavigate }) => {
  const { currentUser } = useApp();
  const [step, setStep] = useState(1); // 1: meta, 2: questions, 3: success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdQuizId, setCreatedQuizId] = useState('');

  const [meta, setMeta] = useState({ title: '', numQuestions: 5, timeLimitMinutes: 0 });
  const [questions, setQuestions] = useState(() => Array.from({ length: 5 }, defaultQuestion));

  const handleNumQuestionsChange = (num) => {
    const n = Math.max(1, Math.min(50, parseInt(num) || 1));
    setMeta(p => ({ ...p, numQuestions: n }));
    setQuestions(prev => {
      const arr = [...prev];
      while (arr.length < n) arr.push(defaultQuestion());
      return arr.slice(0, n);
    });
  };

  const updateQuestion = (idx, field, value) => {
    setQuestions(prev => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [field]: value };
      return arr;
    });
  };

  const updateOption = (qIdx, oIdx, value) => {
    setQuestions(prev => {
      const arr = [...prev];
      const opts = [...arr[qIdx].options];
      opts[oIdx] = value;
      arr[qIdx] = { ...arr[qIdx], options: opts };
      return arr;
    });
  };

  const validateMeta = () => {
    if (!meta.title.trim()) { setError('Please enter a quiz title.'); return false; }
    if (meta.numQuestions < 1) { setError('At least 1 question is required.'); return false; }
    return true;
  };

  const validateQuestions = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) { setError(`Question ${i + 1}: Please enter the question text.`); return false; }
      for (let j = 0; j < 4; j++) {
        if (!q.options[j].trim()) { setError(`Question ${i + 1}: Option ${OPTION_LABELS[j]} is empty.`); return false; }
      }
      if (q.correctOption === null) { setError(`Question ${i + 1}: Please select the correct answer.`); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateQuestions()) return;
    setLoading(true);
    try {
      const res = await createQuiz({
        teacherId: currentUser.teacherId,
        title: meta.title.trim(),
        questions,
        timeLimitMinutes: parseInt(meta.timeLimitMinutes) || 0,
      });
      setCreatedQuizId(res.data.data.quizId);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create quiz.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Success screen
  if (step === 3) {
    return (
      <div style={{ maxWidth: 520, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: 8 }}>
          Quiz Created!
        </h2>
        <p style={{ color: 'var(--slate-500)', marginBottom: 24 }}>
          Your quiz "<strong>{meta.title}</strong>" is live and ready for students.
        </p>
        <div className="card" style={{ marginBottom: 24, textAlign: 'left' }}>
          <div className="card-body">
            <div className="form-label" style={{ marginBottom: 6 }}>Quiz ID (share with students)</div>
            <div style={{
              padding: '10px 14px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--indigo-600)',
              border: '1px solid var(--slate-200)', wordBreak: 'break-all'
            }}>
              {createdQuizId}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => { setStep(1); setMeta({ title: '', numQuestions: 5, timeLimitMinutes: 0 }); setQuestions(Array.from({ length: 5 }, defaultQuestion)); setCreatedQuizId(''); }}>
            Create Another
          </button>
          <button className="btn btn-primary" onClick={() => onNavigate('teacher-dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="page-header">
        <div>
          <button className="btn btn-ghost btn-sm" style={{ marginBottom: 8 }} onClick={() => step === 1 ? onNavigate('teacher-dashboard') : setStep(1)}>
            ← {step === 1 ? 'Back to Dashboard' : 'Back to Setup'}
          </button>
          <div className="page-title">{step === 1 ? 'Create New Quiz' : `Add Questions (${meta.numQuestions})`}</div>
          <div className="page-subtitle">
            {step === 1 ? 'Set up your quiz details' : `${meta.title} · ${currentUser.subjectName}`}
          </div>
        </div>
        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[1, 2].map(s => (
            <React.Fragment key={s}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: step >= s ? 'var(--indigo-500)' : 'var(--slate-200)',
                color: step >= s ? 'white' : 'var(--slate-500)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 700, transition: 'all 0.2s'
              }}>{s}</div>
              {s < 2 && <div style={{ width: 32, height: 2, background: step > s ? 'var(--indigo-400)' : 'var(--slate-200)' }} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Step 1: Meta */}
      {step === 1 && (
        <div style={{ maxWidth: 560 }}>
          <div className="card">
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="form-group">
                  <label className="form-label">Quiz Title *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Chapter 3: Algebra Fundamentals"
                    value={meta.title}
                    onChange={e => setMeta(p => ({ ...p, title: e.target.value }))}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Number of Questions *</label>
                    <input
                      className="form-input"
                      type="number"
                      min={1}
                      max={50}
                      value={meta.numQuestions}
                      onChange={e => handleNumQuestionsChange(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time Limit (minutes)</label>
                    <input
                      className="form-input"
                      type="number"
                      min={0}
                      placeholder="0 = No limit"
                      value={meta.timeLimitMinutes}
                      onChange={e => setMeta(p => ({ ...p, timeLimitMinutes: e.target.value }))}
                    />
                  </div>
                </div>
                <div style={{
                  padding: '14px 16px',
                  background: 'var(--indigo-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--indigo-200)',
                  fontSize: '0.85rem', color: 'var(--indigo-700)'
                }}>
                  ℹ️ You'll enter questions on the next step. Fields are auto-generated based on the number you select.
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => { setError(''); if (validateMeta()) setStep(2); }}
                >
                  Continue to Questions →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Questions */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 'var(--radius-sm)',
                    background: 'var(--indigo-100)', color: 'var(--indigo-600)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 700, flexShrink: 0
                  }}>
                    {qIdx + 1}
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>Question {qIdx + 1}</span>
                </div>
                {q.correctOption !== null && (
                  <span className="badge badge-green">✓ Answer set</span>
                )}
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label className="form-label">Question Text *</label>
                    <textarea
                      className="form-textarea"
                      placeholder="Type your question here..."
                      value={q.questionText}
                      onChange={e => updateQuestion(qIdx, 'questionText', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ marginBottom: 10, display: 'block' }}>
                      Options * <span style={{ color: 'var(--slate-400)', fontWeight: 400 }}>— click the radio to mark correct answer</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 14px',
                          border: `2px solid ${q.correctOption === oIdx ? 'var(--emerald-400)' : 'var(--slate-200)'}`,
                          borderRadius: 'var(--radius-md)',
                          background: q.correctOption === oIdx ? '#d1fae5' : 'var(--white)',
                          transition: 'all 0.15s'
                        }}>
                          <input
                            type="radio"
                            name={`q-${qIdx}-correct`}
                            checked={q.correctOption === oIdx}
                            onChange={() => updateQuestion(qIdx, 'correctOption', oIdx)}
                            style={{ accentColor: 'var(--emerald-500)', width: 16, height: 16, flexShrink: 0 }}
                          />
                          <div style={{
                            width: 24, height: 24, borderRadius: 6,
                            background: q.correctOption === oIdx ? 'var(--emerald-500)' : 'var(--slate-100)',
                            color: q.correctOption === oIdx ? 'white' : 'var(--slate-500)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                          }}>
                            {OPTION_LABELS[oIdx]}
                          </div>
                          <input
                            style={{
                              border: 'none', outline: 'none',
                              fontFamily: 'var(--font-main)', fontSize: '0.9rem',
                              color: 'var(--slate-700)', background: 'transparent', width: '100%'
                            }}
                            placeholder={`Option ${OPTION_LABELS[oIdx]}`}
                            value={opt}
                            onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
            <button className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleSubmit}
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? '⏳ Creating Quiz...' : '🚀 Publish Quiz'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateQuizPage;
