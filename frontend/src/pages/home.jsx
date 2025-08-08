import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css'; // Your CSS file

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

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

  useEffect(() => {
    if (!user) return;

    axios.get('/api/user-history/', { withCredentials: true })
      .then(res => {
        setBookings(res.data.slice(0, 5)); // limit to 5 bookings
      })
      .catch(err => {
        console.error('Failed to fetch bookings:', err);
        setBookings([]);
      });
  }, [user]);

  if (loading) return <p className="loading-text">Loading...</p>;

  // Helper function to check if booking is in the past
  const isPastBooking = (dateStr, timeStr) => {
    // Assuming dateStr format: YYYY-MM-DD, timeStr format: e.g. "10:00 AM"
    const bookingDateTime = new Date(`${dateStr} ${timeStr}`);
    return bookingDateTime < new Date();
  };

  return (
    <main className="home-container">
      <h1 className="home-title">Welcome to MyApp Booking System</h1>
      <p className="home-description">
        Easily reserve your spot and manage bookings with our user-friendly platform.
      </p>

      {/* View Grounds button - visible to all users */}
      <div className="all-bookings-btn-container" style={{ marginBottom: '2rem' }}>
        <Link to="/grounds" className="btn primary-btn">
          View All Grounds
        </Link>
      </div>

      {user ? (
        <>
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Futsal Name</th>
                <th>Ground</th>
                <th>Date</th>
                <th>Time Slot</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No bookings yet.</td></tr>
              ) : (
                bookings.map(booking => {
                  const past = isPastBooking(booking.booking_date, booking.time_slot);
                  return (
                    <tr key={booking.id} className={past ? 'booking-past' : 'booking-upcoming'}>
                      <td>{booking.futsal_name || 'N/A'}</td>
                      <td>{booking.ground?.ground_type || 'N/A'}</td>
                      <td>{booking.booking_date}</td>
                      <td>{booking.time_slot}</td>
                      <td>{past ? 'Past' : 'Upcoming'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="all-bookings-btn-container">
            <Link to="/all-bookings" className="btn primary-btn">
              View All Bookings
            </Link>
          </div>
          
          <div className="all-bookings-btn-container">
            <Link to={`/userEdit/${user.id}`} className="btn secondary-btn">
              Update Profile
            </Link>
          </div>
        </>
      ) : (
        <p className="login-prompt">
          Please <Link to="/login" className="login-link">login</Link> to start booking.
        </p>
      )}
    </main>
  );
}

export default Home;
