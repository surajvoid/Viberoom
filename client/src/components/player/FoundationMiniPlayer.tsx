import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Artwork } from '../ui/Artwork.js';
import { usePlayer } from '../../context/PlayerContext.js';

export const FoundationMiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
  } = usePlayer();

  if (!currentTrack) return null;

  return (
    <div
      className="fixed bottom-[68px] md:bottom-4 left-0 right-0 z-30 px-3 md:px-6 max-w-3xl mx-auto pointer-events-none"
    >
      <div
        className="pointer-events-auto glass-panel border border-white/10 dark:border-white/5 rounded-card p-2.5 sm:p-3 shadow-soft-2 flex flex-col gap-2 relative overflow-hidden"
      >
        {/* Interactive Progress Bar across top of Mini Player */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            seekTo(pos);
          }}
          className="absolute top-0 left-0 right-0 h-1 bg-app-elevated/80 cursor-pointer group"
        >
          <motion.div
            className="h-full bg-app-accent shadow-accent-glow"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-0.5">
          {/* Left: Artwork + Track details */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Artwork
              src={currentTrack.artworkSvg}
              alt={currentTrack.title}
              size="xs"
              rounded="chip"
              isPlaying={isPlaying}
              glowColor={currentTrack.accentColor}
            />

            <div className="min-w-0 flex-1">
              <h4 className="text-body font-bold text-app-text truncate">
                {currentTrack.title}
              </h4>
              <p className="text-meta-sm text-app-muted truncate">
                {currentTrack.artist} •{' '}
                <span className="font-mono">
                  {Math.floor(currentTime)}s / {duration}s
                </span>
              </p>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={prevTrack}
              aria-label="Previous Track"
              className="p-1.5 text-app-muted hover:text-app-text transition-colors hidden sm:inline-flex"
            >
              <SkipBack size={18} />
            </button>

            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-9 h-9 rounded-full bg-app-accent text-white flex items-center justify-center shadow-accent-glow hover:brightness-110 transition-all"
            >
              {isPlaying ? (
                <Pause size={17} fill="currentColor" />
              ) : (
                <Play size={17} fill="currentColor" className="ml-0.5" />
              )}
            </motion.button>

            <button
              onClick={nextTrack}
              aria-label="Next Track"
              className="p-1.5 text-app-muted hover:text-app-text transition-colors"
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
