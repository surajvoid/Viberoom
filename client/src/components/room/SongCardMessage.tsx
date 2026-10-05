import React from 'react';
import { Play, Plus, Heart, Disc3 } from 'lucide-react';
import { Track } from '../../mockData.js';
import { Artwork } from '../ui/Artwork.js';
import { usePlayer } from '../../context/PlayerContext.js';
import { useRoom } from '../../context/RoomContext.js';

export const SongCardMessage: React.FC<{ track: Track }> = ({ track }) => {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const { suggestSong, sendReaction } = useRoom();

  const isCurrent = currentTrack?.id === track.id;

  return (
    <div className="w-full max-w-xs rounded-card p-3 bg-app-elevated/90 border border-app-border shadow-soft-1 space-y-2.5 my-1">
      <div className="flex items-center gap-3">
        <Artwork
          src={track.artworkSvg}
          alt={track.title}
          size="sm"
          rounded="chip"
          isPlaying={isCurrent && isPlaying}
        />
        <div className="min-w-0 flex-1">
          <p className="text-body font-bold text-app-text truncate">{track.title}</p>
          <p className="text-meta-sm text-app-muted truncate">{track.artist}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-app-border/40">
        <button
          onClick={() => playTrack(track)}
          className={`flex-1 py-1.5 px-2.5 rounded-chip text-meta-sm font-semibold flex items-center justify-center gap-1.5 transition-colors ${
            isCurrent && isPlaying
              ? 'bg-app-accent text-white shadow-accent-glow'
              : 'bg-app-surface text-app-text hover:bg-app-border'
          }`}
        >
          {isCurrent && isPlaying ? (
            <>
              <Disc3 size={13} className="animate-spin" />
              <span>Playing</span>
            </>
          ) : (
            <>
              <Play size={13} fill="currentColor" />
              <span>Play</span>
            </>
          )}
        </button>

        <button
          onClick={() => suggestSong(track)}
          title="Add to room queue"
          className="p-1.5 rounded-chip bg-app-surface hover:bg-app-border text-app-text transition-colors"
        >
          <Plus size={15} />
        </button>

        <button
          onClick={() => sendReaction('❤️')}
          title="Love this track"
          className="p-1.5 rounded-chip bg-app-surface hover:bg-app-border text-rose-500 transition-colors"
        >
          <Heart size={15} />
        </button>
      </div>
    </div>
  );
};
