import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import API_BASE from './api';

export default function ProtectedRoute({ children, requiredRole }) {
  const [status, setStatus]   = useState('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/session`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (requiredRole && data.role !== requiredRole) {
            setMessage('You are not authorized to access that page.');
            setStatus('denied');
          } else {
            setStatus('allowed');
          }
        } else {
          setMessage('Please login to continue.');
          setStatus('denied');
        }
      } catch (error) {
        setMessage('Something went wrong. Please login again.');
        setStatus('denied');
      }
    };

    checkAuth();
  }, []);

  if (status === 'checking') return <p>Loading...</p>;

  if (status === 'denied') {
    if (requiredRole === 'ADMIN') {
      return <Navigate to="/admin" replace state={{ message }} />;
    }
    return <Navigate to="/" replace state={{ message }} />;
  }

  return children;
}