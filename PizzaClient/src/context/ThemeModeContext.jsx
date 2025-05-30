import React, {
	createContext,
	useContext,
	useMemo,
	useState,
	useEffect,
	useCallback,
} from "react";

const ThemeModeContext = createContext({
	mode: "light",
	toggleMode: () => {},
});

export function ThemeModeProvider({ children }) {
	// State for the current theme mode ('light' or 'dark').
	// Initializes from localStorage if available, otherwise defaults to 'light'.
	const [mode, setMode] = useState(() => {
		try {
			const savedMode = localStorage.getItem("theme-mode");
			return savedMode || "light";
		} catch {
			// Fallback to 'light' if localStorage access fails (e.g., private browsing).
			return "light";
		}
	});

	// Effect to update the 'data-theme' attribute on the root HTML element whenever the mode changes.
	// This allows CSS variables or selectors to adapt to the current theme.
	useEffect(() => {
		document.documentElement.setAttribute("data-theme", mode);
	}, [mode]);

	// Callback function to toggle the theme mode between 'light' and 'dark'.
	// It also persists the new mode preference to localStorage.
	const toggleMode = useCallback(() => {
		setMode((prev) => {
			const newMode = prev === "light" ? "dark" : "light";
			try {
				localStorage.setItem("theme-mode", newMode);
			} catch {
				// Ignore potential errors during localStorage access.
			}
			return newMode;
		});
	}, []);

	// Memoize the context value object to optimize performance.
	const value = useMemo(() => ({ mode, toggleMode }), [mode, toggleMode]);

	return (
		<ThemeModeContext.Provider value={value}>
			{children}
		</ThemeModeContext.Provider>
	);
}

// Custom hook to simplify consuming the ThemeModeContext.
// Includes a check to ensure it's used within a ThemeModeProvider.
// Consider moving useThemeMode to a separate file if Biome still complains about fast refresh.
export { ThemeModeContext };
