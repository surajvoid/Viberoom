import React from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Compass,
  Radio,
  Library,
  User as UserIcon,
  Flame,
  Volume2,
  LogOut,
} from 'lucide-react';
import { NavigationTab } from './BottomNavigation.js';
import { ThemeToggle } from '../ui/ThemeToggle.js';
import { UserAvatar } from '../ui/UserAvatar.js';
import { useAuth } from '../../context/AuthContext.js';

interface DesktopSidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenFriends?: () => void;
  className?: string;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenFriends,
  className = '',
}) => {
  const { currentUser, logout } = useAuth();

  const navItems = [
    { id: 'home' as NavigationTab, label: 'Home', icon: Home },
    { id: 'discover' as NavigationTab, label: 'Discover', icon: Compass },
    { id: 'rooms' as NavigationTab, label: 'Social Rooms', icon: Radio, badge: 'Live' },
    { id: 'library' as NavigationTab, label: 'Your Library', icon: Library },
    { id: 'profile' as NavigationTab, label: 'Profile & Taste', icon: UserIcon },
  ];

  return (
    <aside
      aria-label="Desktop Sidebar"
      className={`
        w-64 h-full bg-app-surface/60 border-r border-app-border
        flex flex-col justify-between p-6 select-none shrink-0 transition-colors duration-200
        ${className}
      `}
    >
      {/* Top Header & Brand */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('home')}>
            <div className="w-9 h-9 rounded-chip bg-app-accent flex items-center justify-center shadow-accent-glow text-white">
              <Volume2 size={20} strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-extrabold text-[18px] tracking-tight text-app-text block leading-none">
                Vibe<span className="text-app-accent">Room</span>
              </span>
              <span className="text-[10px] font-semibold text-app-muted tracking-wider uppercase">
                Social Music
              </span>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Primary Navigation */}
        <div className="space-y-1.5">
          <p className="text-meta-sm text-app-muted uppercase font-bold tracking-wider px-3 mb-2">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`
                  w-full flex items-center justify-between px-3.5 py-2.5 rounded-chip text-body font-semibold transition-all duration-200 group
                  ${
                    isActive
                      ? 'bg-app-accent/15 text-app-accent shadow-sm'
                      : 'text-app-muted hover:text-app-text hover:bg-app-elevated/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.3 : 1.8}
                    className={`transition-colors ${
                      isActive ? 'text-app-accent' : 'text-app-muted group-hover:text-app-text'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Social Hangout Action on Desktop */}
        <div className="pt-2">
          <div
            onClick={() => onSelectTab('rooms')}
            className="flex items-center justify-between px-3 mb-2 cursor-pointer group"
          >
            <p className="text-meta-sm text-app-muted uppercase font-bold tracking-wider group-hover:text-app-text">
              Social Rooms
            </p>
            <span className="flex items-center gap-1 text-[11px] text-app-accent font-semibold">
              <Radio size={12} className="animate-pulse" />
              Live Sync
            </span>
          </div>

          <div
            onClick={() => onSelectTab('rooms')}
            className="p-3 rounded-card bg-app-elevated/40 border border-app-border hover:border-app-accent/50 transition-colors cursor-pointer space-y-2 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-body font-bold text-app-text group-hover:text-app-accent transition-colors">
                Listen Together
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-meta-sm text-app-muted">
              Host a room, vote on songs, or invite friends with a code.
            </p>
          </div>
        </div>
      </div>

      {/* User Footer Profile & Sign Out */}
      {currentUser && (
        <div className="pt-4 border-t border-app-border">
          <div className="flex items-center gap-2 p-2 rounded-card bg-app-elevated/50 border border-app-border">
            <div
              onClick={() => onSelectTab('profile')}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <UserAvatar user={currentUser} size="md" showPresence={true} />
              <div className="min-w-0 flex-1">
                <p className="text-body font-bold text-app-text truncate">{currentUser.name}</p>
                <p className="text-meta-sm text-app-muted truncate">{currentUser.handle}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Sign out of VibeRoom"
              aria-label="Sign out"
              className="p-2 rounded-chip hover:bg-rose-500/10 text-app-muted hover:text-rose-400 transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
