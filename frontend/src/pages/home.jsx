
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../authenticated/axiosCredint";
import "./Home.css";

function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  // Fetch current logged-in user
  useEffect(() => {
    axiosClient
      .get("/api/current_user/")
      .then((res) => {
        if (res.data.user) setUser(res.data.user);
        else setUser(null);
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Fetch user bookings (only if logged in)
  useEffect(() => {
    if (!user) return;

    axiosClient
      .get("/api/user-history/")
      .then((res) => {
        setBookings(res.data.slice(0, 5)); // limit to 5 recent bookings
      })
      .catch((err) => {
        console.error("Failed to fetch bookings:", err);
        setBookings([]);
      });
  }, [user]);

  if (loading)
    return <p className="loading-text animate-fade-in">Loading your data...</p>;

  // Helper: check if a booking is in the past
  const isPastBooking = (dateStr, timeStr) => {
    const startTime = timeStr.split(" - ")[0]; // only start time
    const bookingDateTime = new Date(`${dateStr} ${startTime}`);
    return bookingDateTime < new Date();
  };

  return (
    <>
      <main className="home-container animate-slide-up">
        {/* Hero Section */}
        <section className="hero-section">
          <h1 className="home-title">Welcome to MyApp Futsal Booking System</h1>
          <p className="home-description">
            Reserve your favorite futsal grounds effortlessly. Manage bookings,
            track your schedule, and never miss your game time!
          </p>
          <Link to="/grounds" className="btn primary-btn hero-btn">
            View All Grounds
          </Link>
        </section>

        {/* Booking Section */}
        {user && (
          <section className="booking-section">
            <h2 className="section-title">Your Recent Bookings</h2>
            {bookings.length === 0 ? (
              <p className="no-bookings-msg">
                You don’t have any bookings yet. Start by exploring grounds and
                booking your first slot!
              </p>
            ) : (
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
                  {bookings.map((booking) => {
                    const past = isPastBooking(booking.booking_date, booking.time_slot);
                    return (
                      <tr
                        key={booking.id}
                        className={past ? "booking-past" : "booking-upcoming"}
                      >
                        <td>{booking.futsal_name || "N/A"}</td>
                        <td>{booking.ground?.ground_type || "N/A"}</td>
                        <td>{booking.booking_date}</td>
                        <td>{booking.time_slot}</td>
                        <td>{past ? "Completed" : "Upcoming"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <div className="all-bookings-btn-container">
              <Link to="/all-bookings" className="btn primary-btn">
                View All Bookings
              </Link>
            </div>
          </section>
        )}

        {/* Login prompt for guests */}
        {!user && (
          <section className="login-prompt-section">
            <p className="login-prompt">
              Please{" "}
              <Link to="/login" className="login-link">
                login
              </Link>{" "}
              to start booking your futsal sessions and enjoy exclusive features.
            </p>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>© 2025 MyApp Futsal Booking System. All rights reserved.</p>
          <nav className="footer-nav">
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/grounds" className="footer-link">Grounds</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}

export default Home;
