import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/shared/Navbar';
import HomePage from './pages/HomePage';
import TeacherDashboard from './pages/TeacherDashboard';
import CreateQuizPage from './pages/CreateQuizPage';
import StudentDashboard from './pages/StudentDashboard';
import QuizAttemptPage from './pages/QuizAttemptPage';
import './styles/global.css';

// Inner app uses context
const AppInner = () => {
  const { currentUser } = useApp();
  const [page, setPage] = useState('home');
  const [activeQuizId, setActiveQuizId] = useState(null);

  const navigate = (target) => {
    setPage(target);
    window.scrollTo(0, 0);
  };

  const startQuiz = (quizId) => {
    setActiveQuizId(quizId);
    setPage('quiz-attempt');
    window.scrollTo(0, 0);
  };

  // Redirect unauthenticated users
  const effectivePage = !currentUser && page !== 'home' ? 'home' : page;

  const renderPage = () => {
    switch (effectivePage) {
      case 'home':
        return <HomePage onNavigate={navigate} />;
      case 'teacher-dashboard':
        return <TeacherDashboard onNavigate={navigate} />;
      case 'create-quiz':
        return <CreateQuizPage onNavigate={navigate} />;
      case 'student-dashboard':
        return <StudentDashboard onNavigate={navigate} onStartQuiz={startQuiz} />;
      case 'quiz-attempt':
        return <QuizAttemptPage quizId={activeQuizId} onBack={() => navigate('student-dashboard')} />;
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>
      <footer style={{
        textAlign: 'center', padding: '20px 24px',
        borderTop: '1px solid var(--slate-200)',
        color: 'var(--slate-400)', fontSize: '0.8rem'
      }}>
        QuizMaster Platform · Built with React & Node.js
      </footer>
    </div>
  );
};

const App = () => (
  <AppProvider>
    <AppInner />
  </AppProvider>
);

export default App;
