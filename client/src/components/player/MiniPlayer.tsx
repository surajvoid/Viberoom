import React from 'react';
import { Play, Pause, SkipForward, Heart, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Artwork } from '../ui/Artwork.js';
import { usePlayer } from '../../context/PlayerContext.js';

export const MiniPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    togglePlay,
    nextTrack,
    seekTo,
    isLiked,
    toggleLike,
    expandPlayer,
  } = usePlayer();

  if (!currentTrack) return null;

  const liked = isLiked(currentTrack.id);

  return (
    <div
      className="fixed bottom-[68px] md:bottom-5 left-0 right-0 z-30 px-3 md:px-6 max-w-2xl mx-auto pointer-events-none"
    >
      <motion.div
        layoutId="miniPlayerContainer"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        onClick={expandPlayer}
        className="pointer-events-auto glass-panel border border-white/10 dark:border-white/5 rounded-card p-2 sm:p-2.5 shadow-soft-2 flex flex-col gap-2 relative overflow-hidden cursor-pointer select-none group hover:border-app-border-strong transition-colors"
      >
        {/* Seekable Progress Bar along top edge */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            seekTo(pos);
          }}
          className="absolute top-0 left-0 right-0 h-1 bg-app-elevated/80 cursor-pointer group/bar"
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
              <h4 className="text-body font-bold text-app-text truncate group-hover:text-app-accent transition-colors">
                {currentTrack.title}
              </h4>
              <p className="text-meta-sm text-app-muted truncate">
                {currentTrack.artist} •{' '}
                <span className="font-mono text-[11px]">
                  {Math.floor(currentTime)}s / {duration}s
                </span>
              </p>
            </div>
          </div>

          {/* Right: Controls cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Like Heart Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(currentTrack.id);
              }}
              aria-label={liked ? 'Unlike' : 'Like'}
              className="p-2 text-app-muted hover:text-rose-500 transition-colors"
            >
              <Heart
                size={18}
                className={liked ? 'text-rose-500 fill-rose-500' : ''}
              />
            </button>

            {/* Play / Pause with spring tap & glowing accent */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="w-9 h-9 rounded-full bg-app-accent text-white flex items-center justify-center shadow-accent-glow hover:brightness-110 active:brightness-95 transition-all"
            >
              {isPlaying ? (
                <Pause size={17} fill="currentColor" />
              ) : (
                <Play size={17} fill="currentColor" className="ml-0.5" />
              )}
            </motion.button>

            {/* Next Track Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextTrack();
              }}
              aria-label="Next Track"
              className="p-2 text-app-muted hover:text-app-text transition-colors"
            >
              <SkipForward size={18} />
            </button>

            {/* Expand indicator chevron */}
            <div className="p-1 text-app-muted group-hover:text-app-text transition-colors hidden sm:block">
              <ChevronUp size={16} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
