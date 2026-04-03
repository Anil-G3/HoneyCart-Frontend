import React, { useEffect, useState } from 'react';
import API_BASE from './api';
import './assets/styles.css';

export default function ProfilePage({ onClose }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/session`, {
          credentials: 'include',
        });
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-card" onClick={(e) => e.stopPropagation()}>
        <button className="profile-close-btn" onClick={onClose}>✕</button>

        <div className="profile-avatar-large">
          {(user?.username || 'U').charAt(0).toUpperCase()}
        </div>

        <h2 className="profile-name">{user?.username || '...'}</h2>
        <span className="profile-role-badge">{user?.role || '...'}</span>

        <div className="profile-details">
          <div className="profile-detail-row">
            <span className="profile-detail-key">Username</span>
            <span className="profile-detail-val"><b>{user?.username || '...'}</b></span>
          </div>
          <div className="profile-detail-row">
            <span className="profile-detail-key">Email</span>
            <span className="profile-detail-val"><b>{user?.email || '...'}</b></span>
          </div>
          <div className="profile-detail-row">
            <span className="profile-detail-key">Role</span>
            <span className="profile-detail-val"><b>{user?.role || '...'}</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}