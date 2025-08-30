import axiosClient from "../authenticated/axiosCredint";

/**
 * Fetch distances from user location to grounds
 * @param {number|null} groundId - optional, fetch distance for a specific ground
 * @param {number} userLat - user's latitude
 * @param {number} userLng - user's longitude
 * @returns {Promise<Array|number|null>} - returns an array of grounds with distances or distance of single ground
 */
export const fetchDistance = async (groundId = null, userLat, userLng) => {
  try {
    const payload = { latitude: userLat, longitude: userLng };
    if (groundId) payload.ground_id = groundId;

    const response = await axiosClient.post("/api/distance/", payload);

    if (groundId) {
      return response.data.length > 0 ? response.data[0].distance_meters : null;
    }

    return response.data; // array of grounds with distances
  } catch (error) {
    console.error("Error fetching distances:", error);
    return null;
  }
};
