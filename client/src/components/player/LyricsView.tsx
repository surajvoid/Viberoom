import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LyricLine } from '../../mockData.js';
import { usePlayer } from '../../context/PlayerContext.js';

interface LyricsViewProps {
  lyrics: LyricLine[];
  onClose?: () => void;
  className?: string;
}

export const LyricsView: React.FC<LyricsViewProps> = ({
  lyrics,
  className = '',
}) => {
  const { currentTime, duration, seekTo } = usePlayer();
  const activeLineRef = useRef<HTMLDivElement | null>(null);

  // Find index of current lyric line
  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  // Auto-scroll active lyric into center
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  if (!lyrics || lyrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 space-y-2">
        <p className="text-body font-bold text-app-text">No Lyrics Available</p>
        <p className="text-meta text-app-muted">
          Enjoy the instrumental vibes of this soundtrack.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`h-full overflow-y-auto py-8 px-4 sm:px-8 space-y-6 scrollbar-none select-none ${className}`}
    >
      <div className="max-w-lg mx-auto space-y-7">
        {lyrics.map((line, idx) => {
          const isActive = idx === activeIndex;
          const isPassed = idx < activeIndex;

          return (
            <motion.div
              key={idx}
              ref={isActive ? activeLineRef : null}
              onClick={() => {
                const ratio = duration > 0 ? line.time / duration : 0;
                seekTo(ratio);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                cursor-pointer transition-all duration-300 py-1.5 px-3 rounded-chip
                ${
                  isActive
                    ? 'text-app-text font-extrabold text-[24px] sm:text-[28px] leading-tight tracking-tight scale-105 origin-left'
                    : isPassed
                    ? 'text-app-text/30 font-semibold text-[18px] sm:text-[20px] leading-relaxed'
                    : 'text-app-text/45 font-semibold text-[18px] sm:text-[20px] leading-relaxed hover:text-app-text/80'
                }
              `}
            >
              <span
                className={
                  isActive
                    ? 'text-app-accent drop-shadow-[0_2px_12px_var(--app-accent-glow)]'
                    : ''
                }
              >
                {line.text}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
