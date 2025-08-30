import React, { useEffect, useState } from "react";
import axiosClient from "../authenticated/axiosCredint";

const MAX_IMAGES = 6;

const EditGrounds = () => {
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch owner's grounds
  useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/api/ownerground/")
      .then((res) => setGrounds(res.data || []))
      .catch((err) => {
        console.error("Error fetching grounds:", err.response?.data || err);
        alert("Failed to load grounds. See console for details.");
      })
      .finally(() => setLoading(false));
  }, []);

  const sanitizeGroundPayload = (g) => ({
    name: g.name ?? "",
    ground_type: g.ground_type ?? "",
    opening_time: g.opening_time ?? "05:00",
    closing_time: g.closing_time ?? "22:00",
    use_dynamic_pricing: !!g.use_dynamic_pricing,
    price: g.use_dynamic_pricing
      ? null
      : g.price === "" || g.price == null
      ? null
      : Number(g.price),
  });

  const handleUpdate = async (groundId, ground) => {
    const payload = sanitizeGroundPayload(ground);
    try {
      const { data } = await axiosClient.patch(`/api/ownerground/${groundId}/`, payload);
      setGrounds((prev) => prev.map((g) => (g.id === groundId ? data : g)));
      alert("Ground updated successfully!");
    } catch (err) {
      console.error("Error updating ground:", err.response?.data || err);
      alert("Failed to update ground. Check console for details.");
    }
  };

  const handleDeleteGround = async (groundId) => {
    if (!window.confirm("Are you sure you want to delete this ground?")) return;

    if (groundId.toString().startsWith("temp-")) {
      setGrounds((prev) => prev.filter((g) => g.id !== groundId));
      return;
    }

    try {
      await axiosClient.delete(`/api/ownerground/${groundId}/`);
      setGrounds((prev) => prev.filter((g) => g.id !== groundId));
      alert("Ground deleted successfully!");
    } catch (err) {
      console.error("Error deleting ground:", err.response?.data || err);
      alert("Failed to delete ground. See console for details.");
    }
  };

  const handleAddNewGroundCard = () => {
    setGrounds((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: "My Ground",
        ground_type: "",
        price: "",
        use_dynamic_pricing: false,
        opening_time: "05:00",
        closing_time: "22:00",
        ground_images: [],
        _pending_files: [],
        isNew: true,
      },
    ]);
  };

  const handleSaveNewGround = async (ground) => {
    const payload = sanitizeGroundPayload(ground);
    if (!payload.ground_type.trim()) {
      alert("Please enter ground type.");
      return;
    }
    if (!payload.name.trim()) {
      alert("Please enter ground name.");
      return;
    }
    if (!payload.use_dynamic_pricing && (payload.price == null || Number(payload.price) <= 0)) {
      alert("Please enter a valid price or enable dynamic pricing.");
      return;
    }

    try {
      const { data: created } = await axiosClient.post("/api/ownerground/", payload);

      const files = ground._pending_files || [];
      if (files.length > 0) {
        const formData = new FormData();
        for (const f of files) formData.append("image", f);
        const { data: uploadedImages } = await axiosClient.post(
          `/api/ground/${created.id}/upload-image/`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        created.ground_images = [...(created.ground_images || []), ...uploadedImages];
      }

      setGrounds((prev) => prev.map((g) => (g.id === ground.id ? created : g)));
      alert("New ground added successfully!");
    } catch (err) {
      console.error("Error adding ground:", err.response?.data || err);
      alert("Failed to add new ground. Check console for details.");
    }
  };

  const handleImageUpload = async (groundId, event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (groundId.toString().startsWith("temp-")) {
      setGrounds((prev) =>
        prev.map((g) =>
          g.id === groundId
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
      const target = grounds.find((g) => g.id === groundId);
      const currentCount = target?.ground_images?.length || 0;
      const allowed = Math.max(0, MAX_IMAGES - currentCount);
      const toSend = files.slice(0, allowed);

      if (toSend.length === 0) {
        alert(`Max ${MAX_IMAGES} images allowed per ground.`);
        return;
      }

      const formData = new FormData();
      for (const f of toSend) formData.append("image", f);

      const { data } = await axiosClient.post(
        `/api/ground/${groundId}/upload-image/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setGrounds((prev) =>
        prev.map((g) => (g.id === groundId ? { ...g, ground_images: [...(g.ground_images || []), ...data] } : g))
      );
    } catch (err) {
      console.error("Error uploading images:", err.response?.data || err);
      alert("Failed to upload image(s). See console for details.");
    } finally {
      event.target.value = "";
    }
  };

  const handleImageDelete = async (groundId, imageId) => {
    if (!window.confirm("Delete this image?")) return;

    if (groundId.toString().startsWith("temp-")) {
      setGrounds((prev) =>
        prev.map((g) =>
          g.id === groundId
            ? {
                ...g,
                _pending_files: (g._pending_files || []).filter((_, idx) => `temp-${idx}` !== imageId),
              }
            : g
        )
      );
      return;
    }

    try {
      await axiosClient.delete(`/api/ground/${groundId}/delete-image/${imageId}/`);
      setGrounds((prev) =>
        prev.map((g) =>
          g.id === groundId ? { ...g, ground_images: (g.ground_images || []).filter((img) => img.id !== imageId) } : g
        )
      );
    } catch (err) {
      console.error("Error deleting image:", err.response?.data || err);
      alert("Failed to delete image. See console for details.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h2 className="text-3xl font-semibold text-center mb-6 text-black">Manage Grounds</h2>
      {loading && <p className="text-gray-500">Loading...</p>}

      {grounds.length === 0 && !loading && <p className="text-gray-600 text-center mb-4">No grounds found. Add one below!</p>}

      <div className="space-y-6">
        {grounds.map((ground) => (
          <div
            key={ground.id}
            className="bg-gray-50 rounded-xl p-5 shadow hover:-translate-y-1 transition-transform duration-200"
          >
            {/* Ground Type */}
            <div className="mb-4">
              <label className="block font-medium mb-1 text-black">Ground Type</label>
              <input
                type="text"
                value={ground.ground_type ?? ""}
                onChange={(e) =>
                  setGrounds((prev) =>
                    prev.map((g) => (g.id === ground.id ? { ...g, ground_type: e.target.value } : g))
                  )
                }
                placeholder="Enter ground type (e.g., Futsal, Basketball)"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Price */}
            <div className="mb-4">
              <label className="block font-medium mb-1 text-black">Price (₹)</label>
              <input
                type="number"
                value={ground.use_dynamic_pricing ? "" : ground.price ?? ""}
                onChange={(e) =>
                  setGrounds((prev) =>
                    prev.map((g) => (g.id === ground.id ? { ...g, price: e.target.value } : g))
                  )
                }
                placeholder="Enter price"
                disabled={!!ground.use_dynamic_pricing}
                min={0}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
              />
            </div>

            {/* Dynamic Pricing */}
            <div className="mb-4 flex items-center gap-2">
              <input
                id={`dynamic-pricing-${ground.id}`}
                type="checkbox"
                checked={!!ground.use_dynamic_pricing}
                onChange={(e) =>
                  setGrounds((prev) =>
                    prev.map((g) => (g.id === ground.id ? { ...g, use_dynamic_pricing: e.target.checked } : g))
                  )
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`dynamic-pricing-${ground.id}`} className="font-medium text-black">
                Use Dynamic Pricing
              </label>
            </div>

            {/* Opening & Closing Time */}
            <div className="mb-4">
              <label className="block font-medium mb-1 text-black">Opening Time</label>
              <input
                type="time"
                value={ground.opening_time ?? "05:00"}
                onChange={(e) =>
                  setGrounds((prev) =>
                    prev.map((g) => (g.id === ground.id ? { ...g, opening_time: e.target.value } : g))
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <label className="block font-medium mb-1 mt-2 text-black">Closing Time</label>
              <input
                type="time"
                value={ground.closing_time ?? "22:00"}
                onChange={(e) =>
                  setGrounds((prev) =>
                    prev.map((g) => (g.id === ground.id ? { ...g, closing_time: e.target.value } : g))
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Images Section */}
            <div className="flex flex-wrap gap-3 mb-4">
              {(ground.ground_images || []).map((img) => (
                <div key={img.id} className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-300">
                  <img src={img.image} alt="Ground" className="w-full h-full object-cover" draggable={false} />
                  <button
                    onClick={() => handleImageDelete(ground.id, img.id)}
                    title="Remove Image"
                    className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-lg"
                  >
                    ×
                  </button>
                </div>
              ))}

              {ground.id.toString().startsWith("temp-") &&
                (ground._pending_files || []).map((file, idx) => (
                  <div key={`pending-${idx}`} className="relative w-24 h-24 rounded-md overflow-hidden border border-gray-300">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Pending"
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    <button
                      onClick={() =>
                        setGrounds((prev) =>
                          prev.map((g) =>
                            g.id === ground.id
                              ? { ...g, _pending_files: g._pending_files.filter((_, i) => i !== idx) }
                              : g
                          )
                        )
                      }
                      title="Remove Image"
                      className="absolute top-1 right-1 bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-lg"
                    >
                      ×
                    </button>
                  </div>
                ))}

              {(() => {
                const existingCount = ground.ground_images?.length || 0;
                const pendingCount = ground.id.toString().startsWith("temp-")
                  ? (ground._pending_files || []).length
                  : 0;
                const total = existingCount + pendingCount;
                return total < MAX_IMAGES ? (
                  <label className="w-24 h-24 border-2 border-dashed border-blue-400 rounded-md flex items-center justify-center cursor-pointer text-blue-500 text-2xl">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(ground.id, e)}
                      className="hidden"
                    />
                    +
                  </label>
                ) : null;
              })()}
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              {ground.isNew ? (
                <>
                  <button
                    onClick={() => handleSaveNewGround(ground)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Add Ground
                  </button>
                  <button
                    onClick={() => setGrounds((prev) => prev.filter((g) => g.id !== ground.id))}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleUpdate(ground.id, ground)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => handleDeleteGround(ground.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                  >
                    Remove Ground
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={handleAddNewGroundCard}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Add New Ground
        </button>
      </div>
    </div>
  );
};

export default EditGrounds;
