// src/components/LocationPicker.jsx
import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '300px' };
const defaultCenter = { lat: 27.7172, lng: 85.3240 }; // Kathmandu

const LocationPicker = ({ lat, lng, onSelect }) => {
  const [marker, setMarker] = useState(lat && lng ? { lat, lng } : null);

  const handleClick = (event) => {
    const location = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setMarker(location);
    onSelect(location);
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyC8xO8G4mNzPNlmHGBd49sMfoTBWF0YmtI">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={marker || defaultCenter}
        zoom={14}
        onClick={handleClick}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
    </LoadScript>
  );
};

export default LocationPicker;
