import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext.js';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`
        relative flex items-center justify-center w-9 h-9 rounded-full
        bg-app-surface hover:bg-app-elevated border border-app-border
        text-app-text transition-colors duration-200
        ${className}
      `}
    >
      {isDark ? (
        <Sun size={17} className="text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon size={17} className="text-indigo-600 transition-transform hover:-rotate-12" />
      )}
    </motion.button>
  );
};
