
// import React, { useState } from "react";
// import axiosClient from "./axiosCredint";
// import LocationPicker from "../component/locationPicker";
// import { useNavigate } from "react-router-dom";

// const ImageSelector = ({ images, setImages }) => {
//   const MAX_IMAGES = 6;

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
//     const remainingSlots = MAX_IMAGES - images.length;
//     setImages([...images, ...files.slice(0, remainingSlots)]);
//   };

//   const removeImage = (index) => {
//     setImages(images.filter((_, i) => i !== index));
//   };

//   return (
//     <div className="image-selector">
//       <div className="image-grid">
//         {Array.isArray(images) &&
//           images.map((img, idx) => (
//             <div key={idx}>
//               <img
//                 src={typeof img === "string" ? img : URL.createObjectURL(img)}
//                 alt={`selected-${idx}`}
//               />
//               <button type="button" onClick={() => removeImage(idx)}>×</button>
//             </div>
//           ))}
//         {images.length < MAX_IMAGES && (
//           <label>
//             <span>+</span>
//             <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
//           </label>
//         )}
//       </div>
//     </div>
//   );
// };

// const OwnerRegistrationForm = () => {
//   const navigate = useNavigate();
//   const [ownerData, setOwnerData] = useState({
//     futsal_name: "",
//     address: "",
//     city: "",
//     country: "Nepal",
//     location: null,
//   });

//   const [grounds, setGrounds] = useState([
//     { ground_type: "5A", opening_time: "06:00", closing_time: "22:00", price: 2000, images: [] },
//   ]);

//   const [errors, setErrors] = useState({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [successAnimation, setSuccessAnimation] = useState(false);
//   const [showMap, setShowMap] = useState(false);

//   const handleOwnerChange = (e) => {
//     const { name, value } = e.target;
//     setOwnerData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleGroundChange = (index, e) => {
//     const { name, value } = e.target;
//     setGrounds(prev => {
//       const newGrounds = [...prev];
//       newGrounds[index][name] = name === "price" ? Number(value) : value;
//       return newGrounds;
//     });
//   };

//   const handleImagesChange = (index, images) => {
//     setGrounds(prev => {
//       const newGrounds = [...prev];
//       newGrounds[index].images = images;
//       return newGrounds;
//     });
//   };

//   const validate = () => {
//     const newErrors = {};
//     if (!ownerData.futsal_name) newErrors.futsal_name = "Futsal name required";
//     if (!ownerData.address) newErrors.address = "Address required";
//     if (!ownerData.city) newErrors.city = "City required";
//     if (!ownerData.location) newErrors.location = "Select location from map";

//     grounds.forEach((g, i) => {
//       if (!g.ground_type) newErrors[`ground_type_${i}`] = "Ground type required";
//       if (g.price <= 0) newErrors[`price_${i}`] = "Invalid price";
//       if (!Array.isArray(g.images) || g.images.length === 0) newErrors[`images_${i}`] = "At least one image required";
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
//       const payload = {
//         futsal_name: ownerData.futsal_name,
//         address: ownerData.address,
//         city: ownerData.city,
//         country: ownerData.country,
//         location: ownerData.location ? `${ownerData.location.lat},${ownerData.location.lng}` : null,
//         grounds: grounds.map(({ images, ...rest }) => rest),
//       };

//       const formData = new FormData();
//       formData.append("data", JSON.stringify(payload));

//       grounds.forEach((g, i) => {
//         g.images.forEach((file) => {
//           formData.append(`grounds[${i}].ground_images`, file);
//         });
//       });

//       await axiosClient.post("/api/register-owner/", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       setSuccessAnimation(true);
//       setTimeout(() => {
//         setSuccessAnimation(false);
//         navigate("/");
//       }, 2500);
//     } catch (error) {
//       console.error(error.response?.data || error.message);
//       setErrors({ general: "Registration failed. Please try again." });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
//       <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 animate-slide-up">
//         <button type="button" onClick={() => navigate(-1)} className="flex items-center text-indigo-500 hover:text-indigo-700 mb-4 font-medium">
//           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//           </svg>
//           Back
//         </button>

//         <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Futsal Owner Registration</h1>

//         <form onSubmit={handleSubmit} className="space-y-6">
//           {/* Owner Info Section */}
//           <section className="space-y-4">
//             <h2 className="text-lg font-semibold text-gray-700">Futsal Info</h2>
//             <input
//               type="text"
//               name="futsal_name"
//               placeholder="Futsal Name"
//               value={ownerData.futsal_name}
//               onChange={handleOwnerChange}
//               className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
//             />
//             {errors.futsal_name && <p className="text-red-500 text-sm">{errors.futsal_name}</p>}

//             <input
//               type="text"
//               name="address"
//               placeholder="Address"
//               value={ownerData.address}
//               onChange={handleOwnerChange}
//               className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
//             />
//             {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <input
//                 type="text"
//                 name="city"
//                 placeholder="City"
//                 value={ownerData.city}
//                 onChange={handleOwnerChange}
//                 className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
//               />
//               <input
//                 type="text"
//                 name="country"
//                 placeholder="Country"
//                 value={ownerData.country}
//                 onChange={handleOwnerChange}
//                 className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
//               />
//             </div>
//             {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}

//             {/* Location Selector */}
//             <div className="mt-4">
//               <label className="block mb-2 font-medium text-gray-600">Location</label>
//               {!ownerData.location && <p className="text-gray-500 mb-2">No location selected yet.</p>}
//               {ownerData.location && <p className="text-green-700 mb-2">Lat {ownerData.location.lat.toFixed(4)}, Lng {ownerData.location.lng.toFixed(4)}</p>}
//               <button type="button" onClick={() => setShowMap(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
//                 Select Location
//               </button>
//               {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
//             </div>
//           </section>

//           {/* Grounds Section */}
//           <section className="space-y-4">
//             <div className="flex justify-between items-center">
//               <h2 className="text-lg font-semibold text-gray-700">Grounds</h2>
//               <button
//                 type="button"
//                 className="text-indigo-500 hover:text-indigo-700 font-medium"
//                 onClick={() => setGrounds(prev => [...prev, { ground_type: "5A", opening_time: "06:00", closing_time: "22:00", price: 2000, images: [] }])}
//               >
//                 + Add Ground
//               </button>
//             </div>

//             {grounds.map((ground, index) => (
//               <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-3">
//                 <div className="flex justify-between items-center">
//                   <h3 className="font-medium text-gray-700">Ground #{index + 1}</h3>
//                   {grounds.length > 1 && (
//                     <button type="button" className="text-red-600 hover:text-red-800" onClick={() => setGrounds(prev => prev.filter((_, i) => i !== index))}>
//                       Remove
//                     </button>
//                   )}
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <select
//                     name="ground_type"
//                     value={ground.ground_type}
//                     onChange={(e) => handleGroundChange(index, e)}
//                     className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
//                   >
//                     <option value="5A">5-a-side</option>
//                     <option value="7A">7-a-side</option>
//                     <option value="MAT">Mat Futsal</option>
//                     <option value="TURF">Turf</option>
//                     <option value="WOOD">Wood</option>
//                   </select>

//                   <input
//                     type="number"
//                     name="price"
//                     placeholder="Price"
//                     value={ground.price}
//                     onChange={(e) => handleGroundChange(index, e)}
//                     className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
//                   />

//                   <input
//                     type="time"
//                     name="opening_time"
//                     value={ground.opening_time}
//                     onChange={(e) => handleGroundChange(index, e)}
//                     className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
//                   />

//                   <input
//                     type="time"
//                     name="closing_time"
//                     value={ground.closing_time}
//                     onChange={(e) => handleGroundChange(index, e)}
//                     className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
//                   />
//                 </div>

//                 {/* Image Selector */}
//                 <ImageSelector images={ground.images} setImages={(imgs) => handleImagesChange(index, imgs)} />
//                 {errors[`images_${index}`] && <p className="text-red-500 text-sm">{errors[`images_${index}`]}</p>}
//               </div>
//             ))}
//           </section>

//           {/* Submit Section */}
//           <div className="text-center relative mt-6">
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
//             >
//               {isSubmitting ? "Registering..." : "Register Futsal"}
//             </button>

//             {successAnimation && (
//               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//                 <div className="w-32 h-32 bg-green-500 rounded-full animate-ping opacity-75"></div>
//                 <div className="absolute text-white font-bold text-lg">Registered!</div>
//               </div>
//             )}

//             {errors.general && <p className="mt-4 text-red-500">{errors.general}</p>}
//           </div>
//         </form>

//         {/* Map Picker */}
//         {showMap && (
//           <LocationPicker
//             initialLocation={ownerData.location}
//             onSelect={(location) => {
//               setOwnerData(prev => ({ ...prev, location }));
//               setShowMap(false);
//             }}
//             onCancel={() => setShowMap(false)}
//           />
//         )}
//       </div>
//     </div>

//   );
// };

// export default OwnerRegistrationForm;


import React, { useState } from "react";
import axiosClient from "./axiosCredint";
import LocationPicker from "../component/locationPicker";
import { useNavigate } from "react-router-dom";

const ImageSelector = ({ images, setImages }) => {
  const MAX_IMAGES = 6;

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const remainingSlots = MAX_IMAGES - images.length;
    setImages([...images, ...files.slice(0, remainingSlots)]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-900 mb-3">
        Ground Images ({images.length}/{MAX_IMAGES})
      </label>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {Array.isArray(images) &&
          images.map((img, idx) => (
            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-300 shadow-sm">
              <img
                src={typeof img === "string" ? img : URL.createObjectURL(img)}
                alt={`selected-${idx}`}
                className="w-full h-full object-cover"
              />
              <button 
                type="button" 
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                ×
              </button>
            </div>
          ))}
        {images.length < MAX_IMAGES && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-gray-400 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group">
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange} 
            />
            <svg className="w-6 h-6 text-gray-500 group-hover:text-blue-500 mb-1 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600">Add Image</span>
          </label>
        )}
      </div>
    </div>
  );
};

const OwnerRegistrationForm = () => {
  const navigate = useNavigate();
  const [ownerData, setOwnerData] = useState({
    futsal_name: "",
    address: "",
    city: "",
    country: "Nepal",
    location: null,
  });

  const [grounds, setGrounds] = useState([
    { ground_type: "5A", opening_time: "06:00", closing_time: "22:00", price: 2000, images: [] },
  ]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successAnimation, setSuccessAnimation] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const handleOwnerChange = (e) => {
    const { name, value } = e.target;
    setOwnerData(prev => ({ ...prev, [name]: value }));
  };

  const handleGroundChange = (index, e) => {
    const { name, value } = e.target;
    setGrounds(prev => {
      const newGrounds = [...prev];
      newGrounds[index][name] = name === "price" ? Number(value) : value;
      return newGrounds;
    });
  };

  const handleImagesChange = (index, images) => {
    setGrounds(prev => {
      const newGrounds = [...prev];
      newGrounds[index].images = images;
      return newGrounds;
    });
  };

  const validate = () => {
    const newErrors = {};
    if (!ownerData.futsal_name) newErrors.futsal_name = "Futsal name required";
    if (!ownerData.address) newErrors.address = "Address required";
    if (!ownerData.city) newErrors.city = "City required";
    if (!ownerData.location) newErrors.location = "Select location from map";

    grounds.forEach((g, i) => {
      if (!g.ground_type) newErrors[`ground_type_${i}`] = "Ground type required";
      if (g.price <= 0) newErrors[`price_${i}`] = "Invalid price";
      if (!Array.isArray(g.images) || g.images.length === 0) newErrors[`images_${i}`] = "At least one image required";
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
      const payload = {
        futsal_name: ownerData.futsal_name,
        address: ownerData.address,
        city: ownerData.city,
        country: ownerData.country,
        location: ownerData.location ? `${ownerData.location.lat},${ownerData.location.lng}` : null,
        grounds: grounds.map(({ images, ...rest }) => rest),
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));

      grounds.forEach((g, i) => {
        g.images.forEach((file) => {
          formData.append(`grounds[${i}].ground_images`, file);
        });
      });

      await axiosClient.post("/api/register-owner/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessAnimation(true);
      setTimeout(() => {
        setSuccessAnimation(false);
        navigate("/");
      }, 2500);
    } catch (error) {
      console.error(error.response?.data || error.message);
      setErrors({ general: "Registration failed. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            Register Your
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Futsal Business
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join our platform and start accepting bookings for your futsal grounds
          </p>
        </div>

        {/* Back Button */}
        <button 
          type="button" 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold mb-8 transition-colors duration-300 group"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Previous Page
        </button>

        {/* Main Form */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Owner Info Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-900">Futsal Information</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    Futsal Name *
                  </label>
                  <input
                    type="text"
                    name="futsal_name"
                    placeholder="Enter your futsal name"
                    value={ownerData.futsal_name}
                    onChange={handleOwnerChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                  {errors.futsal_name && <p className="mt-2 text-red-600 text-sm font-medium">{errors.futsal_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={ownerData.city}
                    onChange={handleOwnerChange}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  />
                  {errors.city && <p className="mt-2 text-red-600 text-sm font-medium">{errors.city}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Address *
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Enter complete address"
                  value={ownerData.address}
                  onChange={handleOwnerChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                />
                {errors.address && <p className="mt-2 text-red-600 text-sm font-medium">{errors.address}</p>}
              </div>

              {/* Location Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Location on Map *
                </label>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  {!ownerData.location ? (
                    <div className="text-center py-4">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-gray-600 mb-4">No location selected yet</p>
                      <button 
                        type="button" 
                        onClick={() => setShowMap(true)} 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        Select Location on Map
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-700 font-semibold">
                          Location Selected ✓
                        </p>
                        <p className="text-gray-600 text-sm">
                          Lat {ownerData.location.lat.toFixed(4)}, Lng {ownerData.location.lng.toFixed(4)}
                        </p>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setShowMap(true)} 
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors duration-300"
                      >
                        Change Location
                      </button>
                    </div>
                  )}
                  {errors.location && <p className="mt-2 text-red-600 text-sm font-medium">{errors.location}</p>}
                </div>
              </div>
            </section>

            {/* Grounds Section */}
            <section className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">Ground Details</h2>
                </div>
                <button
                  type="button"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-4 py-2 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  onClick={() => setGrounds(prev => [...prev, { ground_type: "5A", opening_time: "06:00", closing_time: "22:00", price: 2000, images: [] }])}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Ground
                </button>
              </div>

              {grounds.map((ground, index) => (
                <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black text-gray-900">Ground #{index + 1}</h3>
                    {grounds.length > 1 && (
                      <button 
                        type="button" 
                        className="text-red-600 hover:text-red-800 font-semibold text-sm transition-colors duration-300 flex items-center gap-1"
                        onClick={() => setGrounds(prev => prev.filter((_, i) => i !== index))}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Ground Type *</label>
                      <select
                        name="ground_type"
                        value={ground.ground_type}
                        onChange={(e) => handleGroundChange(index, e)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      >
                        <option value="5A">5-a-side</option>
                        <option value="7A">7-a-side</option>
                        <option value="MAT">Mat Futsal</option>
                        <option value="TURF">Turf</option>
                        <option value="WOOD">Wood</option>
                      </select>
                      {errors[`ground_type_${index}`] && <p className="mt-2 text-red-600 text-sm font-medium">{errors[`ground_type_${index}`]}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Price (₹) *</label>
                      <input
                        type="number"
                        name="price"
                        placeholder="Price per hour"
                        value={ground.price}
                        onChange={(e) => handleGroundChange(index, e)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                      {errors[`price_${index}`] && <p className="mt-2 text-red-600 text-sm font-medium">{errors[`price_${index}`]}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Opening Time</label>
                      <input
                        type="time"
                        name="opening_time"
                        value={ground.opening_time}
                        onChange={(e) => handleGroundChange(index, e)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">Closing Time</label>
                      <input
                        type="time"
                        name="closing_time"
                        value={ground.closing_time}
                        onChange={(e) => handleGroundChange(index, e)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Image Selector */}
                  <ImageSelector images={ground.images} setImages={(imgs) => handleImagesChange(index, imgs)} />
                  {errors[`images_${index}`] && <p className="text-red-600 text-sm font-medium">{errors[`images_${index}`]}</p>}
                </div>
              ))}
            </section>

            {/* Submit Section */}
            <div className="text-center relative">
              {errors.general && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl mb-6">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">{errors.general}</span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Registering Your Business...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span>Register Futsal Business</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </button>

              {/* Success Animation */}
              {successAnimation && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">Success!</h3>
                    <p className="text-gray-600">Your futsal business has been registered</p>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Map Picker Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <LocationPicker
              initialLocation={ownerData.location}
              onSelect={(location) => {
                setOwnerData(prev => ({ ...prev, location }));
                setShowMap(false);
              }}
              onCancel={() => setShowMap(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerRegistrationForm;