// components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Users, Building, Calendar, AlertCircle, TrendingUp } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_owners: 0,
    total_businesses: 0,
    total_bookings: 0,
    pending_bookings: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setRecentUsers(data.recent_users);
        setRecentBookings(data.recent_bookings);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} mr-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, Admin</span>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'owners', label: 'Owners', icon: Building },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && (
          <div className="px-4 py-6 sm:px-0">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={Users}
                title="Total Users"
                value={stats.total_users}
                color="bg-blue-500"
              />
              <StatCard
                icon={Building}
                title="Business Owners"
                value={stats.total_owners}
                color="bg-green-500"
              />
              <StatCard
                icon={Building}
                title="Total Businesses"
                value={stats.total_businesses}
                color="bg-purple-500"
              />
              <StatCard
                icon={Calendar}
                title="Total Bookings"
                value={stats.total_bookings}
                subtitle={`${stats.pending_bookings} pending`}
                color="bg-orange-500"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="bg-white shadow-md rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{user.username}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.user_type === 'owner' 
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.user_type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white shadow-md rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.user_name} → {booking.business_name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(booking.booking_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white shadow-md rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">User Management</h2>
              <p className="text-gray-600 mt-1">Manage all users and their permissions</p>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  className="px-4 py-2 border rounded-md w-64"
                />
                <select className="px-4 py-2 border rounded-md">
                  <option value="">All User Types</option>
                  <option value="user">Regular Users</option>
                  <option value="owner">Business Owners</option>
                  <option value="admin">Administrators</option>
                </select>
              </div>
              {/* User list will be implemented in the next step */}
              <div className="text-center py-8 text-gray-500">
                User management table will be implemented here
              </div>
            </div>
          </div>
        )}

        {activeTab === 'owners' && (
          <div className="bg-white shadow-md rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Business Owners Management</h2>
              <p className="text-gray-600 mt-1">Manage business owners and their businesses</p>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="Search owners..."
                  className="px-4 py-2 border rounded-md w-64"
                />
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                    Verify Selected
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                    Reject Selected
                  </button>
                </div>
              </div>
              {/* Owners list will be implemented in the next step */}
              <div className="text-center py-8 text-gray-500">
                Business owners management table will be implemented here
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white shadow-md rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Bookings Management</h2>
              <p className="text-gray-600 mt-1">Manage and monitor all bookings</p>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="Search bookings..."
                  className="px-4 py-2 border rounded-md w-64"
                />
                <select className="px-4 py-2 border rounded-md">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              {/* Bookings list will be implemented in the next step */}
              <div className="text-center py-8 text-gray-500">
                Bookings management table will be implemented here
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;