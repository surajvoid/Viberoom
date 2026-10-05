import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Music, Youtube, Loader2 } from 'lucide-react';
import { Track } from '../../mockData.js';
import { Artwork } from '../ui/Artwork.js';
import { Button } from '../ui/Button.js';
import { useRoom } from '../../context/RoomContext.js';
import { searchYouTube } from '../../services/searchService.js';
import { MOCK_TRACKS } from '../../mockData.js';

export const SuggestSongModal: React.FC = () => {
  const { isSuggestModalOpen, setIsSuggestModalOpen, suggestSong } = useRoom();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      searchYouTube('popular hits')
        .then((found) => setResults(found.slice(0, 8)))
        .catch(() => {});
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const found = await searchYouTube(query);
        setResults(found);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSuggestModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsSuggestModalOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-lg bg-app-surface border border-app-border rounded-t-hero sm:rounded-hero p-5 shadow-2xl z-10 space-y-4 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-app-border shrink-0">
            <div>
              <h3 className="text-section-heading font-extrabold text-app-text">
                Suggest Song to Queue
              </h3>
              <p className="text-meta-sm text-app-muted">
                Participants will vote on whether to play this next!
              </p>
            </div>
            <button
              onClick={() => setIsSuggestModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-app-elevated text-app-muted hover:text-app-text transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Field */}
          <div className="relative shrink-0">
            <Search size={18} className="absolute left-3.5 top-3.5 text-app-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, artist or YouTube..."
              className="w-full bg-app-elevated text-app-text placeholder-app-muted pl-10 pr-10 py-2.5 rounded-card border border-app-border focus:border-app-accent focus:outline-none text-body"
            />
            {loading && (
              <Loader2 size={16} className="absolute right-3.5 top-3.5 text-app-accent animate-spin" />
            )}
          </div>

          {/* Song List */}
          <div className="overflow-y-auto flex-1 space-y-2 pr-1 scrollbar-none">
            {results.map((track) => (
              <div
                key={track.id}
                className="flex items-center justify-between p-2.5 rounded-chip bg-app-elevated/50 hover:bg-app-elevated border border-app-border transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {track.coverUrl ? (
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-10 h-10 rounded-chip object-cover shrink-0 shadow-sm"
                    />
                  ) : (
                    <Artwork src={track.artworkSvg} alt={track.title} size="xs" rounded="chip" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-bold text-app-text truncate">{track.title}</p>
                    <div className="flex items-center gap-1.5 text-meta-sm text-app-muted truncate">
                      <span>{track.artist}</span>
                      {track.youtubeId && (
                        <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
                          <Youtube size={10} /> YouTube
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus size={14} />}
                  onClick={() => suggestSong(track)}
                >
                  Suggest
                </Button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
