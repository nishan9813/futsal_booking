// src/pages/admin/components/OwnerManagement.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../../../authenticated/axiosCredint";
import OwnerDetailsModal from "./details/OwnerDetails";
import DeleteConfirmationModal from "./details/Delete";

const OwnerManagement = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch owners list
  const fetchOwners = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/api/admin/owners/");
      setOwners(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to load owners");
      console.error("Error fetching owners:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (owner) => {
    setSelectedOwner(owner);
    setShowDetailsModal(true);
  };

  const handleDeleteOwner = (owner) => {
    setSelectedOwner(owner);
    setShowDeleteModal(true);
  };

  const confirmDeleteOwner = async () => {
    if (!selectedOwner) return;
    
    setActionLoading(true);
    try {
      await axiosClient.delete(`/api/admin/owners/${selectedOwner.id}/`);
      setShowDeleteModal(false);
      setSelectedOwner(null);
      fetchOwners(); // Refresh the list
    } catch (err) {
      setError("Failed to delete owner");
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOwnerUpdate = () => {
    // Refresh the owners list when details are updated
    fetchOwners();
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  // Calculate stats from owners data
  const stats = {
    total_owners: owners.length,
    total_grounds: owners.reduce((total, owner) => total + owner.total_grounds, 0),
    cities_count: new Set(owners.map(owner => owner.city)).size,
    avg_grounds_per_owner: owners.length > 0 
      ? owners.reduce((total, owner) => total + owner.total_grounds, 0) / owners.length 
      : 0
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Owner Management</h2>
          <p className="text-gray-600 mt-1">Manage all futsal owners in the system</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchOwners}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Cards - Calculated from owners data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-700">Total Owners</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.total_owners}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-700">Active Grounds</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.total_grounds}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-700">Cities</h3>
          <p className="text-2xl font-bold text-gray-900">{stats.cities_count}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold text-gray-700">Avg Grounds/Owner</h3>
          <p className="text-2xl font-bold text-gray-900">
            {stats.avg_grounds_per_owner.toFixed(1)}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Owners Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Futsal Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Owner Info
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grounds
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {owners.map((owner) => (
              <tr key={owner.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-gray-900">
                    {owner.futsal_name}
                  </div>
                  <div className="text-sm text-gray-500">ID: {owner.id}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {owner.user_info?.username}
                  </div>
                  <div className="text-sm text-gray-500">{owner.user_info?.email}</div>
                  <div className="text-xs text-gray-400">
                    {owner.user_info?.first_name} {owner.user_info?.last_name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{owner.city}</div>
                  <div className="text-sm text-gray-500">{owner.address}</div>
                  <div className="text-xs text-blue-600">{owner.location}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    owner.total_grounds > 0 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {owner.total_grounds} {owner.total_grounds === 1 ? 'ground' : 'grounds'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button 
                    onClick={() => handleViewDetails(owner)}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                  >
                    View
                  </button>
                  <button 
                    onClick={() => handleDeleteOwner(owner)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {owners.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏢</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No owners found</h3>
          <p className="text-gray-500">There are no registered owners in the system yet.</p>
        </div>
      )}

      {/* Modals */}
      <OwnerDetailsModal
        owner={selectedOwner}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        onUpdate={handleOwnerUpdate}
      />

      <DeleteConfirmationModal
        owner={selectedOwner}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteOwner}
        loading={actionLoading}
      />
    </div>
  );
};

export default OwnerManagement;