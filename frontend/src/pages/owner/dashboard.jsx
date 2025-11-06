import React, { useEffect, useState } from "react";
import axiosClient from "../../authenticated/axiosCredint";

const OwnerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, [dateFilter, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/api/owner-history/", {
        params: dateFilter ? { date: dateFilter } : {},
      });
      setBookings(res.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await axiosClient.patch(`/api/owner/bookings/${bookingId}/cancel/`);
      fetchBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking.");
    }
  };

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customer_username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.ground_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.futsal_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      booking.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalBookings = bookings.length;
  const upcomingBookings = bookings.filter(
    (b) => b.status?.toLowerCase() === "confirmed"
  ).length;
  const cancelledBookings = bookings.filter(
    (b) => b.status?.toLowerCase() === "cancelled"
  ).length;
  const completedBookings = bookings.filter(
    (b) => b.status?.toLowerCase() === "completed"
  ).length;

  const totalRevenue = bookings
    .filter(b => b.status?.toLowerCase() === "completed")
    .reduce((sum, booking) => sum + (booking.price || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            Owner
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Manage your futsal ground bookings, track performance, and monitor revenue
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { 
              label: "Total Bookings", 
              value: totalBookings, 
              color: "from-blue-500 to-blue-600",
              icon: "📊"
            },
            { 
              label: "Upcoming", 
              value: upcomingBookings, 
              color: "from-green-500 to-green-600",
              icon: "⏳"
            },
            { 
              label: "Completed", 
              value: completedBookings, 
              color: "from-purple-500 to-purple-600",
              icon: "✅"
            },
            { 
              label: "Cancelled", 
              value: cancelledBookings, 
              color: "from-red-500 to-red-600",
              icon: "❌"
            },
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`bg-gradient-to-r ${stat.color} h-2 rounded-full transition-all duration-1000`}
                  style={{ width: `${(stat.value / Math.max(totalBookings, 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-8 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black mb-2">Total Revenue</h3>
              <p className="text-blue-100 text-lg">From completed bookings</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black">Rs {totalRevenue.toLocaleString()}</div>
              <div className="text-blue-100 text-sm mt-1">Lifetime earnings</div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search Bookings</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by customer, ground type, or futsal name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => {
                setDateFilter("");
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all duration-300 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Filters
            </button>
            
            <button
              onClick={fetchBookings}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Data
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Table Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-black text-gray-900">Booking History</h2>
            <p className="text-gray-600 mt-1">
              {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'} found
            </p>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 text-lg">
                {searchQuery || dateFilter || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "No bookings have been made yet"
                }
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Ground Details</th>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Date & Time</th>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Customer</th>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Price</th>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Status</th>
                      <th className="px-8 py-6 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">Actions</th>
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
                              <div className="font-semibold text-gray-900">{booking.futsal_name}</div>
                              <div className="text-sm text-gray-500">{booking.ground_type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-lg font-semibold text-gray-900">{booking.booking_date}</div>
                          <div className="text-sm text-gray-500">{booking.time_slot}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-semibold text-gray-900">{booking.customer_username}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-2xl font-black text-gray-900">
                            Rs {booking.price || "0"}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                            booking.status?.toLowerCase() === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : booking.status?.toLowerCase() === "completed"
                              ? "bg-green-100 text-green-800"
                              : booking.status?.toLowerCase() === "confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          {booking.status?.toLowerCase() !== "cancelled" &&
                            booking.status?.toLowerCase() !== "completed" && (
                              <button
                                onClick={() => cancelBooking(booking.id)}
                                className="text-red-600 hover:text-red-800 font-semibold text-sm transition-colors duration-200 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Cancel
                              </button>
                            )}
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
                          <div className="font-semibold text-gray-900">{booking.futsal_name}</div>
                          <div className="text-sm text-gray-500">{booking.ground_type}</div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status?.toLowerCase() === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : booking.status?.toLowerCase() === "completed"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <div className="text-gray-500">Date</div>
                        <div className="font-semibold text-gray-900">{booking.booking_date}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Time</div>
                        <div className="font-semibold text-gray-900">{booking.time_slot}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Customer</div>
                        <div className="font-semibold text-gray-900">{booking.customer_username}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Price</div>
                        <div className="font-bold text-gray-900 text-lg">Rs {booking.price || "0"}</div>
                      </div>
                    </div>

                    {booking.status?.toLowerCase() !== "cancelled" &&
                      booking.status?.toLowerCase() !== "completed" && (
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          className="w-full text-red-600 hover:text-red-800 font-semibold text-sm transition-colors duration-200 flex items-center justify-center gap-2 py-2 border border-red-200 rounded-xl hover:bg-red-50"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Cancel Booking
                        </button>
                      )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;