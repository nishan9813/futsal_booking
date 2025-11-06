import React, { useEffect, useState } from "react";
import axiosClient from "../../authenticated/axiosCredint";

function AllBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axiosClient
      .get("/api/user-history/")
      .then((res) => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch bookings:", err);
        setBookings([]);
        setLoading(false);
      });
  }, []);

  // Filter and search bookings
  const filteredBookings = bookings
    .filter(booking => {
      if (filter === "all") return true;
      if (filter === "upcoming") {
        const [start] = booking.time_slot.split(" - ");
        const bookingDateTime = new Date(`${booking.booking_date} ${start}`);
        return bookingDateTime > new Date();
      }
      if (filter === "completed") {
        const [start] = booking.time_slot.split(" - ");
        const bookingDateTime = new Date(`${booking.booking_date} ${start}`);
        return bookingDateTime < new Date();
      }
      return booking.status?.toLowerCase() === filter.toLowerCase();
    })
    .filter(booking => 
      booking.futsal_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.ground_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.booking_date?.includes(searchQuery)
    );

  const getStatusColor = (status, bookingDate, timeSlot) => {
    if (status?.toLowerCase() === "cancelled") return "bg-red-100 text-red-800";
    if (status?.toLowerCase() === "confirmed") {
      const [start] = timeSlot.split(" - ");
      const bookingDateTime = new Date(`${bookingDate} ${start}`);
      if (bookingDateTime < new Date()) {
        return "bg-green-100 text-green-800";
      }
      return "bg-blue-100 text-blue-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const getStatusText = (status, bookingDate, timeSlot) => {
    if (status?.toLowerCase() === "cancelled") return "Cancelled";
    if (status?.toLowerCase() === "confirmed") {
      const [start] = timeSlot.split(" - ");
      const bookingDateTime = new Date(`${bookingDate} ${start}`);
      if (bookingDateTime < new Date()) {
        return "Completed";
      }
      return "Upcoming";
    }
    return status || "Pending";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            Your Booking
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              History
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage and track all your futsal bookings in one place
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Bookings", value: bookings.length, color: "from-blue-500 to-blue-600" },
            { 
              label: "Upcoming", 
              value: bookings.filter(b => {
                const [start] = b.time_slot.split(" - ");
                const bookingDateTime = new Date(`${b.booking_date} ${start}`);
                return bookingDateTime > new Date() && b.status?.toLowerCase() === "confirmed";
              }).length, 
              color: "from-green-500 to-green-600" 
            },
            { 
              label: "Completed", 
              value: bookings.filter(b => {
                const [start] = b.time_slot.split(" - ");
                const bookingDateTime = new Date(`${b.booking_date} ${start}`);
                return bookingDateTime < new Date() && b.status?.toLowerCase() === "confirmed";
              }).length, 
              color: "from-purple-500 to-purple-600" 
            },
            { 
              label: "Cancelled", 
              value: bookings.filter(b => b.status?.toLowerCase() === "cancelled").length, 
              color: "from-red-500 to-red-600" 
            },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-2xl font-black text-gray-900">{stat.value}</div>
              <div className="text-sm font-medium text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>

            {/* Filter */}
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              >
                <option value="all">All Bookings</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 text-lg mb-6">
                {searchQuery || filter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "You haven't made any bookings yet"
                }
              </p>
              {!searchQuery && filter === "all" && (
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105">
                  Book Your First Game
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Futsal Ground</th>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Type</th>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Date & Time</th>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Price</th>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 text-lg">{booking.futsal_name || "N/A"}</div>
                              <div className="text-sm text-gray-500">{booking.address}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {booking.ground_type || "N/A"}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-lg font-semibold text-gray-900">{booking.booking_date}</div>
                          <div className="text-sm text-gray-500">{booking.time_slot}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-2xl font-black text-gray-900">
                            Rs {booking.price || "0"}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(booking.status, booking.booking_date, booking.time_slot)}`}>
                            {getStatusText(booking.status, booking.booking_date, booking.time_slot)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4 p-6">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{booking.futsal_name || "N/A"}</div>
                          <div className="text-sm text-gray-500">{booking.ground_type}</div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status, booking.booking_date, booking.time_slot)}`}>
                        {getStatusText(booking.status, booking.booking_date, booking.time_slot)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Date</div>
                        <div className="font-semibold text-gray-900">{booking.booking_date}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Time</div>
                        <div className="font-semibold text-gray-900">{booking.time_slot}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Price</div>
                        <div className="font-bold text-gray-900 text-lg">Rs {booking.price || "0"}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AllBookings;