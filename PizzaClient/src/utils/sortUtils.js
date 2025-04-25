/**
 * Utility functions for sorting and filtering arrays, primarily used for toppings.
 */

/**
 * Generic descending comparator for two objects based on a property.
 * Handles potentially undefined values by treating them as empty strings.
 * @param {Object} a First object.
 * @param {Object} b Second object.
 * @param {string} orderBy Property key to compare.
 * @returns {number} Comparison result (-1, 0, or 1).
 */
export function descendingComparator(a, b, orderBy) {
  const valA = a[orderBy] ?? ''; // Use nullish coalescing for safety.
  const valB = b[orderBy] ?? '';
  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;
}

/**
/**
 * Returns a comparator function suitable for Array.prototype.sort().
 * @param {'asc' | 'desc'} order The desired sort direction.
 * @param {string} orderBy The property key to sort by.
 * @returns {(a: Object, b: Object) => number} A comparator function.
 */
export function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

/**
/**
 * Sorts toppings, prioritizing those marked as 'recent'.
 * Recent toppings are sorted by their order in the `recentToppings` array.
 * Non-recent toppings are sorted alphabetically.
 * @param {Array<Object>} toppings Array of topping objects (must have a 'name' property).
 * @param {Array<string>} recentToppings Array of topping names considered recent.
 * @returns {Array<Object>} A new sorted array of topping objects.
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
/**
 * Sorts toppings primarily by usage count (descending), with alphabetical secondary sort.
 * @param {Array<Object>} toppings Array of topping objects (must have 'usage' and 'name' properties).
 * @returns {Array<Object>} A new sorted array of topping objects.
 */
export function sortByUsage(toppings) {
  return [...toppings].sort((a, b) => b.usage - a.usage || a.name.localeCompare(b.name));
}

/**
/**
 * Sorts toppings alphabetically by name.
 * @param {Array<Object>} toppings Array of topping objects (must have a 'name' property).
 * @param {boolean} [ascending=true] If true, sorts A-Z; otherwise Z-A.
 * @returns {Array<Object>} A new sorted array of topping objects.
 */
export function sortAlphabetically(toppings, ascending = true) {
  return [...toppings].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return ascending ? comparison : -comparison;
  });
}

/**
/**
 * Filters toppings based on whether their name includes the search text (case-insensitive).
 * @param {Array<Object>} toppings Array of topping objects (must have a 'name' property).
 * @param {string} searchText The text to filter by.
 * @returns {Array<Object>} A new filtered array of topping objects.
 */
export function filterToppings(toppings, searchText) {
  if (!searchText) return toppings;
  const lowerFilter = searchText.toLowerCase();
  return toppings.filter(t => t.name.toLowerCase().includes(lowerFilter));
}

/**
/**
 * Checks if a topping name already exists in a list of existing toppings (case-insensitive, trims whitespace).
 * @param {string} name The topping name to check.
 * @param {Array<string>} existingToppings An array of existing topping names.
 * @returns {boolean} True if the name exists in the list, false otherwise.
 */
export function toppingExists(name, existingToppings) {
  const trimmedLower = name.toLowerCase().trim();
  return existingToppings.some(t => t.toLowerCase().trim() === trimmedLower);
}
