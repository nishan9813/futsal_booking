// src/pages/admin/components/DeleteConfirmationModal.jsx
import React from "react";

const DeleteConfirmationModal = ({ 
  owner, 
  isOpen, 
  onClose, 
  onConfirm, 
  loading 
}) => {
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
      <div className="bg-white rounded-lg max-w-md w-full z-[101]">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-red-600">Confirm Deletion</h3>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
          <p className="text-gray-700 mb-4">
            Are you sure you want to delete <strong className="text-red-600">{owner.futsal_name}</strong>? 
            This action cannot be undone and will remove:
          </p>
          <ul className="text-sm text-gray-600 mb-6 list-disc list-inside space-y-1">
            <li>Owner profile and all associated data</li>
            <li>All grounds managed by this owner ({owner.total_grounds} grounds)</li>
            <li>All bookings for these grounds</li>
            <li>All images and ground details</li>
          </ul>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition"
            >
              {loading ? "Deleting..." : "Delete Owner"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;