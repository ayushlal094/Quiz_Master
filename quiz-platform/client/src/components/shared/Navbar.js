import React from 'react';
import { useApp } from '../../context/AppContext';

const Navbar = () => {
  const { currentUser, logout } = useApp();

  return (
    <nav className="navbar">
      <a className="navbar-brand" href="/" onClick={(e) => { e.preventDefault(); if (currentUser) logout(); }}>
        <div className="brand-icon">🎯</div>
        <span>QuizMaster</span>
      </a>
      <div className="navbar-actions">
        {currentUser && (
          <>
            <div className="navbar-user">
              <span>{currentUser.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'}</span>
              <span>
                {currentUser.role === 'teacher'
                  ? currentUser.fullName
                  : `UID: ${currentUser.uid}`}
              </span>
              <span className={`badge ${currentUser.role === 'teacher' ? 'badge-amber' : 'badge-indigo'}`}>
                {currentUser.role === 'teacher' ? 'Teacher' : 'Student'}
              </span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={logout}>
              Sign Out
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
