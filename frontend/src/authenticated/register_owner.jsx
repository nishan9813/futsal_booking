
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
    <div className="image-selector">
      <div className="image-grid">
        {Array.isArray(images) &&
          images.map((img, idx) => (
            <div key={idx}>
              <img
                src={typeof img === "string" ? img : URL.createObjectURL(img)}
                alt={`selected-${idx}`}
              />
              <button type="button" onClick={() => removeImage(idx)}>×</button>
            </div>
          ))}
        {images.length < MAX_IMAGES && (
          <label>
            <span>+</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
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
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 animate-slide-up">
        <button type="button" onClick={() => navigate(-1)} className="flex items-center text-indigo-500 hover:text-indigo-700 mb-4 font-medium">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 mr-1">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">Futsal Owner Registration</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Owner Info Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Futsal Info</h2>
            <input
              type="text"
              name="futsal_name"
              placeholder="Futsal Name"
              value={ownerData.futsal_name}
              onChange={handleOwnerChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
            />
            {errors.futsal_name && <p className="text-red-500 text-sm">{errors.futsal_name}</p>}

            <input
              type="text"
              name="address"
              placeholder="Address"
              value={ownerData.address}
              onChange={handleOwnerChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
            />
            {errors.address && <p className="text-red-500 text-sm">{errors.address}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                placeholder="City"
                value={ownerData.city}
                onChange={handleOwnerChange}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              />
              <input
                type="text"
                name="country"
                placeholder="Country"
                value={ownerData.country}
                onChange={handleOwnerChange}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
              />
            </div>
            {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}

            {/* Location Selector */}
            <div className="mt-4">
              <label className="block mb-2 font-medium text-gray-600">Location</label>
              {!ownerData.location && <p className="text-gray-500 mb-2">No location selected yet.</p>}
              {ownerData.location && <p className="text-green-700 mb-2">Lat {ownerData.location.lat.toFixed(4)}, Lng {ownerData.location.lng.toFixed(4)}</p>}
              <button type="button" onClick={() => setShowMap(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                Select Location
              </button>
              {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
            </div>
          </section>

          {/* Grounds Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-700">Grounds</h2>
              <button
                type="button"
                className="text-indigo-500 hover:text-indigo-700 font-medium"
                onClick={() => setGrounds(prev => [...prev, { ground_type: "5A", opening_time: "06:00", closing_time: "22:00", price: 2000, images: [] }])}
              >
                + Add Ground
              </button>
            </div>

            {grounds.map((ground, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-700">Ground #{index + 1}</h3>
                  {grounds.length > 1 && (
                    <button type="button" className="text-red-600 hover:text-red-800" onClick={() => setGrounds(prev => prev.filter((_, i) => i !== index))}>
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    name="ground_type"
                    value={ground.ground_type}
                    onChange={(e) => handleGroundChange(index, e)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
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
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  />

                  <input
                    type="time"
                    name="opening_time"
                    value={ground.opening_time}
                    onChange={(e) => handleGroundChange(index, e)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  />

                  <input
                    type="time"
                    name="closing_time"
                    value={ground.closing_time}
                    onChange={(e) => handleGroundChange(index, e)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                  />
                </div>

                {/* Image Selector */}
                <ImageSelector images={ground.images} setImages={(imgs) => handleImagesChange(index, imgs)} />
                {errors[`images_${index}`] && <p className="text-red-500 text-sm">{errors[`images_${index}`]}</p>}
              </div>
            ))}
          </section>

          {/* Submit Section */}
          <div className="text-center relative mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
            >
              {isSubmitting ? "Registering..." : "Register Futsal"}
            </button>

            {successAnimation && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-32 h-32 bg-green-500 rounded-full animate-ping opacity-75"></div>
                <div className="absolute text-white font-bold text-lg">Registered!</div>
              </div>
            )}

            {errors.general && <p className="mt-4 text-red-500">{errors.general}</p>}
          </div>
        </form>

        {/* Map Picker */}
        {showMap && (
          <LocationPicker
            initialLocation={ownerData.location}
            onSelect={(location) => {
              setOwnerData(prev => ({ ...prev, location }));
              setShowMap(false);
            }}
            onCancel={() => setShowMap(false)}
          />
        )}
      </div>
    </div>

  );
};

export default OwnerRegistrationForm;
