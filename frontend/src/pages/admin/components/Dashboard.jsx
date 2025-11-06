// src/pages/admin/components/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { 
  Users, UserCheck, Building, Calendar, 
  DollarSign, Activity 
} from "lucide-react";
import axiosClient from "../../../authenticated/axiosCredint";

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_owners: 0,
    total_customers: 0,
    total_grounds: 0,
    total_bookings: 0,
    total_revenue: 0,
    pending_bookings: 0,
    active_bookings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await axiosClient.get("/api/admin/dashboard/");
      console.log("Dashboard API Response:", res.data); // Debug log
      setStats(res.data);
      setError(null);
    } catch (err) {
      console.error("Dashboard API Error:", err);
      console.error("Error details:", err.response?.data);
      setError(`Failed to load dashboard data: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, prefix = "" }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} mr-4`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">
            {prefix}{value}
          </p>
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
        <p className="text-red-800 text-lg mb-4">{error}</p>
        <button 
          onClick={fetchDashboardStats}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.total_users}
          color="bg-blue-500"
        />
        <StatCard
          icon={UserCheck}
          title="Business Owners"
          value={stats.total_owners}
          color="bg-green-500"
        />
        <StatCard
          icon={Users}
          title="Customers"
          value={stats.total_customers}
          color="bg-purple-500"
        />
        <StatCard
          icon={Building}
          title="Total Grounds"
          value={stats.total_grounds}
          color="bg-orange-500"
        />
        <StatCard
          icon={Calendar}
          title="Total Bookings"
          value={stats.total_bookings}
          color="bg-indigo-500"
        />
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={stats.total_revenue}
          prefix="Rs "
          color="bg-emerald-500"
        />
        <StatCard
          icon={Activity}
          title="Active Bookings"
          value={stats.active_bookings}
          color="bg-teal-500"
        />
        <StatCard
          icon={Calendar}
          title="Pending Actions"
          value={stats.pending_bookings}
          color="bg-yellow-500"
        />
      </div>

      {/* Platform Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">User Distribution</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Users</span>
              <span className="font-bold text-blue-600">{stats.total_users}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Business Owners</span>
              <span className="font-bold text-green-600">{stats.total_owners}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customers</span>
              <span className="font-bold text-purple-600">{stats.total_customers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Booking Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Bookings</span>
              <span className="font-bold text-indigo-600">{stats.total_bookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Bookings</span>
              <span className="font-bold text-teal-600">{stats.active_bookings}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-bold text-emerald-600">Rs {stats.total_revenue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Platform Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.total_grounds}</div>
            <div className="text-sm text-gray-600">Futsal Grounds</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.total_bookings}</div>
            <div className="text-sm text-gray-600">Total Bookings</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{stats.total_owners}</div>
            <div className="text-sm text-gray-600">Business Partners</div>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">Rs {stats.total_revenue}</div>
            <div className="text-sm text-gray-600">Platform Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;