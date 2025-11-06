// Search and Sort Algorithms Implementation

export const filterGrounds = (grounds, searchQuery) => {
  if (!searchQuery.trim()) return grounds;

  const query = searchQuery.toLowerCase();
  return grounds.filter(ground =>
    ground.futsal_name?.toLowerCase().includes(query) ||
    ground.address?.toLowerCase().includes(query) ||
    ground.city?.toLowerCase().includes(query)
  );
};

/**
 * Price Range Filter Algorithm
 * Time Complexity: O(n)
 */
export const filterByPriceRange = (grounds, priceRange) => {
  return grounds.filter(ground => 
    ground.price >= priceRange[0] && ground.price <= priceRange[1]
  );
};

/**
 * TimSort-based Sorting Algorithm (using JavaScript's built-in sort)
 * Time Complexity: O(n log n)
 */
export const sortGrounds = (grounds, sortBy) => {
  const sortedGrounds = [...grounds];
  
  switch (sortBy) {
    case "distance":
      // Sort by distance (nearest first), handle null distances
      return sortedGrounds.sort((a, b) => 
        (a.distance || Infinity) - (b.distance || Infinity)
      );
    
    case "price-low":
      // Sort by price (low to high)
      return sortedGrounds.sort((a, b) => a.price - b.price);
    
    case "price-high":
      // Sort by price (high to low)
      return sortedGrounds.sort((a, b) => b.price - a.price);
    
    case "name":
      // Sort by name (A-Z)
      return sortedGrounds.sort((a, b) => 
        a.futsal_name?.localeCompare(b.futsal_name || '')
      );
    
    default:
      return sortedGrounds;
  }
};

/**
 * Combined Filter and Sort Algorithm
 * Applies all filters and sorting in optimal order
 */
export const applyFiltersAndSorting = (grounds, filters) => {
  const { searchQuery, priceRange, sortBy } = filters;
  
  let result = [...grounds];
  
  // Apply search filter first (reduces dataset for subsequent operations)
  if (searchQuery) {
    result = filterGrounds(result, searchQuery);
  }
  
  // Apply price range filter
  if (priceRange && priceRange[1] < 5000) { // Only if not default max
    result = filterByPriceRange(result, priceRange);
  }
  
  // Apply sorting last (most expensive operation)
  if (sortBy && sortBy !== 'distance') {
    result = sortGrounds(result, sortBy);
  }
  
  return result;
};

/**
 * Get filtered results count for display
 */
export const getFilteredResultsCount = (grounds, filters) => {
  const filteredGrounds = applyFiltersAndSorting(grounds, filters);
  return filteredGrounds.length;
};