import { useEffect, useState } from "react";
import axiosClient from "../../authenticated/axiosCredint";

const MAX_IMAGES = 6;

export const useGrounds = () => {
  const [grounds, setGrounds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch owner's grounds
  useEffect(() => {
    setLoading(true);
    axiosClient
      .get("/api/owner-grounds/")
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
      const { data } = await axiosClient.patch(`/api/owner-grounds/${groundId}/`, payload);
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
      await axiosClient.delete(`/api/owner-grounds/${groundId}/`);
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
        name: "My Ground",
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
      const { data: created } = await axiosClient.post("/api/owner-ground/", payload);

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
        prev.map((g) => (g.id === groundId ? { ...g, ground_images: [...(g.ground_images || []), ...data] } : g))
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
          g.id === groundId ? { ...g, ground_images: (g.ground_images || []).filter((img) => img.id !== imageId) } : g
        )
      );
    } catch (err) {
      console.error("Error deleting image:", err.response?.data || err);
      alert("Failed to delete image. See console for details.");
    }
  };

  return {
    grounds,
    setGrounds,
    loading,
    handleUpdate,
    handleDeleteGround,
    handleAddNewGroundCard,
    handleSaveNewGround,
    handleImageUpload,
    handleImageDelete,
  };
};
