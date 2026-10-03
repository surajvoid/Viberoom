import React from 'react';
import { MusicMatchData } from '../types/index.js';
import { X, Sparkles, Heart, Radio, Music } from 'lucide-react';
import { EditorialTitle } from './EditorialTitle.js';

interface MusicMatchModalProps {
  data: MusicMatchData;
  onClose: () => void;
  onListenTogether: () => void;
}

export const MusicMatchModal: React.FC<MusicMatchModalProps> = ({
  data,
  onClose,
  onListenTogether,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none p-4">
      <div className="relative w-full max-w-md my-auto rounded-3xl bg-surface-primary border border-border-subtle overflow-hidden p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-secondary text-content-secondary hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Ambient Match Glow */}
        <div className="absolute -top-20 inset-x-0 h-44 bg-rose-500/15 blur-3xl pointer-events-none" />

        {/* Personas Connection */}
        <div className="flex items-center gap-4 my-2 z-10">
          <img
            src={data.user1.avatarUrl}
            alt={data.user1.name}
            className="w-14 h-14 rounded-full border-2 border-border-subtle object-cover shadow-lg"
          />
          <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Heart size={16} className="fill-current" />
          </div>
          <img
            src={data.user2.avatarUrl}
            alt={data.user2.name}
            className="w-14 h-14 rounded-full border-2 border-border-subtle object-cover shadow-lg"
          />
        </div>

        <div className="mt-2 text-xs font-mono uppercase tracking-widest text-content-muted">
          {data.user1.name} × {data.user2.name}
        </div>

        {/* Match Percentage */}
        <div className="my-4">
          <div className="font-serif text-6xl tracking-tight text-content-primary">
            {data.matchPercentage}%
          </div>
          <div className="text-[11px] font-mono tracking-widest uppercase text-content-secondary mt-1">
            Music Match
          </div>
        </div>

        {/* Stats Grid */}
        <div className="w-full grid grid-cols-2 gap-2 my-2 text-left">
          <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle">
            <div className="text-lg font-mono font-bold text-content-primary">
              {data.commonSongCount}
            </div>
            <div className="text-[11px] text-content-muted">Shared Songs</div>
          </div>

          <div className="p-3 rounded-xl bg-surface-secondary border border-border-subtle">
            <div className="text-lg font-mono font-bold text-content-primary">
              {data.commonArtistCount}
            </div>
            <div className="text-[11px] text-content-muted">Shared Artists</div>
          </div>
        </div>

        {/* Shared Artists Pills */}
        <div className="w-full my-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-content-muted mb-2 text-left">
            Common Artists
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.commonArtists.map((artist, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-full bg-surface-secondary/80 border border-border-subtle text-[11px] text-content-primary"
              >
                {artist}
              </span>
            ))}
          </div>
        </div>

        {/* Action: Listen Together */}
        <button
          onClick={() => {
            onClose();
            onListenTogether();
          }}
          className="w-full mt-4 py-3.5 px-4 rounded-xl bg-content-primary text-background font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <Radio size={16} />
          <span>Listen with {data.user2.name} ❤️</span>
        </button>
      </div>
    </div>
  );
};
