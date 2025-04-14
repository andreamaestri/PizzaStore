import { API_URL } from '../../constants/toppingConstants';

// Main API functions
const fetchPizzas = async () => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

const updatePizza = async (id, updatedPizza) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedPizza),
  });
  if (!response.ok) {
    throw new Error(`Failed to update pizza ${id}`);
  }
  return await response.json();
};

// Topping-specific operations
const updateToppingInPizzas = async (oldTopping, newTopping) => {
  try {
    const pizzasData = await fetchPizzas();
    const pizzasToUpdate = pizzasData.filter(
      pizza => pizza.toppings?.includes(oldTopping)
    );
    
    // Update all pizzas in parallel for better performance
    await Promise.all(pizzasToUpdate.map(pizza => {
      const updatedToppings = pizza.toppings.map(t => 
        t === oldTopping ? newTopping : t
      );
      return updatePizza(pizza.id, { ...pizza, toppings: updatedToppings });
    }));

    return true;
  } catch (error) {
    console.error('Error updating topping:', error);
    throw new Error(`Failed to update topping: ${error.message}`);
  }
};

const removeToppingFromPizzas = async (toppingToRemove) => {
  try {
    const pizzasData = await fetchPizzas();
    const pizzasToUpdate = pizzasData.filter(
      pizza => pizza.toppings?.includes(toppingToRemove)
    );
    
    // Update all pizzas in parallel
    await Promise.all(pizzasToUpdate.map(pizza => {
      const updatedToppings = pizza.toppings.filter(t => t !== toppingToRemove);
      return updatePizza(pizza.id, { ...pizza, toppings: updatedToppings });
    }));

    return true;
  } catch (error) {
    console.error('Error removing topping:', error);
    throw new Error(`Failed to remove topping: ${error.message}`);
  }
};

const removeMultipleToppingsFromPizzas = async (toppingsToRemove) => {
  try {
    const pizzasData = await fetchPizzas();
    const toppingSet = new Set(toppingsToRemove);
    const pizzasToUpdate = pizzasData.filter(
      pizza => pizza.toppings?.some(t => toppingSet.has(t))
    );
    
    // Update all pizzas in parallel
    await Promise.all(pizzasToUpdate.map(pizza => {
      const updatedToppings = pizza.toppings.filter(t => !toppingSet.has(t));
      return updatePizza(pizza.id, { ...pizza, toppings: updatedToppings });
    }));

    return true;
  } catch (error) {
    console.error('Error removing multiple toppings:', error);
    throw new Error(`Failed to remove toppings: ${error.message}`);
  }
};

// Export the service
const toppingService = {
  fetchPizzas,
  updateToppingInPizzas,
  removeToppingFromPizzas,
  removeMultipleToppingsFromPizzas
};

export default toppingService;
