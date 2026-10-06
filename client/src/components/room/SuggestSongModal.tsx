import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, Plus, ListPlus, X, Youtube, Loader2, Music2 } from 'lucide-react';
import { Track } from '../../mockData.js';
import { Artwork } from '../ui/Artwork.js';
import { Button } from '../ui/Button.js';
import { useRoom } from '../../context/RoomContext.js';
import { searchYouTube } from '../../services/searchService.js';

export const SuggestSongModal: React.FC = () => {
  const {
    isSuggestModalOpen,
    setIsSuggestModalOpen,
    playRoomSong,
    playNextSong,
    addToRoomQueue,
  } = useRoom();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const found = await searchYouTube(query.trim());
        setResults(found);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSuggestModalOpen) return null;

  const quickPicks = ['The Weeknd', 'Dua Lipa', 'Lofi Chill', 'Synthwave', 'Arijit Singh', 'Coldplay'];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSuggestModalOpen(false)}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-2xl bg-app-surface border border-app-border rounded-t-hero sm:rounded-hero p-5 shadow-2xl z-10 space-y-4 max-h-[88vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-app-border shrink-0">
            <div>
              <h3 className="text-section-heading font-extrabold text-app-text flex items-center gap-2">
                <Music2 size={20} className="text-app-accent" />
                <span>Search Music</span>
              </h3>
              <p className="text-meta-sm text-app-muted">
                Find songs, artists, albums, or YouTube tracks to play together.
              </p>
            </div>
            <button
              onClick={() => setIsSuggestModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-app-elevated text-app-muted hover:text-app-text transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Input Bar */}
          <div className="relative shrink-0">
            <Search size={18} className="absolute left-3.5 top-3.5 text-app-muted" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search songs, artists, albums, or YouTube..."
              className="w-full bg-app-elevated text-app-text placeholder-app-muted pl-10 pr-10 py-3 rounded-card border border-app-border focus:border-app-accent focus:outline-none text-body font-medium"
            />
            {loading && (
              <Loader2 size={18} className="absolute right-3.5 top-3.5 text-app-accent animate-spin" />
            )}
            {query && !loading && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 top-3.5 text-app-muted hover:text-app-text"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="overflow-y-auto flex-1 space-y-2.5 pr-1 scrollbar-none min-h-[220px]">
            {!query.trim() ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-app-elevated flex items-center justify-center mx-auto text-app-muted">
                  <Search size={22} />
                </div>
                <div className="space-y-1">
                  <p className="text-body font-bold text-app-text">
                    Search for something to listen to together
                  </p>
                  <p className="text-meta-sm text-app-muted">
                    Enter any song title, artist, album, or YouTube link
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-meta-sm text-app-muted mb-2 font-semibold">Try searching:</p>
                  <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                    {quickPicks.map((pick) => (
                      <button
                        key={pick}
                        onClick={() => setQuery(pick)}
                        className="px-3 py-1.5 rounded-chip bg-app-elevated hover:bg-app-accent/20 hover:text-app-accent text-meta text-app-text border border-app-border transition-colors font-medium"
                      >
                        {pick}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : results.length === 0 && !loading ? (
              <div className="py-12 text-center text-app-muted">
                <p className="text-body font-bold text-app-text">No tracks found</p>
                <p className="text-meta-sm mt-1">Try another search term or paste a YouTube title</p>
              </div>
            ) : (
              results.map((track) => (
                <div
                  key={track.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-card bg-app-elevated/60 hover:bg-app-elevated border border-app-border transition-colors gap-3"
                >
                  {/* Track Info */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-12 h-12 rounded-card object-cover shrink-0 shadow-sm"
                      />
                    ) : (
                      <Artwork src={track.artworkSvg} alt={track.title} size="xs" rounded="chip" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-body font-bold text-app-text truncate">{track.title}</p>
                      <div className="flex items-center gap-2 text-meta-sm text-app-muted truncate mt-0.5">
                        <span className="truncate">{track.artist}</span>
                        {track.youtubeId && (
                          <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5 shrink-0">
                            <Youtube size={11} /> YouTube
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 3 Explicit Actions: [ Play Now ] [ Add to Room ] [ Play Next ] */}
                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Play size={13} fill="currentColor" />}
                      onClick={() => playRoomSong(track)}
                      className="text-meta-sm font-bold shadow-accent-glow"
                    >
                      Play Now
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<ListPlus size={14} />}
                      onClick={() => playNextSong(track)}
                      className="text-meta-sm font-medium"
                    >
                      Play Next
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Plus size={14} />}
                      onClick={() => addToRoomQueue(track)}
                      className="text-meta-sm font-medium border border-app-border"
                    >
                      Add to Room
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
