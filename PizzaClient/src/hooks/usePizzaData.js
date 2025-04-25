import { useState, useCallback } from 'react';

const API_URL = '/api/pizzas';
const headers = {
  'Content-Type': 'application/json',
};

export function usePizzaData() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Fetches all pizzas from the API.
  const fetchPizzas = useCallback(() => {
    setLoading(true);
    setError(null);
    
    return fetch(API_URL)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setData(data);
        setLoading(false);
        return data;
      })
      .catch(error => {
        console.error("Fetch error:", error);
        setError(error);
        setLoading(false);
        showNotification(`Failed to load pizza data: ${error.message}`, 'error');
        return [];
      });
  }, []);

  // Creates a new pizza via the API.
  const createPizza = useCallback((pizza) => {
    setLoading(true);
    setError(null);
    
    return fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: pizza.name,
        description: pizza.description,
        baseId: parseInt(pizza.baseId) || 1,
        toppings: pizza.toppings || []
      }),
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to create pizza');
        return response.json();
      })
      .then(newPizza => {
        setData(prevData => [...prevData, newPizza]);
        setLoading(false);
        showNotification(`${newPizza.name} added successfully`, 'success');
        return newPizza;
      })
      .catch(error => {
        console.error("Create error:", error);
        setError(error);
        setLoading(false);
        showNotification(`Failed to add pizza: ${error.message}`, 'error');
        return null;
      });
  }, []);

  // Updates an existing pizza via the API.
  const updatePizza = useCallback((updatedPizza) => {
    setLoading(true);
    setError(null);
    
    return fetch(`${API_URL}/${updatedPizza.id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(updatedPizza),
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to update pizza');
        return response.json();
      })
      .then(returnedPizza => {
        setData(prevData => 
          prevData.map(item => 
            item.id === returnedPizza.id ? returnedPizza : item
          )
        );
        setLoading(false);
        showNotification(`${returnedPizza.name} updated successfully`, 'success');
        return returnedPizza;
      })
      .catch(error => {
        console.error("Update error:", error);
        setError(error);
        setLoading(false);
        showNotification(`Failed to update pizza: ${error.message}`, 'error');
        return null;
      });
  }, []);

  // Deletes a pizza by its ID via the API.
  const deletePizza = useCallback((id) => {
    setLoading(true);
    setError(null);
    
    return fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers,
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to delete pizza');
        return response.text(); // DELETE might not return JSON
      })
      .then(() => {
        setData(prevData => prevData.filter(item => item.id !== id));
        setLoading(false);
        showNotification('Pizza deleted successfully', 'success');
        return true;
      })
      .catch(error => {
        console.error("Delete error:", error);
        setError(error);
        setLoading(false);
        showNotification(`Failed to delete pizza: ${error.message}`, 'error');
        return false;
      });
  }, []);

  return {
    pizzas: data,
    loading,
    error,
    notification,
    fetchPizzas,
    createPizza,
    updatePizza,
    deletePizza,
    closeNotification,
  };
}
