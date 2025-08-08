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

    // Use the correct API endpoints - use relative paths for consistency
    axios.get('http://127.0.0.1:8000/api/csrf/', { withCredentials: true })
      .then(() => axios.get('http://127.0.0.1:8000/api/current_user/', { withCredentials: true }))
      .then(res => {
        // The backend returns the user data directly in res.data
        setUser(res.data || null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [location]);

  if (loading) {
    return <nav className="navbar">Loading...</nav>;
  }

  const displayName = user?.role === 'owner' ? user.futsal_name : user?.username;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '';

  // Use profile_pic field from backend, else fallback to default
  const profileImage = user?.profile_pic || DEFAULT_PROFILE_PIC_URL;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {user ? (
          <Link to={`/userEdit/${user.id}`} className="profile-link">
            <img
              src={profileImage}
              alt={`${displayName} profile`}
              className="profile-pic"
              onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_PROFILE_PIC_URL; }}
            />
          </Link>
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

            {(user.role === 'user' || user.role === 'owner') && (
              <Link to="/register-owner" className="nav-link special-btn">Register a Ground</Link>
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
