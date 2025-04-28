import { API_URL } from "../../constants/toppingConstants";

// --- Pizza API Functions (used by topping operations) ---

/**
 * Fetches all pizzas from the API.
 * @returns {Promise<Array>} A promise that resolves to an array of pizza objects.
 * @throws {Error} If the network response is not ok.
 */
const fetchPizzas = async () => {
	const response = await fetch(API_URL);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return await response.json();
};

/**
 * Updates a specific pizza by its ID via the API.
 * @param {number|string} id The ID of the pizza to update.
 * @param {Object} updatedPizza The updated pizza data.
 * @returns {Promise<Object>} A promise that resolves to the updated pizza object.
 * @throws {Error} If the network response is not ok.
 */
const updatePizza = async (id, updatedPizza) => {
	const response = await fetch(`${API_URL}/${id}`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(updatedPizza),
	});
	if (!response.ok) {
		throw new Error(`Failed to update pizza ${id}`);
	}
	return await response.json();
};

// --- Topping-Specific Operations ---
// Note: These operations fetch all pizzas and update relevant ones individually.

/**
 * Updates a topping name across all pizzas that use it.
 * Fetches all pizzas, finds those containing the old topping, and updates them.
 * @param {string} oldTopping The current name of the topping.
 * @param {string} newTopping The new name for the topping.
 * @returns {Promise<boolean>} A promise that resolves to true if successful.
 * @throws {Error} If fetching pizzas or updating any pizza fails.
 */
const updateToppingInPizzas = async (oldTopping, newTopping) => {
	try {
		const pizzasData = await fetchPizzas();
		const pizzasToUpdate = pizzasData.filter((pizza) =>
			pizza.toppings?.includes(oldTopping),
		);

		// Update all affected pizzas in parallel for better performance.
		await Promise.all(
			pizzasToUpdate.map((pizza) => {
				const updatedToppings = pizza.toppings.map((t) =>
					t === oldTopping ? newTopping : t,
				);
				return updatePizza(pizza.id, { ...pizza, toppings: updatedToppings });
			}),
		);

		return true;
	} catch (error) {
		console.error("Error updating topping:", error);
		throw new Error(`Failed to update topping: ${error.message}`);
	}
};

/**
 * Removes a specific topping from all pizzas that use it.
 * Fetches all pizzas, finds those containing the topping, and updates them.
 * @param {string} toppingToRemove The name of the topping to remove.
 * @returns {Promise<boolean>} A promise that resolves to true if successful.
 * @throws {Error} If fetching pizzas or updating any pizza fails.
 */
const removeToppingFromPizzas = async (toppingToRemove) => {
	try {
		const pizzasData = await fetchPizzas();
		const pizzasToUpdate = pizzasData.filter((pizza) =>
			pizza.toppings?.includes(toppingToRemove),
		);

		// Update all affected pizzas in parallel.
		await Promise.all(
			pizzasToUpdate.map((pizza) => {
				const updatedToppings = pizza.toppings.filter(
					(t) => t !== toppingToRemove,
				);
				return updatePizza(pizza.id, { ...pizza, toppings: updatedToppings });
			}),
		);

		return true;
	} catch (error) {
		console.error("Error removing topping:", error);
		throw new Error(`Failed to remove topping: ${error.message}`);
	}
};

/**
 * Removes multiple toppings from all pizzas that use any of them.
 * Fetches all pizzas, finds those containing any of the specified toppings, and updates them.
 * @param {Array<string>} toppingsToRemove An array of topping names to remove.
 * @returns {Promise<boolean>} A promise that resolves to true if successful.
 * @throws {Error} If fetching pizzas or updating any pizza fails.
 */
const removeMultipleToppingsFromPizzas = async (toppingsToRemove) => {
	try {
		const pizzasData = await fetchPizzas();
		const toppingSet = new Set(toppingsToRemove);
		const pizzasToUpdate = pizzasData.filter((pizza) =>
			pizza.toppings?.some((t) => toppingSet.has(t)),
		);

		// Update all affected pizzas in parallel.
		await Promise.all(
			pizzasToUpdate.map((pizza) => {
				const updatedToppings = pizza.toppings.filter(
					(t) => !toppingSet.has(t),
				);
				return updatePizza(pizza.id, { ...pizza, toppings: updatedToppings });
			}),
		);

		return true;
	} catch (error) {
		console.error("Error removing multiple toppings:", error);
		throw new Error(`Failed to remove toppings: ${error.message}`);
	}
};

// --- Service Export ---
const toppingService = {
	fetchPizzas,
	updateToppingInPizzas,
	removeToppingFromPizzas,
	removeMultipleToppingsFromPizzas,
};

export default toppingService;
