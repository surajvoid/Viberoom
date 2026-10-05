import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  activeAccent: string;
  setActiveAccent: (hexColor: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 139;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 92;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 246;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem('viberoom_theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch (e) {
      // ignore
    }
    return 'dark'; // Default dark theme as specified in PRD
  });

  const [activeAccent, setActiveAccentState] = useState<string>('#8B5CF6'); // Electric purple default

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('viberoom_theme', theme);
    } catch (e) {
      // ignore
    }
  }, [theme]);

  // Update dynamic track accent on root CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--app-accent', activeAccent);
    root.style.setProperty(
      '--app-accent-glow',
      hexToRgba(activeAccent, theme === 'dark' ? 0.32 : 0.24)
    );
  }, [activeAccent, theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const setActiveAccent = (hex: string) => {
    if (hex) setActiveAccentState(hex);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        activeAccent,
        setActiveAccent,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
