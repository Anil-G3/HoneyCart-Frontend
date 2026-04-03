import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import './assets/styles.css';

export function ProfileDropdown({ username }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:9090/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleOrdersClick = () => navigate('/orders');

  return (
    <>
      <div className="profile-dropdown">
        <button className="profile-button" onClick={toggleDropdown}>
          <div className="user-avatar-icon">
            {(String(username || 'G')).charAt(0).toUpperCase()}
          </div>
          <span className="username">{username || 'Guest'}</span>
        </button>
        {isOpen && (
          <div className="dropdown-menu">
            <a onClick={() => { setShowProfile(true); setIsOpen(false); }}>Profile</a>
            <a onClick={handleOrdersClick}>Orders</a>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>

      {/* Profile overlay */}
      {showProfile && <ProfilePage onClose={() => setShowProfile(false)} />}
    </>
  );
}