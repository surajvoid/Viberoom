import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Sparkles,
  Zap,
  Clock,
  Music,
  Share2,
  Check,
  Disc3,
  ListPlus,
  Volume2,
} from 'lucide-react';
import { ContextualSoundscape } from '../../services/contextualMusicService.js';
import { Track } from '../../mockData.js';
import { Artwork } from '../ui/Artwork.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { usePlayer } from '../../context/PlayerContext.js';
import { useRoom } from '../../context/RoomContext.js';

interface ContextualSoundscapeModalProps {
  soundscape: ContextualSoundscape | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ContextualSoundscapeModal: React.FC<ContextualSoundscapeModalProps> = ({
  soundscape,
  isOpen,
  onClose,
}) => {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const { activeRoom, suggestSong } = useRoom();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !soundscape) return null;

  const handlePlayAll = () => {
    if (soundscape.tracks.length > 0) {
      playTrack(soundscape.tracks[0]);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(
      `Check out "${soundscape.name} ${soundscape.emoji}" on VibeRoom — ${soundscape.tagline}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-app-surface border border-app-border rounded-hero shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
        >
          {/* Header Banner */}
          <div
            className={`relative p-6 sm:p-8 bg-gradient-to-br ${soundscape.gradient} text-white shrink-0 overflow-hidden`}
          >
            {/* Ambient Lighting Orbs */}
            <div
              className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-40 pointer-events-none"
              style={{ backgroundColor: soundscape.accentColor }}
            />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white/90 hover:text-white transition-colors"
              aria-label="Close soundscape"
            >
              <X size={18} />
            </button>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="accent" icon={<Sparkles size={12} />}>
                  Contextual Soundscape
                </Badge>
                <span className="text-meta-sm font-semibold text-white/80">
                  {soundscape.mood}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-4xl">{soundscape.emoji}</span>
                <div>
                  <h2 className="text-section-heading sm:text-page-title font-black tracking-tight text-white">
                    {soundscape.name}
                  </h2>
                  <p className="text-meta text-white/80 line-clamp-1">{soundscape.tagline}</p>
                </div>
              </div>

              <p className="text-body text-white/70 max-w-lg text-sm sm:text-base leading-relaxed">
                {soundscape.description}
              </p>

              {/* Sonic Metrics Pill Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-meta-sm text-white/90">
                <span className="px-2.5 py-1 rounded-chip bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-1.5">
                  <Zap size={13} style={{ color: soundscape.secondaryColor }} />
                  <span>Energy: {soundscape.energy}%</span>
                </span>
                <span className="px-2.5 py-1 rounded-chip bg-white/10 backdrop-blur-sm border border-white/15 flex items-center gap-1.5">
                  <Music size={13} />
                  <span>{soundscape.tempo}</span>
                </span>
                <span className="px-2.5 py-1 rounded-chip bg-white/10 backdrop-blur-sm border border-white/15">
                  {soundscape.tracks.length} Verified Tracks
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-3">
                <Button
                  variant="primary"
                  size="md"
                  icon={<Play size={16} fill="currentColor" />}
                  onClick={handlePlayAll}
                  className="bg-white text-black hover:bg-white/90 font-bold shadow-lg"
                >
                  Play Soundscape
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  icon={copied ? <Check size={14} /> : <Share2 size={14} />}
                  onClick={handleShare}
                  className="bg-black/30 border-white/20 text-white hover:bg-black/50"
                >
                  {copied ? 'Copied Link' : 'Share'}
                </Button>
              </div>
            </div>
          </div>

          {/* Tracklist Container */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 scrollbar-none bg-app-surface">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-meta font-bold uppercase tracking-wider text-app-muted">
                Curated Contextual Tracklist
              </h3>
              <span className="text-meta-sm text-app-muted">100% Genre & Mood Aligned</span>
            </div>

            {soundscape.tracks.map((track: Track, idx: number) => {
              const isCurrent = currentTrack?.id === track.id || currentTrack?.youtubeId === track.youtubeId;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`flex items-center justify-between p-3 rounded-card transition-all cursor-pointer group border ${
                    isCurrent
                      ? 'bg-app-elevated border-app-accent/60 shadow-sm'
                      : 'bg-app-elevated/40 hover:bg-app-elevated border-app-border'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-meta-sm font-mono font-bold text-app-muted w-6 text-center shrink-0">
                      {isCurrent && isPlaying ? (
                        <Volume2 size={15} className="text-app-accent animate-pulse inline" />
                      ) : (
                        String(idx + 1).padStart(2, '0')
                      )}
                    </span>

                    <Artwork
                      src={track.artworkSvg}
                      alt={track.title}
                      size="sm"
                      rounded="chip"
                      isPlaying={isCurrent && isPlaying}
                      glowColor={track.accentColor}
                    />

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-body font-bold truncate ${
                          isCurrent ? 'text-app-accent' : 'text-app-text group-hover:text-app-accent'
                        }`}
                      >
                        {track.title}
                      </p>
                      <div className="flex items-center gap-2 text-meta-sm text-app-muted truncate">
                        <span>{track.artist}</span>
                        <span>•</span>
                        <span>{track.genre}</span>
                        <span>•</span>
                        <span>{track.bpm} BPM</span>
                      </div>
                    </div>
                  </div>

                  {/* Right side actions */}
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {activeRoom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          suggestSong(track);
                        }}
                        title="Suggest to active room queue"
                        className="p-2 rounded-full hover:bg-app-surface text-app-muted hover:text-app-text transition-colors"
                      >
                        <ListPlus size={16} />
                      </button>
                    )}

                    <Button
                      variant={isCurrent && isPlaying ? 'primary' : 'ghost'}
                      size="sm"
                      icon={<Play size={13} fill="currentColor" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(track);
                      }}
                    >
                      {isCurrent && isPlaying ? 'Playing' : 'Play'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
