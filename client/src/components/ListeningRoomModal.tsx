import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext.js';
import { useAudio } from '../context/AudioContext.js';
import { useUser } from '../context/UserContext.js';
import { FloatingReactionsView } from './FloatingReactionsView.js';
import { ReactionTimelineView } from './ReactionTimelineView.js';
import {
  X,
  Share2,
  Copy,
  Check,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Send,
  Sparkles,
  Users,
  Radio,
  Image as ImageIcon,
} from 'lucide-react';

interface ListeningRoomModalProps {
  onClose: () => void;
}

export const ListeningRoomModal: React.FC<ListeningRoomModalProps> = ({ onClose }) => {
  const {
    activeRoom,
    sendMessage,
    sendReaction,
    setTyping,
    typingUsers,
    emitPlay,
    emitPause,
    emitSeek,
    emitChangeSong,
    leaveRoom,
  } = useSocket();

  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    togglePlayPause,
    seek,
    next,
    prev,
  } = useAudio();

  const { currentUser } = useUser();
  const [chatText, setChatText] = useState('');
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<any>(null);

  // Auto scroll chat to bottom on new message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [activeRoom?.messages?.length]);

  if (!activeRoom) return null;

  const activeSong = activeRoom.currentSong || currentSong;
  const isHost = activeRoom.hostId === currentUser.id;
  const canControl = activeRoom.controlMode === 'everyone' || isHost;

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatText(e.target.value);
    setTyping(true);

    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setTyping(false);
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatText.trim()) return;
    sendMessage(chatText.trim());
    setChatText('');
    setTyping(false);
  };

  const handleSendGif = (gifUrl: string) => {
    sendMessage(undefined, gifUrl);
    setShowGifPicker(false);
  };

  const roomCode = activeRoom.code || activeRoom.id.replace(/^room-/, '').slice(-4);

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
  };

  const handlePlayPause = () => {
    if (!canControl) return;
    if (isPlaying) {
      emitPause(Math.floor(currentTime * 1000));
    } else {
      emitPlay(Math.floor(currentTime * 1000));
    }
  };

  const handleScrubber = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canControl) return;
    const sec = parseFloat(e.target.value);
    seek(sec);
    emitSeek(Math.floor(sec * 1000));
  };

  const curatedGifs = [
    'https://media.giphy.com/media/blSTtZehjAZ8I/giphy.gif',
    'https://media.giphy.com/media/l41lI4bYmcsPJX9Go/giphy.gif',
    'https://media.giphy.com/media/3o7TKoWXm3okO1kgHC/giphy.gif',
    'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-md h-full flex flex-col justify-between bg-surface-primary border-x border-border-subtle overflow-hidden">
        {/* Ambient Top Glow from Album Artwork */}
        <div
          className="absolute top-0 inset-x-0 h-64 opacity-25 blur-3xl pointer-events-none transition-colors duration-700"
          style={{ backgroundColor: activeSong?.dominantColor || '#331B22' }}
        />

        {/* Floating Reactions Overlay */}
        <FloatingReactionsView reactions={activeRoom.reactions || []} />

        {/* Top Room Header */}
        <div className="relative z-10 px-4 pt-3 pb-2 border-b border-border-subtle/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                leaveRoom();
                onClose();
              }}
              className="p-2 rounded-full hover:bg-surface-secondary text-content-secondary hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h1 className="text-xs font-mono uppercase tracking-widest text-content-primary">
                  {activeRoom.title}
                </h1>
              </div>
              <span className="text-[10px] text-content-muted tracking-wide uppercase font-mono">
                Code: <span className="font-bold text-emerald-400">{roomCode}</span> • {canControl ? 'Synced' : 'Host controls'}
              </span>
            </div>
          </div>

          {/* Copy Room Code Button (Groic feature) */}
          <button
            onClick={handleCopyInvite}
            title="Copy 4-digit code to invite friends"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-secondary hover:bg-surface-tertiary border border-border-highlight text-xs text-content-primary transition-all active:scale-95 shadow-sm"
          >
            {copiedInvite ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            <span className="text-[11px] font-mono font-bold text-emerald-300">
              {copiedInvite ? 'Copied!' : `Code: ${roomCode}`}
            </span>
          </button>
        </div>

        {/* Lounge Participants Bar */}
        <div className="relative z-10 px-4 py-2 bg-surface-secondary/40 border-b border-border-subtle/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-content-muted" />
            <span className="text-xs text-content-secondary font-medium">In Room:</span>
          </div>

          <div className="flex items-center -space-x-2">
            {activeRoom.members?.map((member, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={member.user.avatarUrl}
                  alt={member.user.name}
                  className="w-7 h-7 rounded-full border-2 border-surface-primary object-cover"
                />
                {member.user.id === activeRoom.hostId && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border border-black flex items-center justify-center text-[7px] font-bold text-black">
                    ★
                  </span>
                )}
                {/* Tooltip */}
                <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-8 left-1/2 -translate-x-1/2 bg-surface-primary border border-border-subtle text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-20 text-content-primary">
                  {member.user.name} {member.user.id === activeRoom.hostId ? '(Host)' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Synchronized Artwork & Song Metadata */}
        <div className="relative z-10 flex flex-col items-center px-6 py-3">
          {activeSong?.youtubeId && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600/20 border border-red-500/30 text-red-400 text-[10px] font-mono uppercase tracking-wider mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Synced YouTube Music
            </span>
          )}
          <div className="relative w-36 h-36 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/5 my-1">
            <img
              src={activeSong?.coverUrl}
              alt={activeSong?.title}
              className="w-full h-full object-cover select-none"
            />
          </div>

          <div className="text-center mt-2 w-full">
            <h2 className="text-base font-semibold text-content-primary truncate">
              {activeSong?.title}
            </h2>
            <p className="text-xs text-content-secondary truncate mt-0.5">
              {activeSong?.artist}
            </p>
          </div>

          {/* Reaction Timeline with jump pins */}
          {activeSong?.reactionTimeline && (
            <div className="w-full mt-1">
              <ReactionTimelineView
                timeline={activeSong.reactionTimeline}
                durationSec={duration}
                currentSec={currentTime}
                onSeek={(sec) => {
                  if (canControl) {
                    seek(sec);
                    emitSeek(Math.floor(sec * 1000));
                  }
                }}
              />
            </div>
          )}

          {/* Scrubber */}
          <div className="w-full flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono text-content-muted">
              {Math.floor(currentTime / 60)}:
              {Math.floor(currentTime % 60).toString().padStart(2, '0')}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.5}
              value={currentTime}
              disabled={!canControl}
              onChange={handleScrubber}
              className={`flex-1 h-1 bg-white/20 rounded-lg appearance-none accent-white ${
                canControl ? 'cursor-pointer hover:accent-white/90' : 'cursor-not-allowed opacity-60'
              }`}
            />
            <span className="text-[10px] font-mono text-content-muted">
              {Math.floor(duration / 60)}:
              {Math.floor(duration % 60).toString().padStart(2, '0')}
            </span>
          </div>

          {/* Synchronized Playback Controls */}
          <div className="flex items-center gap-6 mt-2">
            <button
              onClick={() => {
                if (canControl) {
                  prev();
                  emitSeek(0);
                }
              }}
              disabled={!canControl}
              className={`text-content-secondary hover:text-white transition-colors ${
                !canControl && 'opacity-40 cursor-not-allowed'
              }`}
            >
              <SkipBack size={20} className="fill-current" />
            </button>

            <button
              onClick={handlePlayPause}
              disabled={!canControl}
              className={`w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg ${
                !canControl && 'opacity-60 cursor-not-allowed'
              }`}
            >
              {isPlaying ? (
                <Pause size={18} className="fill-current" />
              ) : (
                <Play size={18} className="fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                if (canControl) {
                  next();
                }
              }}
              disabled={!canControl}
              className={`text-content-secondary hover:text-white transition-colors ${
                !canControl && 'opacity-40 cursor-not-allowed'
              }`}
            >
              <SkipForward size={20} className="fill-current" />
            </button>
          </div>
        </div>

        {/* Live Chat Pane */}
        <div className="relative z-10 flex-1 flex flex-col min-h-0 bg-surface-primary/70 border-t border-border-subtle/50">
          <div className="px-4 py-1.5 border-b border-border-subtle/30 flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-content-muted">
              LIVE CHAT
            </span>
            {typingUsers.length > 0 && (
              <span className="text-[11px] text-content-secondary italic animate-pulse">
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
              </span>
            )}
          </div>

          {/* Messages Scroll Area */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto px-4 py-2 space-y-2.5 text-xs scrollbar-none"
          >
            {activeRoom.messages?.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-content-muted text-center py-4">
                <Sparkles size={20} className="mb-1 opacity-50" />
                <p>Welcome to the listening room.</p>
                <p className="text-[11px]">Send a message or react to the music.</p>
              </div>
            ) : (
              activeRoom.messages?.map((msg) => {
                const isMe = msg.user.id === currentUser.id;
                const isSystem = msg.type === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="text-center text-[10px] text-content-muted py-0.5">
                      <span className="font-semibold text-content-secondary">{msg.user.name}</span>{' '}
                      {msg.text}
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <img
                      src={msg.user.avatarUrl}
                      alt={msg.user.name}
                      className="w-5 h-5 rounded-full object-cover flex-shrink-0 mt-0.5"
                    />
                    <div className={`max-w-[78%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[9px] text-content-muted tracking-wider mb-0.5">
                        {msg.user.name}
                      </span>
                      {msg.text && (
                        <div
                          className={`px-3 py-1.5 rounded-2xl ${
                            isMe
                              ? 'bg-content-primary text-background font-medium rounded-tr-none'
                              : 'bg-surface-secondary text-content-primary border border-border-subtle rounded-tl-none'
                          }`}
                        >
                          {msg.text}
                        </div>
                      )}
                      {msg.gifUrl && (
                        <img
                          src={msg.gifUrl}
                          alt="GIF"
                          className="w-36 h-28 object-cover rounded-xl mt-1 border border-border-subtle"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Reaction Bar */}
          <div className="px-4 py-1.5 bg-surface-secondary/30 border-t border-border-subtle/30 flex items-center justify-around">
            {['😂', '❤️', '🔥', '😭', '✨'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                className="text-xl p-1.5 rounded-full hover:bg-surface-tertiary active:scale-125 transition-transform"
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
            <button
              onClick={() => setShowGifPicker(!showGifPicker)}
              className={`p-1.5 rounded-full transition-colors ${
                showGifPicker ? 'bg-surface-tertiary text-white' : 'text-content-muted hover:text-white'
              }`}
              title="Share GIF"
            >
              <ImageIcon size={18} />
            </button>
          </div>

          {/* GIF Picker Tray */}
          {showGifPicker && (
            <div className="p-2 bg-surface-secondary border-t border-border-subtle flex gap-2 overflow-x-auto">
              {curatedGifs.map((gif, idx) => (
                <img
                  key={idx}
                  src={gif}
                  alt="GIF option"
                  onClick={() => handleSendGif(gif)}
                  className="w-20 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 flex-shrink-0 border border-border-subtle"
                />
              ))}
            </div>
          )}

          {/* Input Box */}
          <form onSubmit={handleSendMessage} className="p-3 bg-surface-primary flex items-center gap-2">
            <input
              type="text"
              value={chatText}
              onChange={handleTextChange}
              placeholder="Say something..."
              className="flex-1 bg-surface-secondary border border-border-subtle rounded-full px-4 py-2 text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-border-highlight"
            />
            <button
              type="submit"
              disabled={!chatText.trim()}
              className="w-8 h-8 rounded-full bg-content-primary text-background flex items-center justify-center hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Send size={14} className="ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
