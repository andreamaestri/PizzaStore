const API_URL = "/api/orders";
const headers = {
	"Content-Type": "application/json",
};

/**
 * Fetches all orders from the API.
 * @returns {Promise<Array>} A promise that resolves to an array of order objects.
 * @throws {Error} If the network response is not ok.
 */
const fetchOrders = async () => {
	const response = await fetch(API_URL);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return await response.json();
};

/**
 * Fetches a single order by its ID from the API.
 * @param {number|string} id The ID of the order to fetch.
 * @returns {Promise<Object>} A promise that resolves to the order object.
 * @throws {Error} If the network response is not ok.
 */
const fetchOrderById = async (id) => {
	const response = await fetch(`${API_URL}/${id}`);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	return await response.json();
};

/**
 * Creates a new order via the API.
 * @param {Object} orderData The data for the new order.
 * @returns {Promise<Object>} A promise that resolves to the newly created order object.
 * @throws {Error} If the network response is not ok.
 */
const createOrder = async (orderData) => {
	const response = await fetch(API_URL, {
		method: "POST",
		headers,
		body: JSON.stringify(orderData),
	});

	if (!response.ok) {
		throw new Error(`Failed to create order (Status: ${response.status})`);
	}

	return await response.json();
};

/**
 * Updates the status of a specific order via the API.
 * @param {number|string} id The ID of the order to update.
 * @param {string} newStatus The new status string.
 * @returns {Promise<Object>} A promise that resolves to the updated order object.
 * @throws {Error} If the network response is not ok.
 */
const updateOrderStatus = async (id, newStatus) => {
	const response = await fetch(`${API_URL}/${id}/status`, {
		method: "PUT",
		headers,
		body: JSON.stringify(newStatus),
	});

	if (!response.ok) {
		throw new Error(
			`Failed to update order status (Status: ${response.status})`,
		);
	}

	return await response.json();
};

/**
 * Cancels an order via the API (using DELETE method).
 * @param {number|string} id The ID of the order to cancel.
 * @returns {Promise<boolean>} A promise that resolves to true if cancellation was successful (status ok).
 * @throws {Error} If the network response is not ok.
 */
const cancelOrder = async (id) => {
	const response = await fetch(`${API_URL}/${id}`, {
		method: "DELETE",
		headers,
	});

	if (!response.ok) {
		throw new Error(`Failed to cancel order (Status: ${response.status})`);
	}

	return true;
};

const orderService = {
	fetchOrders,
	fetchOrderById,
	createOrder,
	updateOrderStatus,
	cancelOrder,
};

export default orderService;
