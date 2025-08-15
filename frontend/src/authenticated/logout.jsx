import React, { useEffect, useState } from 'react';
import axiosClient from './axiosCredint';
import { useNavigate } from 'react-router-dom';

const fadeInKeyframes = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// Inject keyframes into a style tag in the document head
const injectKeyframes = () => {
  if (!document.getElementById('fadeIn-keyframes')) {
    const style = document.createElement('style');
    style.id = 'fadeIn-keyframes';
    style.innerHTML = fadeInKeyframes;
    document.head.appendChild(style);
  }
};

const Logout = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  useEffect(() => {
    injectKeyframes();

    const logoutUser = async () => {
      try {
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          setMessage('❌ No refresh token found. You are probably logged out.');
          setTimeout(() => navigate('/login'), 1500);
          return;
        }

        await axiosClient.post('/api/logout/', { refresh: refreshToken });

        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        localStorage.removeItem('email');
        localStorage.removeItem('role');

        setMessage('✅ Logged out successfully.');

        setTimeout(() => navigate('/login'), 1500);
      } catch (err) {
        console.error('Logout failed:', err);
        const errMsg = err.response?.data?.detail || 'Logout failed';
        setMessage('❌ ' + errMsg);
      }
    };

    logoutUser();
  }, [navigate]);

  const styles = {
    wrapper: {
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: '#222',
      color: '#ddd',
      fontFamily: "'Poppins', sans-serif",
      padding: '2rem',
      borderRadius: '1rem',
      maxWidth: '400px',
      margin: '3rem auto',
      borderTop: '4px solid #27ae60',
      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.6)',
      animation: 'fadeIn 0.6s ease forwards',
    },
    heading: {
      color: '#27ae60',
      marginBottom: '1rem',
    },
    message: {
      fontSize: '1rem',
      marginTop: '0.5rem',
      minHeight: '1.2rem',
    },
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.heading}>Logging out...</h2>
      <p style={styles.message}>{message}</p>
    </div>
  );
};

export default Logout;
