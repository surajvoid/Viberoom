import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Radio,
  Users,
  Vote,
  MessageSquare,
  Sparkles,
  Share2,
  Plus,
  Play,
  Heart,
  ThumbsDown,
  Trash2,
  Send,
  Image as ImageIcon,
  Disc3,
  RefreshCw,
  Crown,
  Settings,
  Flame,
  Music,
} from 'lucide-react';
import { useRoom } from '../../context/RoomContext.js';
import { usePlayer } from '../../context/PlayerContext.js';
import { Artwork } from '../ui/Artwork.js';
import { UserAvatar } from '../ui/UserAvatar.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { Card } from '../ui/Card.js';
import { FloatingReactionsLayer } from './FloatingReactionsLayer.js';
import { SongCardMessage } from './SongCardMessage.js';
import { GifPickerModal } from './GifPickerModal.js';
import { SuggestSongModal } from './SuggestSongModal.js';
import { QueueItem, Track } from '../../mockData.js';
import { useAuth } from '../../context/AuthContext.js';

export const PrivateRoomModal: React.FC = () => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || 'me';
  const {
    activeRoom,
    leaveRoom,
    voteSong,
    removeQueueSong,
    sendMessage,
    sendReaction,
    syncStatus,
    syncNow,
    presenceToast,
    setRoomMode,
    setIsSuggestModalOpen,
    setIsGifPickerOpen,
  } = useRoom();

  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const [activeTab, setActiveTab] = useState<'queue' | 'chat' | 'people'>('queue');
  const [chatInput, setChatInput] = useState('');

  if (!activeRoom) return null;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput.trim(), 'text');
    setChatInput('');
  };

  const reactionEmojis = ['❤️', '🔥', '😭', '⚡', '🎵', '🫶'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-2xl select-none">
      {/* Floating Reaction Bubbles Animation Layer */}
      <FloatingReactionsLayer />

      {/* Main Room Viewport Container */}
      <div className="relative w-full h-full max-w-5xl bg-app-bg border-x border-app-border flex flex-col overflow-hidden shadow-2xl">
        {/* Top Room Header Bar */}
        <header className="px-4 py-3 border-b border-app-border flex items-center justify-between glass-panel shrink-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-chip bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <Radio size={18} className="animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-body sm:text-section-heading font-extrabold text-app-text truncate">
                  {activeRoom.name}
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-app-elevated text-app-muted border border-app-border">
                  #{activeRoom.code}
                </span>
              </div>
              <p className="text-meta-sm text-app-muted truncate hidden sm:block">
                Host: <strong className="text-app-text">{activeRoom.host.name}</strong> • Mode:{' '}
                <span className="capitalize text-app-accent font-semibold">{activeRoom.mode}</span>
              </p>
            </div>
          </div>

          {/* Sync status & Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={syncNow}
              title="Click to force audio resynchronization"
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-chip text-meta-sm font-semibold transition-colors ${
                syncStatus === 'synced'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}
            >
              <RefreshCw
                size={12}
                className={syncStatus === 'syncing' ? 'animate-spin' : ''}
              />
              <span>{syncStatus === 'synced' ? 'SYNCED' : 'SYNC NOW'}</span>
            </button>

            <button
              onClick={leaveRoom}
              className="px-3 py-1.5 rounded-chip bg-app-elevated hover:bg-rose-500/15 hover:text-rose-400 border border-app-border text-meta font-bold transition-colors"
            >
              Leave Room
            </button>
          </div>
        </header>

        {/* Quiet Presence Toast (PRD Section 15) */}
        {presenceToast && (
          <div className="w-full bg-app-accent/15 border-b border-app-accent/30 py-1.5 px-4 text-center text-meta-sm text-app-accent font-semibold animate-fade-in shrink-0">
            {presenceToast}
          </div>
        )}

        {/* Central Layout Body: Responsive Split View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Left Column: Player & Queue (Main on desktop) */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-app-border/40">
            {/* Top: Currently Playing in Room */}
            <div className="p-4 sm:p-6 bg-app-surface/50 border-b border-app-border flex flex-col sm:flex-row items-center gap-4 shrink-0">
              <Artwork
                src={activeRoom.currentTrack?.artworkSvg || ''}
                alt={activeRoom.currentTrack?.title || 'Live Room'}
                size="md"
                rounded="card"
                isPlaying={isPlaying}
                glowColor={activeRoom.currentTrack?.accentColor || '#FF3D81'}
              />

              <div className="min-w-0 flex-1 text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <Badge variant="live">Now Playing</Badge>
                  <span className="text-meta-sm text-app-muted">
                    {activeRoom.participants.length} listening in sync
                  </span>
                </div>
                <h4 className="text-section-heading font-extrabold text-app-text truncate">
                  {activeRoom.currentTrack?.title || 'Waiting for song...'}
                </h4>
                <p className="text-meta font-semibold text-app-accent truncate">
                  {activeRoom.currentTrack?.artist || 'Suggest a track to start'}
                </p>
              </div>

              {/* Floating Reaction Trigger Buttons */}
              <div className="flex items-center gap-1.5 bg-app-elevated/80 p-1.5 rounded-full border border-app-border shrink-0">
                {reactionEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => sendReaction(emoji)}
                    className="w-8 h-8 rounded-full hover:scale-125 active:scale-95 transition-transform flex items-center justify-center text-lg leading-none"
                    title={`Send ${emoji} reaction`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Tab Switcher: Queue | Chat | People */}
            <div className="md:hidden flex items-center border-b border-app-border bg-app-surface/80 p-1 shrink-0">
              <button
                onClick={() => setActiveTab('queue')}
                className={`flex-1 py-2 text-meta font-bold rounded-chip flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === 'queue'
                    ? 'bg-app-elevated text-app-accent'
                    : 'text-app-muted'
                }`}
              >
                <Vote size={15} />
                <span>Queue ({activeRoom.queue.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-2 text-meta font-bold rounded-chip flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-app-elevated text-app-accent'
                    : 'text-app-muted'
                }`}
              >
                <MessageSquare size={15} />
                <span>Chat ({activeRoom.chatMessages.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('people')}
                className={`flex-1 py-2 text-meta font-bold rounded-chip flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === 'people'
                    ? 'bg-app-elevated text-app-accent'
                    : 'text-app-muted'
                }`}
              >
                <Users size={15} />
                <span>People ({activeRoom.participants.length})</span>
              </button>
            </div>

            {/* Queue View (Visible on desktop or when activeTab === 'queue') */}
            <div
              className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-none ${
                activeTab !== 'queue' ? 'hidden md:block' : 'block'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-section-heading font-bold text-app-text flex items-center gap-2">
                    <Vote size={18} className="text-app-accent" />
                    <span>Democratic Queue</span>
                  </h4>
                  <p className="text-meta-sm text-app-muted">
                    Top upvoted songs play next automatically
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus size={15} />}
                  onClick={() => setIsSuggestModalOpen(true)}
                >
                  Suggest Song
                </Button>
              </div>

              {/* Democratic Queue List */}
              {activeRoom.queue.length === 0 ? (
                <div className="text-center py-12 p-6 rounded-card bg-app-surface/60 border border-app-border space-y-2">
                  <Music size={32} className="mx-auto text-app-muted" />
                  <p className="text-body font-bold text-app-text">Queue is empty</p>
                  <p className="text-meta text-app-muted">
                    Suggest a song so participants can vote!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <AnimatePresence>
                    {activeRoom.queue.map((item: QueueItem, index: number) => {
                      const userVoted = item.votedByUserIds?.includes(currentUserId);
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                          className="flex items-center justify-between p-3 rounded-card bg-app-surface hover:bg-app-elevated border border-app-border transition-colors group"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="text-meta-sm font-mono font-bold text-app-muted w-5 text-center">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <Artwork
                              src={item.track.artworkSvg}
                              alt={item.track.title}
                              size="xs"
                              rounded="chip"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-body font-bold text-app-text truncate">
                                {item.track.title}
                              </p>
                              <p className="text-meta-sm text-app-muted truncate">
                                {item.track.artist} • Added by {item.addedBy.name}
                              </p>
                            </div>
                          </div>

                          {/* Democratic Voting Controls */}
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            <div className="flex items-center gap-1 bg-app-elevated px-2 py-1 rounded-chip border border-app-border">
                              <button
                                onClick={() => voteSong(item.id, 'up')}
                                title="Upvote track"
                                className={`p-1 rounded transition-colors ${
                                  userVoted ? 'text-rose-500 fill-rose-500' : 'text-app-muted hover:text-rose-500'
                                }`}
                              >
                                <Heart size={15} fill={userVoted ? 'currentColor' : 'none'} />
                              </button>
                              <span className="text-meta font-extrabold font-mono text-app-text min-w-[20px] text-center">
                                {item.votes}
                              </span>
                              <button
                                onClick={() => voteSong(item.id, 'down')}
                                title="Downvote track"
                                className="p-1 rounded text-app-muted hover:text-app-text transition-colors"
                              >
                                <ThumbsDown size={14} />
                              </button>
                            </div>

                            {item.addedBy.id === currentUserId && (
                              <button
                                onClick={() => removeQueueSong(item.id)}
                                title="Remove your suggestion"
                                className="p-1.5 text-app-muted hover:text-rose-500 rounded transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Chat & Participants (Always visible on desktop, or switched on mobile) */}
          <div
            className={`w-full md:w-80 lg:w-96 flex flex-col bg-app-surface/40 overflow-hidden ${
              activeTab === 'queue' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* If People Tab Selected on Mobile */}
            {activeTab === 'people' ? (
              <div className="p-4 space-y-4 overflow-y-auto flex-1 scrollbar-none">
                <div className="flex items-center justify-between">
                  <h4 className="text-section-heading font-bold text-app-text">
                    Participants ({activeRoom.participants.length})
                  </h4>
                </div>

                <div className="space-y-2">
                  {activeRoom.participants.map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-chip bg-app-elevated border border-app-border"
                    >
                      <div className="flex items-center gap-3">
                        <UserAvatar user={p.user} size="sm" showPresence={true} />
                        <div>
                          <p className="text-body font-bold text-app-text">{p.user.name}</p>
                          <p className="text-meta-sm text-app-muted">{p.user.handle}</p>
                        </div>
                      </div>
                      <Badge variant={p.role === 'host' ? 'accent' : 'default'}>
                        {p.role === 'host' && <Crown size={11} className="inline mr-1" />}
                        {p.role.toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>

                {/* Host Mode Controls */}
                <div className="pt-4 border-t border-app-border space-y-2">
                  <span className="text-meta font-bold text-app-text flex items-center gap-1.5">
                    <Settings size={15} />
                    <span>Change Room Mode</span>
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(['democratic', 'dj', 'chill'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setRoomMode(m)}
                        className={`p-2 rounded-chip text-meta-sm font-semibold capitalize border transition-all ${
                          activeRoom.mode === m
                            ? 'bg-app-accent text-white border-app-accent shadow-accent-glow'
                            : 'bg-app-elevated border-app-border text-app-muted hover:text-app-text'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Live Chat Component */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Chat Message Stream */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
                  {activeRoom.chatMessages.map((msg) => {
                    const isMe = msg.sender.id === currentUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-meta-sm font-bold text-app-muted">
                            {msg.sender.name}
                          </span>
                          <span className="text-[10px] text-app-muted/60">{msg.timestamp}</span>
                        </div>

                        {msg.type === 'song_card' && msg.song ? (
                          <SongCardMessage track={msg.song} />
                        ) : msg.type === 'gif' ? (
                          <div className="px-3.5 py-2 rounded-card bg-app-accent/15 border border-app-accent/30 text-app-accent font-bold text-body">
                            {msg.content}
                          </div>
                        ) : (
                          <div
                            className={`px-3.5 py-2 rounded-card text-body font-medium max-w-[85%] ${
                              isMe
                                ? 'bg-app-accent text-white shadow-accent-glow rounded-tr-none'
                                : 'bg-app-elevated text-app-text border border-app-border rounded-tl-none'
                            }`}
                          >
                            {msg.content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={handleSendChat}
                  className="p-3 border-t border-app-border bg-app-surface/80 flex items-center gap-2 shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => setIsGifPickerOpen(true)}
                    className="p-2 text-app-muted hover:text-app-accent rounded-full hover:bg-app-elevated transition-colors"
                    title="Send animated GIF"
                  >
                    <ImageIcon size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      sendMessage(`Listening to "${activeRoom.currentTrack.title}"!`, 'song_card', activeRoom.currentTrack)
                    }
                    className="p-2 text-app-muted hover:text-app-accent rounded-full hover:bg-app-elevated transition-colors"
                    title="Share current song into chat"
                  >
                    <Music size={18} />
                  </button>

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Send a message or drop song..."
                    className="flex-1 bg-app-elevated text-app-text placeholder-app-muted px-3.5 py-2 rounded-chip border border-app-border focus:border-app-accent focus:outline-none text-body"
                  />

                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="p-2 rounded-full bg-app-accent text-white disabled:opacity-40 transition-opacity"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auxiliary Modals for Rooms */}
      <SuggestSongModal />
      <GifPickerModal />
    </div>
  );
};
