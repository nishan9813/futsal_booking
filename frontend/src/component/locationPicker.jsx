// LocationPicker.jsx
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./locationpicker.css"; // optional for modal styling

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });
  return position ? <Marker position={position} /> : null;
};

const LocationPicker = ({ initialLocation, onSelect, onCancel }) => {
  const [tempLocation, setTempLocation] = useState(initialLocation);

  return (
    <div className="location-modal">
      <div className="location-modal-backdrop" onClick={onCancel}></div>
      <div className="location-modal-content">
        <h2 className="mb-2 text-lg font-semibold">Select Location</h2>
        <div style={{ height: "400px", width: "100%" }}>
          <MapContainer
            center={tempLocation || { lat: 27.7172, lng: 85.324 }}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <LocationMarker position={tempLocation} setPosition={setTempLocation} />
          </MapContainer>
        </div>
        <div className="flex justify-end space-x-4 mt-4">
          <button
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            disabled={!tempLocation}
            onClick={() => onSelect(tempLocation)}
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
