import React from 'react';

export const LoadingSpinner = ({ text = 'Loading...' }) => (
  <div className="loading-center">
    <div className="spinner" />
    <p className="loading-text">{text}</p>
  </div>
);

export const Alert = ({ type = 'info', message, onClose }) => {
  if (!message) return null;
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  return (
    <div className={`alert alert-${type}`}>
      <span>{icons[type]}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.6 }}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className="empty-state">
    <div className="empty-icon">{icon}</div>
    <div className="empty-title">{title}</div>
    {description && <div className="empty-desc">{description}</div>}
    {action}
  </div>
);

export const StatCard = ({ icon, iconClass, value, label }) => (
  <div className="stat-card">
    <div className={`stat-icon ${iconClass}`}>{icon}</div>
    <div className="stat-value">{value ?? '—'}</div>
    <div className="stat-label">{label}</div>
  </div>
);
