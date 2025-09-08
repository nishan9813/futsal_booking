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
      .get("/api/owner-grounds/")
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
      const { data } = await axiosClient.patch(`/api/owner-grounds/${groundId}/`, payload);
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
      await axiosClient.delete(`/api/owner-grounds/${groundId}/`);
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
      const { data: created } = await axiosClient.post("/api/owner-ground/", payload);

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
  <div className="max-w-7xl mx-auto px-6 py-10 bg-slate-900 min-h-screen text-gray-100">
    <h1 className="text-4xl font-extrabold text-white text-center mb-10">
      Manage Your Grounds
    </h1>

    {loading && <p className="text-gray-400 text-center">Loading...</p>}
    {grounds.length === 0 && !loading && (
      <p className="text-gray-400 text-center mb-6">
        No grounds found. Add one below!
      </p>
    )}

    <div className="space-y-10">
      {grounds.map((ground) => (
        <div
          key={ground.id}
          className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 transition hover:shadow-xl hover:border-indigo-500"
        >
          {/* Ground Type */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-200">
              Ground Type
            </label>
            <input
              type="text"
              value={ground.ground_type ?? ""}
              onChange={(e) =>
                setGrounds((prev) =>
                  prev.map((g) =>
                    g.id === ground.id ? { ...g, ground_type: e.target.value } : g
                  )
                )
              }
              placeholder="Enter ground type (e.g., Futsal, Basketball)"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Price */}
          <div className="mb-6">
            <label className="block font-semibold mb-2 text-gray-200">
              Price (₹)
            </label>
            <input
              type="number"
              value={ground.use_dynamic_pricing ? "" : ground.price ?? ""}
              onChange={(e) =>
                setGrounds((prev) =>
                  prev.map((g) =>
                    g.id === ground.id ? { ...g, price: e.target.value } : g
                  )
                )
              }
              placeholder="Enter price"
              disabled={!!ground.use_dynamic_pricing}
              min={0}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-700"
            />
          </div>

          {/* Dynamic Pricing */}
          <div className="mb-6 flex items-center gap-3">
            <input
              id={`dynamic-pricing-${ground.id}`}
              type="checkbox"
              checked={!!ground.use_dynamic_pricing}
              onChange={(e) =>
                setGrounds((prev) =>
                  prev.map((g) =>
                    g.id === ground.id
                      ? { ...g, use_dynamic_pricing: e.target.checked }
                      : g
                  )
                )
              }
              className="h-5 w-5 text-indigo-500 rounded focus:ring-indigo-500"
            />
            <label
              htmlFor={`dynamic-pricing-${ground.id}`}
              className="text-gray-200 font-medium"
            >
              Enable Dynamic Pricing
            </label>
          </div>

          {/* Opening & Closing Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block font-semibold mb-2 text-gray-200">
                Opening Time
              </label>
              <input
                type="time"
                value={ground.opening_time ?? "05:00"}
                onChange={(e) =>
                  setGrounds((prev) =>
                    prev.map((g) =>
                      g.id === ground.id ? { ...g, opening_time: e.target.value } : g
                    )
                  )
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2 text-gray-200">
                Closing Time
              </label>
              <input
                type="time"
                value={ground.closing_time ?? "22:00"}
                onChange={(e) =>
                  setGrounds((prev) =>
                    prev.map((g) =>
                      g.id === ground.id ? { ...g, closing_time: e.target.value } : g
                    )
                  )
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Images */}
          <div className="mb-6">
            <label className="block font-semibold mb-3 text-gray-200">
              Ground Images
            </label>
            <div className="flex flex-wrap gap-4">
              {(ground.ground_images || []).map((img) => (
                <div
                  key={img.id}
                  className="relative w-28 h-28 rounded-lg overflow-hidden border border-slate-600 shadow-sm"
                >
                  <img
                    src={img.image}
                    alt="Ground"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleImageDelete(ground.id, img.id)}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}

              {ground.id.toString().startsWith("temp-") &&
                (ground._pending_files || []).map((file, idx) => (
                  <div
                    key={`pending-${idx}`}
                    className="relative w-28 h-28 rounded-lg overflow-hidden border border-slate-600 shadow-sm"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Pending"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() =>
                        setGrounds((prev) =>
                          prev.map((g) =>
                            g.id === ground.id
                              ? {
                                  ...g,
                                  _pending_files: g._pending_files.filter(
                                    (_, i) => i !== idx
                                  ),
                                }
                              : g
                          )
                        )
                      }
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center"
                    >
                      ×
                    </button>
                  </div>
                ))}

              {/* Upload Button */}
              {(() => {
                const existingCount = ground.ground_images?.length || 0;
                const pendingCount = ground.id.toString().startsWith("temp-")
                  ? (ground._pending_files || []).length
                  : 0;
                const total = existingCount + pendingCount;
                return total < MAX_IMAGES ? (
                  <label className="w-28 h-28 border-2 border-dashed border-indigo-400 rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-700 text-indigo-400 text-3xl">
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
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            {ground.isNew ? (
              <>
                <button
                  onClick={() => handleSaveNewGround(ground)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow"
                >
                  Add Ground
                </button>
                <button
                  onClick={() =>
                    setGrounds((prev) => prev.filter((g) => g.id !== ground.id))
                  }
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow"
                >
                  Remove
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleUpdate(ground.id, ground)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => handleDeleteGround(ground.id)}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow"
                >
                  Remove Ground
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>

    <div className="mt-10 text-center">
      <button
        onClick={handleAddNewGroundCard}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg"
      >
        + Add New Ground
      </button>
    </div>
  </div>
);
};

export default EditGrounds;
