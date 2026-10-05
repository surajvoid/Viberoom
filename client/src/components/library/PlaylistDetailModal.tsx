import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Shuffle, Heart, Plus, Clock, Share2 } from 'lucide-react';
import { Playlist, MOCK_TRACKS, Track } from '../../mockData.js';
import { Artwork } from '../ui/Artwork.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { usePlayer } from '../../context/PlayerContext.js';

interface PlaylistDetailModalProps {
  playlist: Playlist | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PlaylistDetailModal: React.FC<PlaylistDetailModalProps> = ({
  playlist,
  isOpen,
  onClose,
}) => {
  const { playTrack, currentTrack, isPlaying, isLiked, toggleLike, addToQueue } = usePlayer();

  if (!isOpen || !playlist) return null;

  const tracks: Track[] = playlist.trackIds
    .map((id) => MOCK_TRACKS.find((t) => t.id === id))
    .filter((t): t is Track => Boolean(t));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-2xl h-full sm:h-[88vh] bg-app-surface border border-app-border rounded-t-hero sm:rounded-hero p-5 sm:p-7 shadow-2xl z-10 flex flex-col overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-app-muted hover:text-app-text rounded-full hover:bg-app-elevated transition-colors z-20"
          >
            <X size={20} />
          </button>

          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-app-border shrink-0 text-center sm:text-left">
            <div className="w-36 h-36 shrink-0 shadow-2xl">
              <Artwork
                src={playlist.artworkSvg}
                alt={playlist.title}
                size="hero"
                rounded="card"
                glowColor={playlist.accentColor}
              />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Badge variant={playlist.isCurated ? 'accent' : 'default'}>
                  {playlist.isCurated ? 'Editorial Playlist' : 'Custom Mix'}
                </Badge>
                <span className="text-meta-sm text-app-muted">
                  {tracks.length} songs • ~{tracks.length * 3} min
                </span>
              </div>

              <h2 className="text-section-heading sm:text-page-title font-extrabold text-app-text tracking-tight">
                {playlist.title}
              </h2>
              <p className="text-meta text-app-muted max-w-md">{playlist.description}</p>
              <p className="text-meta-sm text-app-muted">
                Created by <strong className="text-app-text">{playlist.creator}</strong>
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  icon={<Play size={16} fill="currentColor" />}
                  onClick={() => tracks[0] && playTrack(tracks[0])}
                >
                  Play All
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  icon={<Shuffle size={16} />}
                  onClick={() => {
                    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
                    if (shuffled[0]) playTrack(shuffled[0]);
                  }}
                >
                  Shuffle
                </Button>
              </div>
            </div>
          </div>

          {/* Song List */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2 scrollbar-none">
            {tracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;
              const liked = isLiked(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`flex items-center justify-between p-2.5 rounded-chip cursor-pointer transition-colors group ${
                    isCurrent
                      ? 'bg-app-elevated border border-app-accent shadow-sm'
                      : 'hover:bg-app-elevated/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <span className="text-meta-sm font-mono font-bold text-app-muted w-4 text-center">
                      {idx + 1}
                    </span>
                    <Artwork
                      src={track.artworkSvg}
                      alt={track.title}
                      size="xs"
                      rounded="chip"
                      isPlaying={isCurrent && isPlaying}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-body font-bold text-app-text truncate group-hover:text-app-accent transition-colors">
                        {track.title}
                      </p>
                      <p className="text-meta-sm text-app-muted truncate">{track.artist}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(track.id);
                      }}
                      className="p-1.5 text-app-muted hover:text-rose-500 transition-colors"
                    >
                      <Heart
                        size={16}
                        className={liked ? 'text-rose-500 fill-rose-500' : ''}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToQueue(track);
                      }}
                      title="Add to queue"
                      className="p-1.5 text-app-muted hover:text-app-text transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                    <span className="text-meta-sm font-mono text-app-muted hidden sm:inline">
                      {track.duration}s
                    </span>
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
