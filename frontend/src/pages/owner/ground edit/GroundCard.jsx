// src/components/grounds/GroundCard.jsx
import React from "react";
import GroundForm from "./GroundForm";
import GroundImages from "./GroundImage"
import GroundActions from "./GroundAction"

const GroundCard = ({ ground, setGrounds, MAX_IMAGES }) => {
  const isNew = ground.id.toString().startsWith("temp-");

  return (
    <div className={`bg-white rounded-3xl shadow-2xl border-2 p-8 transition-all duration-300 hover:shadow-3xl ${
      isNew ? 'border-dashed border-blue-300 bg-blue-50/30' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            isNew 
              ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
              : 'bg-gradient-to-r from-green-500 to-green-600'
          }`}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900">
              {ground.ground_type || "New Ground"}
            </h3>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isNew 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {isNew ? "Draft" : "Published"}
            </div>
          </div>
        </div>
        
        {!isNew && ground.price && (
          <div className="text-right">
            <div className="text-3xl font-black text-gray-900">Rs {ground.price}</div>
            <div className="text-sm text-gray-600">per hour</div>
          </div>
        )}
      </div>

      {/* Ground info form */}
      <GroundForm ground={ground} setGrounds={setGrounds} />

      {/* Image upload + preview */}
      <GroundImages ground={ground} setGrounds={setGrounds} MAX_IMAGES={MAX_IMAGES} />

      {/* Buttons (Save, Delete, etc.) */}
      <GroundActions ground={ground} setGrounds={setGrounds} />
    </div>
  );
};

export default GroundCard;