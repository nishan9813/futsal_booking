// src/components/grounds/GroundForm.jsx
import React from "react";

const GroundForm = ({ ground, setGrounds }) => {
  const updateField = (field, value) => {
    setGrounds((prev) =>
      prev.map((g) =>
        g.id === ground.id ? { ...g, [field]: value } : g
      )
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Ground Type */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Ground Type *
          </label>
          <input
            type="text"
            value={ground.ground_type ?? ""}
            onChange={(e) => updateField("ground_type", e.target.value)}
            placeholder="e.g. Futsal, Basketball, Cricket"
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Base Price (₹) *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-gray-600 font-semibold">₹</span>
            </div>
            <input
              type="number"
              value={ground.price ?? ""}
              onChange={(e) => updateField("price", e.target.value)}
              placeholder="Enter base price"
              min={1}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900 placeholder-gray-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Dynamic Pricing */}
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">
                Dynamic Pricing
              </label>
              <p className="text-sm text-gray-600">Automatically adjust prices based on demand</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!!ground.use_dynamic_pricing}
                onChange={(e) => updateField("use_dynamic_pricing", e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600"></div>
            </label>
          </div>
        </div>

        {/* Opening & Closing Times */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Opening Time *
            </label>
            <input
              type="time"
              value={ground.opening_time ?? "05:00"}
              onChange={(e) => updateField("opening_time", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Closing Time *
            </label>
            <input
              type="time"
              value={ground.closing_time ?? "22:00"}
              onChange={(e) => updateField("closing_time", e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-gray-900"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroundForm;