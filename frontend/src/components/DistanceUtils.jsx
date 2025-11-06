// Distance-related utilities and algorithms

/**
 * Format distance for display
 * Converts meters to kilometers with proper formatting
 */
export const formatDistance = (distanceMeters) => {
  if (distanceMeters === null || distanceMeters === undefined) {
    return null;
  }
  
  if (distanceMeters < 1000) {
    return `${distanceMeters} m`; // Show meters if less than 1km
  }
  
  return `${(distanceMeters / 1000).toFixed(1)} km`;
};

/**
 * Get distance badge color based on distance
 * Algorithm for dynamic UI based on distance values
 */
export const getDistanceBadgeColor = (distanceMeters) => {
  if (!distanceMeters) return 'gray';
  
  const distanceKm = distanceMeters / 1000;
  
  if (distanceKm < 2) return 'green';    // Very close
  if (distanceKm < 5) return 'blue';     // Close
  if (distanceKm < 10) return 'orange';  // Moderate
  return 'red';                          // Far
};

/**
 * Sort by distance algorithm (separate for potential optimization)
 */
export const sortByDistance = (grounds) => {
  return grounds.sort((a, b) => 
    (a.distance || Infinity) - (b.distance || Infinity)
  );
};