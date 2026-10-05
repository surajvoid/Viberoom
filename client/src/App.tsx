import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { PlayerProvider } from './context/PlayerContext.js';
import { RoomProvider } from './context/RoomContext.js';
import { AuthScreen } from './screens/auth/AuthScreen.js';
import { BottomNavigation, NavigationTab } from './components/navigation/BottomNavigation.js';
import { DesktopSidebar } from './components/navigation/DesktopSidebar.js';
import { AppHeader } from './components/navigation/AppHeader.js';
import { MiniPlayer } from './components/player/MiniPlayer.js';
import { NowPlayingModal } from './components/player/NowPlayingModal.js';
import { PrivateRoomModal } from './components/room/PrivateRoomModal.js';
import { CreateRoomModal } from './components/room/CreateRoomModal.js';
import { JoinRoomCodeModal } from './components/room/JoinRoomCodeModal.js';
import { SessionSummaryModal } from './components/room/SessionSummaryModal.js';
import { FriendsActivityModal } from './components/social/FriendsActivityModal.js';
import { HomeScreen } from './screens/foundation/HomeScreen.js';
import { DiscoverScreen } from './screens/foundation/DiscoverScreen.js';
import { RoomsScreen } from './screens/foundation/RoomsScreen.js';
import { LibraryScreen } from './screens/foundation/LibraryScreen.js';
import { ProfileScreen } from './screens/foundation/ProfileScreen.js';
import { Smartphone, Monitor, Volume2 } from 'lucide-react';

const ShellLayout: React.FC = () => {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavigationTab>('home');
  const [isMobileFramePreview, setIsMobileFramePreview] = useState(false);
  const [isFriendsActivityOpen, setIsFriendsActivityOpen] = useState(false);

  // Loading state while checking persistent session
  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-app-bg text-app-text flex flex-col items-center justify-center select-none">
        <div className="w-14 h-14 rounded-hero bg-app-accent flex items-center justify-center shadow-accent-glow text-white animate-pulse">
          <Volume2 size={26} strokeWidth={2.5} />
        </div>
        <div className="mt-5 text-center space-y-1">
          <p className="font-extrabold text-[20px] text-app-text tracking-tight">
            Vibe<span className="text-app-accent">Room</span>
          </p>
          <p className="text-meta text-app-muted">Preparing synchronized soundscapes...</p>
        </div>
      </div>
    );
  }

  // Authentication gating: NEVER show default logged-in user or go directly to Home
  if (!isAuthenticated || !currentUser) {
    return <AuthScreen />;
  }

  const renderActiveTabContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomeScreen
            onOpenRoom={() => setCurrentTab('rooms')}
            onNavigateTab={setCurrentTab}
          />
        );
      case 'discover':
        return <DiscoverScreen />;
      case 'rooms':
        return <RoomsScreen />;
      case 'library':
        return <LibraryScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return (
          <HomeScreen
            onOpenRoom={() => setCurrentTab('rooms')}
            onNavigateTab={setCurrentTab}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-app-text flex flex-col items-center justify-start transition-colors duration-200">
      {/* Dev / Desktop Viewport Frame Toggle Bar */}
      <div className="w-full bg-app-surface/90 border-b border-app-border py-1 px-4 hidden md:flex items-center justify-between text-meta-sm font-mono text-app-muted z-50">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>VibeRoom • Premium Social Music</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-meta-sm text-app-muted">Preview:</span>
          <button
            onClick={() => setIsMobileFramePreview(!isMobileFramePreview)}
            className="flex items-center gap-1.5 text-app-text hover:text-app-accent px-2.5 py-0.5 rounded-chip bg-app-elevated border border-app-border transition-colors"
          >
            {isMobileFramePreview ? <Monitor size={13} /> : <Smartphone size={13} />}
            <span>{isMobileFramePreview ? 'Desktop View' : 'Phone Frame (390px)'}</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Container */}
      <div
        className={`w-full flex-1 flex transition-all duration-300 ${
          isMobileFramePreview
            ? 'max-w-[420px] my-6 rounded-[36px] border-[10px] border-app-surface shadow-2xl overflow-hidden min-h-[820px] max-h-[92vh] flex-col relative'
            : 'max-w-7xl mx-auto h-[100dvh] overflow-hidden'
        }`}
      >
        {/* Desktop Sidebar (hidden on phone preview or mobile viewports) */}
        {!isMobileFramePreview && (
          <DesktopSidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            onOpenFriends={() => setIsFriendsActivityOpen(true)}
            className="hidden md:flex"
          />
        )}

        {/* Central Viewport */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Editorial Top Header */}
          <AppHeader
            currentTab={currentTab}
            onNavigateTab={setCurrentTab}
            onOpenSearch={() => setCurrentTab('discover')}
            onOpenFriends={() => setIsFriendsActivityOpen(true)}
          />

          {/* Scrollable Screen Body */}
          <main className="flex-1 overflow-y-auto px-mobile-pad md:px-desktop-pad py-5 scrollbar-none overscroll-contain">
            {renderActiveTabContent()}
          </main>

          {/* Floating Mini Player */}
          <MiniPlayer />

          {/* Cinematic Now Playing Full Screen Modal */}
          <NowPlayingModal onStartRoom={() => setCurrentTab('rooms')} />

          {/* Real-Time Private Social Room Full Screen Modal */}
          <PrivateRoomModal />

          {/* Room Modals */}
          <CreateRoomModal />
          <JoinRoomCodeModal />
          <SessionSummaryModal />

          {/* Friend Activity Modal */}
          <FriendsActivityModal
            isOpen={isFriendsActivityOpen}
            onClose={() => setIsFriendsActivityOpen(false)}
          />

          {/* Mobile Bottom Navigation (Visible on mobile or when mobile frame preview is toggled) */}
          {(isMobileFramePreview || true) && (
            <div className={isMobileFramePreview ? 'block' : 'block md:hidden'}>
              <BottomNavigation
                currentTab={currentTab}
                onSelectTab={setCurrentTab}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PlayerProvider>
          <RoomProvider>
            <ShellLayout />
          </RoomProvider>
        </PlayerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
