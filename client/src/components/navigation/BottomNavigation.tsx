import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Home, Compass, Radio, Library, User } from 'lucide-react';

export type NavigationTab = 'home' | 'discover' | 'rooms' | 'library' | 'profile';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'discover', label: 'Discover', icon: Compass },
  { id: 'rooms', label: 'Rooms', icon: Radio, badge: 'Live' },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'profile', label: 'Profile', icon: User },
];

export interface BottomNavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  currentTab,
  onSelectTab,
  className = '',
}) => {
  return (
    <nav
      aria-label="Bottom Navigation"
      className={`
        relative w-full glass-panel border-t border-app-border
        pb-safe pt-2 px-3 z-30 transition-all duration-200
        ${className}
      `}
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className="relative flex flex-col items-center justify-center flex-1 py-1.5 focus:outline-none select-none group"
              aria-label={item.label}
              aria-selected={isActive}
            >
              {/* Active Tab Spring Indicator Pill */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavActivePill"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className="absolute -top-1.5 w-8 h-1 rounded-full bg-app-accent shadow-accent-glow"
                />
              )}

              {/* Icon Container with Spring Bounce on Active */}
              <motion.div
                animate={isActive ? { scale: 1.12, y: -2 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative"
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.4 : 1.8}
                  className={`transition-colors duration-200 ${
                    isActive
                      ? 'text-app-accent'
                      : 'text-app-muted group-hover:text-app-text'
                  }`}
                />

                {/* Optional mini badge */}
                {item.badge && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-rose-500 text-[9px] font-bold text-white rounded-full leading-tight">
                    {item.badge}
                  </span>
                )}
              </motion.div>

              {/* Label */}
              <span
                className={`text-[11px] font-medium tracking-tight mt-1 transition-colors duration-200 ${
                  isActive
                    ? 'text-app-accent font-semibold'
                    : 'text-app-muted group-hover:text-app-text'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
