import React, { useState } from 'react';
import {
  Play,
  Pause,
  Shuffle,
  Sparkles,
  Youtube,
  Search,
  Radio,
  Flame,
  Plus,
  KeyRound,
  Compass,
  Library,
  Disc3,
  Volume2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Artwork } from '../../components/ui/Artwork.js';
import { UserAvatar } from '../../components/ui/UserAvatar.js';
import { Track } from '../../mockData.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePlayer } from '../../context/PlayerContext.js';
import { useRoom } from '../../context/RoomContext.js';
import {
  CONTEXTUAL_SOUNDSCAPES,
  ContextualSoundscape,
} from '../../services/contextualMusicService.js';
import { ContextualSoundscapeModal } from '../../components/discovery/ContextualSoundscapeModal.js';

interface HomeScreenProps {
  onOpenRoom?: (roomId: string) => void;
  onNavigateTab?: (tab: 'home' | 'discover' | 'rooms' | 'library' | 'profile') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onOpenRoom, onNavigateTab }) => {
  const { currentUser } = useAuth();
  const { playTrack, currentTrack, isPlaying, togglePlay, progress, expandPlayer } = usePlayer();
  const { setIsCreateModalOpen, setIsJoinModalOpen } = useRoom();
  const [quickSearch, setQuickSearch] = useState('');
  const [selectedSoundscape, setSelectedSoundscape] = useState<ContextualSoundscape | null>(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const featuredSoundscapes = CONTEXTUAL_SOUNDSCAPES.slice(0, 4);

  const handleQuickSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickSearch.trim()) return;
    onNavigateTab?.('discover');
  };

  return (
    <div className="space-y-8 pb-36">
      {/* Editorial Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-meta font-bold text-app-accent uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-app-accent animate-pulse" />
            Social Frequency Sync
          </span>
          <h2 className="text-section-heading md:text-page-title font-extrabold text-app-text tracking-tight mt-0.5">
            {getGreeting()}, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Music Lover'}
          </h2>
        </div>

        {currentUser && (
          <button
            onClick={() => onNavigateTab?.('profile')}
            className="p-1.5 rounded-full hover:bg-app-elevated transition-colors cursor-pointer"
            aria-label="User Profile"
          >
            <UserAvatar user={currentUser} size="md" showPresence={true} />
          </button>
        )}
      </div>

      {/* Hero Section: Dynamic depending on whether a track is currently playing */}
      {currentTrack ? (
        <section className="relative">
          <div className="relative rounded-hero overflow-hidden bg-gradient-to-br from-app-surface via-app-elevated to-app-surface border border-app-border p-6 sm:p-8 shadow-soft-2">
            <div
              className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-35 pointer-events-none"
              style={{ backgroundColor: currentTrack.accentColor || '#FF3D81' }}
            />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div
                className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 cursor-pointer group"
                onClick={expandPlayer}
              >
                <Artwork
                  src={currentTrack.artworkSvg}
                  alt={currentTrack.title}
                  size="hero"
                  rounded="hero"
                  isPlaying={isPlaying}
                  glowColor={currentTrack.accentColor}
                />
              </div>

              <div className="flex-1 text-center md:text-left space-y-3">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <Badge variant="live">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    Now Playing
                  </Badge>
                  {currentTrack.youtubeId && (
                    <Badge variant="accent" icon={<Youtube size={12} />}>
                      YouTube Stream
                    </Badge>
                  )}
                </div>

                <h2 className="text-page-title font-extrabold text-app-text tracking-tight line-clamp-1">
                  {currentTrack.title}
                </h2>

                <p className="text-body text-app-muted line-clamp-1">
                  {currentTrack.artist} • {currentTrack.album}
                </p>

                {/* Progress preview */}
                <div className="w-full max-w-md h-1.5 bg-app-elevated rounded-full overflow-hidden mx-auto md:mx-0">
                  <div
                    className="h-full bg-app-accent rounded-full transition-all duration-300"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-center md:justify-start gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    icon={isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                    onClick={togglePlay}
                  >
                    {isPlaying ? 'Pause' : 'Resume'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    icon={<Disc3 size={18} />}
                    onClick={expandPlayer}
                  >
                    Cinematic View
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    icon={<Plus size={18} />}
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    Host in Room
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Welcome Launchpad when idle */
        <section className="relative">
          <div className="relative rounded-hero overflow-hidden bg-gradient-to-br from-app-surface via-app-elevated to-app-surface border border-app-border p-6 sm:p-10 shadow-soft-2">
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-25 bg-[#FF3D81] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-20 bg-[#8B5CF6] pointer-events-none" />

            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="accent" icon={<Sparkles size={12} />}>
                  Listen Together
                </Badge>
                <span className="text-meta-sm text-app-muted">YouTube Powered</span>
              </div>

              <h2 className="text-page-title sm:text-[36px] font-extrabold text-app-text tracking-tight leading-tight">
                Stream any song. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-app-accent to-[#8B5CF6]">
                  Listen together in sync.
                </span>
              </h2>

              <p className="text-body text-app-muted max-w-lg">
                Search millions of real tracks from YouTube, create collaborative rooms with voting, or explore soundscapes.
              </p>

              {/* Quick Search Launchpad Input */}
              <form onSubmit={handleQuickSearchSubmit} className="pt-2">
                <div className="relative flex items-center max-w-lg">
                  <Search size={18} className="absolute left-4 text-app-muted pointer-events-none" />
                  <input
                    type="text"
                    value={quickSearch}
                    onChange={(e) => setQuickSearch(e.target.value)}
                    placeholder="Search any song, artist, or YouTube URL..."
                    className="w-full bg-app-elevated text-app-text placeholder-app-muted pl-11 pr-24 py-3.5 rounded-card border border-app-border focus:border-app-accent focus:outline-none transition-colors text-body font-medium shadow-soft-1"
                  />
                  <div className="absolute right-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => onNavigateTab?.('discover')}
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Quick Action Cards (PRD Social Features) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-section-heading font-bold text-app-text">Quick Launchpad</h3>
          <span className="text-meta-sm text-app-muted">Instant social controls</span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
          <Card
            interactive={true}
            onClick={() => setIsCreateModalOpen(true)}
            className="p-3 sm:p-4 flex flex-col items-center sm:items-start text-center sm:text-left justify-between space-y-2 group hover:border-app-accent transition-colors"
          >
            <div className="w-8 h-8 rounded-chip bg-app-accent/15 text-app-accent flex items-center justify-center shrink-0">
              <Plus size={16} />
            </div>
            <div className="min-w-0 w-full">
              <h4 className="text-caption sm:text-body-sm font-bold text-app-text group-hover:text-app-accent transition-colors truncate">
                New Room
              </h4>
              <p className="text-[10px] sm:text-meta-sm text-app-muted mt-0.5 hidden sm:block truncate">
                Host a sync session
              </p>
            </div>
          </Card>

          <Card
            interactive={true}
            onClick={() => setIsJoinModalOpen(true)}
            className="p-3 sm:p-4 flex flex-col items-center sm:items-start text-center sm:text-left justify-between space-y-2 group hover:border-[#8B5CF6] transition-colors"
          >
            <div className="w-8 h-8 rounded-chip bg-[#8B5CF6]/15 text-[#8B5CF6] flex items-center justify-center shrink-0">
              <KeyRound size={16} />
            </div>
            <div className="min-w-0 w-full">
              <h4 className="text-caption sm:text-body-sm font-bold text-app-text group-hover:text-[#8B5CF6] transition-colors truncate">
                Join Code
              </h4>
              <p className="text-[10px] sm:text-meta-sm text-app-muted mt-0.5 hidden sm:block truncate">
                4-digit code
              </p>
            </div>
          </Card>

          <Card
            interactive={true}
            onClick={() => onNavigateTab?.('discover')}
            className="p-3 sm:p-4 flex flex-col items-center sm:items-start text-center sm:text-left justify-between space-y-2 group hover:border-[#22D3EE] transition-colors"
          >
            <div className="w-8 h-8 rounded-chip bg-[#22D3EE]/15 text-[#22D3EE] flex items-center justify-center shrink-0">
              <Compass size={16} />
            </div>
            <div className="min-w-0 w-full">
              <h4 className="text-caption sm:text-body-sm font-bold text-app-text group-hover:text-[#22D3EE] transition-colors truncate">
                Discover
              </h4>
              <p className="text-[10px] sm:text-meta-sm text-app-muted mt-0.5 hidden sm:block truncate">
                Explore genres & vibes
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Mood Soundscapes (User-friendly genre launchers) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-section-heading font-bold text-app-text">Mood Soundscapes</h3>
            <p className="text-meta text-app-muted">Curated sonic vibes tuned for any mood</p>
          </div>
          <button
            onClick={() => onNavigateTab?.('discover')}
            className="text-meta font-bold text-app-accent hover:underline"
          >
            Explore All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {featuredSoundscapes.map((soundscape) => (
            <div
              key={soundscape.id}
              onClick={() => setSelectedSoundscape(soundscape)}
              className="p-4.5 rounded-card bg-app-surface hover:bg-app-elevated border border-app-border hover:border-app-accent/50 transition-all cursor-pointer space-y-1.5 group shadow-soft-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{soundscape.emoji}</span>
                <Play size={14} className="text-app-muted group-hover:text-app-accent transition-colors" />
              </div>
              <h4 className="text-body font-bold text-app-text group-hover:text-app-accent transition-colors pt-1">
                {soundscape.name}
              </h4>
              <p className="text-meta-sm text-app-muted line-clamp-1">{soundscape.tagline}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contextual Soundscape Modal for 1-Tap Playback */}
      <ContextualSoundscapeModal
        soundscape={selectedSoundscape}
        isOpen={Boolean(selectedSoundscape)}
        onClose={() => setSelectedSoundscape(null)}
      />
    </div>
  );
};
