import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';

function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Default fallback image URL (adjust to your backend URL and path)
  const DEFAULT_PROFILE_PIC_URL = 'http://127.0.0.1:8000/media/defaults/pfp.png';

  useEffect(() => {
    setLoading(true);

    axios.get('/api/csrf/', { withCredentials: true })
      .then(() => axios.get('/api/current_user/', { withCredentials: true }))
      .then(res => {
        setUser(res.data.user || null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [location]);

  if (loading) {
    return <nav className="navbar">Loading...</nav>;
  }

  const displayName = user?.role === 'owner' ? user.futsal_name : user?.username;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '';

  // Use profile_pic_url if available, else fallback to default
  const profileImage = user?.profile_pic_url || DEFAULT_PROFILE_PIC_URL;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {user ? (
          <img
            src={profileImage}
            alt={`${displayName} profile`}
            className="profile-pic"
            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PROFILE_PIC_URL; }} // fallback if broken
          />
        ) : null}
        {user && (
          <span className="welcome-text">
            Welcome, <strong>{displayName}</strong>
          </span>
        )}
      </div>

      <div className="navbar-center">
        <Link to="/" className="logo">MyApp</Link>
      </div>

      <div className="navbar-right">
        {user ? (
          <>
            <Link to="/dashboard" className="nav-link">Dashboard</Link>

            {user.role === 'owner' && (
              <Link to="/edit-ground" className="nav-link special-btn">Edit Ground</Link>
            )}

            {user.role === 'admin' && (
              <Link to="/admin" className="nav-link special-btn">Admin Panel</Link>
            )}

            <Link to="/logout" className="logout-btn">Logout</Link>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
