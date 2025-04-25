import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';

const ThemeModeContext = createContext({
  mode: 'light',
  toggleMode: () => {},
});

export function ThemeModeProvider({ children }) {
  // Get the initial mode from localStorage or default to 'light'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('theme-mode');
    return savedMode || 'light';
  });
  
  // Toggle between light and dark modes
  const toggleMode = () => {
    setMode((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme-mode', newMode);
      return newMode;
    });
  };

  // Update localStorage when mode changes
  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  // Set data-theme attribute on <html> for CSS variable theming
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const value = useMemo(() => ({ mode, toggleMode }), [mode]);
  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeModeContext);
}
