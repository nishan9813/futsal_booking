import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css'; // Import CSS

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/csrf/', { withCredentials: true })
      .then(() => axios.get('/api/current_user/', { withCredentials: true }))
      .then(res => {
        if (res.data.user) setUser(res.data.user);
        else setUser(null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="loading-text">Loading...</p>;

  return (
    <main className="home-container">
      <h1 className="home-title">Welcome to MyApp Booking System</h1>
      <p className="home-description">
        Easily reserve your spot and manage bookings with our user-friendly platform.
      </p>

      {user ? (
        <Link to="/booking" className="btn primary-btn">
          Start Booking
        </Link>
      ) : (
        <p className="login-prompt">
          Please <Link to="/login" className="login-link">login</Link> to start booking.
        </p>
      )}
    </main>
  );
}

export default Home;
