import React, { useState } from 'react';
import { SongDedication } from '../types/index.js';
import { Heart, Sparkles } from 'lucide-react';

interface SongDedicationRibbonProps {
  dedication: SongDedication;
  size?: 'sm' | 'md';
}

export const SongDedicationRibbon: React.FC<SongDedicationRibbonProps> = ({
  dedication,
  size = 'md',
}) => {
  const [likes, setLikes] = useState(dedication.likesCount || 1);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
    }
  };

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/40 border border-rose-800/40 text-[10px] text-rose-200 select-none">
        <Heart size={10} className="fill-current text-rose-400" />
        <span className="truncate max-w-[200px]">
          Dedicated to <span className="font-semibold text-rose-100">{dedication.toUserName}</span>: "{dedication.message}"
        </span>
      </div>
    );
  }

  return (
    <div className="w-full my-2 p-2.5 rounded-2xl bg-gradient-to-r from-rose-950/50 via-surface-secondary/70 to-surface-secondary border border-rose-900/30 flex items-center justify-between gap-2 shadow-sm select-none animate-in fade-in">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
          <Heart size={13} className="fill-current" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-mono uppercase tracking-wider text-rose-300/80">
            DEDICATED TO {dedication.toUserName} BY {dedication.fromUser?.name || 'Someone'}
          </div>
          <div className="text-xs text-content-primary italic truncate mt-0.5">
            "{dedication.message}"
          </div>
        </div>
      </div>

      <button
        onClick={handleLike}
        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-mono border transition-all ${
          hasLiked
            ? 'bg-rose-500/30 border-rose-500 text-rose-200'
            : 'bg-surface-primary/60 border-border-subtle text-content-muted hover:text-rose-300'
        }`}
      >
        <Heart size={10} className={hasLiked ? 'fill-current' : ''} />
        <span>{likes}</span>
      </button>
    </div>
  );
};
