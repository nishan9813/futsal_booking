// src/pages/admin/components/OwnerDetailsModal.jsx
import React, { useState, useEffect } from "react";
import axiosClient from "../../../../authenticated/axiosCredint";
import LocationPicker from "../../../../component/locationPicker"; // Import the LocationPicker

const OwnerDetailsModal = ({ 
  owner, 
  isOpen, 
  onClose, 
  onUpdate 
}) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({});
  const [showMap, setShowMap] = useState(false);

  // Initialize form data when owner changes
  useEffect(() => {
    if (owner) {
      setFormData({
        futsal_name: owner.futsal_name || '',
        location: owner.location || '',
        city: owner.city || '',
        address: owner.address || '',
      });
    }
  }, [owner]);

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  const handleSaveChanges = async () => {
    if (!owner) return;
    
    setLoading(true);
    try {
      // Prepare update data
      const updateData = {
        futsal_name: formData.futsal_name?.trim() || '',
        location: formData.location?.trim() || '',
        city: formData.city?.trim() || '',
        address: formData.address?.trim() || '',
      };

      console.log("Updating owner with data:", updateData);

      // Use PATCH for partial updates
      await axiosClient.patch(`/api/admin/owners/${owner.id}/`, updateData);
      
      // Call the update callback to refresh parent component
      onUpdate();
      
      setEditing(false);
      alert("Owner details updated successfully!");
    } catch (err) {
      console.error("Failed to update owner:", err);
      console.error("Error details:", err.response?.data);
      
      // Show specific error message
      if (err.response?.data) {
        const errorData = err.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = [];
          for (const [field, messages] of Object.entries(errorData)) {
            errorMessages.push(`${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`);
          }
          alert(`Validation errors:\n${errorMessages.join('\n')}`);
        } else {
          alert(`Error: ${JSON.stringify(errorData)}`);
        }
      } else {
        alert("Failed to update owner details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationSelect = (location) => {
    // Convert location object to string format "lat,lng"
    const locationString = `${location.lat},${location.lng}`;
    setFormData(prev => ({
      ...prev,
      location: locationString
    }));
    setShowMap(false);
  };

  const parseLocation = (locationString) => {
    if (!locationString) return null;
    const parts = locationString.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
    return null;
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data to original values
    if (owner) {
      setFormData({
        futsal_name: owner.futsal_name || '',
        location: owner.location || '',
        city: owner.city || '',
        address: owner.address || '',
      });
    }
  };

  // Close modal when clicking backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !owner) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto z-[101]">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">Owner Profile</h3>
              <p className="text-gray-600">Manage owner information</p>
            </div>
            <div className="flex gap-2">
              {!editing ? (
                <button
                  onClick={handleEditToggle}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveChanges}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button 
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Owner Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Futsal Information</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Futsal Name
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.futsal_name}
                      onChange={(e) => handleInputChange('futsal_name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter futsal name"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{owner.futsal_name}</p>
                  )}
                </div>

                {/* Location Coordinates with Map Picker */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location Coordinates
                  </label>
                  {editing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 27.7172,85.3240"
                        />
                        <button
                          type="button"
                          onClick={() => setShowMap(true)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          Map
                        </button>
                      </div>
                      {formData.location && (
                        <p className="text-sm text-green-600">
                          Current: {formData.location}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-900">{owner.location}</p>
                      {owner.location && (
                        <p className="text-sm text-gray-500 mt-1">
                          <a 
                            href={`https://www.google.com/maps?q=${owner.location}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View on Google Maps
                          </a>
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter city"
                    />
                  ) : (
                    <p className="text-gray-900">{owner.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  {editing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter full address"
                    />
                  ) : (
                    <p className="text-gray-900">{owner.address}</p>
                  )}
                </div>
              </div>
            </div>

            {/* User Information (Read-only) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h4>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <p className="text-gray-900 font-medium">{owner.user_info?.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-gray-900">{owner.user_info?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <p className="text-gray-900">{owner.user_info?.first_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <p className="text-gray-900">{owner.user_info?.last_name || 'Not set'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User ID</label>
                    <p className="text-gray-900">{owner.user_info?.id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Owner ID</label>
                    <p className="text-gray-900">{owner.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats (Read-only) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Business Overview</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-blue-600">{owner.total_grounds || 0}</div>
                  <div className="text-sm text-blue-800">Total Grounds</div>
                </div>
                <div className="bg-green-50 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-green-600">{owner.total_grounds || 0}</div>
                  <div className="text-sm text-green-800">Active Grounds</div>
                </div>
                <div className="bg-purple-50 p-3 rounded text-center">
                  <div className="text-2xl font-bold text-purple-600">{owner.city || 'N/A'}</div>
                  <div className="text-sm text-purple-800">Location</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div>
                Last updated: {new Date().toLocaleDateString()}
              </div>
              <div>
                Owner since: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Picker Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[200]">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <LocationPicker
              initialLocation={parseLocation(formData.location)}
              onSelect={handleLocationSelect}
              onCancel={() => setShowMap(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDetailsModal;