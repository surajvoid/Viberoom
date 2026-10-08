import React from 'react';
import { Play, Pause, SkipForward, Heart, ChevronUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Artwork } from '../ui/Artwork.js';
import { usePlayer } from '../../context/PlayerContext.js';
import { useRoom } from '../../context/RoomContext.js';

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
  const { activeRoom, isRoomModalOpen, openRoomModal } = useRoom();

  if (!currentTrack && !activeRoom) return null;

  const liked = currentTrack ? isLiked(currentTrack.id) : false;

  return (
    <div
      className="fixed bottom-[calc(64px+env(safe-area-inset-bottom,0px))] md:bottom-5 left-0 right-0 z-30 px-2.5 sm:px-4 md:px-6 max-w-2xl mx-auto pointer-events-none"
    >
      {/* Live Social Room Multitasking Bar (shows when user minimized the active room) */}
      {activeRoom && !isRoomModalOpen && (
        <motion.div
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 8, opacity: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            openRoomModal();
          }}
          className="pointer-events-auto mb-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF3D81] to-[#8B5CF6] text-white shadow-lg backdrop-blur-md flex items-center justify-between cursor-pointer text-xs font-semibold hover:brightness-110 active:scale-[0.99] transition-all border border-white/20 select-none group"
        >
          <div className="flex items-center gap-2 truncate">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="truncate font-bold tracking-tight">LIVE ROOM: {activeRoom.name}</span>
            <span className="font-mono bg-black/25 px-1.5 py-0.5 rounded text-[10px] tracking-wider text-pink-100">
              #{activeRoom.code}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] shrink-0 font-medium opacity-90 pl-2 group-hover:opacity-100">
            <span>Reopen Room</span>
            <ChevronUp size={14} />
          </div>
        </motion.div>
      )}

      {currentTrack && (
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
      )}
    </div>
  );
};
