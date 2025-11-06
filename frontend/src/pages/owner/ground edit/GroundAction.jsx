// src/components/grounds/GroundActions.jsx
import React, { useState } from "react";
import axiosClient from "../../../authenticated/axiosCredint";

const GroundActions = ({ ground, setGrounds }) => {
  const [loading, setLoading] = useState(false);
  const isNew = ground.id.toString().startsWith("temp-");

  // ✅ Save or Create Ground
  const handleSave = async () => {
    setLoading(true);
    try {
      let response;

      const basePrice = ground.price ?? 1;
      const payload = {
        ground_type: ground.ground_type,
        price: Number(basePrice),
        use_dynamic_pricing: !!ground.use_dynamic_pricing,
        opening_time: ground.opening_time,
        closing_time: ground.closing_time,
      };

      if (isNew) {
        response = await axiosClient.post("/api/owner-grounds/", payload);
        const created = response.data;

        if (ground._pending_files?.length) {
          const formData = new FormData();
          ground._pending_files.forEach((file) => formData.append("image", file));

          const { data: uploaded } = await axiosClient.post(
            `/api/owner-grounds/${created.id}/upload-image/`,
            formData,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
          created.ground_images = uploaded;
        }

        setGrounds((prev) => prev.map((g) => (g.id === ground.id ? created : g)));
      } else {
        response = await axiosClient.patch(`/api/owner-grounds/${ground.id}/`, payload);
        const updated = response.data;
        setGrounds((prev) => prev.map((g) => (g.id === ground.id ? updated : g)));
      }
    } catch (err) {
      console.error("Error saving ground:", err.response?.data || err);
      alert("Failed to save ground. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete or Remove Ground
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this ground?")) return;

    if (isNew) {
      setGrounds((prev) => prev.filter((g) => g.id !== ground.id));
      return;
    }

    setLoading(true);
    try {
      await axiosClient.delete(`/api/owner-ground/${ground.id}/`);
      setGrounds((prev) => prev.filter((g) => g.id !== ground.id));
    } catch (err) {
      console.error("Error deleting ground:", err.response?.data || err);
      alert("Failed to delete ground. Please check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
      <button
        onClick={handleSave}
        disabled={loading}
        className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {isNew ? "Create Ground" : "Save Changes"}
      </button>

      <button
        onClick={handleDelete}
        disabled={loading}
        className="group bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {isNew ? "Remove Draft" : "Delete Ground"}
      </button>
    </div>
  );
};

export default GroundActions;