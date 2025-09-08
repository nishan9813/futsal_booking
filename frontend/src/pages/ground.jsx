// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import axiosClient from "../authenticated/axiosCredint";
// import { fetchDistance } from "../component/distance";

// const Grounds = () => {
//   const [grounds, setGrounds] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentImages, setCurrentImages] = useState({});

//   const userLat = 27.7172;
//   const userLng = 85.3240;

//   useEffect(() => {
//     const fetchGroundsWithDistance = async () => {
//       try {
//         const response = await axiosClient.get("/api/grounds/");
//         const allGrounds = [];

//         for (const owner of response.data.owners) {
//           const groundsWithDistance = await Promise.all(
//             owner.grounds.map(async (ground) => {
//               const distance = await fetchDistance(ground.id, userLat, userLng);
//               return {
//                 ...ground,
//                 futsal_name: owner.futsal_name,
//                 distance,
//               };
//             })
//           );
//           allGrounds.push(...groundsWithDistance);
//         }

//         setGrounds(allGrounds);

//         const initialIndices = {};
//         allGrounds.forEach((ground) => {
//           initialIndices[ground.id] = 0;
//         });
//         setCurrentImages(initialIndices);
//       } catch (error) {
//         console.error("Error fetching grounds:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchGroundsWithDistance();
//   }, []);

//   const getFullImageUrl = (imgUrl) => {
//     if (!imgUrl) return "/placeholder.jpg";
//     if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) return imgUrl;
//     if (imgUrl.startsWith("/media")) return axiosClient.defaults.baseURL + imgUrl;
//     return imgUrl;
//   };

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

//   if (loading)
//     return (
//       <p className="text-center text-gray-600 mt-20 text-lg font-medium">
//         Loading...
//       </p>
//     );

//   return (
//     <div className="px-4 py-8 flex flex-col gap-8 items-center font-poppins text-gray-900">
//       {grounds.length === 0 ? (
//         <p className="text-gray-500 text-lg">No grounds found.</p>
//       ) : (
//         grounds.map((ground) => {
//           const images = ground.images || [];
//           const currentIndex = currentImages[ground.id] || 0;
//           const currentImageUrl =
//             images.length > 0 ? getFullImageUrl(images[currentIndex]) : "/placeholder.jpg";

//           return (
//             <div
//               key={ground.id}
//               className="w-full max-w-3xl bg-white rounded-xl shadow-md overflow-hidden transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
//             >
//               <h3 className="text-center text-2xl font-bold mt-4 mb-2 text-gray-800">
//                 {ground.futsal_name}
//               </h3>

//               <img
//                 src={currentImageUrl}
//                 alt={`${ground.futsal_name} ground`}
//                 className="w-full h-64 object-cover border-b-4 border-green-600"
//                 onError={(e) => {
//                   e.target.onerror = null;
//                   e.target.src = "/placeholder.jpg";
//                 }}
//               />

//               <div className="p-6 flex flex-col gap-2">
//                 <p>
//                   <span className="font-semibold">TYPE:</span> {ground.ground_type}
//                 </p>
//                 <p>
//                   <span className="font-semibold">OPENING:</span> {ground.opening_time}
//                 </p>
//                 <p>
//                   <span className="font-semibold">CLOSING:</span> {ground.closing_time}
//                 </p>
//                 <p>
//                   <span className="font-semibold">PRICE:</span> Rs {ground.price}
//                 </p>
//                 <p>
//                   <span className="font-semibold">ADDRESS:</span> {ground.address}, {ground.city}
//                 </p>

//                 <Link
//                   to={`/book/${ground.id}`}
//                   className="mt-3 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold text-center px-4 py-2 rounded-lg transition-all duration-300"
//                 >
//                   Book
//                 </Link>

//                 {ground.distance !== null && (
//                   <p className="mt-2 text-sm text-gray-500 text-right">
//                     Distance: {(ground.distance / 1000).toFixed(2)} km
//                   </p>
//                 )}
//               </div>
//             </div>
//           );
//         })
//       )}
//     </div>
//   );
// };

// export default Grounds;


import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../authenticated/axiosCredint";
import { fetchDistance } from "../component/distance";

const Grounds = () => {
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImages, setCurrentImages] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const userLat = 27.7172;
  const userLng = 85.3240;

  // Fetch grounds data with distances
  useEffect(() => {
    const fetchGroundsWithDistance = async () => {
      try {
        const response = await axiosClient.get("/api/grounds/");
        const allGrounds = [];

        for (const owner of response.data.owners) {
          const groundsWithDistance = await Promise.all(
            owner.grounds.map(async (ground) => {
              const distance = await fetchDistance(ground.id, userLat, userLng);
              return {
                ...ground,
                futsal_name: owner.futsal_name,
                distance,
              };
            })
          );
          allGrounds.push(...groundsWithDistance);
        }

        setGrounds(allGrounds);

        const initialIndices = {};
        allGrounds.forEach((ground) => {
          initialIndices[ground.id] = 0;
        });
        setCurrentImages(initialIndices);
      } catch (error) {
        console.error("Error fetching grounds:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroundsWithDistance();
  }, []);

  // Rotate images every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImages((prev) => {
        const updated = { ...prev };
        grounds.forEach((ground) => {
          if (ground.images && ground.images.length > 0) {
            updated[ground.id] = (prev[ground.id] + 1) % ground.images.length;
          }
        });
        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [grounds]);

  const getFullImageUrl = (imgUrl) => {
    if (!imgUrl) return "/placeholder.jpg";
    if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) return imgUrl;
    if (imgUrl.startsWith("/media")) return axiosClient.defaults.baseURL + imgUrl;
    return imgUrl;
  };

  const filteredGrounds = grounds.filter(
    (g) =>
      g.futsal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <p className="text-center text-gray-600 mt-20 text-lg font-medium">
        Loading...
      </p>
    );

  return (
    <div className="min-h-screen bg-slate-50 font-sans px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto">
      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by location, name or available time"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-input w-full rounded-lg border border-slate-300 bg-white pl-12 pr-4 py-3 text-lg text-slate-800 placeholder:text-slate-400 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      {/* Available Grounds */}
      <h2 className="text-slate-900 text-2xl font-bold mb-6">Available Grounds</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredGrounds.length === 0 ? (
          <p className="text-gray-500 text-lg col-span-full text-center">No grounds found.</p>
        ) : (
          filteredGrounds.map((ground) => {
            const images = ground.images || [];
            const currentIndex = currentImages[ground.id] || 0;
            const currentImageUrl =
              images.length > 0 ? getFullImageUrl(images[currentIndex]) : "/placeholder.jpg";

            return (
              <div
                key={ground.id}
                className="w-full max-w-3xl bg-white rounded-xl shadow-md overflow-hidden transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <h3 className="text-center text-2xl font-bold mt-4 mb-2 text-gray-800">
                  {ground.futsal_name}
                </h3>

                <img
                  src={currentImageUrl}
                  alt={`${ground.futsal_name} ground`}
                  className="w-full h-64 object-cover border-b-4 border-green-600"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/placeholder.jpg";
                  }}
                />

                <div className="p-6 flex flex-col gap-2">
                  <p>
                    <span className="font-semibold">TYPE:</span> {ground.ground_type}
                  </p>
                  <p>
                    <span className="font-semibold">OPENING:</span> {ground.opening_time}
                  </p>
                  <p>
                    <span className="font-semibold">CLOSING:</span> {ground.closing_time}
                  </p>
                  <p>
                    <span className="font-semibold">PRICE:</span> Rs {ground.price}
                  </p>
                  <p>
                    <span className="font-semibold">ADDRESS:</span> {ground.address}, {ground.city}
                  </p>

                  <Link
                    to={`/book/${ground.id}`}
                    className="mt-3 inline-block bg-green-600 hover:bg-green-700 text-white font-semibold text-center px-4 py-2 rounded-lg transition-all duration-300"
                  >
                    Book
                  </Link>

                  {ground.distance !== null && (
                    <p className="mt-2 text-sm text-gray-500 text-right">
                      Distance: {(ground.distance / 1000).toFixed(2)} km
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Grounds;
