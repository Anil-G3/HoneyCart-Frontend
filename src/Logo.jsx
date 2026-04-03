import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo2 from './assets/logo2.svg';

export default function Logo({ to = '/categories' }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to === '#') return;
    navigate(to);
  };

  return (
    <div
      className={`logo-container${to === '#' ? ' logo-container--static' : ''}`}
      onClick={handleClick}
    >
      <img
        src={logo2}
        alt="HoneyCart Logo"
        className="logo-image"
        onError={(e) => { e.target.src = 'fallback-logo.png'; }}
      />
      <span className="logo-text">HoneyCart</span>
    </div>
  );
}