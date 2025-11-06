import React from "react";

const GroundCard = ({ ground, setGrounds, handleUpdate, handleDeleteGround, handleSaveNewGround, handleImageUpload, handleImageDelete }) => {
  return (
    <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 transition hover:shadow-xl hover:border-indigo-500">
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
            return total < 6 ? (
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
  );
};

export default GroundCard;
