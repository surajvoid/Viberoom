import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { MOCK_GIFS } from '../../mockData.js';
import { useRoom } from '../../context/RoomContext.js';

const GIF_CATEGORIES = ['Trending', 'Reactions', 'Dance', 'Hype', 'Music', 'Memes'];

export const GifPickerModal: React.FC = () => {
  const { isGifPickerOpen, setIsGifPickerOpen, sendMessage } = useRoom();
  const [activeCategory, setActiveCategory] = useState('Trending');

  if (!isGifPickerOpen) return null;

  const handleSelectGif = (title: string, svg: string) => {
    sendMessage(`[GIF: ${title}]`, 'gif');
    setIsGifPickerOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsGifPickerOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-md bg-app-surface border border-app-border rounded-t-hero sm:rounded-hero p-5 shadow-2xl z-10 space-y-4 max-h-[75vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-app-border shrink-0">
            <h3 className="text-section-heading font-extrabold text-app-text flex items-center gap-2">
              <Sparkles size={18} className="text-app-accent" />
              <span>GIF Reactions</span>
            </h3>
            <button
              onClick={() => setIsGifPickerOpen(false)}
              className="p-1.5 rounded-full hover:bg-app-elevated text-app-muted hover:text-app-text transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Categories Tab Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
            {GIF_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-chip text-meta-sm font-semibold transition-colors shrink-0 ${
                  activeCategory === cat
                    ? 'bg-app-accent text-white shadow-accent-glow'
                    : 'bg-app-elevated text-app-muted hover:text-app-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Animated GIF Tiles Grid */}
          <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1 scrollbar-none py-1">
            {MOCK_GIFS.map((gif) => (
              <div
                key={gif.id}
                onClick={() => handleSelectGif(gif.title, gif.svg)}
                className="relative rounded-card overflow-hidden bg-app-elevated border border-app-border hover:border-app-accent p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102 active:scale-98 shadow-soft-1"
              >
                <div
                  className="w-16 h-16 flex items-center justify-center animate-bounce duration-1000"
                  dangerouslySetInnerHTML={{ __html: gif.svg }}
                />
                <span className="text-meta-sm font-bold text-app-text text-center">
                  {gif.title}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
