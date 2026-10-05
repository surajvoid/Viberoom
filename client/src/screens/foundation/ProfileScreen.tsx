import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Share2,
  Check,
  LogOut,
  Radio,
  Play,
  Pause,
  Sliders,
  Smartphone,
  ShieldCheck,
  Music2,
  Clock,
  Compass,
} from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { UserAvatar } from '../../components/ui/UserAvatar.js';
import { Artwork } from '../../components/ui/Artwork.js';
import { useAuth } from '../../context/AuthContext.js';
import { usePlayer } from '../../context/PlayerContext.js';
import { useTheme } from '../../context/ThemeContext.js';

export const ProfileScreen: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const {
    likedTracks,
    history,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleLike,
    isAutoplayEnabled,
    toggleAutoplay,
  } = usePlayer();
  const { theme, toggleTheme } = useTheme();
  const [copied, setCopied] = useState(false);

  if (!currentUser) return null;

  const handleShareProfile = () => {
    const shareText = `Join me on VibeRoom! Listen together in real-time rooms 🎧 Handle: ${currentUser.handle}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pb-36 select-none max-w-4xl mx-auto">
      {/* Profile Header Hero */}
      <div className="relative rounded-hero overflow-hidden bg-gradient-to-br from-app-surface via-app-elevated to-app-surface border border-app-border p-5 sm:p-7 shadow-soft-1">
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <UserAvatar user={currentUser} size="xl" showPresence={true} />

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-section-heading md:text-page-title font-extrabold text-app-text">
                {currentUser.name}
              </h2>
              <Badge variant="accent">
                <Sparkles size={12} className="inline mr-1" />
                Verified
              </Badge>
            </div>
            <p className="text-meta font-medium text-app-muted">{currentUser.handle}</p>
            {currentUser.email && (
              <p className="text-meta-sm text-app-muted/80">{currentUser.email}</p>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0 pt-2 sm:pt-0">
            <Button
              variant="secondary"
              size="sm"
              icon={copied ? <Check size={14} /> : <Share2 size={14} />}
              onClick={handleShareProfile}
            >
              {copied ? 'Copied Link' : 'Share Profile'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              icon={<LogOut size={14} className="text-rose-400" />}
              onClick={logout}
              className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Liked Songs Shelf (Genuine User Data) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-rose-500 fill-rose-500/20" />
            <h3 className="text-section-heading font-bold text-app-text">
              Liked Tracks ({likedTracks.length})
            </h3>
          </div>
          <span className="text-meta-sm text-app-muted">1-Tap to Play</span>
        </div>

        {likedTracks.length === 0 ? (
          <Card className="p-6 text-center space-y-2 border border-app-border bg-app-surface/50">
            <Music2 size={32} className="mx-auto text-app-muted opacity-60" />
            <p className="text-body font-bold text-app-text">No liked songs yet</p>
            <p className="text-meta text-app-muted max-w-sm mx-auto">
              Tap the heart icon on any song while listening or searching to pin your favorite tracks here.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {likedTracks.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              const isCurrentPlaying = isCurrent && isPlaying;

              return (
                <div
                  key={track.id}
                  onClick={() => (isCurrent ? togglePlay() : playTrack(track))}
                  className={`flex items-center justify-between p-3 rounded-card border transition-all cursor-pointer group ${
                    isCurrent
                      ? 'bg-app-accent/10 border-app-accent shadow-sm'
                      : 'bg-app-surface hover:bg-app-elevated border-app-border'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Artwork
                      src={track.artworkSvg}
                      alt={track.title}
                      size="sm"
                      rounded="chip"
                      isPlaying={isCurrentPlaying}
                      glowColor={track.accentColor}
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-body font-bold truncate ${
                          isCurrent ? 'text-app-accent' : 'text-app-text'
                        }`}
                      >
                        {track.title}
                      </p>
                      <p className="text-meta-sm text-app-muted truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track.id);
                      }}
                      className="p-2 text-rose-500 hover:scale-110 active:scale-95 transition-transform"
                      aria-label="Unlike track"
                    >
                      <Heart size={16} fill="currentColor" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        isCurrent ? togglePlay() : playTrack(track);
                      }}
                      className="w-8 h-8 rounded-full bg-app-elevated group-hover:bg-app-accent text-app-text group-hover:text-white flex items-center justify-center transition-all"
                      aria-label="Play track"
                    >
                      {isCurrentPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Listening History (Genuine Session History) */}
      {history.length > 0 && (
        <section className="space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-app-accent" />
              <h3 className="text-section-heading font-bold text-app-text">
                Recently Played ({history.length})
              </h3>
            </div>
            <span className="text-meta-sm text-app-muted">Session History</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {history.slice(0, 8).map((track, idx) => (
              <div
                key={`${track.id}-${idx}`}
                onClick={() => playTrack(track)}
                className="w-36 shrink-0 p-2.5 rounded-card bg-app-surface hover:bg-app-elevated border border-app-border transition-all cursor-pointer group"
              >
                <Artwork
                  src={track.artworkSvg}
                  alt={track.title}
                  size="md"
                  rounded="card"
                  glowColor={track.accentColor}
                />
                <p className="text-body-sm font-bold text-app-text truncate mt-2 group-hover:text-app-accent transition-colors">
                  {track.title}
                </p>
                <p className="text-meta-sm text-app-muted truncate">{track.artist}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mobile Playback & App Settings */}
      <section className="space-y-3.5">
        <div className="flex items-center gap-2">
          <Sliders size={20} className="text-app-accent" />
          <h3 className="text-section-heading font-bold text-app-text">
            Playback & Experience Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Autoplay Similar Songs */}
          <Card className="p-4.5 border border-app-border flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-body font-bold text-app-text flex items-center gap-2">
                <Radio size={16} className="text-app-accent" />
                Infinite Similar Autoplay
              </p>
              <p className="text-meta-sm text-app-muted">
                Automatically finds and plays musically similar songs when the queue ends or you're idle.
              </p>
            </div>
            <button
              onClick={toggleAutoplay}
              aria-label="Toggle autoplay"
              className={`w-12 h-6.5 rounded-full p-0.5 transition-colors shrink-0 ${
                isAutoplayEnabled ? 'bg-app-accent' : 'bg-app-elevated border border-app-border'
              }`}
            >
              <div
                className={`w-5.5 h-5.5 rounded-full bg-white shadow-sm transition-transform ${
                  isAutoplayEnabled ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </Card>

          {/* Theme Switcher */}
          <Card className="p-4.5 border border-app-border flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-body font-bold text-app-text flex items-center gap-2">
                <Sparkles size={16} className="text-app-accent" />
                Appearance Mode
              </p>
              <p className="text-meta-sm text-app-muted">
                Currently using <span className="font-bold capitalize">{theme}</span> theme palette.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleTheme} className="shrink-0">
              Toggle {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </Card>

          {/* Background Audio Capability Badge */}
          <Card className="p-4.5 border border-app-border flex items-center gap-3 bg-app-surface/60">
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="text-body-sm font-bold text-app-text">Background Audio Active</p>
              <p className="text-meta-sm text-app-muted">
                Music plays continuously on phone sleep, screen lock, and tab switch.
              </p>
            </div>
          </Card>

          {/* PWA Mobile Optimization */}
          <Card className="p-4.5 border border-app-border flex items-center gap-3 bg-app-surface/60">
            <div className="w-9 h-9 rounded-full bg-app-accent/15 text-app-accent flex items-center justify-center shrink-0">
              <Smartphone size={18} />
            </div>
            <div>
              <p className="text-body-sm font-bold text-app-text">Mobile-First PWA</p>
              <p className="text-meta-sm text-app-muted">
                Add to Home Screen for fullscreen native app experience with Lock-Screen controls.
              </p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
