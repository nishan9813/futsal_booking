// src/components/Logout.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Helper to get CSRF token from cookies
const getCsrfToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
};

const Logout = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  useEffect(() => {
    const logoutUser = async () => {
      try {
        const csrfToken = getCsrfToken();
        if (!csrfToken) {
          throw new Error('CSRF token missing. Please refresh the page.');
        }

        // Send POST request to logout
        await axios.post('/api/logout/', {}, {
          headers: {
            'X-CSRFToken': csrfToken,
          },
          withCredentials: true, // important for sending cookies
        });

        setMessage('✅ Logged out successfully.');
        // Optional: redirect to login or homepage
        setTimeout(() => navigate('/login'), 1500);
      } catch (err) {
        console.error('Logout failed:', err);
        const errMsg = err.response?.data || 'Logout failed';
        setMessage('❌ ' + JSON.stringify(errMsg));
      }
    };

    logoutUser();
  }, [navigate]);

  return (
    <div>
      <h2>Logging out...</h2>
      <p>{message}</p>
    </div>
  );
};

export default Logout;
