// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import axiosClient from "../authenticated/axiosCredint";

// const ActiveBookings = () => {
//   const [user, setUser] = useState(null);
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [canceling, setCanceling] = useState(null);

//   // ✅ Fetch current user
//   useEffect(() => {
//     axiosClient
//       .get("/api/current_user/")
//       .then((res) => setUser(res.data.user || res.data))
//       .catch(() => setUser(null))
//       .finally(() => setLoading(false));
//   }, []);

//   // ✅ Fetch only active (upcoming) bookings
//   useEffect(() => {
//     if (!user) return;

//     axiosClient
//       .get("/api/user-history/")
//       .then((res) => {
//         const activeBookings = res.data.filter(
//           (b) => b.status !== "cancelled" && !isPastBooking(b.booking_date, b.time_slot)
//         );
//         setBookings(activeBookings);
//       })
//       .catch(() => setBookings([]));
//   }, [user]);

//   const isPastBooking = (dateStr, timeStr) => {
//     const [start] = timeStr.split(" - ");
//     const bookingDateTime = new Date(`${dateStr} ${start}`);
//     return bookingDateTime < new Date();
//   };

//   const handleCancel = async (bookingId) => {
//     if (!window.confirm("Are you sure you want to cancel this booking? Cancellation policy: 100% refund if cancelled more than 12 hours before booking, no refund within 12 hours.")) return;
//     setCanceling(bookingId);

//     try {
//       // ✅ Use the new cancellation endpoint with POST
//       const response = await axiosClient.post(`/api/bookings/${bookingId}/cancel_booking/`);
      
//       // Show appropriate message based on refund
//       alert(response.data.message);
      
//       // Remove the cancelled booking from the list
//       setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      
//     } catch (err) {
//       console.error("Failed to cancel booking:", err);
      
//       // Show specific error message from backend
//       const errorMessage = err.response?.data?.error || err.response?.data?.message || "Could not cancel booking. Please try again.";
//       alert(`❌ ${errorMessage}`);
      
//     } finally {
//       setCanceling(null);
//     }
//   };

//   if (loading) return <p className="text-center py-10 text-gray-500">Loading active bookings...</p>;

//   if (!user) {
//     return (
//       <div className="text-center py-16">
//         <h2 className="text-3xl font-bold mb-4 text-gray-900">Please Log In</h2>
//         <p className="text-gray-600 mb-6">
//           Log in to view and manage your active bookings.
//         </p>
//         <Link
//           to="/login"
//           className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700"
//         >
//           Log In
//         </Link>
//       </div>
//     );
//   }

//   if (bookings.length === 0) {
//     return (
//       <div className="text-center py-16">
//         <h2 className="text-3xl font-bold mb-4 text-gray-900">No Active Bookings</h2>
//         <p className="text-gray-600 mb-6">
//           You don't have any upcoming games. Book one now and hit the field!
//         </p>
//         <Link
//           to="/grounds"
//           className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700"
//         >
//           Book a Ground
//         </Link>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-6 lg:px-8 py-16">
//       <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
//         Your Active Bookings
//       </h2>

//       {/* Cancellation Policy Notice */}
//       <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
//         <div className="flex items-center">
//           <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
//             <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
//           </svg>
//           <p className="text-yellow-700 text-sm">
//             <strong>Cancellation Policy:</strong> 100% refund if cancelled more than 12 hours before booking. No refund if cancelled within 12 hours.
//           </p>
//         </div>
//       </div>

//       <div className="overflow-x-auto bg-white rounded-lg shadow-md">
//         <table className="w-full text-sm text-left text-gray-600">
//           <thead className="text-xs text-gray-700 uppercase bg-gray-50">
//             <tr>
//               <th className="px-6 py-3">Ground</th>
//               <th className="px-6 py-3">Type</th>
//               <th className="px-6 py-3">Date</th>
//               <th className="px-6 py-3">Time</th>
//               <th className="px-6 py-3 text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {bookings.map((booking) => (
//               <tr
//                 key={booking.id}
//                 className="bg-white border-b hover:bg-gray-50 transition"
//               >
//                 <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
//                   {booking.futsal_name}
//                 </td>
//                 <td className="px-6 py-4">{booking.ground_type}</td>
//                 <td className="px-6 py-4">{booking.booking_date}</td>
//                 <td className="px-6 py-4">{booking.time_slot}</td>
//                 <td className="px-6 py-4 text-center space-x-3">
//                   <Link
//                     to={`/booking/${booking.id}`}
//                     className="text-indigo-600 hover:underline font-medium"
//                   >
//                     View
//                   </Link>
//                   <button
//                     onClick={() => handleCancel(booking.id)}
//                     disabled={canceling === booking.id}
//                     className={`${
//                       canceling === booking.id
//                         ? "bg-gray-400"
//                         : "bg-red-600 hover:bg-red-700"
//                     } text-white font-semibold px-3 py-1.5 rounded-lg shadow-sm transition`}
//                   >
//                     {canceling === booking.id ? "Canceling..." : "Cancel"}
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default ActiveBookings;


import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../authenticated/axiosCredint";

const ActiveBookings = () => {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(null);

  // ✅ Fetch current user
  useEffect(() => {
    axiosClient
      .get("/api/current_user/")
      .then((res) => setUser(res.data.user || res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // ✅ Fetch only active (upcoming) bookings
  useEffect(() => {
    if (!user) return;

    axiosClient
      .get("/api/user-history/")
      .then((res) => {
        const activeBookings = res.data.filter(
          (b) => b.status !== "cancelled" && !isPastBooking(b.booking_date, b.time_slot)
        );
        setBookings(activeBookings);
      })
      .catch(() => setBookings([]));
  }, [user]);

  const isPastBooking = (dateStr, timeStr) => {
    const [start] = timeStr.split(" - ");
    const bookingDateTime = new Date(`${dateStr} ${start}`);
    return bookingDateTime < new Date();
  };

  const getCancellationInfo = (booking) => {
    // Use the data already available from the booking
    return {
      can_cancel: booking.can_cancel,
      is_refund_eligible: booking.is_refund_eligible,
      cancellation_deadline: booking.cancellation_deadline,
      time_until_booking: booking.time_until_booking
    };
  };

  const getCancellationMessage = (booking) => {
    const info = getCancellationInfo(booking);
    
    if (!info.can_cancel) {
      return { 
        type: "error", 
        message: "Cannot cancel this booking" 
      };
    }
    
    if (info.is_refund_eligible) {
      return { 
        type: "refund", 
        message: `Cancel now for full refund of Rs 500` 
      };
    } else {
      return { 
        type: "no-refund", 
        message: "Cancellation available but no refund (within 12 hours)" 
      };
    }
  };

  const handleCancel = async (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    
    if (!booking?.can_cancel) {
      alert("This booking cannot be cancelled.");
      return;
    }

    const refundMessage = booking.is_refund_eligible 
      ? `✅ You will receive a FULL REFUND of Rs 500 as you're cancelling more than 12 hours before the booking.`
      : `⚠️ NO REFUND will be issued as you're cancelling within 12 hours of the booking time.`;
    
    const confirmationMessage = `Are you sure you want to cancel this booking?\n\n${refundMessage}\n\nClick OK to confirm cancellation.`;
    
    if (!window.confirm(confirmationMessage)) return;
    
    setCanceling(bookingId);

    try {
      // ✅ Use the cancellation endpoint
      const response = await axiosClient.post(`/api/bookings/${bookingId}/cancel_booking/`, {
        confirm: true
      });
      
      if (response.data.success) {
        // Show success message with refund details
        alert(`✅ ${response.data.message}`);
        
        // Remove the cancelled booking from the list
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      } else {
        alert(`❌ ${response.data.error || "Failed to cancel booking"}`);
      }
      
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      
      // Show specific error message from backend
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          "Could not cancel booking. Please try again.";
      alert(`❌ ${errorMessage}`);
      
    } finally {
      setCanceling(null);
    }
  };

  const getStatusBadge = (booking) => {
    if (!booking.can_cancel) {
      return (
        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
          Cannot Cancel
        </span>
      );
    }

    if (booking.is_refund_eligible) {
      return (
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
          Refund Available
        </span>
      );
    } else {
      return (
        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
          No Refund
        </span>
      );
    }
  };

  if (loading) return <p className="text-center py-10 text-gray-500">Loading active bookings...</p>;

  if (!user) {
    return (
      <div className="text-center py-16">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Please Log In</h2>
        <p className="text-gray-600 mb-6">
          Log in to view and manage your active bookings.
        </p>
        <Link
          to="/login"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700"
        >
          Log In
        </Link>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">No Active Bookings</h2>
        <p className="text-gray-600 mb-6">
          You don't have any upcoming games. Book one now and hit the field!
        </p>
        <Link
          to="/grounds"
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700"
        >
          Book a Ground
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 lg:px-8 py-16">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
        Your Active Bookings
      </h2>

      {/* Cancellation Policy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-blue-700 font-semibold">Cancellation Policy</p>
            <p className="text-blue-600 text-sm mt-1">
              • <strong>100% refund</strong> if cancelled more than 12 hours before booking<br/>
              • <strong>No refund</strong> if cancelled within 12 hours of booking time
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">Ground</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Time</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => {
              const cancelMessage = getCancellationMessage(booking);
              
              return (
                <tr
                  key={booking.id}
                  className="bg-white border-b hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {booking.futsal_name}
                  </td>
                  <td className="px-6 py-4">{booking.ground_type}</td>
                  <td className="px-6 py-4">{booking.booking_date}</td>
                  <td className="px-6 py-4">{booking.time_slot}</td>
                  <td className="px-6 py-4">
                    {getStatusBadge(booking)}
                  </td>
                  <td className="px-6 py-4 text-center space-x-3">
                    <Link
                      to={`/booking/${booking.id}`}
                      className="text-indigo-600 hover:underline font-medium"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleCancel(booking.id)}
                      disabled={canceling === booking.id || !booking.can_cancel}
                      className={`${
                        canceling === booking.id
                          ? "bg-gray-400 cursor-not-allowed"
                          : !booking.can_cancel
                          ? "bg-gray-300 cursor-not-allowed"
                          : booking.is_refund_eligible
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-red-600 hover:bg-red-700"
                      } text-white font-semibold px-3 py-1.5 rounded-lg shadow-sm transition`}
                    >
                      {canceling === booking.id 
                        ? "Canceling..." 
                        : !booking.can_cancel
                        ? "Cannot Cancel"
                        : "Cancel"
                      }
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Additional Help Text */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Need help with your booking? Contact support if you have any questions.</p>
      </div>
    </div>
  );
};

export default ActiveBookings;