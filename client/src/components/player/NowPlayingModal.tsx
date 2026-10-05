import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  MoreHorizontal,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Mic2,
  ListMusic,
  Share2,
  Volume2,
  VolumeX,
  Youtube,
} from 'lucide-react';
import { usePlayer } from '../../context/PlayerContext.js';
import { Artwork } from '../ui/Artwork.js';
import { LyricsView } from './LyricsView.js';
import { QueueView } from './QueueView.js';
import { TrackActionsSheet } from './TrackActionsSheet.js';

interface NowPlayingModalProps {
  onStartRoom?: () => void;
}

export const NowPlayingModal: React.FC<NowPlayingModalProps> = ({ onStartRoom }) => {
  const {
    currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    isMuted,
    repeatMode,
    isShuffled,
    isExpanded,
    collapsePlayer,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    isLiked,
    toggleLike,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'artwork' | 'lyrics' | 'queue' | 'video'>('artwork');
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  if (!isExpanded || !currentTrack) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const remainingTime = Math.max(0, duration - currentTime);
  const liked = isLiked(currentTrack.id);

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center select-none">
          {/* Backdrop with multi-layer ambient blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={collapsePlayer}
            className="fixed inset-0 bg-black/85 backdrop-blur-2xl"
          />

          {/* Dynamic Track Accent Radial Ambient Background Glow */}
          <div
            className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-40 transition-all duration-700 blur-[120px]"
            style={{
              background: `radial-gradient(circle at 50% 35%, ${currentTrack.accentColor} 0%, transparent 65%)`,
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-xl h-full sm:h-[94vh] sm:rounded-hero bg-app-surface/90 border border-white/10 dark:border-white/5 flex flex-col justify-between overflow-hidden shadow-2xl z-10"
          >
            {/* Top Bar Navigation */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-app-border/40 shrink-0">
              <button
                onClick={collapsePlayer}
                aria-label="Collapse player"
                className="p-2 text-app-muted hover:text-app-text rounded-full hover:bg-app-elevated transition-colors"
              >
                <ChevronDown size={22} />
              </button>

              <div className="text-center min-w-0 px-2">
                <p className="text-[10px] font-extrabold tracking-widest uppercase text-app-muted truncate">
                  Playing from library
                </p>
                <p className="text-meta font-bold text-app-text truncate">
                  {currentTrack.album}
                </p>
              </div>

              <button
                onClick={() => setIsActionsOpen(true)}
                aria-label="Track actions"
                className="p-2 text-app-muted hover:text-app-text rounded-full hover:bg-app-elevated transition-colors"
              >
                <MoreHorizontal size={22} />
              </button>
            </div>

            {/* Central Content Area (Switchable between Cinematic Artwork, Lyrics, Queue) */}
            <div className="flex-1 overflow-hidden relative flex flex-col justify-center">
              {activeTab === 'artwork' && (
                <div className="flex flex-col items-center justify-center p-6 sm:p-8 space-y-6">
                  {/* Hero Artwork with Slow Pulse/Scale on Play */}
                  <motion.div
                    animate={isPlaying ? { scale: [1, 1.02, 1] } : { scale: 1 }}
                    transition={{
                      repeat: isPlaying ? Infinity : 0,
                      duration: 4,
                      ease: 'easeInOut',
                    }}
                    className="relative w-56 h-56 sm:w-72 md:w-80 sm:h-72 md:h-80 shadow-2xl rounded-hero overflow-hidden"
                  >
                    <Artwork
                      src={currentTrack.artworkSvg}
                      alt={currentTrack.title}
                      size="hero"
                      rounded="hero"
                      glowColor={currentTrack.accentColor}
                    />
                  </motion.div>
                </div>
              )}

              {activeTab === 'lyrics' && (
                <LyricsView lyrics={currentTrack.lyrics} />
              )}

              {activeTab === 'queue' && <QueueView />}

              {activeTab === 'video' && (
                <div className="flex flex-col items-center justify-center p-4 h-full">
                  {currentTrack.youtubeId ? (
                    <div className="w-full max-w-lg aspect-video rounded-card overflow-hidden shadow-2xl border border-app-border bg-black">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${currentTrack.youtubeId}?autoplay=1&enablejsapi=1`}
                        title={currentTrack.title}
                        allow="autoplay; encrypted-media"
                        className="w-full h-full border-0"
                      />
                    </div>
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <p className="text-body font-bold text-app-text">No YouTube Video Available</p>
                      <p className="text-meta text-app-muted">Playing in high-fidelity audio mode.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Controls Area */}
            <div className="p-5 sm:px-8 sm:pb-8 pt-2 pb-safe space-y-4 sm:space-y-5 shrink-0 bg-app-surface/95 border-t border-app-border/40">
              {/* Title, Artist & Like Button */}
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-section-heading sm:text-page-title font-extrabold text-app-text tracking-tight truncate">
                    {currentTrack.title}
                  </h2>
                  <p className="text-body font-semibold text-app-muted truncate mt-0.5">
                    {currentTrack.artist}
                  </p>
                </div>

                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => toggleLike(currentTrack.id)}
                  aria-label={liked ? 'Unlike' : 'Like'}
                  className="p-3 text-app-muted hover:text-rose-500 rounded-full hover:bg-app-elevated transition-colors shrink-0"
                >
                  <Heart
                    size={24}
                    className={liked ? 'text-rose-500 fill-rose-500' : ''}
                  />
                </motion.button>
              </div>

              {/* Scrubbable Progress Bar */}
              <div className="space-y-1.5">
                <div
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pos = (e.clientX - rect.left) / rect.width;
                    seekTo(pos);
                  }}
                  className="relative h-2 bg-app-elevated rounded-full cursor-pointer group flex items-center"
                >
                  <motion.div
                    className="h-full bg-app-accent rounded-full shadow-accent-glow"
                    style={{ width: `${progress * 100}%` }}
                  />
                  {/* Scrub Handle */}
                  <div
                    className="absolute w-3.5 h-3.5 rounded-full bg-white shadow-md border-2 border-app-accent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none -translate-x-1/2"
                    style={{ left: `${progress * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-meta-sm font-mono text-app-muted">
                  <span>{formatTime(currentTime)}</span>
                  <span>-{formatTime(remainingTime)}</span>
                </div>
              </div>

              {/* Main Playback Controls Cluster */}
              <div className="flex items-center justify-between px-2">
                {/* Shuffle */}
                <button
                  onClick={toggleShuffle}
                  aria-label="Toggle shuffle"
                  className={`p-2.5 rounded-full transition-colors ${
                    isShuffled
                      ? 'text-app-accent bg-app-accent/15'
                      : 'text-app-muted hover:text-app-text'
                  }`}
                >
                  <Shuffle size={20} />
                </button>

                {/* Previous */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={prevTrack}
                  aria-label="Previous track"
                  className="p-3 text-app-text hover:text-app-accent transition-colors"
                >
                  <SkipBack size={26} />
                </motion.button>

                {/* Play / Pause Primary Button */}
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="w-16 h-16 rounded-full bg-app-accent text-white flex items-center justify-center shadow-accent-glow hover:brightness-110 active:brightness-95 transition-all"
                >
                  {isPlaying ? (
                    <Pause size={28} fill="currentColor" />
                  ) : (
                    <Play size={28} fill="currentColor" className="ml-1" />
                  )}
                </motion.button>

                {/* Next */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={nextTrack}
                  aria-label="Next track"
                  className="p-3 text-app-text hover:text-app-accent transition-colors"
                >
                  <SkipForward size={26} />
                </motion.button>

                {/* Repeat */}
                <button
                  onClick={toggleRepeat}
                  aria-label="Toggle repeat"
                  className={`p-2.5 rounded-full transition-colors ${
                    repeatMode !== 'off'
                      ? 'text-app-accent bg-app-accent/15'
                      : 'text-app-muted hover:text-app-text'
                  }`}
                >
                  {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                </button>
              </div>

              {/* Secondary Bottom Switcher (Lyrics, Queue, Volume) */}
              <div className="flex items-center justify-between pt-1 border-t border-app-border/40">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setActiveTab((prev) => (prev === 'lyrics' ? 'artwork' : 'lyrics'))
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-chip text-meta font-semibold transition-all ${
                      activeTab === 'lyrics'
                        ? 'bg-app-accent text-white shadow-accent-glow'
                        : 'bg-app-surface text-app-muted hover:text-app-text border border-app-border'
                    }`}
                  >
                    <Mic2 size={15} />
                    <span>Lyrics</span>
                  </button>

                  <button
                    onClick={() =>
                      setActiveTab((prev) => (prev === 'queue' ? 'artwork' : 'queue'))
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-chip text-meta font-semibold transition-all ${
                      activeTab === 'queue'
                        ? 'bg-app-accent text-white shadow-accent-glow'
                        : 'bg-app-surface text-app-muted hover:text-app-text border border-app-border'
                    }`}
                  >
                    <ListMusic size={15} />
                    <span>Queue</span>
                  </button>

                  {currentTrack.youtubeId && (
                    <button
                      onClick={() =>
                        setActiveTab((prev) => (prev === 'video' ? 'artwork' : 'video'))
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-chip text-meta font-semibold transition-all ${
                        activeTab === 'video'
                          ? 'bg-rose-500 text-white shadow-soft-1'
                          : 'bg-app-surface text-app-muted hover:text-app-text border border-app-border'
                      }`}
                    >
                      <Youtube size={15} />
                      <span>Video</span>
                    </button>
                  )}
                </div>

                {/* Volume Slider Control */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                    className="text-app-muted hover:text-app-text transition-colors"
                  >
                    {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-20 accent-app-accent h-1 bg-app-elevated rounded-full cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Track Actions "More" Bottom Sheet */}
      <TrackActionsSheet
        track={currentTrack}
        isOpen={isActionsOpen}
        onClose={() => setIsActionsOpen(false)}
        onStartRoom={onStartRoom}
      />
    </>
  );
};
