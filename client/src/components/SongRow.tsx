import React from 'react';
import { Song } from '../types/index.js';
import { useAudio } from '../context/AudioContext.js';
import { Play, Pause, Heart, Radio } from 'lucide-react';

interface SongRowProps {
  song: Song;
  index: number;
  playlistContext?: Song[];
  showCover?: boolean;
  onOpenRoomForSong?: (song: Song) => void;
}

export const SongRow: React.FC<SongRowProps> = ({
  song,
  index,
  playlistContext,
  showCover = false,
  onOpenRoomForSong,
}) => {
  const { currentSong, isPlaying, playSong, togglePlayPause, likedSongs, toggleLike } = useAudio();
  const isCurrent = currentSong?.id === song.id;
  const isCurrentlyPlaying = isCurrent && isPlaying;
  const isLiked = likedSongs.has(song.id);

  const formatIndex = (num: number) => (num < 10 ? `0${num}` : `${num}`);

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else {
      playSong(song, playlistContext);
    }
  };

  return (
    <div
      onClick={handlePlayClick}
      className={`group flex items-center justify-between py-3 px-3 rounded-lg cursor-pointer transition-all duration-150 select-none ${
        isCurrent ? 'bg-surface-secondary/80' : 'hover:bg-surface-primary/60'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Index or Play icon */}
        <div className="w-6 flex items-center justify-center text-xs font-mono text-content-muted flex-shrink-0">
          {isCurrentlyPlaying ? (
            <div className="flex items-end gap-[2px] h-3.5">
              <span className="w-[3px] h-full bg-content-primary animate-pulse" />
              <span className="w-[3px] h-2/3 bg-content-primary animate-pulse delay-75" />
              <span className="w-[3px] h-4/5 bg-content-primary animate-pulse delay-150" />
            </div>
          ) : (
            <span className="group-hover:hidden">{formatIndex(index + 1)}</span>
          )}
          {!isCurrentlyPlaying && (
            <Play
              size={14}
              className="hidden group-hover:block text-content-primary fill-content-primary"
            />
          )}
        </div>

        {/* Optional Cover */}
        {showCover && (
          <img
            src={song.coverUrl}
            alt={song.title}
            className="w-10 h-10 rounded object-cover flex-shrink-0 bg-surface-secondary"
          />
        )}

        {/* Title & Artist */}
        <div className="min-w-0 flex-1">
          <div
            className={`text-sm font-medium truncate leading-tight flex items-center gap-1.5 ${
              isCurrent ? 'text-white' : 'text-content-primary'
            }`}
          >
            <span className="truncate">{song.title}</span>
            {song.youtubeId && (
              <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 flex-shrink-0">
                YouTube
              </span>
            )}
          </div>
          <div className="text-xs text-content-secondary truncate mt-0.5">
            {song.artist}
          </div>
        </div>
      </div>

      {/* Right Actions: Listen Together shortcut, Like, Duration */}
      <div className="flex items-center gap-3 flex-shrink-0 ml-2">
        {onOpenRoomForSong && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenRoomForSong(song);
            }}
            title="Listen Together"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-surface-tertiary text-content-secondary hover:text-content-primary"
          >
            <Radio size={14} />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(song.id);
          }}
          className={`p-1.5 rounded-full transition-colors ${
            isLiked ? 'text-red-500 fill-red-500' : 'text-content-muted hover:text-content-primary'
          }`}
        >
          <Heart size={14} className={isLiked ? 'fill-current text-red-500' : ''} />
        </button>

        <span className="text-xs font-mono text-content-muted">
          {formatDuration(song.durationSec)}
        </span>
      </div>
    </div>
  );
};
