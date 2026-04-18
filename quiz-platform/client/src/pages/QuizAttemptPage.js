import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getQuizForStudent, submitQuiz } from '../services/api';
import { LoadingSpinner, Alert } from '../components/shared/UI';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

// ─── Timer component ───────────────────────────────────────────────────────────
const Timer = ({ seconds, onExpire }) => {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (seconds === 0) return;
    const id = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(id); onExpire(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [seconds, onExpire]);

  if (seconds === 0) return null;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const danger = remaining < 60;
  const warning = remaining < 180;

  return (
    <div className={`timer-display ${danger ? 'danger' : warning ? 'warning' : ''}`}>
      <span>⏱️</span>
      <span>{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
    </div>
  );
};

// ─── Results Screen ────────────────────────────────────────────────────────────
const ResultScreen = ({ result, onBack }) => {
  const [showReview, setShowReview] = useState(false);
  const { score, correctAnswers, totalQuestions, detailedAnswers } = result;

  const grade =
    score >= 90 ? { label: 'Excellent!', emoji: '🏆', color: 'var(--emerald-600)' } :
    score >= 75 ? { label: 'Great Job!', emoji: '🌟', color: 'var(--emerald-500)' } :
    score >= 50 ? { label: 'Good Effort!', emoji: '👍', color: 'var(--amber-600)' } :
                  { label: 'Keep Practicing!', emoji: '💪', color: 'var(--rose-500)' };

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 24px 60px' }}>
      {/* Score card */}
      <div className="card" style={{ marginBottom: 24, textAlign: 'center' }}>
        <div className="card-body" style={{ padding: '40px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>{grade.emoji}</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: grade.color, marginBottom: 8 }}>
            {grade.label}
          </h2>
          <div style={{
            width: 130, height: 130, borderRadius: '50%', margin: '20px auto',
            background: `conic-gradient(${score >= 80 ? 'var(--emerald-400)' : score >= 50 ? 'var(--amber-400)' : 'var(--rose-400)'} ${score * 3.6}deg, var(--slate-200) 0)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute', inset: 10, borderRadius: '50%',
              background: 'white', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center'
            }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--slate-900)', lineHeight: 1 }}>{score}%</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600 }}>SCORE</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-600)' }}>{correctAnswers}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 500 }}>Correct</div>
            </div>
            <div style={{ width: 1, background: 'var(--slate-200)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--rose-400)' }}>{totalQuestions - correctAnswers}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 500 }}>Incorrect</div>
            </div>
            <div style={{ width: 1, background: 'var(--slate-200)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--slate-700)' }}>{totalQuestions}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 500 }}>Total</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onBack}>← Dashboard</button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setShowReview(!showReview)}>
          {showReview ? 'Hide Review' : '📋 Review Answers'}
        </button>
      </div>

      {/* Answer Review */}
      {showReview && detailedAnswers && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h3 style={{ fontWeight: 700, color: 'var(--slate-800)' }}>Answer Review</h3>
          {detailedAnswers.map((a, i) => (
            <div key={i} className="card">
              <div className="card-body">
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 6, flexShrink: 0,
                    background: a.isCorrect ? '#d1fae5' : '#ffe4e6',
                    color: a.isCorrect ? 'var(--emerald-600)' : 'var(--rose-500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.85rem', fontWeight: 700
                  }}>
                    {a.isCorrect ? '✓' : '✗'}
                  </div>
                  <div style={{ fontWeight: 600, color: 'var(--slate-800)', lineHeight: 1.4 }}>
                    Q{i + 1}: {a.questionText}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {a.options.map((opt, oIdx) => {
                    const isCorrect = oIdx === a.correctOption;
                    const isSelected = oIdx === a.selectedOption;
                    const showWrong = isSelected && !isCorrect;
                    return (
                      <div key={oIdx} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 14px', borderRadius: 'var(--radius-sm)',
                        background: isCorrect ? '#d1fae5' : showWrong ? '#ffe4e6' : 'var(--slate-50)',
                        border: `1.5px solid ${isCorrect ? 'var(--emerald-300)' : showWrong ? 'var(--rose-300)' : 'var(--slate-200)'}`,
                      }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 4, flexShrink: 0,
                          background: isCorrect ? 'var(--emerald-500)' : showWrong ? 'var(--rose-400)' : 'var(--slate-200)',
                          color: (isCorrect || showWrong) ? 'white' : 'var(--slate-500)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.72rem', fontWeight: 700
                        }}>
                          {OPTION_LABELS[oIdx]}
                        </div>
                        <span style={{ fontSize: '0.88rem', color: 'var(--slate-700)' }}>{opt}</span>
                        {isCorrect && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 600, color: 'var(--emerald-600)' }}>✓ Correct</span>}
                        {showWrong && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 600, color: 'var(--rose-500)' }}>✗ Your answer</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Quiz Page ────────────────────────────────────────────────────────────
const QuizAttemptPage = ({ quizId, onBack }) => {
  const { currentUser } = useApp();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    (async () => {
      try {
        const res = await getQuizForStudent(quizId);
        setQuiz(res.data.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load quiz.');
        setLoading(false);
      }
    })();
  }, [quizId]);

  const handleTimerExpire = useCallback(() => {
    handleSubmit(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  const handleSelect = (qIdx, oIdx) => {
    setAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  const handleSubmit = async (auto = false) => {
    setShowConfirm(false);
    setSubmitting(true);
    setError('');
    try {
      const timeTaken = Math.floor((Date.now() - startTime.current) / 1000);
      const answersArr = (quiz?.questions || []).map((_, i) =>
        answers[i] !== undefined ? answers[i] : -1
      );
      const res = await submitQuiz({
        studentUid: currentUser.uid,
        studentName: currentUser.name || '',
        quizId,
        answers: answersArr,
        timeTakenSeconds: timeTaken,
      });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading quiz..." />;
  if (error && !quiz) return (
    <div className="container" style={{ paddingTop: 40, textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: 16 }}>😕</div>
      <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>Oops! {error}</div>
      <button className="btn btn-primary" onClick={onBack}>← Back to Dashboard</button>
    </div>
  );
  if (result) return <ResultScreen result={result} onBack={onBack} />;

  const total = quiz.questions.length;
  const answered = Object.keys(answers).length;
  const q = quiz.questions[currentQ];

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 60px' }}>
      {/* Quiz header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => {
            if (window.confirm('Leave quiz? Your progress will be lost.')) onBack();
          }}>← Exit</button>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--slate-800)', marginTop: 8 }}>{quiz.title}</div>
          <div className="text-muted text-sm">{quiz.subject} · {quiz.teacherName}</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-indigo">{answered}/{total} answered</span>
          <Timer seconds={quiz.timeLimitMinutes * 60} onExpire={handleTimerExpire} />
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError('')} />

      {/* Progress bar */}
      <div className="question-progress-bar" style={{ marginBottom: 24 }}>
        <div className="question-progress-fill" style={{ width: `${((currentQ + 1) / total) * 100}%` }} />
      </div>

      {/* Question dots */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 24 }}>
        {quiz.questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            style={{
              width: 32, height: 32, borderRadius: 6, border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-main)', fontSize: '0.78rem', fontWeight: 700,
              background: i === currentQ
                ? 'var(--indigo-500)'
                : answers[i] !== undefined
                  ? 'var(--emerald-400)'
                  : 'var(--slate-200)',
              color: (i === currentQ || answers[i] !== undefined) ? 'white' : 'var(--slate-600)',
              transition: 'all 0.15s'
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body">
          <div className="question-number" style={{ marginBottom: 12 }}>
            QUESTION {currentQ + 1} OF {total}
          </div>
          <div className="question-text">{q.questionText}</div>
          <div className="options-list">
            {q.options.map((opt, oIdx) => (
              <div
                key={oIdx}
                className={`option-item ${answers[currentQ] === oIdx ? 'selected' : ''}`}
                onClick={() => handleSelect(currentQ, oIdx)}
              >
                <div className="option-label">{OPTION_LABELS[oIdx]}</div>
                <span className="option-text">{opt}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <button
          className="btn btn-secondary"
          onClick={() => setCurrentQ(p => Math.max(0, p - 1))}
          disabled={currentQ === 0}
        >
          ← Previous
        </button>

        <div style={{ display: 'flex', gap: 10 }}>
          {currentQ < total - 1 ? (
            <button className="btn btn-primary" onClick={() => setCurrentQ(p => p + 1)}>
              Next →
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={() => setShowConfirm(true)}
              disabled={submitting}
            >
              {submitting ? '⏳ Submitting...' : '✅ Submit Quiz'}
            </button>
          )}
        </div>
      </div>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header" style={{ paddingBottom: 16 }}>
              <div className="modal-title">Submit Quiz?</div>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--slate-600)', marginBottom: 16, lineHeight: 1.6 }}>
                You've answered <strong>{answered}</strong> of <strong>{total}</strong> questions.
                {answered < total && (
                  <span style={{ color: 'var(--amber-600)' }}> {total - answered} question(s) are unanswered.</span>
                )}
              </p>
              <p style={{ color: 'var(--slate-500)', fontSize: '0.88rem', marginBottom: 24 }}>
                Once submitted, you cannot change your answers.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>
                  Go Back
                </button>
                <button
                  className="btn btn-primary" style={{ flex: 1 }}
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                >
                  {submitting ? '⏳...' : 'Confirm Submit'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizAttemptPage;
