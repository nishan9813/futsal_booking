
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../authenticated/axiosCredint";

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
      <main className="bg-gray-50 min-h-screen p-6 space-y-12">
  {/* Hero Section */}
  <section className="bg-indigo-600 text-white rounded-xl p-10 shadow-lg flex flex-col items-center text-center space-y-4 animate-fade-in">
    <h1 className="text-4xl md:text-5xl font-bold">Welcome to MyApp Futsal Booking System</h1>
    <p className="text-lg md:text-xl max-w-2xl">Reserve your favorite futsal grounds effortlessly. Manage bookings, track your schedule, and never miss your game time!</p>
    <Link to="/grounds" className="bg-amber-400 text-indigo-900 px-6 py-3 rounded-lg font-semibold hover:bg-amber-300 transition">View All Grounds</Link>
  </section>

  {/* Booking Section */}
  {user && (
    <section className="bg-white rounded-xl shadow-md p-6 animate-slide-up">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Recent Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-500">You don’t have any bookings yet. Start by exploring grounds and booking your first slot!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-4 py-2 text-left text-gray-600">Futsal Name</th>
                <th className="px-4 py-2 text-left text-gray-600">Ground Type</th>
                <th className="px-4 py-2 text-left text-gray-600">Date</th>
                <th className="px-4 py-2 text-left text-gray-600">Time Slot</th>
                <th className="px-4 py-2 text-left text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map((booking) => {
                const past = isPastBooking(booking.booking_date, booking.time_slot);
                return (
                  <tr key={booking.id} className={past ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-800'}>
                    <td className="px-4 py-2">{booking.futsal_name || "N/A"}</td>
                    <td className="px-4 py-2">{booking.ground_type || "N/A"}</td>
                    <td className="px-4 py-2">{booking.booking_date}</td>
                    <td className="px-4 py-2">{booking.time_slot}</td>
                    <td className="px-4 py-2">{past ? "Completed" : "Upcoming"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <Link to="/all-bookings" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500 transition">View All Bookings</Link>
      </div>
    </section>
  )}

  {/* Login prompt */}
  {!user && (
    <section className="text-center text-gray-600">
      <p>Please <Link to="/login" className="text-indigo-600 hover:underline">login</Link> to start booking your futsal sessions and enjoy exclusive features.</p>
    </section>
  )}
</main>

{/* Footer */}
<footer className="bg-white shadow-inner p-4 mt-12">
  <div className="flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
    <p>© 2025 MyApp Futsal Booking System. All rights reserved.</p>
    <nav className="flex space-x-4 mt-2 md:mt-0">
      <Link to="/" className="hover:text-indigo-600 transition">Home</Link>
      <Link to="/grounds" className="hover:text-indigo-600 transition">Grounds</Link>
    </nav>
  </div>
</footer>


    </>
  );
}

export default Home;
