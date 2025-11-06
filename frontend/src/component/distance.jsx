// frontend/src/services/distanceService.jsx
import axiosClient from "../authenticated/axiosCredint";

/**
 * Fetch distances for all grounds from backend
 * @param {number} userLat - User's latitude
 * @param {number} userLng - User's longitude
 * @returns {Promise<Object[]>} - Array of grounds with {id, distance_meters}
 */
export const fetchAllDistances = async (userLat, userLng) => {
  try {
    const payload = { latitude: userLat, longitude: userLng };
    const response = await axiosClient.post("/api/distance/", payload);
    // response.data should be an array of {id, distance_meters}
    return response.data || [];
  } catch (error) {
    console.error("Error fetching distances:", error);
    return [];
  }
};

/**
 * Helper: get distance for a specific ground
 * @param {number} groundId 
 * @param {Object[]} allDistances 
 * @returns {number} distance in meters
 */
export const getDistanceForGround = (groundId, allDistances) => {
  const groundData = allDistances.find((g) => g.id === groundId);
  return groundData?.distance_meters || 0;
};
