


// import React, { useState } from 'react';
// import axios from 'axios';
// import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import './registerowner.css'

// // Helper to get CSRF token from cookie
// function getCookie(name) {
//   let cookieValue = null;
//   if (document.cookie && document.cookie !== '') {
//     const cookies = document.cookie.split(';');
//     for (let cookie of cookies) {
//       cookie = cookie.trim();
//       if (cookie.startsWith(name + '=')) {
//         cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
//         break;
//       }
//     }
//   }
//   return cookieValue;
// }

// const LocationMarker = ({ position, setPosition }) => {
//   const map = useMapEvents({
//     click(e) {
//       setPosition(e.latlng);
//       map.flyTo(e.latlng, map.getZoom());
//     },
//   });
//   return position ? <Marker position={position} /> : null;
// };

// const OwnerRegistrationForm = () => {
//   const [ownerData, setOwnerData] = useState({
//     futsal_name: '',
//     address: '',
//     city: '',
//     country: 'Nepal',
//     location: null,
//   });

//   const [grounds, setGrounds] = useState([
//     {
//       ground_type: '5A',
//       opening_time: '06:00',
//       closing_time: '22:00',
//       price: 2000,
//       images: [],
//     },
//   ]);

//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [success, setSuccess] = useState(false);

//   const handleOwnerChange = (e) => {
//     const { name, value } = e.target;
//     setOwnerData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleGroundChange = (index, e) => {
//     const { name, value } = e.target;
//     setGrounds((prev) => {
//       const newGrounds = [...prev];
//       if (name === 'price') newGrounds[index][name] = Number(value);
//       else newGrounds[index][name] = value;
//       return newGrounds;
//     });
//   };

//   const handleImageChange = (index, e) => {
//     const files = e.target.files;
//     if (files) {
//       setGrounds((prev) => {
//         const newGrounds = [...prev];
//         newGrounds[index].images = Array.from(files);
//         return newGrounds;
//       });
//     }
//   };

//   const handleLocationSelect = (latlng) => {
//     setOwnerData((prev) => ({ ...prev, location: latlng }));
//   };

//   const addGround = () => {
//     setGrounds((prev) => [
//       ...prev,
//       {
//         ground_type: '5A',
//         opening_time: '06:00',
//         closing_time: '22:00',
//         price: 2000,
//         images: [],
//       },
//     ]);
//   };

//   const removeGround = (index) => {
//     setGrounds((prev) => {
//       const newGrounds = [...prev];
//       newGrounds.splice(index, 1);
//       return newGrounds;
//     });
//   };

//   const validate = () => {
//     const newErrors = {};
//     if (!ownerData.futsal_name) newErrors.futsal_name = 'Futsal name required';
//     if (!ownerData.address) newErrors.address = 'Address required';
//     if (!ownerData.city) newErrors.city = 'City required';
//     if (!ownerData.location) newErrors.location = 'Select location from map';

//     grounds.forEach((g, i) => {
//       if (!g.ground_type) newErrors[`ground_type_${i}`] = 'Ground type required';
//       if (g.price <= 0) newErrors[`price_${i}`] = 'Invalid price';
//       if (g.images.length === 0) newErrors[`images_${i}`] = 'At least one image required';
//     });

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validate()) return;

//     setIsSubmitting(true);
//     setErrors({});

//     try {
//       await axios.get('/api/csrf/', { withCredentials: true });

//       const payload = {
//         futsal_name: ownerData.futsal_name,
//         address: ownerData.address,
//         city: ownerData.city,
//         country: ownerData.country,
//         location: ownerData.location
//           ? `${ownerData.location.lat},${ownerData.location.lng}`
//           : null,
//         grounds: grounds.map(({ images, ...rest }) => rest), // exclude images here, files sent separately
//       };

//       const formData = new FormData();
//       formData.append('data', JSON.stringify(payload));

//       grounds.forEach((g, i) => {
//         g.images.forEach((file) => {
//           formData.append(`grounds[${i}].ground_images`, file);
//         });
//       });

//       const csrfToken = getCookie('csrftoken');

//       await axios.post('/api/register-owner/', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//           'X-CSRFToken': csrfToken,
//         },
//         withCredentials: true,
//       });

//       setSuccess(true);
//     } catch (error) {
//       console.error(error.response?.data || error.message);
//       setErrors({ general: 'Registration failed. Please try again.' });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (success) {
//     return (
//       <div className="p-6 max-w-xl mx-auto text-green-700 bg-green-100 rounded-lg mt-10">
//         <h2 className="text-xl font-semibold mb-2">Registration Successful!</h2>
//         <p>Your futsal has been registered. Please check your email to verify your account.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
//       <h1 className="text-2xl font-bold text-center mb-6">Futsal Owner Registration</h1>
//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Owner Info */}
//         <section className="border p-4 rounded-lg">
//           <h2 className="text-lg font-semibold mb-4">Futsal Info</h2>
//           <input
//             type="text"
//             name="futsal_name"
//             placeholder="Futsal Name"
//             value={ownerData.futsal_name}
//             onChange={handleOwnerChange}
//             className="w-full p-2 border rounded mb-2"
//           />
//           {errors.futsal_name && <p className="text-red-500 text-sm">{errors.futsal_name}</p>}
//           <input
//             type="text"
//             name="address"
//             placeholder="Address"
//             value={ownerData.address}
//             onChange={handleOwnerChange}
//             className="w-full p-2 border rounded mb-2"
//           />
//           {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
//           <div className="grid grid-cols-2 gap-4">
//             <input
//               type="text"
//               name="city"
//               placeholder="City"
//               value={ownerData.city}
//               onChange={handleOwnerChange}
//               className="p-2 border rounded"
//             />
//             <input
//               type="text"
//               name="country"
//               placeholder="Country"
//               value={ownerData.country}
//               onChange={handleOwnerChange}
//               className="p-2 border rounded"
//             />
//           </div>
//           {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}

//           {/* Map */}
//           <div className="mt-4">
//             <label className="block mb-2">Location (Click on the map)</label>
//             <MapContainer center={{ lat: 27.7172, lng: 85.324 }} zoom={13} style={{ height: '300px' }}>
//               <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//               <LocationMarker position={ownerData.location} setPosition={handleLocationSelect} />
//             </MapContainer>
//             {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
//           </div>
//         </section>

//         {/* Grounds */}
//         <section className="border p-4 rounded-lg">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-semibold">Grounds</h2>
//             <button type="button" className="text-blue-600" onClick={addGround}>
//               + Add Ground
//             </button>
//           </div>
//           {grounds.map((ground, index) => (
//             <div key={index} className="border p-4 rounded mb-4 bg-gray-50">
//               <div className="flex justify-between items-center mb-2">
//                 <h3 className="font-medium">Ground #{index + 1}</h3>
//                 {grounds.length > 1 && (
//                   <button
//                     type="button"
//                     className="text-red-600"
//                     onClick={() => removeGround(index)}
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <select
//                   name="ground_type"
//                   value={ground.ground_type}
//                   onChange={(e) => handleGroundChange(index, e)}
//                   className="p-2 border rounded"
//                 >
//                   <option value="5A">5-a-side</option>
//                   <option value="7A">7-a-side</option>
//                   <option value="MAT">Mat Futsal</option>
//                   <option value="TURF">Turf</option>
//                   <option value="WOOD">Wood</option>
//                 </select>
//                 <input
//                   type="number"
//                   name="price"
//                   placeholder="Price"
//                   value={ground.price}
//                   onChange={(e) => handleGroundChange(index, e)}
//                   className="p-2 border rounded"
//                 />
//                 <input
//                   type="time"
//                   name="opening_time"
//                   value={ground.opening_time}
//                   onChange={(e) => handleGroundChange(index, e)}
//                   className="p-2 border rounded"
//                 />
//                 <input
//                   type="time"
//                   name="closing_time"
//                   value={ground.closing_time}
//                   onChange={(e) => handleGroundChange(index, e)}
//                   className="p-2 border rounded"
//                 />
//               </div>
//               <input
//                 type="file"
//                 multiple
//                 accept="image/*"
//                 onChange={(e) => handleImageChange(index, e)}
//                 className="mt-2"
//               />
//               {errors[`images_${index}`] && (
//                 <p className="text-red-500 text-sm">{errors[`images_${index}`]}</p>
//               )}
//             </div>
//           ))}
//         </section>

//         {/* Submit */}
//         <div className="text-center">
//           <button
//             type="submit"
//             disabled={isSubmitting}
//             className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
//           >
//             {isSubmitting ? 'Registering...' : 'Register Futsal'}
//           </button>
//           {errors.general && <p className="mt-4 text-red-500">{errors.general}</p>}
//         </div>
//       </form>
//     </div>
//   );
// };

// export default OwnerRegistrationForm;










import React, { useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './registerowner.css';

// Helper to get CSRF token from cookie
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });
  return position ? <Marker position={position} /> : null;
};

const OwnerRegistrationForm = () => {
  const [ownerData, setOwnerData] = useState({
    futsal_name: '',
    address: '',
    city: '',
    country: 'Nepal',
    location: null,
  });

  const [grounds, setGrounds] = useState([
    {
      ground_type: '5A',
      opening_time: '06:00',
      closing_time: '22:00',
      price: 2000,
      images: [],
    },
  ]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [tempLocation, setTempLocation] = useState(null);

  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    setOwnerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGroundChange = (index, e) => {
    const { name, value } = e.target;
    setGrounds((prev) => {
      const newGrounds = [...prev];
      newGrounds[index][name] = name === 'price' ? Number(value) : value;
      return newGrounds;
    });
  };

  const handleImageChange = (index, e) => {
    const files = e.target.files;
    if (files) {
      setGrounds((prev) => {
        const newGrounds = [...prev];
        newGrounds[index].images = Array.from(files);
        return newGrounds;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!ownerData.futsal_name) newErrors.futsal_name = 'Futsal name required';
    if (!ownerData.address) newErrors.address = 'Address required';
    if (!ownerData.city) newErrors.city = 'City required';
    if (!ownerData.location) newErrors.location = 'Select location from map';

    grounds.forEach((g, i) => {
      if (!g.ground_type) newErrors[`ground_type_${i}`] = 'Ground type required';
      if (g.price <= 0) newErrors[`price_${i}`] = 'Invalid price';
      if (g.images.length === 0) newErrors[`images_${i}`] = 'At least one image required';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      await axios.get('/api/csrf/', { withCredentials: true });

      const payload = {
        futsal_name: ownerData.futsal_name,
        address: ownerData.address,
        city: ownerData.city,
        country: ownerData.country,
        location: ownerData.location
          ? `${ownerData.location.lat},${ownerData.location.lng}`
          : null,
        grounds: grounds.map(({ images, ...rest }) => rest),
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));

      grounds.forEach((g, i) => {
        g.images.forEach((file) => {
          formData.append(`grounds[${i}].ground_images`, file);
        });
      });

      const csrfToken = getCookie('csrftoken');

      await axios.post('/api/register-owner/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-CSRFToken': csrfToken,
        },
        withCredentials: true,
      });

      setSuccess(true);
    } catch (error) {
      console.error(error.response?.data || error.message);
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="p-6 max-w-xl mx-auto text-green-700 bg-green-100 rounded-lg mt-10">
        <h2 className="text-xl font-semibold mb-2">Registration Successful!</h2>
        <p>Your futsal has been registered. Please check your email to verify your account.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold text-center mb-6">Futsal Owner Registration</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Owner Info */}
        <section className="border p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Futsal Info</h2>
          <input
            type="text"
            name="futsal_name"
            placeholder="Futsal Name"
            value={ownerData.futsal_name}
            onChange={handleOwnerChange}
            className="w-full p-2 border rounded mb-2"
          />
          {errors.futsal_name && <p className="text-red-500 text-sm">{errors.futsal_name}</p>}
          <input
            type="text"
            name="address"
            placeholder="Address"
            value={ownerData.address}
            onChange={handleOwnerChange}
            className="w-full p-2 border rounded mb-2"
          />
          {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={ownerData.city}
              onChange={handleOwnerChange}
              className="p-2 border rounded"
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={ownerData.country}
              onChange={handleOwnerChange}
              className="p-2 border rounded"
            />
          </div>
          {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}

          {/* Location Selector */}
          <div className="mt-4">
            <label className="block mb-2">Location</label>
            {!ownerData.location && (
              <p className="text-sm text-gray-600 mb-2">No location selected yet.</p>
            )}
            {ownerData.location && (
              <p className="text-sm text-green-700 mb-2">
                Selected Location: Lat {ownerData.location.lat.toFixed(4)}, Lng{' '}
                {ownerData.location.lng.toFixed(4)}
              </p>
            )}
            <button
              type="button"
              onClick={() => {
                setShowMap(true);
                setTempLocation(ownerData.location);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Select Location
            </button>
            {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
          </div>
        </section>

        {/* Grounds Section */}
        <section className="border p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Grounds</h2>
            <button type="button" className="text-blue-600" onClick={() => {
              setGrounds((prev) => [
                ...prev,
                {
                  ground_type: '5A',
                  opening_time: '06:00',
                  closing_time: '22:00',
                  price: 2000,
                  images: [],
                },
              ]);
            }}>
              + Add Ground
            </button>
          </div>
          {grounds.map((ground, index) => (
            <div key={index} className="border p-4 rounded mb-4 bg-gray-50">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Ground #{index + 1}</h3>
                {grounds.length > 1 && (
                  <button
                    type="button"
                    className="text-red-600"
                    onClick={() => {
                      const newGrounds = [...grounds];
                      newGrounds.splice(index, 1);
                      setGrounds(newGrounds);
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="ground_type"
                  value={ground.ground_type}
                  onChange={(e) => handleGroundChange(index, e)}
                  className="p-2 border rounded"
                >
                  <option value="5A">5-a-side</option>
                  <option value="7A">7-a-side</option>
                  <option value="MAT">Mat Futsal</option>
                  <option value="TURF">Turf</option>
                  <option value="WOOD">Wood</option>
                </select>
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={ground.price}
                  onChange={(e) => handleGroundChange(index, e)}
                  className="p-2 border rounded"
                />
                <input
                  type="time"
                  name="opening_time"
                  value={ground.opening_time}
                  onChange={(e) => handleGroundChange(index, e)}
                  className="p-2 border rounded"
                />
                <input
                  type="time"
                  name="closing_time"
                  value={ground.closing_time}
                  onChange={(e) => handleGroundChange(index, e)}
                  className="p-2 border rounded"
                />
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleImageChange(index, e)}
                className="mt-2"
              />
              {errors[`images_${index}`] && (
                <p className="text-red-500 text-sm">{errors[`images_${index}`]}</p>
              )}
            </div>
          ))}
        </section>

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            {isSubmitting ? 'Registering...' : 'Register Futsal'}
          </button>
          {errors.general && <p className="mt-4 text-red-500">{errors.general}</p>}
        </div>
      </form>

      {/* Location Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg w-full max-w-2xl relative">
            <h2 className="text-lg font-semibold mb-2">Click on the map to select a location</h2>
            <div style={{ height: '300px' }} className="mb-4">
              <MapContainer
                center={tempLocation || { lat: 27.7172, lng: 85.324 }}
                zoom={13}
                style={{ height: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <LocationMarker position={tempLocation} setPosition={setTempLocation} />
              </MapContainer>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowMap(false);
                  setTempLocation(null);
                }}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setOwnerData((prev) => ({ ...prev, location: tempLocation }));
                  setShowMap(false);
                }}
                disabled={!tempLocation}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                Select
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerRegistrationForm;
