// src/components/grounds/EditGrounds.jsx
import React, { useEffect, useState } from "react";
import axiosClient from "../../../authenticated/axiosCredint";
import GroundCard from "./GroundCard";

const MAX_IMAGES = 6;

const EditGrounds = () => {
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/api/owner-grounds/")
      .then((res) => setGrounds(res.data || []))
      .catch((err) => {
        console.error("Error fetching grounds:", err.response?.data || err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddNewGround = () => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading your grounds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            Manage Your
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Futsal Grounds
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create, edit, and manage your futsal grounds with real-time updates
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="text-2xl font-black text-gray-900">{grounds.length}</div>
            <div className="text-sm font-medium text-gray-600">Total Grounds</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="text-2xl font-black text-gray-900">
              {grounds.filter(g => !g.id.toString().startsWith('temp-')).length}
            </div>
            <div className="text-sm font-medium text-gray-600">Published</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="text-2xl font-black text-gray-900">
              {grounds.filter(g => g.id.toString().startsWith('temp-')).length}
            </div>
            <div className="text-sm font-medium text-gray-600">Draft</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="text-2xl font-black text-gray-900">{MAX_IMAGES}</div>
            <div className="text-sm font-medium text-gray-600">Max Images</div>
          </div>
        </div>

        {/* Empty State */}
        {!loading && grounds.length === 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border border-gray-200 mb-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No grounds yet</h3>
            <p className="text-gray-600 text-lg mb-6">Get started by adding your first futsal ground</p>
          </div>
        )}

        {/* Ground Cards */}
        <div className="space-y-8">
          {grounds.map((ground) => (
            <GroundCard
              key={ground.id}
              ground={ground}
              setGrounds={setGrounds}
              MAX_IMAGES={MAX_IMAGES}
            />
          ))}
        </div>

        {/* Add New Ground Button */}
        <div className="text-center mt-12">
          <button
            onClick={handleAddNewGround}
            className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 mx-auto"
          >
            <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Ground
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditGrounds;