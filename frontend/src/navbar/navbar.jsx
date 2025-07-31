import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';

function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Helper to get CSRF token from cookies (optional)
  const getCsrfToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
  };

  useEffect(() => {
    setLoading(true);

    // Fetch CSRF token first (if your backend requires it)
    axios.get('/api/csrf/', { withCredentials: true })
      .then(() => 
        // Then fetch current user, sending cookies withCredentials
        axios.get('/api/current_user/', { withCredentials: true })
      )
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

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {user?.profile_pic ? (
          <img
            src={user.profile_pic}
            alt={`${displayName} profile`}
            className="profile-pic"
          />
        ) : user ? (
          <div className="profile-placeholder">{initial}</div>
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
