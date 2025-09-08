// import React, { useEffect, useState } from "react";
// import axiosClient from "../authenticated/axiosCredint";

// const OwnerDashboard = () => {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [dateFilter, setDateFilter] = useState("");

//   useEffect(() => {
//     fetchBookings();
//   }, [dateFilter]);

//   const fetchBookings = async () => {
//     try {
//       setLoading(true);
//       const res = await axiosClient.get("/api/owner-history/", {
//         params: dateFilter ? { date: dateFilter } : {},
//       });
//       setBookings(res.data);
//     } catch (error) {
//       console.error("Error fetching bookings:", error);
//       alert("Failed to load bookings.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const cancelBooking = async (bookingId) => {
//     if (!window.confirm("Are you sure you want to cancel this booking?")) return;
//     try {
//       await axiosClient.patch(`/api/owner/bookings/${bookingId}/cancel/`);
//       alert("Booking cancelled successfully!");
//       fetchBookings();
//     } catch (error) {
//       console.error("Error cancelling booking:", error);
//       alert("Failed to cancel booking.");
//     }
//   };

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <h1 className="text-3xl font-bold text-gray-800 mb-6">Owner Booking Dashboard</h1>

//       <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
//         <input
//           type="date"
//           value={dateFilter}
//           onChange={(e) => setDateFilter(e.target.value)}
//           className="border border-gray-300 p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
//         />
//         <button
//           onClick={() => setDateFilter("")}
//           className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg shadow-sm"
//         >
//           Clear
//         </button>
//       </div>

//       {loading ? (
//         <p className="text-gray-600">Loading bookings...</p>
//       ) : bookings.length === 0 ? (
//         <p className="text-gray-600">No bookings found.</p>
//       ) : (
//         <div className="overflow-x-auto shadow-lg rounded-lg">
//           <table className="min-w-full bg-white">
//             <thead className="bg-indigo-600 text-white">
//               <tr>
//                 <th className="p-3 text-left">Ground</th>
//                 <th className="p-3 text-left">Date</th>
//                 <th className="p-3 text-left">Time Slot</th>
//                 <th className="p-3 text-left">Booked By</th>
//                 <th className="p-3 text-left">Status</th>
//                 <th className="p-3 text-left">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {bookings.map((booking) => (
//                 <tr key={booking.id} className="border-b hover:bg-gray-100">
//                   <td className="p-3">{booking.ground_name}</td>
//                   <td className="p-3">{booking.booking_date}</td>
//                   <td className="p-3">{booking.time_slot}</td>
//                   <td className="p-3">{booking.user_name}</td>
//                   <td className={`p-3 font-medium ${booking.status.toLowerCase() === "cancelled" ? "text-red-500" : "text-green-600"}`}>
//                     {booking.status}
//                   </td>
//                   <td className="p-3">
//                     {booking.status.toLowerCase() !== "cancelled" && (
//                       <button
//                         onClick={() => cancelBooking(booking.id)}
//                         className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-lg transition"
//                       >
//                         Cancel
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default OwnerDashboard;




import React, { useEffect, useState } from "react";
import axiosClient from "../authenticated/axiosCredint";

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

  const totalBookings = bookings.length;
  const upcomingBookings = bookings.filter(b => b.status.toLowerCase() !== "cancelled").length;
  const cancelledBookings = bookings.filter(b => b.status.toLowerCase() === "cancelled").length;

  return (
    <div className="bg-background-secondary min-h-screen p-6 md:p-10 font-manrope text-text-primary">
      <h1 className="text-3xl font-bold mb-2">Owner Booking Dashboard</h1>
      <p className="text-text-secondary mb-6">Manage and view your ground bookings.</p>

      {/* Filters */}
      <div className="mb-8 space-y-4 rounded-lg border border-border-color bg-background-primary p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xl font-semibold">Filters</h3>
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              search
            </span>
            <input
              type="search"
              placeholder="Search by name, ground..."
              className="form-input w-full rounded-lg border-border-color py-2 pl-10 pr-4 text-sm focus:border-primary-color focus:ring-primary-color"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
              calendar_today
            </span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="form-input w-full rounded-lg border-border-color py-2 pl-10 pr-4 text-sm focus:border-primary-color focus:ring-primary-color"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDateFilter("")}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-semibold text-text-secondary hover:bg-gray-300"
            >
              <span className="material-symbols-outlined text-base"> clear_all </span>
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-border-color bg-background-primary p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-secondary">Total Bookings Today</p>
            <span className="material-symbols-outlined text-green-500"> event_available </span>
          </div>
          <p className="mt-2 text-3xl font-bold">{totalBookings}</p>
        </div>
        <div className="rounded-lg border border-border-color bg-background-primary p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-secondary">Upcoming Bookings</p>
            <span className="material-symbols-outlined text-blue-500"> pending_actions </span>
          </div>
          <p className="mt-2 text-3xl font-bold">{upcomingBookings}</p>
        </div>
        <div className="rounded-lg border border-border-color bg-background-primary p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-secondary">Cancelled Bookings</p>
            <span className="material-symbols-outlined text-red-500"> event_busy </span>
          </div>
          <p className="mt-2 text-3xl font-bold">{cancelledBookings}</p>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <p className="text-text-secondary">Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p className="text-text-secondary">No bookings found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border-color bg-background-primary shadow-sm">
          <table className="min-w-full divide-y divide-border-color">
            <thead className="bg-background-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Ground Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Ground Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Booked By</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-text-secondary">Status</th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Action</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color bg-background-primary">
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-text-primary">{booking.ground_type}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-text-primary">{booking.ground_name}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">{booking.booking_date}, {booking.time_slot}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-text-secondary">{booking.user_name}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${booking.status.toLowerCase() === "cancelled" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    {booking.status.toLowerCase() !== "cancelled" && (
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="text-red-600 hover:text-red-900"
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
