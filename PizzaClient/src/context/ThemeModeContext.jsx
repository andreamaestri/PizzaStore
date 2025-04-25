// filepath: c:\Users\andre\source\repos\PizzaStore\PizzaClient\src\context\ThemeModeContext.jsx
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const ThemeModeContext = createContext({
  mode: 'light',
  toggleMode: () => {},
});

export function ThemeModeProvider({ children }) {
  // Get the initial mode from localStorage or default to 'light'
  const [mode, setMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem('theme-mode');
      return savedMode || 'light';
    } catch (e) {
      // In case localStorage is not available
      return 'light';
    }
  });
  
  // Apply data-theme attribute to html element when mode changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);
  
  // Toggle between light and dark modes
  const toggleMode = () => {
    setMode((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('theme-mode', newMode);
      } catch (e) {
        // Ignore errors if localStorage is not available
      }
      return newMode;
    });
  };

  // Value to be provided to consumers
  const value = useMemo(() => ({ mode, toggleMode }), [mode]);
  
  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

// Custom hook to use the theme mode context
export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (context === undefined) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
}
