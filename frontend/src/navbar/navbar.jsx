import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axiosClient from '../authenticated/axiosCredint';
import './Navbar.css';

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
    <nav className="navbar">
      <div className="navbar-left">
        <Link to={`/userEdit/${user.id}`} className="profile-link">
          {profileImage ? (
            <img src={profileImage} alt={`${displayName} profile`} className="profile-pic" />
          ) : (
            <div className="profile-pic-placeholder" />
          )}
        </Link>
        <span className="welcome-text">
          Welcome, <strong>{displayName}</strong>
        </span>
      </div>

      <div className="navbar-center">
        <Link to="/" className="logo">Futsal Booking</Link>
      </div>

      <div className="navbar-right">
        {user.role === 'owner' && (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to={`/ownerEdit/${user.id}`} className="nav-link special-btn">Edit Ground</Link>
          </>
        )}

        {user.role === 'admin' && (
          <Link to="/admin-panal" className="nav-link special-btn">Admin Panel</Link>
        )}

        {user.role === 'user' && (
          <Link to="/register-owner" className="nav-link special-btn">Register a Ground</Link>
        )}

        <Link to="/logout" className="logout-btn">Logout</Link>
      </div>
    </nav>
  );
}

export default Navbar;
