import React, { useEffect, useState } from "react";
import axiosClient from "../../authenticated/axiosCredint";

const OwnerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    fetchBookings();
  }, [dateFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/api/owner-history/", {
        params: dateFilter ? { date: dateFilter } : {},
      });
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      alert("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await axiosClient.patch(`/api/owner/bookings/${bookingId}/cancel/`);
      alert("Booking cancelled successfully!");
      fetchBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking.");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Owner Booking Dashboard</h1>

      <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={() => setDateFilter("")}
          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg shadow-sm"
        >
          Clear
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-600">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto shadow-lg rounded-lg">
          <table className="min-w-full bg-white">
            <thead className="bg-indigo-600 text-white">
              <tr>
                <th className="p-3 text-left">Ground</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Time Slot</th>
                <th className="p-3 text-left">Booked By</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b hover:bg-gray-100">
                  <td className="p-3">{booking.ground_name}</td>
                  <td className="p-3">{booking.booking_date}</td>
                  <td className="p-3">{booking.time_slot}</td>
                  <td className="p-3">{booking.user_name}</td>
                  <td className={`p-3 font-medium ${booking.status.toLowerCase() === "cancelled" ? "text-red-500" : "text-green-600"}`}>
                    {booking.status}
                  </td>
                  <td className="p-3">
                    {booking.status.toLowerCase() !== "cancelled" && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
