/**
 * Compare two values in descending order
 * @param {any} a First value
 * @param {any} b Second value
 * @param {string} orderBy Property to sort by
 * @returns {number} Comparison result (-1, 0, or 1)
 */
export function descendingComparator(a, b, orderBy) {
  const valA = a[orderBy] ?? ''; // Handle potential undefined values
  const valB = b[orderBy] ?? '';
  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;
}

/**
 * Get sort comparator function based on order direction and property
 * @param {string} order Sort direction ('asc' or 'desc')
 * @param {string} orderBy Property to sort by
 * @returns {Function} Comparator function for sorting
 */
export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

/**
 * Sort toppings by recent status and within recent groups by index
 * @param {Array} toppings Array of topping objects
 * @param {Array} recentToppings Array of recent topping names
 * @returns {Array} Sorted toppings array
 */
export function sortByRecent(toppings, recentToppings) {
  return [...toppings].sort((a, b) => {
    const aIsRecent = recentToppings.includes(a.name);
    const bIsRecent = recentToppings.includes(b.name);
    if (aIsRecent && !bIsRecent) return -1;
    if (!aIsRecent && bIsRecent) return 1;
    if (aIsRecent && bIsRecent) {
      return recentToppings.indexOf(a.name) - recentToppings.indexOf(b.name);
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * Sort toppings by usage count
 * @param {Array} toppings Array of topping objects
 * @returns {Array} Sorted toppings array
 */
export function sortByUsage(toppings) {
  return [...toppings].sort((a, b) => b.usage - a.usage || a.name.localeCompare(b.name));
}

/**
 * Sort toppings alphabetically
 * @param {Array} toppings Array of topping objects
 * @param {boolean} ascending Sort direction
 * @returns {Array} Sorted toppings array
 */
export function sortAlphabetically(toppings, ascending = true) {
  return [...toppings].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return ascending ? comparison : -comparison;
  });
}

/**
 * Filter toppings by search text
 * @param {Array} toppings Array of topping objects
 * @param {string} searchText Text to filter by
 * @returns {Array} Filtered toppings array
 */
export function filterToppings(toppings, searchText) {
  if (!searchText) return toppings;
  const lowerFilter = searchText.toLowerCase();
  return toppings.filter(t => t.name.toLowerCase().includes(lowerFilter));
}

/**
 * Check if a topping name already exists (case-insensitive)
 * @param {string} name Topping name to check
 * @param {Array} existingToppings Array of existing topping names
 * @returns {boolean} True if topping exists
 */
export function toppingExists(name, existingToppings) {
  const trimmedLower = name.toLowerCase().trim();
  return existingToppings.some(t => t.toLowerCase().trim() === trimmedLower);
}
