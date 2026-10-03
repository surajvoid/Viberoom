import React, { useState, useEffect } from 'react';
import { UserProvider, useUser } from './context/UserContext.js';
import { AudioProvider, useAudio } from './context/AudioContext.js';
import { SocketProvider, useSocket } from './context/SocketContext.js';
import { Header } from './components/Header.js';
import { BottomNavigation, TabType } from './components/BottomNavigation.js';
import { MiniPlayer } from './components/MiniPlayer.js';
import { FullPlayerModal } from './components/FullPlayerModal.js';
import { ListeningRoomModal } from './components/ListeningRoomModal.js';
import { MusicMatchModal } from './components/MusicMatchModal.js';
import { JoinRoomCodeModal } from './components/JoinRoomCodeModal.js';
import { SongDedicationModal } from './components/SongDedicationModal.js';
import { UserOnboardingModal } from './components/UserOnboardingModal.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { SearchScreen } from './screens/SearchScreen.js';
import { LibraryScreen } from './screens/LibraryScreen.js';
import { FriendsScreen } from './screens/FriendsScreen.js';
import { api } from './services/api.js';
import { MusicMatchData } from './types/index.js';
import { Smartphone, Monitor } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isMobileFrame, setIsMobileFrame] = useState(false);
  const [musicMatchData, setMusicMatchData] = useState<MusicMatchData | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [isJoinCodeModalOpen, setIsJoinCodeModalOpen] = useState(false);

  const { currentUser } = useUser();
  const { isRoomOpen, openRoom, closeRoom } = useAudio();
  const { activeRoom, joinRoom } = useSocket();

  useEffect(() => {
    api.getMusicMatch(currentUser.id, 'user-community-2').then(setMusicMatchData);
  }, [currentUser.id]);

  const handleOpenRoom = (roomId: string) => {
    openRoom(roomId);
  };

  const handleOpenMusicMatch = () => {
    setShowMatchModal(true);
  };

  const renderScreen = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomeScreen
            onOpenRoom={handleOpenRoom}
            onOpenMusicMatch={handleOpenMusicMatch}
            onOpenJoinCodeModal={() => setIsJoinCodeModalOpen(true)}
          />
        );
      case 'search':
        return <SearchScreen onOpenRoom={handleOpenRoom} />;
      case 'library':
        return <LibraryScreen />;
      case 'friends':
        return <FriendsScreen onOpenRoom={handleOpenRoom} onOpenMusicMatch={handleOpenMusicMatch} />;
      default:
        return (
          <HomeScreen
            onOpenRoom={handleOpenRoom}
            onOpenMusicMatch={handleOpenMusicMatch}
            onOpenJoinCodeModal={() => setIsJoinCodeModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050607] flex flex-col items-center justify-start text-content-primary">
      {/* Viewport Frame Toggle Bar for Desktop Preview */}
      <div className="w-full max-w-md py-1.5 px-4 flex items-center justify-between text-[11px] font-mono text-content-muted border-b border-border-subtle/30 bg-surface-primary/60">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          VibeRoom • Social Music
        </span>
        <button
          onClick={() => setIsMobileFrame(!isMobileFrame)}
          className="flex items-center gap-1 text-content-secondary hover:text-content-primary py-0.5 px-2 rounded hover:bg-surface-secondary transition-colors"
        >
          {isMobileFrame ? <Monitor size={12} /> : <Smartphone size={12} />}
          <span>{isMobileFrame ? 'Expand' : 'Mobile Frame'}</span>
        </button>
      </div>

      {/* Main Mobile App Container */}
      <div
        className={`w-full relative flex flex-col transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-[420px] my-4 rounded-[40px] border-[8px] border-[#1C1D21] shadow-2xl overflow-hidden min-h-[850px] max-h-[90vh]'
            : 'max-w-md min-h-screen bg-background border-x border-border-subtle/40 shadow-2xl'
        }`}
      >
        {/* Editorial Top Header */}
        <Header />

        {/* Active Tab Screen */}
        <main className="flex-1 overflow-y-auto scrollbar-none">{renderScreen()}</main>

        {/* Floating Mini Player (docked above bottom navigation) */}
        <MiniPlayer />

        {/* Bottom Navigation */}
        <BottomNavigation currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Full Cinematic Player Modal */}
        <FullPlayerModal
          onOpenListenTogether={async () => {
            await joinRoom('8492');
            openRoom('8492');
          }}
        />

        {/* Real-Time Listening Room Modal */}
        {(isRoomOpen || activeRoom) && (
          <ListeningRoomModal onClose={closeRoom} />
        )}

        {/* Couple / Music Match Modal */}
        {showMatchModal && musicMatchData && (
          <MusicMatchModal
            data={musicMatchData}
            onClose={() => setShowMatchModal(false)}
            onListenTogether={async () => {
              await joinRoom('8492');
              openRoom('8492');
            }}
          />
        )}

        {/* Groic 1-Tap Room Code Modal */}
        <JoinRoomCodeModal
          isOpen={isJoinCodeModalOpen}
          onClose={() => setIsJoinCodeModalOpen(false)}
          onJoined={(code) => openRoom(code)}
        />

        {/* Groic Song Dedication Modal */}
        <SongDedicationModal />

        {/* User Identity & Onboarding Modal */}
        <UserOnboardingModal />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <UserProvider>
      <AudioProvider>
        <SocketProvider>
          <MainAppContent />
        </SocketProvider>
      </AudioProvider>
    </UserProvider>
  );
};

export default App;
