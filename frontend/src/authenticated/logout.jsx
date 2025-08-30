import React, { useEffect, useState } from 'react';
import axiosClient from './axiosCredint';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  useEffect(() => {
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

  return (
    <div className="min-h-[60vh] flex flex-col justify-center items-center bg-secondary text-light p-8 rounded-xl max-w-md mx-auto mt-12 border-t-4 border-primary shadow-xl animate-fade-in font-sans">
      <h2 className="text-primary text-2xl mb-4">Logging out...</h2>
      <p className="text-base mt-2 min-h-[1.2rem]">{message}</p>
    </div>

  );
};

export default Logout;
