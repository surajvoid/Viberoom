import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Heart, Users, Sparkles, Youtube } from 'lucide-react';
import { Artist, Track } from '../../mockData.js';
import { Artwork } from '../ui/Artwork.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { usePlayer } from '../../context/PlayerContext.js';
import { searchYouTube } from '../../services/searchService.js';

interface ArtistDetailModalProps {
  artist: Artist | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ArtistDetailModal: React.FC<ArtistDetailModalProps> = ({
  artist,
  isOpen,
  onClose,
}) => {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [artistTracks, setArtistTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (artist?.name && isOpen) {
      setIsLoading(true);
      searchYouTube(`${artist.name} songs`)
        .then((tracks) => {
          if (tracks && tracks.length > 0) {
            setArtistTracks(tracks.slice(0, 10));
          }
        })
        .catch((err) => console.warn('Artist tracks load notice:', err))
        .finally(() => setIsLoading(false));
    }
  }, [artist?.name, isOpen]);

  if (!isOpen || !artist) return null;

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
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-app-muted hover:text-app-text rounded-full hover:bg-app-elevated transition-colors z-20"
          >
            <X size={20} />
          </button>

          {/* Artist Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-app-border shrink-0 text-center sm:text-left">
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl border-2 border-app-accent shrink-0">
              <img
                src={artist.artworkSvg}
                alt={artist.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <Badge variant="accent">
                  <Sparkles size={12} className="inline mr-1" />
                  Verified Artist
                </Badge>
                <span className="text-meta-sm text-app-muted">
                  {(artist.monthlyListeners / 1000000).toFixed(1)}M Monthly Listeners
                </span>
              </div>

              <h2 className="text-section-heading sm:text-page-title font-extrabold text-app-text tracking-tight">
                {artist.name}
              </h2>
              <p className="text-meta text-app-muted max-w-md">{artist.bio}</p>

              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
                {artist.genres.map((g) => (
                  <span
                    key={g}
                    className="text-meta-sm px-2.5 py-0.5 rounded-full bg-app-elevated border border-app-border text-app-text font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Top Tracks Section */}
          <div className="flex-1 overflow-y-auto py-3 space-y-2 scrollbar-none">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-meta font-bold uppercase tracking-wider text-app-muted">
                Popular Tracks on YouTube
              </h4>
              <span className="text-[11px] text-app-accent font-semibold flex items-center gap-1">
                <Youtube size={12} /> Live Sync
              </span>
            </div>

            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-chip bg-app-elevated/40 animate-pulse border border-app-border" />
              ))
            ) : artistTracks.length === 0 ? (
              <p className="text-meta text-app-muted text-center py-6">No tracks loaded yet.</p>
            ) : (
              artistTracks.map((track, idx) => {
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className={`flex items-center justify-between p-2.5 rounded-chip cursor-pointer transition-colors group ${
                      isCurrent
                        ? 'bg-app-elevated border border-app-accent'
                        : 'hover:bg-app-elevated/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <span className="text-meta-sm font-mono font-bold text-app-muted w-4 text-center">
                        {idx + 1}
                      </span>
                      {track.coverUrl ? (
                        <div className="w-9 h-9 rounded-chip overflow-hidden shrink-0">
                          <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <Artwork
                          src={track.artworkSvg}
                          alt={track.title}
                          size="xs"
                          rounded="chip"
                          isPlaying={isCurrent && isPlaying}
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-body font-bold text-app-text truncate group-hover:text-app-accent transition-colors">
                          {track.title}
                        </p>
                        <p className="text-meta-sm text-app-muted truncate">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant={isCurrent && isPlaying ? 'primary' : 'ghost'}
                      size="sm"
                      icon={<Play size={14} fill="currentColor" />}
                    >
                      {isCurrent && isPlaying ? 'Playing' : 'Play'}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
