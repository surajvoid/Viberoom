import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ArrowUp, ArrowDown, Plus, Disc3 } from 'lucide-react';
import { Artwork } from '../ui/Artwork.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { usePlayer } from '../../context/PlayerContext.js';
import { MOCK_TRACKS, Track } from '../../mockData.js';

export const QueueView: React.FC<{ onClose?: () => void }> = () => {
  const {
    currentTrack,
    queue,
    similarTracks,
    isAutoplayEnabled,
    toggleAutoplay,
    playTrack,
    removeFromQueue,
    reorderQueue,
    addToQueue,
  } = usePlayer();

  if (!currentTrack) return null;

  // Non-queued similar tracks available to suggest
  const unqueuedTracks = similarTracks.filter(
    (t) => t.id !== currentTrack.id && (!t.youtubeId || t.youtubeId !== currentTrack.youtubeId) && !queue.some((q) => q.id === t.id)
  );

  return (
    <div className="h-full overflow-y-auto px-4 sm:px-6 py-6 space-y-6 scrollbar-none select-none">
      {/* Current Playing Banner */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-meta-sm font-bold text-app-muted uppercase tracking-wider">
            Now Playing
          </span>
          <Badge variant="live">Live Track</Badge>
        </div>

        <div className="flex items-center gap-3.5 p-3 rounded-card bg-app-elevated/80 border border-app-accent/40 shadow-soft-1">
          <Artwork
            src={currentTrack.artworkSvg}
            alt={currentTrack.title}
            size="sm"
            rounded="chip"
            isPlaying={true}
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-body font-bold text-app-text truncate">
              {currentTrack.title}
            </h4>
            <p className="text-meta-sm text-app-accent truncate font-semibold">
              {currentTrack.artist} • {currentTrack.album}
            </p>
          </div>
          <Disc3 size={20} className="text-app-accent animate-spin duration-3000" />
        </div>
      </div>

      {/* Up Next List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-meta-sm font-bold text-app-muted uppercase tracking-wider">
              Up Next ({queue.length})
            </span>
            {isAutoplayEnabled && (
              <Badge variant="accent" className="text-[10px] py-0 px-2 font-mono">
                Auto-Play Similar
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleAutoplay}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-chip border transition-colors ${
                isAutoplayEnabled
                  ? 'bg-app-accent/15 border-app-accent/40 text-app-accent'
                  : 'bg-app-elevated border-app-border text-app-muted'
              }`}
            >
              {isAutoplayEnabled ? 'Autoplay On' : 'Autoplay Off'}
            </button>
            {queue.length > 0 && (
              <span className="text-meta-sm text-app-muted font-mono hidden sm:inline">
                ~{queue.length * 30}s
              </span>
            )}
          </div>
        </div>

        {queue.length === 0 ? (
          <div className="text-center py-6 p-4 rounded-card bg-app-surface/50 border border-app-border space-y-1">
            <p className="text-body font-bold text-app-text">Queue is empty</p>
            <p className="text-meta text-app-muted text-xs">
              Continuous autoplay is active. Similar songs will play automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {queue.map((track: Track, index: number) => (
                <motion.div
                  key={track.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  className="flex items-center justify-between p-2.5 rounded-chip bg-app-surface hover:bg-app-elevated border border-app-border transition-colors group"
                >
                  <div
                    onClick={() => playTrack(track)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <span className="text-meta-sm font-bold text-app-muted w-4 font-mono">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <Artwork
                      src={track.artworkSvg}
                      alt={track.title}
                      size="xs"
                      rounded="chip"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-body font-bold text-app-text truncate group-hover:text-app-accent transition-colors">
                        {track.title}
                      </p>
                      <p className="text-meta-sm text-app-muted truncate">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Reorder & Remove */}
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {index > 0 && (
                      <button
                        onClick={() => reorderQueue(index, index - 1)}
                        title="Move Up"
                        className="p-1 text-app-muted hover:text-app-text rounded hover:bg-app-elevated transition-colors"
                      >
                        <ArrowUp size={14} />
                      </button>
                    )}
                    {index < queue.length - 1 && (
                      <button
                        onClick={() => reorderQueue(index, index + 1)}
                        title="Move Down"
                        className="p-1 text-app-muted hover:text-app-text rounded hover:bg-app-elevated transition-colors"
                      >
                        <ArrowDown size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => removeFromQueue(track.id)}
                      title="Remove from queue"
                      className="p-1 text-app-muted hover:text-rose-500 rounded hover:bg-app-elevated transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Suggested to Add */}
      {unqueuedTracks.length > 0 && (
        <div className="space-y-3 pt-2">
          <span className="text-meta-sm font-bold text-app-muted uppercase tracking-wider">
            Similar Recommendations
          </span>
          <div className="space-y-2">
            {unqueuedTracks.slice(0, 3).map((track: Track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-2.5 rounded-chip bg-app-surface/60 border border-app-border"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Artwork
                    src={track.artworkSvg}
                    alt={track.title}
                    size="xs"
                    rounded="chip"
                  />
                  <div className="min-w-0">
                    <p className="text-body font-semibold text-app-text truncate">
                      {track.title}
                    </p>
                    <p className="text-meta-sm text-app-muted truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() => addToQueue(track)}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
