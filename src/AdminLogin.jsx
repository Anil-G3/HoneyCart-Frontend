import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE from './api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const authMessage = location.state?.message;

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.role === 'ADMIN') {
          navigate('/admindashboard');
        } else if (data.role === 'CUSTOMER') {
          navigate('/customerhome');
        } else {
          navigate('/admin');
        }
      } else {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Unexpected error occurred');
    }
  };

  return (
    <div className="page-layout">
      <div className="page-container1">
        <div className="form-container">
          <h1 className="form-title">Admin Login</h1>
          {authMessage && <p className="error-message">{authMessage}</p>}
          {error && <p className="error-message">{error}</p>}

          <form onSubmit={handleSignIn} className="form-content">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter Admin username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <button type="submit" className="form-button">Enter As Admin</button>
          </form>

          <div className="form-footer">
            <a href="/" className="form-link">Not Admin? Login As User!</a>
          </div>
        </div>
      </div>
    </div>
  );
}