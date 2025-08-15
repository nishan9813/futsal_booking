
// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import './grounds.css'

// const BACKEND_URL = "http://127.0.0.1:8000";

// const Grounds = () => {
//   const [grounds, setGrounds] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentImages, setCurrentImages] = useState({}); // track current image index per ground

//   useEffect(() => {
//     const token = localStorage.getItem("access_token");

//     axios
//       .get(`${BACKEND_URL}/api/grounds/`, {
//         headers: token
//           ? {
//               Authorization: `Bearer ${token}`,
//             }
//           : {},
//       })
//       .then((response) => {
//         const allGrounds = [];
//         response.data.owners.forEach((owner) => {
//           owner.grounds.forEach((ground) => {
//             allGrounds.push({
//               ...ground,
//               futsal_name: owner.futsal_name,
//               location: owner.location,
//               owner_username: owner.username,
//             });
//           });
//         });
//         setGrounds(allGrounds);

//         // Initialize currentImages with 0 for each ground
//         const initialIndices = {};
//         allGrounds.forEach((ground) => {
//           initialIndices[ground.id] = 0;
//         });
//         setCurrentImages(initialIndices);
//       })
//       .catch((error) => {
//         console.error("Error fetching grounds:", error);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   // Image URL helper
//   const getFullImageUrl = (imgUrl) => {
//     if (!imgUrl) return "/placeholder.jpg";
//     if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) return imgUrl;
//     if (imgUrl.startsWith("/media")) return BACKEND_URL + imgUrl;
//     return imgUrl;
//   };

//   // Auto-slide images every 3 seconds
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
//     }, 3000); // change every 3 seconds

//     return () => clearInterval(interval);
//   }, [grounds]);

//   if (loading) return <p>Loading...</p>;

//   return (
//     <div className="grounds-container">
//       {grounds.length === 0 ? (
//         <p>No grounds found.</p>
//       ) : (
//         grounds.map((ground, idx) => {
//           const images = ground.images || [];
//           const currentIndex = currentImages[ground.id] || 0;
//           const currentImageUrl = images.length > 0 ? getFullImageUrl(images[currentIndex]) : "/placeholder.jpg";

//           return (
//             <div key={idx} className="ground-card">
//               <h3 className="ground-name">{ground.futsal_name}</h3>

//               <img
//                 src={currentImageUrl}
//                 alt={`${ground.futsal_name} ground`}
//                 className="ground-img"
//                 onError={(e) => {
//                   e.target.onerror = null;
//                   e.target.src = "/placeholder.jpg";
//                 }}
//               />

//               <div className="ground-details">
//                 <p>
//                   <strong>Location:</strong> {ground.location}
//                 </p>
//                 <p>
//                   <strong>Type:</strong> {ground.ground_type}
//                 </p>
//                 <p>
//                   <strong>Price:</strong> Rs. {ground.price}
//                 </p>
//                 <Link to={`/book/${ground.id}`} className="nav-link">
//                   Book
//                 </Link>
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
import axios from "axios";
import { Link } from "react-router-dom";

const BACKEND_URL = "http://127.0.0.1:8000";

const Grounds = () => {
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImages, setCurrentImages] = useState({}); // track current image index per ground

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    axios
      .get(`${BACKEND_URL}/api/grounds/`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .then((response) => {
        const allGrounds = [];
        response.data.owners.forEach((owner) => {
          owner.grounds.forEach((ground) => {
            allGrounds.push({
              ...ground,
              futsal_name: owner.futsal_name,
              location: owner.location,
              owner_username: owner.username,
            });
          });
        });
        setGrounds(allGrounds);

        const initialIndices = {};
        allGrounds.forEach((ground) => {
          initialIndices[ground.id] = 0;
        });
        setCurrentImages(initialIndices);
      })
      .catch((error) => console.error("Error fetching grounds:", error))
      .finally(() => setLoading(false));
  }, []);

  const getFullImageUrl = (imgUrl) => {
    if (!imgUrl) return "/placeholder.jpg";
    if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) return imgUrl;
    if (imgUrl.startsWith("/media")) return BACKEND_URL + imgUrl;
    return imgUrl;
  };

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

  if (loading) return <p>Loading...</p>;

  // Inline styles
  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2rem",
    padding: "2rem",
    width: "100%",
    fontFamily: "Poppins, sans-serif",
  };

  const cardStyle = {
    width: "90%",
    maxWidth: "900px",
    backgroundColor: "#f5f5f5",
    borderRadius: "12px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.2)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  };

  const cardHoverStyle = {
    transform: "translateY(-5px)",
    boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
  };

  const imgStyle = {
    width: "100%",
    height: "250px",
    objectFit: "cover",
    borderBottom: "2px solid #27ae60",
  };

  const nameStyle = {
    textAlign: "center",
    fontSize: "1.7rem",
    fontWeight: "700",
    color: "#27ae60",
    margin: "1rem 0 0.5rem 0",
  };

  const detailsStyle = {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  };

  const linkStyle = {
    display: "inline-block",
    marginTop: "0.8rem",
    backgroundColor: "#27ae60",
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    textDecoration: "none",
    transition: "all 0.3s ease",
  };

  return (
    <div style={containerStyle}>
      {grounds.length === 0 ? (
        <p>No grounds found.</p>
      ) : (
        grounds.map((ground, idx) => {
          const images = ground.images || [];
          const currentIndex = currentImages[ground.id] || 0;
          const currentImageUrl = images.length > 0 ? getFullImageUrl(images[currentIndex]) : "/placeholder.jpg";

          return (
            <div
              key={idx}
              style={cardStyle}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHoverStyle)}
              onMouseLeave={(e) => Object.assign(e.currentTarget.style, cardStyle)}
            >
              <h3 style={nameStyle}>{ground.futsal_name}</h3>

              <img
                src={currentImageUrl}
                alt={`${ground.futsal_name} ground`}
                style={imgStyle}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/placeholder.jpg";
                }}
              />

              <div style={detailsStyle}>
                <p>
                  <strong>Location:</strong> {ground.location}
                </p>
                <p>
                  <strong>Type:</strong> {ground.ground_type}
                </p>
                <p>
                  <strong>Price:</strong> Rs. {ground.price}
                </p>
                <Link to={`/book/${ground.id}`} style={linkStyle}>
                  Book
                </Link>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Grounds;
