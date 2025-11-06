// // // frontend/src/pages/Grounds.jsx
// // import React, { useEffect, useState } from "react";
// // import { Link } from "react-router-dom";
// // import axiosClient from "../authenticated/axiosCredint";
// // import { fetchAllDistances, getDistanceForGround } from "../component/distance";

// // const Grounds = () => {
// //   const [grounds, setGrounds] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [currentImages, setCurrentImages] = useState({});
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [userLat, setUserLat] = useState(null);
// //   const [userLng, setUserLng] = useState(null);

// //   // ✅ Get live user location and log it
// //   useEffect(() => {
// //     if (navigator.geolocation) {
// //       navigator.geolocation.getCurrentPosition(
// //         (position) => {
// //           const lat = position.coords.latitude;
// //           const lng = position.coords.longitude;
// //           console.log("User Coordinates:", lat, lng); // log current coordinates
// //           setUserLat(lat);
// //           setUserLng(lng);
// //         },
// //         (error) => {
// //           console.error("Error getting location:", error);
// //           // fallback coordinates (Kathmandu)
// //           const fallbackLat = 27.7172;
// //           const fallbackLng = 85.3240;
// //           console.log("Fallback Coordinates:", fallbackLat, fallbackLng);
// //           setUserLat(fallbackLat);
// //           setUserLng(fallbackLng);
// //         }
// //       );
// //     } else {
// //       console.error("Geolocation not supported");
// //       const fallbackLat = 27.7172;
// //       const fallbackLng = 85.3240;
// //       console.log("Fallback Coordinates:", fallbackLat, fallbackLng);
// //       setUserLat(fallbackLat);
// //       setUserLng(fallbackLng);
// //     }
// //   }, []);

// //   // Fetch grounds + distances
// //   useEffect(() => {
// //     if (userLat === null || userLng === null) return;

// //     const fetchGroundsWithDistance = async () => {
// //       try {
// //         const response = await axiosClient.get("/api/grounds/");
// //         const allDistances = await fetchAllDistances(userLat, userLng);
// //         console.log("Distances fetched from backend:", allDistances); // log distances

// //         const allGrounds = [];
// //         for (const owner of response.data.owners) {
// //           owner.grounds.forEach((ground) => {
// //             allGrounds.push({
// //               ...ground,
// //               futsal_name: owner.futsal_name,
// //               distance: getDistanceForGround(ground.id, allDistances),
// //             });
// //           });
// //         }

// //         setGrounds(allGrounds);

// //         // Initialize image rotation indices
// //         const initialIndices = {};
// //         allGrounds.forEach((ground) => {
// //           initialIndices[ground.id] = 0;
// //         });
// //         setCurrentImages(initialIndices);
// //       } catch (error) {
// //         console.error("Error fetching grounds or distances:", error);
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchGroundsWithDistance();
// //   }, [userLat, userLng]);

// //   // Rotate images every 3 seconds
// //   useEffect(() => {
// //     const interval = setInterval(() => {
// //       setCurrentImages((prev) => {
// //         const updated = { ...prev };
// //         grounds.forEach((ground) => {
// //           if (ground.images && ground.images.length > 0) {
// //             updated[ground.id] = (prev[ground.id] + 1) % ground.images.length;
// //           }
// //         });
// //         return updated;
// //       });
// //     }, 3000);

// //     return () => clearInterval(interval);
// //   }, [grounds]);

// //   const getFullImageUrl = (imgUrl) => {
// //     if (!imgUrl) return "/placeholder.jpg";
// //     if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) return imgUrl;
// //     if (imgUrl.startsWith("/media")) return axiosClient.defaults.baseURL + imgUrl;
// //     return imgUrl;
// //   };

// //   const filteredGrounds = grounds.filter(
// //     (g) =>
// //       g.futsal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //       g.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //       g.city.toLowerCase().includes(searchQuery.toLowerCase())
// //   );

// //   if (loading)
// //     return (
// //       <p className="text-center text-gray-600 mt-20 text-lg font-medium">
// //         Loading...
// //       </p>
// //     );

// //   return (
// //     <div className="min-h-screen bg-slate-50 font-sans px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
// //       {/* Search */}
// //       <div className="mb-8">
// //         <input
// //           type="text"
// //           placeholder="Search by location, name or available time"
// //           value={searchQuery}
// //           onChange={(e) => setSearchQuery(e.target.value)}
// //           className="form-input w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 py-3 text-lg text-slate-800 placeholder:text-slate-400 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
// //         />
// //       </div>

// //       {/* Available Grounds */}
// //       <h2 className="text-slate-900 text-2xl font-bold mb-6">Available Grounds</h2>
// //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
// //         {filteredGrounds.length === 0 ? (
// //           <p className="text-gray-500 text-lg col-span-full text-center">No grounds found.</p>
// //         ) : (
// //           filteredGrounds.map((ground) => {
// //             const images = ground.images || [];
// //             const currentIndex = currentImages[ground.id] || 0;
// //             const currentImageUrl =
// //               images.length > 0 ? getFullImageUrl(images[currentIndex]) : "/placeholder.jpg";

// //             return (
// //               <div
// //                 key={ground.id}
// //                 className="w-full max-w-3xl bg-white rounded-xl shadow-md overflow-hidden transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
// //               >
// //                 <h3 className="text-center text-2xl font-bold mt-4 mb-2 text-gray-800">
// //                   {ground.futsal_name}
// //                 </h3>

// //                 <img
// //                   src={currentImageUrl}
// //                   alt={`${ground.futsal_name} ground`}
// //                   className="w-full h-64 object-cover border-b-4 border-green-600"
// //                   onError={(e) => {
// //                     e.target.onerror = null;
// //                     e.target.src = "/placeholder.jpg";
// //                   }}
// //                 />

// //                 <div className="p-6 flex flex-col gap-2">
// //                   <p>
// //                     <span className="font-semibold">TYPE:</span> {ground.ground_type}
// //                   </p>
// //                   <p>
// //                     <span className="font-semibold">OPENING:</span> {ground.opening_time}
// //                   </p>
// //                   <p>
// //                     <span className="font-semibold">CLOSING:</span> {ground.closing_time}
// //                   </p>
// //                   <p>
// //                     <span className="font-semibold">PRICE:</span> Rs {ground.price}
// //                   </p>
// //                   <p>
// //                     <span className="font-semibold">ADDRESS:</span> {ground.address}, {ground.city}
// //                   </p>

// //                   <Link
// //                     to={`/book/${ground.id}`}
// //                     className="mt-3 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold text-center px-4 py-2 rounded-lg transition-all duration-300"
// //                   >
// //                     Book
// //                   </Link>

// //                   {ground.distance !== null && (
// //                     <p className="mt-2 text-sm text-gray-500 text-right">
// //                       Distance: {(ground.distance / 1000).toFixed(2)} km
// //                     </p>
// //                   )}
// //                 </div>
// //               </div>
// //             );
// //           })
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default Grounds;


// // frontend/src/pages/Grounds.jsx
// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import axiosClient from "../authenticated/axiosCredint";
// import { fetchAllDistances, getDistanceForGround } from "../component/distance";

// const Grounds = () => {
//   const [grounds, setGrounds] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentImages, setCurrentImages] = useState({});
//   const [searchQuery, setSearchQuery] = useState("");
//   const [userLat, setUserLat] = useState(null);
//   const [userLng, setUserLng] = useState(null);
//   const [sortBy, setSortBy] = useState("distance");
//   const [priceRange, setPriceRange] = useState([0, 5000]);

//   // ✅ Get live user location
//   useEffect(() => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const lat = position.coords.latitude;
//           const lng = position.coords.longitude;
//           console.log("User Coordinates:", lat, lng);
//           setUserLat(lat);
//           setUserLng(lng);
//         },
//         (error) => {
//           console.error("Error getting location:", error);
//           const fallbackLat = 27.7172;
//           const fallbackLng = 85.3240;
//           setUserLat(fallbackLat);
//           setUserLng(fallbackLng);
//         }
//       );
//     } else {
//       const fallbackLat = 27.7172;
//       const fallbackLng = 85.3240;
//       setUserLat(fallbackLat);
//       setUserLng(fallbackLng);
//     }
//   }, []);

//   // Fetch grounds + distances
//   useEffect(() => {
//     if (userLat === null || userLng === null) return;

//     const fetchGroundsWithDistance = async () => {
//       try {
//         const response = await axiosClient.get("/api/grounds/");
//         const allDistances = await fetchAllDistances(userLat, userLng);

//         const allGrounds = [];
//         for (const owner of response.data.owners) {
//           owner.grounds.forEach((ground) => {
//             allGrounds.push({
//               ...ground,
//               futsal_name: owner.futsal_name,
//               distance: getDistanceForGround(ground.id, allDistances),
//             });
//           });
//         }

//         setGrounds(allGrounds);

//         const initialIndices = {};
//         allGrounds.forEach((ground) => {
//           initialIndices[ground.id] = 0;
//         });
//         setCurrentImages(initialIndices);
//       } catch (error) {
//         console.error("Error fetching grounds or distances:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchGroundsWithDistance();
//   }, [userLat, userLng]);

//   // Rotate images every 3 seconds
//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImages((prev) => {
//         const updated = { ...prev };
//         grounds.forEach((ground) => {
//           if (ground.images && ground.images.length > 0) {
//             updated[ground.id] = (prev[ground.id] + 1) % ground.images.length;
//           }
//         });
//         return updated;
//       });
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [grounds]);

//   const getFullImageUrl = (imgUrl) => {
//     if (!imgUrl) return "/placeholder.jpg";
//     if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) return imgUrl;
//     if (imgUrl.startsWith("/media")) return axiosClient.defaults.baseURL + imgUrl;
//     return imgUrl;
//   };

//   // Filter and sort grounds
//   const filteredAndSortedGrounds = grounds
//     .filter((g) =>
//       g.futsal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       g.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       g.city.toLowerCase().includes(searchQuery.toLowerCase())
//     )
//     .filter((g) => g.price >= priceRange[0] && g.price <= priceRange[1])
//     .sort((a, b) => {
//       switch (sortBy) {
//         case "distance":
//           return (a.distance || Infinity) - (b.distance || Infinity);
//         case "price-low":
//           return a.price - b.price;
//         case "price-high":
//           return b.price - a.price;
//         case "name":
//           return a.futsal_name.localeCompare(b.futsal_name);
//         default:
//           return 0;
//       }
//     });

//   if (loading)
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600 text-lg font-medium">Finding the best futsal grounds near you...</p>
//         </div>
//       </div>
//     );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header Section */}
//         <div className="text-center mb-12">
//           <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
//             Find Your Perfect
//             <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//               Futsal Ground
//             </span>
//           </h1>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//             Discover premium futsal venues near you with real-time availability and instant booking
//           </p>
//         </div>

//         {/* Search and Filters Section */}
//         <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100">
//           {/* Search Bar */}
//           <div className="relative mb-8">
//             <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//               <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//             </div>
//             <input
//               type="text"
//               placeholder="Search by ground name, location, or city..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full pl-12 pr-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
//             />
//           </div>

//           {/* Filters Row */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             {/* Sort By */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
//               >
//                 <option value="distance">Distance (Nearest)</option>
//                 <option value="price-low">Price (Low to High)</option>
//                 <option value="price-high">Price (High to Low)</option>
//                 <option value="name">Name (A-Z)</option>
//               </select>
//             </div>

//             {/* Price Range */}
//             <div>
//               <label className="block text-sm font-semibold text-gray-700 mb-2">
//                 Price Range: Rs {priceRange[0]} - Rs {priceRange[1]}
//               </label>
//               <input
//                 type="range"
//                 min="0"
//                 max="5000"
//                 step="100"
//                 value={priceRange[1]}
//                 onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
//                 className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
//               />
//             </div>

//             {/* Results Count */}
//             <div className="flex items-end">
//               <p className="text-lg font-semibold text-gray-700">
//                 {filteredAndSortedGrounds.length} {filteredAndSortedGrounds.length === 1 ? 'Ground' : 'Grounds'} Found
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Grounds Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
//           {filteredAndSortedGrounds.length === 0 ? (
//             <div className="col-span-full text-center py-16">
//               <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//               <h3 className="text-2xl font-bold text-gray-900 mb-2">No grounds found</h3>
//               <p className="text-gray-600 text-lg">Try adjusting your search criteria or filters</p>
//             </div>
//           ) : (
//             filteredAndSortedGrounds.map((ground) => {
//               const images = ground.images || [];
//               const currentIndex = currentImages[ground.id] || 0;
//               const currentImageUrl =
//                 images.length > 0 ? getFullImageUrl(images[currentIndex]) : "/placeholder.jpg";

//               return (
//                 <div
//                   key={ground.id}
//                   className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-500 transform hover:-translate-y-2"
//                 >
//                   {/* Image with overlay */}
//                   <div className="relative h-64 overflow-hidden">
//                     <img
//                       src={currentImageUrl}
//                       alt={`${ground.futsal_name} ground`}
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                       onError={(e) => {
//                         e.target.onerror = null;
//                         e.target.src = "/placeholder.jpg";
//                       }}
//                     />
                    
//                     {/* Image indicators */}
//                     {images.length > 1 && (
//                       <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
//                         {images.map((_, index) => (
//                           <div
//                             key={index}
//                             className={`w-2 h-2 rounded-full transition-all duration-300 ${
//                               index === currentIndex ? 'bg-white' : 'bg-white/50'
//                             }`}
//                           />
//                         ))}
//                       </div>
//                     )}

//                     {/* Distance badge */}
//                     {ground.distance !== null && (
//                       <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold">
//                         {(ground.distance / 1000).toFixed(1)} km
//                       </div>
//                     )}

//                     {/* Price badge */}
//                     <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-2xl font-bold text-lg shadow-lg">
//                       Rs {ground.price}
//                     </div>
//                   </div>

//                   {/* Content */}
//                   <div className="p-6">
//                     <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
//                       {ground.futsal_name}
//                     </h3>

//                     <div className="space-y-3 mb-6">
//                       <div className="flex items-center gap-2 text-gray-600">
//                         <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                         </svg>
//                         <span className="font-medium">{ground.ground_type}</span>
//                       </div>

//                       <div className="flex items-center gap-2 text-gray-600">
//                         <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                         <span className="font-medium">{ground.opening_time} - {ground.closing_time}</span>
//                       </div>

//                       <div className="flex items-center gap-2 text-gray-600">
//                         <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                         </svg>
//                         <span className="font-medium">{ground.address}, {ground.city}</span>
//                       </div>
//                     </div>

//                     <Link
//                       to={`/book/${ground.id}`}
//                       className="group/btn w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
//                     >
//                       Book Now
//                       <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//                       </svg>
//                     </Link>
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>

//       <style jsx>{`
//         .slider::-webkit-slider-thumb {
//           appearance: none;
//           height: 20px;
//           width: 20px;
//           border-radius: 50%;
//           background: linear-gradient(135deg, #2563eb, #7c3aed);
//           cursor: pointer;
//           border: 2px solid white;
//           box-shadow: 0 2px 6px rgba(0,0,0,0.2);
//         }
        
//         .slider::-moz-range-thumb {
//           height: 20px;
//           width: 20px;
//           border-radius: 50%;
//           background: linear-gradient(135deg, #2563eb, #7c3aed);
//           cursor: pointer;
//           border: 2px solid white;
//           box-shadow: 0 2px 6px rgba(0,0,0,0.2);
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Grounds;


import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../authenticated/axiosCredint";
import { fetchAllDistances, getDistanceForGround } from "../components/allDistance"

// Import all utility functions
import { 
  applyFiltersAndSorting, 
  getFilteredResultsCount 
} from "../components/searchSorts";
import { formatDistance } from "../components/DistanceUtils";
import { 
  initializeImageIndices, 
  rotateAllImages, 
  getCurrentImage 
} from "../components/Images";

const Grounds = () => {
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImages, setCurrentImages] = useState({});
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("distance");
  const [priceRange, setPriceRange] = useState([0, 5000]);

  // ✅ Get live user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log("User Coordinates:", lat, lng);
          setUserLat(lat);
          setUserLng(lng);
        },
        (error) => {
          console.error("Error getting location:", error);
          const fallbackLat = 27.7172;
          const fallbackLng = 85.3240;
          setUserLat(fallbackLat);
          setUserLng(fallbackLng);
        }
      );
    } else {
      const fallbackLat = 27.7172;
      const fallbackLng = 85.3240;
      setUserLat(fallbackLat);
      setUserLng(fallbackLng);
    }
  }, []);

  // Fetch grounds + distances
  useEffect(() => {
    if (userLat === null || userLng === null) return;

    const fetchGroundsWithDistance = async () => {
      try {
        const response = await axiosClient.get("/api/grounds/");
        const allDistances = await fetchAllDistances(userLat, userLng);

        const allGrounds = [];
        for (const owner of response.data.owners) {
          owner.grounds.forEach((ground) => {
            allGrounds.push({
              ...ground,
              futsal_name: owner.futsal_name,
              distance: getDistanceForGround(ground.id, allDistances),
            });
          });
        }

        setGrounds(allGrounds);
        
        // Initialize image rotation indices using utility function
        const initialIndices = initializeImageIndices(allGrounds);
        setCurrentImages(initialIndices);
      } catch (error) {
        console.error("Error fetching grounds or distances:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroundsWithDistance();
  }, [userLat, userLng]);

  // Rotate images every 3 seconds using utility function
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImages((prev) => rotateAllImages(prev, grounds));
    }, 3000);

    return () => clearInterval(interval);
  }, [grounds]);

  // Apply all filters and sorting using utility functions
  const filters = { searchQuery, priceRange, sortBy };
  const filteredAndSortedGrounds = applyFiltersAndSorting(grounds, filters);
  const resultsCount = getFilteredResultsCount(grounds, filters);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Finding the best futsal grounds near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
            Find Your Perfect
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Futsal Ground
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover premium futsal venues near you with real-time availability and instant booking
          </p>
        </div>

        {/* Search and Filters Section */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-12 border border-gray-100">
          {/* Search Bar */}
          <div className="relative mb-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by ground name, location, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sort By */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
              >
                <option value="distance">Distance (Nearest)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price Range: Rs {priceRange[0]} - Rs {priceRange[1]}
              </label>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <p className="text-lg font-semibold text-gray-700">
                {resultsCount} {resultsCount === 1 ? 'Ground' : 'Grounds'} Found
              </p>
            </div>
          </div>
        </div>

        {/* Grounds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredAndSortedGrounds.length === 0 ? (
            <div className="col-span-full text-center py-16">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No grounds found</h3>
              <p className="text-gray-600 text-lg">Try adjusting your search criteria or filters</p>
            </div>
          ) : (
            filteredAndSortedGrounds.map((ground) => {
              const { url: currentImageUrl, index: currentIndex, total: totalImages } = 
                getCurrentImage(ground, currentImages, axiosClient);

              return (
                <div
                  key={ground.id}
                  className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl overflow-hidden border border-gray-100 transition-all duration-500 transform hover:-translate-y-2"
                >
                  {/* Image with overlay */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={currentImageUrl}
                      alt={`${ground.futsal_name} ground`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder.jpg";
                      }}
                    />
                    
                    {/* Image indicators */}
                    {totalImages > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {Array.from({ length: totalImages }).map((_, index) => (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                              index === currentIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Distance badge */}
                    {ground.distance !== null && (
                      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                        {formatDistance(ground.distance)}
                      </div>
                    )}

                    {/* Price badge */}
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-2xl font-bold text-lg shadow-lg">
                      Rs {ground.price}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {ground.futsal_name}
                    </h3>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium">{ground.ground_type}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">{ground.opening_time} - {ground.closing_time}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">{ground.address}, {ground.city}</span>
                      </div>
                    </div>

                    <Link
                      to={`/book/${ground.id}`}
                      className="group/btn w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      Book Now
                      <svg className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>


    </div>
  );
};

export default Grounds;