import axiosClient from "../authenticated/axiosCredint"; // ✅ ADD THIS

export const fetchAllDistances = async (userLat, userLng) => {
  try {
    const response = await axiosClient.post('/api/distance/', {
      latitude: userLat,
      longitude: userLng
    });
    console.log("Distances API response:", response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching distances:', error);
    return [];
  }
};

export const getDistanceForGround = (groundId, allDistances) => {
  if (!allDistances || !Array.isArray(allDistances)) {
    return null;
  }
  const distanceObj = allDistances.find(d => d.id === groundId);
  return distanceObj ? distanceObj.distance_meters : null;
};