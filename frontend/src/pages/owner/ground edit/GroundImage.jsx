// src/components/grounds/GroundImages.jsx
import React from "react";
import axiosClient from "../../../authenticated/axiosCredint";

const GroundImages = ({ ground, setGrounds, MAX_IMAGES }) => {
  const handleImageUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (ground.id.toString().startsWith("temp-")) {
      setGrounds((prev) =>
        prev.map((g) =>
          g.id === ground.id
            ? {
                ...g,
                _pending_files: [...(g._pending_files || []), ...files].slice(0, MAX_IMAGES),
              }
            : g
        )
      );
      return;
    }

    try {
      const existingCount = ground.ground_images?.length || 0;
      const allowed = Math.max(0, MAX_IMAGES - existingCount);
      const toUpload = files.slice(0, allowed);

      if (toUpload.length === 0) {
        alert(`You can upload a maximum of ${MAX_IMAGES} images per ground.`);
        return;
      }

      const formData = new FormData();
      toUpload.forEach((f) => formData.append("image", f));

      const { data: uploaded } = await axiosClient.post(
        `/api/ground/${ground.id}/upload-image/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setGrounds((prev) =>
        prev.map((g) =>
          g.id === ground.id
            ? { ...g, ground_images: [...(g.ground_images || []), ...uploaded] }
            : g
        )
      );
    } catch (err) {
      console.error("Error uploading images:", err.response?.data || err);
      alert("Failed to upload image(s). Please check the console for details.");
    } finally {
      event.target.value = "";
    }
  };

  const handleImageDelete = async (imageId, index) => {
    if (!window.confirm("Delete this image?")) return;

    if (ground.id.toString().startsWith("temp-")) {
      setGrounds((prev) =>
        prev.map((g) =>
          g.id === ground.id
            ? {
                ...g,
                _pending_files: (g._pending_files || []).filter((_, i) => i !== index),
              }
            : g
        )
      );
      return;
    }

    try {
      await axiosClient.delete(`/api/ground/${ground.id}/delete-image/${imageId}/`);
      setGrounds((prev) =>
        prev.map((g) =>
          g.id === ground.id
            ? {
                ...g,
                ground_images: (g.ground_images || []).filter((img) => img.id !== imageId),
              }
            : g
        )
      );
    } catch (err) {
      console.error("Error deleting image:", err.response?.data || err);
      alert("Failed to delete image. Please check the console for details.");
    }
  };

  const existingImages = ground.ground_images || [];
  const pendingFiles = ground.id.toString().startsWith("temp-")
    ? ground._pending_files || []
    : [];
  const totalImages = existingImages.length + pendingFiles.length;
  const canUpload = totalImages < MAX_IMAGES;
  const uploadsRemaining = MAX_IMAGES - totalImages;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <label className="block text-lg font-black text-gray-900 mb-1">
            Ground Images
          </label>
          <p className="text-sm text-gray-600">
            {uploadsRemaining} of {MAX_IMAGES} slots remaining
          </p>
        </div>
        {!canUpload && (
          <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            Maximum images reached
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Existing images */}
        {existingImages.map((img) => (
          <div
            key={img.id}
            className="group relative aspect-square rounded-xl overflow-hidden border-2 border-gray-300 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <img
              src={img.image}
              alt="Ground"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button
                onClick={() => handleImageDelete(img.id)}
                className="bg-red-600 hover:bg-red-700 text-white w-10 h-10 rounded-full flex items-center justify-center transform hover:scale-110 transition-transform duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}

        {/* Pending images */}
        {pendingFiles.map((file, index) => (
          <div
            key={`pending-${index}`}
            className="group relative aspect-square rounded-xl overflow-hidden border-2 border-blue-300 shadow-md"
          >
            <img
              src={URL.createObjectURL(file)}
              alt="Pending"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
              <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                Uploading...
              </div>
            </div>
            <button
              onClick={() => handleImageDelete(null, index)}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            >
              ×
            </button>
          </div>
        ))}

        {/* Upload button */}
        {canUpload && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-gray-400 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <svg className="w-8 h-8 text-gray-500 group-hover:text-blue-500 mb-2 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors duration-300">
              Add Image
            </span>
            <span className="text-xs text-gray-500 mt-1">
              {uploadsRemaining} left
            </span>
          </label>
        )}
      </div>
    </div>
  );
};

export default GroundImages;