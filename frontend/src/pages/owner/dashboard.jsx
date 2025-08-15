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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Owner Booking Dashboard</h1>

      <div className="mb-4 flex gap-2">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={() => setDateFilter("")}
          className="bg-gray-300 px-3 py-2 rounded"
        >
          Clear
        </button>
      </div>

      {loading ? (
        <p>Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border">Ground</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Time Slot</th>
              <th className="p-2 border">Booked By</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="text-center">
                <td className="p-2 border">{booking.ground_name}</td>
                <td className="p-2 border">{booking.booking_date}</td>
                <td className="p-2 border">{booking.time_slot}</td>
                <td className="p-2 border">{booking.user_name}</td>
                <td className="p-2 border">{booking.status}</td>
                <td className="p-2 border">
                  {booking.status.toLowerCase() !== "cancelled" && (
                    <button
                      onClick={() => cancelBooking(booking.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OwnerDashboard;
