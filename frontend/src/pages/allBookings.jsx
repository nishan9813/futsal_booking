import React, { useEffect, useState } from "react";
import axiosClient from "../authenticated/axiosCredint";

function AllBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    axiosClient
      .get("/api/user-history/")
      .then((res) => setBookings(res.data))
      .catch((err) => {
        console.error("Failed to fetch bookings:", err);
        setBookings([]);
      });
  }, []);

  return (
    <main className="bg-gray-50 min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-6">Your Bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-4 py-2 text-left">Futsal</th>
                <th className="px-4 py-2 text-left">Type</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="px-4 py-2">{booking.futsal_name || "N/A"}</td>
                  <td className="px-4 py-2">{booking.ground_type || "N/A"}</td>
                  <td className="px-4 py-2">{booking.booking_date}</td>
                  <td className="px-4 py-2">{booking.time_slot}</td>
                  <td className="px-4 py-2">{booking.price || "N/A"}</td>
                  <td className="px-4 py-2">{booking.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default AllBookings;
