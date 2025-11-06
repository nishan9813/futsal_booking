// Image-related utilities and algorithms

/**
 * Circular Buffer Algorithm for image rotation
 * Implements circular indexing for carousel functionality
 * Time Complexity: O(1) for rotation
 */
export const initializeImageIndices = (grounds) => {
  const initialIndices = {};
  grounds.forEach((ground) => {
    initialIndices[ground.id] = 0;
  });
  return initialIndices;
};

/**
 * Rotate images using circular indexing algorithm
 * Implements: nextIndex = (current + 1) % arrayLength
 */
export const rotateAllImages = (currentIndices, grounds) => {
  const updated = { ...currentIndices };
  
  grounds.forEach((ground) => {
    if (ground.images && ground.images.length > 0) {
      // Circular buffer algorithm: wraps around when reaching end
      updated[ground.id] = (currentIndices[ground.id] + 1) % ground.images.length;
    }
  });
  
  return updated;
};

/**
 * Get full image URL with fallback
 */
export const getFullImageUrl = (imgUrl, axiosClient) => {
  if (!imgUrl) return "/placeholder.jpg";
  if (imgUrl.startsWith("http://") || imgUrl.startsWith("https://")) return imgUrl;
  if (imgUrl.startsWith("/media")) return axiosClient.defaults.baseURL + imgUrl;
  return imgUrl;
};

/**
 * Get current image for a ground
 */
export const getCurrentImage = (ground, currentImages, axiosClient) => {
  const images = ground.images || [];
  const currentIndex = currentImages[ground.id] || 0;
  const currentImageUrl = images.length > 0 
    ? getFullImageUrl(images[currentIndex], axiosClient) 
    : "/placeholder.jpg";
  
  return {
    url: currentImageUrl,
    index: currentIndex,
    total: images.length
  };
};