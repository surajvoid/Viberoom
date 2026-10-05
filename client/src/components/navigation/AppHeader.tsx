import React from 'react';
import { Search, Users, Sparkles, Volume2 } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle.js';
import { UserAvatar } from '../ui/UserAvatar.js';
import { useAuth } from '../../context/AuthContext.js';
import { NavigationTab } from './BottomNavigation.js';

interface AppHeaderProps {
  currentTab: NavigationTab;
  onOpenSearch?: () => void;
  onOpenFriends?: () => void;
  onNavigateTab: (tab: NavigationTab) => void;
  className?: string;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentTab,
  onOpenSearch,
  onOpenFriends,
  onNavigateTab,
  className = '',
}) => {
  const { currentUser } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const titles: Record<NavigationTab, string> = {
    home: getGreeting(),
    discover: 'Discover Music',
    rooms: 'Live Listening Rooms',
    library: 'Your Library',
    profile: 'Music Personality',
  };

  return (
    <header
      className={`
        sticky top-0 z-20 w-full glass-panel border-b border-app-border
        px-mobile-pad md:px-desktop-pad py-3.5 flex items-center justify-between
        transition-colors duration-200 select-none
        ${className}
      `}
    >
      {/* Left: Mobile Brand / Tab title */}
      <div className="flex items-center gap-3">
        <div
          onClick={() => onNavigateTab('home')}
          className="md:hidden w-8 h-8 rounded-chip bg-app-accent flex items-center justify-center text-white shadow-accent-glow cursor-pointer"
        >
          <Volume2 size={16} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-section-heading md:text-page-title font-bold text-app-text tracking-tight flex items-center gap-2">
            <span>{titles[currentTab]}</span>
            {currentTab === 'home' && (
              <span className="text-app-accent text-lg">
                <Sparkles size={18} className="inline animate-pulse" />
              </span>
            )}
          </h1>
          <p className="text-meta-sm text-app-muted hidden sm:block">
            {currentTab === 'home'
              ? 'Synchronized social soundscapes'
              : 'Listen, discover, and vibe together'}
          </p>
        </div>
      </div>

      {/* Right: Quick actions (Search trigger, Friends trigger, Theme toggle, Avatar) */}
      <div className="flex items-center gap-2.5">
        {/* Quick Search Button */}
        <button
          onClick={onOpenSearch || (() => onNavigateTab('discover'))}
          aria-label="Search tracks, artists, rooms"
          className="p-2 rounded-full bg-app-surface hover:bg-app-elevated border border-app-border text-app-text transition-colors"
        >
          <Search size={18} />
        </button>

        {/* Quick Friends Modal / Activity Trigger */}
        <button
          onClick={onOpenFriends || (() => onNavigateTab('profile'))}
          aria-label="Friends and Activity"
          className="relative p-2 rounded-full bg-app-surface hover:bg-app-elevated border border-app-border text-app-text transition-colors"
        >
          <Users size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 border border-app-bg" />
        </button>

        {/* Light / Dark Mode Toggle */}
        <ThemeToggle />

        {/* Mobile Profile Avatar */}
        {currentUser && (
          <div className="md:hidden ml-1 cursor-pointer" onClick={() => onNavigateTab('profile')}>
            <UserAvatar user={currentUser} size="sm" showPresence={true} />
          </div>
        )}
      </div>
    </header>
  );
};
