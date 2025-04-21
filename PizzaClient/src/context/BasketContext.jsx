import React, { createContext, useContext, useReducer } from 'react';

const BasketContext = createContext();

const initialState = {
  items: [] // { pizza, quantity }
};

function basketReducer(state, action) {
  switch (action.type) {
    case 'ADD_TO_BASKET': {
      const idx = state.items.findIndex(i => i.pizza.id === action.pizza.id);
      if (idx !== -1) {
        // Increase quantity
        const items = [...state.items];
        items[idx].quantity += action.quantity;
        return { ...state, items };
      }
      return { ...state, items: [...state.items, { pizza: action.pizza, quantity: action.quantity }] };
    }
    case 'REMOVE_FROM_BASKET':
      return { ...state, items: state.items.filter(i => i.pizza.id !== action.pizzaId) };
    case 'UPDATE_QUANTITY': {
      const items = state.items.map(i =>
        i.pizza.id === action.pizzaId ? { ...i, quantity: action.quantity } : i
      );
      return { ...state, items };
    }
    case 'CLEAR_BASKET':
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function BasketProvider({ children }) {
  const [state, dispatch] = useReducer(basketReducer, initialState);
  const addToBasket = (pizza, quantity = 1) => dispatch({ type: 'ADD_TO_BASKET', pizza, quantity });
  const removeFromBasket = (pizzaId) => dispatch({ type: 'REMOVE_FROM_BASKET', pizzaId });
  const updateQuantity = (pizzaId, quantity) => dispatch({ type: 'UPDATE_QUANTITY', pizzaId, quantity });
  const clearBasket = () => dispatch({ type: 'CLEAR_BASKET' });
  return (
    <BasketContext.Provider value={{ items: state.items, addToBasket, removeFromBasket, updateQuantity, clearBasket }}>
      {children}
    </BasketContext.Provider>
  );
}

export function useBasket() {
  return useContext(BasketContext);
}

export default BasketProvider;
