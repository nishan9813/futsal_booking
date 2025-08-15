
// import React, { useEffect, useState } from "react";
// import axiosClient from "../authenticated/axiosCredint";
// import "./editground.css";

// const MAX_IMAGES = 6;

// const EditGrounds = () => {
//   const [grounds, setGrounds] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // Fetch owner's grounds
//   useEffect(() => {
//     setLoading(true);
//     axiosClient
//       .get("/api/ownerground/")
//       .then((res) => setGrounds(res.data || []))
//       .catch((err) => {
//         console.error("Error fetching grounds:", err.response?.data || err);
//         alert("Failed to load grounds. See console for details.");
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   // Keep only serializer-writable fields
//   const sanitizeGroundPayload = (g) => ({
//     name: g.name ?? "",
//     ground_type: g.ground_type ?? "",
//     opening_time: g.opening_time ?? "05:00",
//     closing_time: g.closing_time ?? "22:00",
//     use_dynamic_pricing: !!g.use_dynamic_pricing,
//     // If dynamic pricing, price must be null
//     price: g.use_dynamic_pricing ? null : (g.price === "" || g.price == null ? null : Number(g.price)),
//     // We are NOT sending ground_images or pricing_rules here
//   });

//   // ---------- UPDATE ----------
//   const handleUpdate = async (groundId, ground) => {
//     const payload = sanitizeGroundPayload(ground);

//     try {
//       const { data } = await axiosClient.patch(`/api/ownerground/${groundId}/`, payload);
//       // Replace the updated ground from server (ensures server-calculated fields refresh)
//       setGrounds((prev) => prev.map((g) => (g.id === groundId ? data : g)));
//       alert("Ground updated successfully!");
//     } catch (err) {
//       console.error("Error updating ground:", err.response?.data || err);
//       alert("Failed to update ground. Check console for details.");
//     }
//   };

//   // ---------- DELETE ----------
//   const handleDeleteGround = async (groundId) => {
//     if (!window.confirm("Are you sure you want to delete this ground?")) return;

//     // Remove temp card (unsaved)
//     if (groundId.toString().startsWith("temp-")) {
//       setGrounds((prev) => prev.filter((g) => g.id !== groundId));
//       return;
//     }

//     try {
//       await axiosClient.delete(`/api/ownerground/${groundId}/`);
//       setGrounds((prev) => prev.filter((g) => g.id !== groundId));
//       alert("Ground deleted successfully!");
//     } catch (err) {
//       console.error("Error deleting ground:", err.response?.data || err);
//       alert("Failed to delete ground. See console for details.");
//     }
//   };

//   // ---------- ADD NEW CARD ----------
//   const handleAddNewGroundCard = () => {
//     setGrounds((prev) => [
//       ...prev,
//       {
//         id: `temp-${Date.now()}`,
//         name: "",
//         ground_type: "",
//         price: "",
//         use_dynamic_pricing: false,
//         opening_time: "05:00",
//         closing_time: "22:00",
//         ground_images: [], // server images after creation
//         _pending_files: [], // local File[] chosen before creation
//         isNew: true,
//       },
//     ]);
//   };

//   // ---------- CREATE ----------
//   const handleSaveNewGround = async (ground) => {
//     const payload = sanitizeGroundPayload(ground);

//     // Basic client-side checks
//     if (!payload.ground_type.trim()) {
//       alert("Please enter ground type.");
//       return;
//     }
//     if (!payload.name.trim()) {
//       alert("Please enter ground name.");
//       return;
//     }
//     if (!payload.use_dynamic_pricing && (payload.price == null || Number(payload.price) <= 0)) {
//       alert("Please enter a valid price or enable dynamic pricing.");
//       return;
//     }

//     try {
//       // 1) Create ground (no images in this request)
//       const { data: created } = await axiosClient.post("/api/ownerground/", payload);

//       // 2) If user already picked files, upload them now
//       const files = ground._pending_files || [];
//       if (files.length > 0) {
//         const formData = new FormData();
//         for (const f of files) formData.append("image", f);
//         const { data: uploadedImages } = await axiosClient.post(
//           `/api/ground/${created.id}/upload-image/`,
//           formData,
//           { headers: { "Content-Type": "multipart/form-data" } }
//         );
//         created.ground_images = [...(created.ground_images || []), ...uploadedImages];
//       }

//       // Replace temp card with server created ground
//       setGrounds((prev) => prev.map((g) => (g.id === ground.id ? created : g)));
//       alert("New ground added successfully!");
//     } catch (err) {
//       console.error("Error adding ground:", err.response?.data || err);
//       alert("Failed to add new ground. Check console for details.");
//     }
//   };

//   // ---------- IMAGE UPLOAD (existing ground) ----------
//   const handleImageUpload = async (groundId, event) => {
//     const files = Array.from(event.target.files || []);
//     if (files.length === 0) return;

//     // Handle temp (unsaved) ground: stash files locally
//     if (groundId.toString().startsWith("temp-")) {
//       setGrounds((prev) =>
//         prev.map((g) =>
//           g.id === groundId
//             ? {
//                 ...g,
//                 _pending_files: [...(g._pending_files || []), ...files].slice(0, MAX_IMAGES),
//               }
//             : g
//         )
//       );
//       return;
//     }

//     // Existing ground: call upload endpoint
//     try {
//       // Respect 6-image cap
//       const target = grounds.find((g) => g.id === groundId);
//       const currentCount = target?.ground_images?.length || 0;
//       const allowed = Math.max(0, MAX_IMAGES - currentCount);
//       const toSend = files.slice(0, allowed);

//       if (toSend.length === 0) {
//         alert(`Max ${MAX_IMAGES} images allowed per ground.`);
//         return;
//       }

//       const formData = new FormData();
//       for (const f of toSend) formData.append("image", f);

//       const { data } = await axiosClient.post(
//         `/api/ground/${groundId}/upload-image/`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       setGrounds((prev) =>
//         prev.map((g) =>
//           g.id === groundId
//             ? { ...g, ground_images: [...(g.ground_images || []), ...data] }
//             : g
//         )
//       );
//     } catch (err) {
//       console.error("Error uploading images:", err.response?.data || err);
//       alert("Failed to upload image(s). See console for details.");
//     } finally {
//       // Clear the input value so the same file(s) can be re-selected if needed
//       event.target.value = "";
//     }
//   };

//   // ---------- IMAGE DELETE ----------
//   const handleImageDelete = async (groundId, imageId) => {
//     if (!window.confirm("Delete this image?")) return;

//     // Deleting from a temp ground (unsaved): just pop from _pending_files preview
//     if (groundId.toString().startsWith("temp-")) {
//       // temp images exist only in _pending_files, not ground_images (which are server-side)
//       setGrounds((prev) =>
//         prev.map((g) =>
//           g.id === groundId
//             ? {
//                 ...g,
//                 _pending_files: (g._pending_files || []).filter((_, idx) => `temp-${idx}` !== imageId),
//               }
//             : g
//         )
//       );
//       return;
//     }

//     try {
//       await axiosClient.delete(`/api/ground/${groundId}/delete-image/${imageId}/`);
//       setGrounds((prev) =>
//         prev.map((g) =>
//           g.id === groundId
//             ? { ...g, ground_images: (g.ground_images || []).filter((img) => img.id !== imageId) }
//             : g
//         )
//       );
//     } catch (err) {
//       console.error("Error deleting image:", err.response?.data || err);
//       alert("Failed to delete image. See console for details.");
//     }
//   };

//   return (
//     <div className="edit-grounds-container">
//       <h2 className="page-title">Manage Grounds</h2>
//       {loading && <p>Loading...</p>}

//       <section className="grounds-list">
//         {grounds.length === 0 && !loading && <p>No grounds found. Add one below!</p>}

//         {grounds.map((ground) => (
//           <div key={ground.id} className="ground-card">
//             {/* Name */}
//             <div className="form-group">
//               <label>Ground Name</label>
//               <input
//                 type="text"
//                 value={ground.name ?? ""}
//                 onChange={(e) =>
//                   setGrounds((prev) =>
//                     prev.map((g) => (g.id === ground.id ? { ...g, name: e.target.value } : g))
//                   )
//                 }
//                 placeholder="Enter ground name"
//               />
//             </div>

//             {/* Type */}
//             <div className="form-group">
//               <label>Ground Type</label>
//               <input
//                 type="text"
//                 value={ground.ground_type ?? ""}
//                 onChange={(e) =>
//                   setGrounds((prev) =>
//                     prev.map((g) =>
//                       g.id === ground.id ? { ...g, ground_type: e.target.value } : g
//                     )
//                   )
//                 }
//                 placeholder="Enter ground type (e.g., Futsal, Basketball)"
//               />
//             </div>

//             {/* Price */}
//             <div className="form-group">
//               <label>Price (₹)</label>
//               <input
//                 type="number"
//                 value={ground.use_dynamic_pricing ? "" : (ground.price ?? "")}
//                 onChange={(e) =>
//                   setGrounds((prev) =>
//                     prev.map((g) => (g.id === ground.id ? { ...g, price: e.target.value } : g))
//                   )
//                 }
//                 placeholder="Enter price"
//                 disabled={!!ground.use_dynamic_pricing}
//                 min={0}
//               />
//             </div>

//             {/* Dynamic pricing */}
//             <div className="form-group checkbox-group">
//               <input
//                 id={`dynamic-pricing-${ground.id}`}
//                 type="checkbox"
//                 checked={!!ground.use_dynamic_pricing}
//                 onChange={(e) =>
//                   setGrounds((prev) =>
//                     prev.map((g) =>
//                       g.id === ground.id ? { ...g, use_dynamic_pricing: e.target.checked } : g
//                     )
//                   )
//                 }
//               />
//               <label htmlFor={`dynamic-pricing-${ground.id}`}>Use Dynamic Pricing</label>
//             </div>

//             {/* Time */}
//             <div className="form-group time-group">
//               <label>Opening Time</label>
//               <input
//                 type="time"
//                 value={ground.opening_time ?? "05:00"}
//                 onChange={(e) =>
//                   setGrounds((prev) =>
//                     prev.map((g) =>
//                       g.id === ground.id ? { ...g, opening_time: e.target.value } : g
//                     )
//                   )
//                 }
//               />
//               <label>Closing Time</label>
//               <input
//                 type="time"
//                 value={ground.closing_time ?? "22:00"}
//                 onChange={(e) =>
//                   setGrounds((prev) =>
//                     prev.map((g) =>
//                       g.id === ground.id ? { ...g, closing_time: e.target.value } : g
//                     )
//                   )
//                 }
//               />
//             </div>

//             {/* Images */}
//             <div className="images-section">
//               {/* Existing server images */}
//               {(ground.ground_images || []).map((img) => (
//                 <div key={img.id} className="image-box">
//                   <img
//                     src={img.image}
//                     alt="Ground"
//                     className="ground-image-thumb"
//                     draggable={false}
//                   />
//                   <button
//                     className="btn-image-remove"
//                     onClick={() => handleImageDelete(ground.id, img.id)}
//                     title="Remove Image"
//                   >
//                     ×
//                   </button>
//                 </div>
//               ))}

//               {/* Pending local files for temp ground (preview only) */}
//               {ground.id.toString().startsWith("temp-") &&
//                 (ground._pending_files || []).map((file, idx) => (
//                   <div key={`pending-${idx}`} className="image-box">
//                     <img
//                       src={URL.createObjectURL(file)}
//                       alt="Pending"
//                       className="ground-image-thumb"
//                       draggable={false}
//                     />
//                     <button
//                       className="btn-image-remove"
//                       onClick={() =>
//                         setGrounds((prev) =>
//                           prev.map((g) =>
//                             g.id === ground.id
//                               ? {
//                                   ...g,
//                                   _pending_files: g._pending_files.filter((_, i) => i !== idx),
//                                 }
//                               : g
//                           )
//                         )
//                       }
//                       title="Remove Image"
//                     >
//                       ×
//                     </button>
//                   </div>
//                 ))}

//               {/* Upload button (respects MAX_IMAGES) */}
//               {(() => {
//                 const existingCount = ground.ground_images?.length || 0;
//                 const pendingCount = ground.id.toString().startsWith("temp-")
//                   ? (ground._pending_files || []).length
//                   : 0;
//                 const total = existingCount + pendingCount;

//                 return total < MAX_IMAGES ? (
//                   <label className="image-upload-box" title="Add Image">
//                     <input
//                       type="file"
//                       accept="image/*"
//                       multiple
//                       onChange={(e) => handleImageUpload(ground.id, e)}
//                       style={{ display: "none" }}
//                     />
//                     <span className="plus-icon">+</span>
//                   </label>
//                 ) : null;
//               })()}
//             </div>

//             {/* Buttons */}
//             <div className="buttons-row">
//               {ground.isNew ? (
//                 <>
//                   <button
//                     className="btn btn-primary"
//                     onClick={() => handleSaveNewGround(ground)}
//                   >
//                     Add Ground
//                   </button>
//                   <button
//                     className="btn btn-danger"
//                     onClick={() =>
//                       setGrounds((prev) => prev.filter((g) => g.id !== ground.id))
//                     }
//                   >
//                     Remove
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <button
//                     className="btn btn-primary"
//                     onClick={() => handleUpdate(ground.id, ground)}
//                   >
//                     Save Changes
//                   </button>
//                   <button
//                     className="btn btn-danger"
//                     onClick={() => handleDeleteGround(ground.id)}
//                   >
//                     Remove Ground
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         ))}
//       </section>

//       <section className="add-ground-section">
//         <button
//           className="btn btn-primary toggle-add-btn"
//           onClick={handleAddNewGroundCard}
//         >
//           Add New Ground
//         </button>
//       </section>
//     </div>
//   );
// };

// export default EditGrounds;



import React, { useEffect, useState } from "react";
import axiosClient from "../authenticated/axiosCredint";

const MAX_IMAGES = 6;

const EditGrounds = () => {
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Inline CSS styles
  const styles = {
    container: {
      maxWidth: "800px",
      margin: "20px auto",
      padding: "0 15px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "#000000", // changed to black
    },
    pageTitle: {
      textAlign: "center",
      fontSize: "28px",
      fontWeight: 600,
      marginBottom: "20px",
      color: "#000000", // changed to black
    },
    groundCard: {
      backgroundColor: "#f9fafb",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "20px",
      boxShadow: "0px 3px 10px rgba(0,0,0,0.05)",
      transition: "transform 0.2s ease-in-out",
    },
    formGroup: {
      marginBottom: "15px",
    },
  label: {
    display: "block",
    fontWeight: 500,
    marginBottom: "5px",
    color: "#000000", // changed to black
  },
  // 
    input: {
      width: "100%",
      padding: "8px 12px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      fontSize: "14px",
      boxSizing: "border-box",
    },
    checkboxGroup: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    imagesSection: {
      display: "flex",
      flexWrap: "wrap",
      gap: "10px",
      margin: "15px 0",
    },
    imageBox: {
      position: "relative",
      width: "100px",
      height: "100px",
      borderRadius: "8px",
      overflow: "hidden",
      border: "1px solid #d1d5db",
    },
    groundImageThumb: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    btnImageRemove: {
      position: "absolute",
      top: "2px",
      right: "2px",
      backgroundColor: "rgba(239, 68, 68, 0.9)",
      border: "none",
      color: "#fff",
      fontSize: "16px",
      borderRadius: "50%",
      cursor: "pointer",
      width: "22px",
      height: "22px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    imageUploadBox: {
      width: "100px",
      height: "100px",
      border: "2px dashed #93c5fd",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "24px",
      color: "#3b82f6",
    },
    plusIcon: {
      fontSize: "28px",
      fontWeight: "bold",
    },
    buttonsRow: {
      display: "flex",
      gap: "10px",
      marginTop: "15px",
    },
    btn: {
      padding: "8px 16px",
      borderRadius: "8px",
      border: "none",
      fontSize: "14px",
      cursor: "pointer",
      transition: "0.2s",
    },
    btnPrimary: {
      backgroundColor: "#3b82f6",
      color: "#fff",
    },
    btnDanger: {
      backgroundColor: "#ef4444",
      color: "#fff",
    },
    toggleAddBtn: {
      marginBottom: "15px",
      backgroundColor: "#3b82f6",
      color: "#fff",
      borderRadius: "8px",
      padding: "8px 12px",
      cursor: "pointer",
      border: "none",
    },
  };

  // Fetch owner's grounds
  useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/api/ownerground/")
      .then((res) => setGrounds(res.data || []))
      .catch((err) => {
        console.error("Error fetching grounds:", err.response?.data || err);
        alert("Failed to load grounds. See console for details.");
      })
      .finally(() => setLoading(false));
  }, []);

  const sanitizeGroundPayload = (g) => ({
    name: g.name ?? "",
    ground_type: g.ground_type ?? "",
    opening_time: g.opening_time ?? "05:00",
    closing_time: g.closing_time ?? "22:00",
    use_dynamic_pricing: !!g.use_dynamic_pricing,
    price: g.use_dynamic_pricing
      ? null
      : g.price === "" || g.price == null
        ? null
        : Number(g.price),
  });

  const handleUpdate = async (groundId, ground) => {
    const payload = sanitizeGroundPayload(ground);
    try {
      const { data } = await axiosClient.patch(
        `/api/ownerground/${groundId}/`,
        payload
      );
      setGrounds((prev) => prev.map((g) => (g.id === groundId ? data : g)));
      alert("Ground updated successfully!");
    } catch (err) {
      console.error("Error updating ground:", err.response?.data || err);
      alert("Failed to update ground. Check console for details.");
    }
  };

  const handleDeleteGround = async (groundId) => {
    if (!window.confirm("Are you sure you want to delete this ground?")) return;

    if (groundId.toString().startsWith("temp-")) {
      setGrounds((prev) => prev.filter((g) => g.id !== groundId));
      return;
    }

    try {
      await axiosClient.delete(`/api/ownerground/${groundId}/`);
      setGrounds((prev) => prev.filter((g) => g.id !== groundId));
      alert("Ground deleted successfully!");
    } catch (err) {
      console.error("Error deleting ground:", err.response?.data || err);
      alert("Failed to delete ground. See console for details.");
    }
  };

  const handleAddNewGroundCard = () => {
    setGrounds((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: "My Ground", // default name
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

  const handleSaveNewGround = async (ground) => {
    const payload = sanitizeGroundPayload(ground);
    if (!payload.ground_type.trim()) {
      alert("Please enter ground type.");
      return;
    }
    if (!payload.name.trim()) {
      alert("Please enter ground name.");
      return;
    }
    if (!payload.use_dynamic_pricing && (payload.price == null || Number(payload.price) <= 0)) {
      alert("Please enter a valid price or enable dynamic pricing.");
      return;
    }

    try {
      const { data: created } = await axiosClient.post("/api/ownerground/", payload);

      const files = ground._pending_files || [];
      if (files.length > 0) {
        const formData = new FormData();
        for (const f of files) formData.append("image", f);
        const { data: uploadedImages } = await axiosClient.post(
          `/api/ground/${created.id}/upload-image/`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        created.ground_images = [...(created.ground_images || []), ...uploadedImages];
      }

      setGrounds((prev) => prev.map((g) => (g.id === ground.id ? created : g)));
      alert("New ground added successfully!");
    } catch (err) {
      console.error("Error adding ground:", err.response?.data || err);
      alert("Failed to add new ground. Check console for details.");
    }
  };

  const handleImageUpload = async (groundId, event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (groundId.toString().startsWith("temp-")) {
      setGrounds((prev) =>
        prev.map((g) =>
          g.id === groundId
            ? {
              ...g,
              _pending_files: [...(g._pending_files || []), ...files].slice(0, MAX_IMAGES),
            }
            : g
        )
      );
      return;
    }

    try {
      const target = grounds.find((g) => g.id === groundId);
      const currentCount = target?.ground_images?.length || 0;
      const allowed = Math.max(0, MAX_IMAGES - currentCount);
      const toSend = files.slice(0, allowed);

      if (toSend.length === 0) {
        alert(`Max ${MAX_IMAGES} images allowed per ground.`);
        return;
      }

      const formData = new FormData();
      for (const f of toSend) formData.append("image", f);

      const { data } = await axiosClient.post(
        `/api/ground/${groundId}/upload-image/`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setGrounds((prev) =>
        prev.map((g) =>
          g.id === groundId
            ? { ...g, ground_images: [...(g.ground_images || []), ...data] }
            : g
        )
      );
    } catch (err) {
      console.error("Error uploading images:", err.response?.data || err);
      alert("Failed to upload image(s). See console for details.");
    } finally {
      event.target.value = "";
    }
  };

  const handleImageDelete = async (groundId, imageId) => {
    if (!window.confirm("Delete this image?")) return;

    if (groundId.toString().startsWith("temp-")) {
      setGrounds((prev) =>
        prev.map((g) =>
          g.id === groundId
            ? {
              ...g,
              _pending_files: (g._pending_files || []).filter((_, idx) => `temp-${idx}` !== imageId),
            }
            : g
        )
      );
      return;
    }

    try {
      await axiosClient.delete(`/api/ground/${groundId}/delete-image/${imageId}/`);
      setGrounds((prev) =>
        prev.map((g) =>
          g.id === groundId
            ? { ...g, ground_images: (g.ground_images || []).filter((img) => img.id !== imageId) }
            : g
        )
      );
    } catch (err) {
      console.error("Error deleting image:", err.response?.data || err);
      alert("Failed to delete image. See console for details.");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.pageTitle}>Manage Grounds</h2>
      {loading && <p>Loading...</p>}

      <section>
        {grounds.length === 0 && !loading && <p>No grounds found. Add one below!</p>}

        {grounds.map((ground) => (
          <div
            key={ground.id}
            style={{ ...styles.groundCard, ...(ground.hover && { transform: "translateY(-2px)" }) }}
            onMouseEnter={() => (ground.hover = true)}
            onMouseLeave={() => (ground.hover = false)}
          >
            {/* Name */}
            {/* <div style={styles.formGroup}>
              <label style={styles.label}>Ground Name</label>
              <input
                type="text"
                value={ground.name ?? ""}
                onChange={(e) =>
                  setGrounds((prev) =>
                    prev.map((g) => (g.id === ground.id ? { ...g, name: e.target.value } : g))
                  )
                }
                placeholder="Enter ground name"
                style={styles.input}
              />
            </div> */}

            {/* Type */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Ground Type</label>
              <input
                type="text"
                value={ground.ground_type ?? ""}
                onChange={(e) =>
                  setGrounds((prev) =>
                    prev.map((g) => (g.id === ground.id ? { ...g, ground_type: e.target.value } : g))
                  )
                }
                placeholder="Enter ground type (e.g., Futsal, Basketball)"
                style={styles.input}
              />
            </div>

            {/* Price */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Price (₹)</label>
              <input
                type="number"
                value={ground.use_dynamic_pricing ? "" : ground.price ?? ""}
                onChange={(e) =>
                  setGrounds((prev) =>
                    prev.map((g) => (g.id === ground.id ? { ...g, price: e.target.value } : g))
                  )
                }
                placeholder="Enter price"
                disabled={!!ground.use_dynamic_pricing}
                min={0}
                style={styles.input}
              />
            </div>

            {/* Dynamic pricing */}
            <div style={{ ...styles.formGroup, ...styles.checkboxGroup }}>
              <input
                id={`dynamic-pricing-${ground.id}`}
                type="checkbox"
                checked={!!ground.use_dynamic_pricing}
                onChange={(e) =>
                  setGrounds((prev) =>
                    prev.map((g) => (g.id === ground.id ? { ...g, use_dynamic_pricing: e.target.checked } : g))
                  )
                }
              />
              <label htmlFor={`dynamic-pricing-${ground.id}`} style={styles.label}>
                Use Dynamic Pricing
              </label>
            </div>

            {/* Time */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Opening Time</label>
              <input
                type="time"
                value={ground.opening_time ?? "05:00"}
                onChange={(e) =>
                  setGrounds((prev) =>
                    prev.map((g) => (g.id === ground.id ? { ...g, opening_time: e.target.value } : g))
                  )
                }
                style={styles.input}
              />
              <label style={styles.label}>Closing Time</label>
              <input
                type="time"
                value={ground.closing_time ?? "22:00"}
                onChange={(e) =>
                  setGrounds((prev) =>
                    prev.map((g) => (g.id === ground.id ? { ...g, closing_time: e.target.value } : g))
                  )
                }
                style={styles.input}
              />
            </div>

            {/* Images */}
            <div style={styles.imagesSection}>
              {(ground.ground_images || []).map((img) => (
                <div key={img.id} style={styles.imageBox}>
                  <img src={img.image} alt="Ground" style={styles.groundImageThumb} draggable={false} />
                  <button
                    style={styles.btnImageRemove}
                    onClick={() => handleImageDelete(ground.id, img.id)}
                    title="Remove Image"
                  >
                    ×
                  </button>
                </div>
              ))}

              {ground.id.toString().startsWith("temp-") &&
                (ground._pending_files || []).map((file, idx) => (
                  <div key={`pending-${idx}`} style={styles.imageBox}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Pending"
                      style={styles.groundImageThumb}
                      draggable={false}
                    />
                    <button
                      style={styles.btnImageRemove}
                      onClick={() =>
                        setGrounds((prev) =>
                          prev.map((g) =>
                            g.id === ground.id
                              ? {
                                ...g,
                                _pending_files: g._pending_files.filter((_, i) => i !== idx),
                              }
                              : g
                          )
                        )
                      }
                      title="Remove Image"
                    >
                      ×
                    </button>
                  </div>
                ))}

              {(() => {
                const existingCount = ground.ground_images?.length || 0;
                const pendingCount = ground.id.toString().startsWith("temp-")
                  ? (ground._pending_files || []).length
                  : 0;
                const total = existingCount + pendingCount;

                return total < MAX_IMAGES ? (
                  <label style={styles.imageUploadBox} title="Add Image">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleImageUpload(ground.id, e)}
                      style={{ display: "none" }}
                    />
                    <span style={styles.plusIcon}>+</span>
                  </label>
                ) : null;
              })()}
            </div>

            {/* Buttons */}
            <div style={styles.buttonsRow}>
              {ground.isNew ? (
                <>
                  <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={() => handleSaveNewGround(ground)}>
                    Add Ground
                  </button>
                  <button
                    style={{ ...styles.btn, ...styles.btnDanger }}
                    onClick={() => setGrounds((prev) => prev.filter((g) => g.id !== ground.id))}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  <button
                    style={{ ...styles.btn, ...styles.btnPrimary }}
                    onClick={() => handleUpdate(ground.id, ground)}
                  >
                    Save Changes
                  </button>
                  <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={() => handleDeleteGround(ground.id)}>
                    Remove Ground
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </section>

      <section>
        <button style={styles.toggleAddBtn} onClick={handleAddNewGroundCard}>
          Add New Ground
        </button>
      </section>
    </div>
  );
};

export default EditGrounds;
