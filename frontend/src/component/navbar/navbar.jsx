import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosClient from '../../authenticated/axiosCredint';

function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const MEDIA_URL = 'http://127.0.0.1:8000/media/';

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const res = await axiosClient.get('/api/current_user/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data.user || null);
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [location]);

  if (loading) return <nav className="navbar">Loading...</nav>;

  if (!user) {
    return (
      <nav className="navbar">
        <div className="navbar-left"></div>
        <div className="navbar-center">
          <Link to="/" className="logo">Futsal Booking</Link>
        </div>
        <div className="navbar-right">
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="nav-link">Register</Link>
        </div>
      </nav>
    );
  }

  const profileImage = user.profile_pic
    ? (user.profile_pic.startsWith('http') ? user.profile_pic : `${MEDIA_URL}${user.profile_pic}`)
    : null;

  const displayName = user.role === 'owner' ? user.futsal_name : user.username;

  return (
    <nav className="bg-white shadow-md px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-4">
        <Link to={`/userEdit/${user?.id}`} className="flex items-center space-x-2">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-white font-bold">U</div>
          )}
          <span className="text-gray-800 font-medium">Welcome, <strong>{displayName}</strong></span>
        </Link>
      </div>

      <div className="text-xl font-bold text-indigo-600">
        <Link to="/">🏠 Futsal Booking</Link>
      </div>

      <div className="flex items-center space-x-3">
        {user.role === 'owner' && (
          <>
            <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 transition">Dashboard</Link>
            <Link to={`/ownerEdit/${user.id}`} className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-500 transition">Edit Ground</Link>
          </>
        )}
        {user.role === 'admin' && (
          <Link to="/admin-panal" className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-500 transition">Admin Panel</Link>
        )}
        {user.role === 'user' && (
          <Link to="/register-owner" className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-500 transition">Register a Ground</Link>
        )}
        <Link to="/logout" className="text-red-600 hover:text-red-400 transition">Logout</Link>
      </div>
    </nav>

  );
}

export default Navbar;
