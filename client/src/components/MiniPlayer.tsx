import React from 'react';
import { useAudio } from '../context/AudioContext.js';
import { useSocket } from '../context/SocketContext.js';
import { Play, Pause, Radio, Users } from 'lucide-react';

export const MiniPlayer: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    togglePlayPause,
    currentTime,
    duration,
    openFullPlayer,
    isRoomOpen,
    currentDedication,
    isRadioMode,
    currentRadioStation,
  } = useAudio();
  const { activeRoom } = useSocket();

  if (!currentSong || isRoomOpen) return null;

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={openFullPlayer}
      className="fixed bottom-[68px] inset-x-0 mx-auto max-w-md px-3 z-40 cursor-pointer select-none"
    >
      <div className="relative overflow-hidden rounded-xl bg-[#141518]/95 backdrop-blur-md border border-border-subtle shadow-2xl p-2.5 flex items-center justify-between transition-transform active:scale-[0.99]">
        {/* Subtle Top Progress Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
          <div
            className="h-full bg-content-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Left: Artwork + Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img
            src={currentSong.coverUrl}
            alt={currentSong.title}
            className="w-10 h-10 rounded-lg object-cover bg-surface-secondary shadow-sm flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-content-primary truncate max-w-[140px]">
                {currentSong.title}
              </span>
              {currentDedication && currentDedication.song.id === currentSong.id && (
                <span className="flex items-center gap-1 text-[9px] font-medium text-rose-300 bg-rose-950/60 border border-rose-800/50 px-1.5 py-0.2 rounded-full">
                  💌 {currentDedication.toUserName}
                </span>
              )}
              {isRadioMode && currentRadioStation && (
                <span className="flex items-center gap-1 text-[9px] font-medium text-amber-300 bg-amber-950/60 border border-amber-800/50 px-1.5 py-0.2 rounded-full font-mono">
                  📻 {currentRadioStation.frequency}
                </span>
              )}
              {activeRoom && (
                <span className="flex items-center gap-1 text-[9px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Synced
                </span>
              )}
            </div>
            <div className="text-[11px] text-content-secondary truncate">
              {isRadioMode && currentRadioStation ? `${currentRadioStation.name} • ${currentSong.artist}` : currentSong.artist}
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          {activeRoom && (
            <div className="flex items-center gap-1 text-xs text-content-secondary mr-1">
              <Users size={13} />
              <span className="text-[11px] font-mono">{activeRoom.members.length || 1}</span>
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            className="w-8 h-8 rounded-full bg-content-primary text-background flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <Pause size={15} className="fill-current" />
            ) : (
              <Play size={15} className="fill-current ml-0.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
