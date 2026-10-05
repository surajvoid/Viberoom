import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext.js';
import { useSocket } from '../context/SocketContext.js';
import { ReactionTimelineView } from './ReactionTimelineView.js';
import { SongDedicationRibbon } from './SongDedicationRibbon.js';
import {
  ChevronDown,
  MoreVertical,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Heart,
  Plus,
  Share2,
  Radio,
  ListMusic,
  FileText,
  Gift,
  Video,
} from 'lucide-react';

interface FullPlayerModalProps {
  onOpenListenTogether: () => void;
}

export const FullPlayerModal: React.FC<FullPlayerModalProps> = ({ onOpenListenTogether }) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    seek,
    next,
    prev,
    isFullPlayerOpen,
    closeFullPlayer,
    likedSongs,
    toggleLike,
    currentDedication,
    openDedicateModal,
    isVideoMode,
    toggleVideoMode,
    isLoadingRelated,
  } = useAudio();

  const { activeRoom } = useSocket();
  const [activeTab, setActiveTab] = useState<'player' | 'lyrics'>('player');

  if (!isFullPlayerOpen || !currentSong) return null;

  const isLiked = likedSongs.has(currentSong.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    seek(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md h-full flex flex-col justify-between p-6 overflow-hidden transition-colors duration-700"
        style={{
          backgroundColor: currentSong.dominantColor || '#0c0d10',
          backgroundImage: `radial-gradient(circle at 50% 30%, ${currentSong.dominantColor}CC 0%, #08090B 85%)`,
        }}
      >
        {/* Atmospheric Blur Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/80 pointer-events-none" />

        {/* Top Header Bar */}
        <div className="relative z-10 flex items-center justify-between pt-2">
          <button
            onClick={closeFullPlayer}
            className="w-10 h-10 rounded-full flex items-center justify-center text-content-primary hover:bg-white/10 transition-colors"
          >
            <ChevronDown size={24} />
          </button>

          <div className="text-center">
            <span className="text-[10px] font-mono tracking-widest text-content-muted uppercase">
              {activeRoom ? `IN ROOM • ${activeRoom.title}` : 'NOW PLAYING'}
            </span>
            <div className="text-xs font-medium text-content-secondary tracking-wide">
              {currentSong.album}
            </div>
          </div>

          <button
            onClick={() => setActiveTab(activeTab === 'player' ? 'lyrics' : 'player')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-content-primary hover:bg-white/10 transition-colors"
            title={activeTab === 'player' ? 'View Lyrics' : 'View Artwork'}
          >
            {activeTab === 'player' ? <FileText size={20} /> : <ListMusic size={20} />}
          </button>
        </div>

        {/* Center Content: Artwork or Lyrics */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center my-4 overflow-hidden">
          {activeTab === 'player' ? (
            <div className="w-full flex flex-col items-center">
              {currentSong.youtubeId && (
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-[10px] font-mono uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Real YouTube Stream
                  </span>
                  <button
                    onClick={toggleVideoMode}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider transition-all ${
                      isVideoMode
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-white/10 text-content-secondary hover:text-white border border-white/10'
                    }`}
                  >
                    <Video size={11} />
                    <span>{isVideoMode ? 'Hide Video' : 'Watch Video'}</span>
                  </button>
                </div>
              )}

              {/* Artwork with subtle shadow and rounded corners */}
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/5 transition-transform duration-500 hover:scale-[1.02]">
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  className={`w-full h-full object-cover select-none transition-opacity duration-300 ${
                    isVideoMode ? 'opacity-0' : 'opacity-100'
                  }`}
                />
              </div>

              {/* Reaction Timeline Component */}
              {currentSong.reactionTimeline && (
                <div className="w-full max-w-[310px] mt-3">
                  <ReactionTimelineView
                    timeline={currentSong.reactionTimeline}
                    durationSec={duration}
                    currentSec={currentTime}
                    onSeek={seek}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Synchronized Lyrics View */
            <div className="w-full h-72 overflow-y-auto px-4 py-2 space-y-4 text-center scrollbar-none">
              <div className="text-xs font-mono text-content-muted uppercase tracking-wider mb-2">
                LYRICS
              </div>
              {currentSong.lyrics && currentSong.lyrics.length > 0 ? (
                currentSong.lyrics.map((l, i) => {
                  const currentMs = currentTime * 1000;
                  const isActive =
                    currentMs >= l.timeMs &&
                    (!currentSong.lyrics![i + 1] || currentMs < currentSong.lyrics![i + 1].timeMs);
                  return (
                    <p
                      key={i}
                      onClick={() => seek(l.timeMs / 1000)}
                      className={`cursor-pointer transition-all duration-300 font-serif text-lg leading-snug ${
                        isActive
                          ? 'text-white font-medium scale-105 drop-shadow'
                          : 'text-content-muted hover:text-content-secondary'
                      }`}
                    >
                      {l.text}
                    </p>
                  );
                })
              ) : (
                <p className="text-content-muted text-sm italic">Lyrics not available for this track.</p>
              )}
            </div>
          )}
        </div>

        {/* Bottom Section: Metadata, Scrubber, Minimal Monochrome Controls */}
        <div className="relative z-10 w-full flex flex-col gap-3 pb-4">
          {/* Song Dedication Ribbon (Groic feature) */}
          {currentDedication && currentDedication.song.id === currentSong.id && (
            <SongDedicationRibbon dedication={currentDedication} />
          )}

          {/* Song Title & Artist + Like */}
          <div className="flex items-center justify-between px-1">
            <div className="min-w-0 flex-1 pr-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-content-primary truncate tracking-tight">
                {currentSong.title}
              </h2>
              <p className="text-sm text-content-secondary truncate mt-0.5">
                {currentSong.artist}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => openDedicateModal(currentSong)}
                title="Dedicate this song to someone"
                className="p-2 rounded-full hover:bg-white/10 text-rose-300 hover:text-rose-200 transition-colors"
              >
                <Gift size={20} />
              </button>
              <button
                onClick={() => toggleLike(currentSong.id)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Heart
                  size={22}
                  className={isLiked ? 'fill-red-500 text-red-500' : 'text-content-primary'}
                />
              </button>
            </div>
          </div>

          {/* Scrubber Progress Bar */}
          <div className="w-full flex flex-col gap-1.5 px-1">
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              onChange={handleScrubberChange}
              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white hover:accent-white/90 focus:outline-none transition-all"
            />
            <div className="flex justify-between text-[11px] font-mono text-content-muted">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Monochrome Playback Controls */}
          <div className="flex items-center justify-center gap-8 my-1">
            <button
              onClick={prev}
              className="p-2 text-content-primary/80 hover:text-white transition-colors active:scale-95"
            >
              <SkipBack size={26} className="fill-current" />
            </button>

            <button
              onClick={togglePlayPause}
              className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <Pause size={26} className="fill-current" />
              ) : (
                <Play size={26} className="fill-current ml-1" />
              )}
            </button>

            <button
              onClick={next}
              disabled={isLoadingRelated}
              className={`p-2 text-content-primary/80 hover:text-white transition-colors active:scale-95 ${
                isLoadingRelated ? 'opacity-40 animate-pulse' : ''
              }`}
              title={isLoadingRelated ? 'Finding related songs...' : 'Next track'}
            >
              <SkipForward size={26} className="fill-current" />
            </button>
          </div>

          {isLoadingRelated && (
            <div className="text-center text-[10px] font-mono text-emerald-400 animate-pulse py-0.5">
              Finding related song on YouTube...
            </div>
          )}

          {/* Groic Dual CTAs: Listen Together & Dedicate */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            <button
              onClick={() => {
                closeFullPlayer();
                onOpenListenTogether();
              }}
              className="py-3 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.99] border border-white/10 flex items-center justify-center gap-2 text-content-primary transition-all shadow-md group text-xs font-semibold"
            >
              <Radio size={15} className="text-content-primary animate-pulse flex-shrink-0" />
              <span className="truncate">
                {activeRoom ? `Room: ${activeRoom.title}` : '🎧 Listen Together'}
              </span>
            </button>

            <button
              onClick={() => openDedicateModal(currentSong)}
              className="py-3 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 active:scale-[0.99] border border-rose-500/30 flex items-center justify-center gap-2 text-rose-200 transition-all shadow-md group text-xs font-semibold"
            >
              <Gift size={15} className="text-rose-300 flex-shrink-0" />
              <span>💌 Dedicate Track</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
