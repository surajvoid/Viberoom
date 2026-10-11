import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Radio,
  Users,
  Vote,
  MessageSquare,
  Plus,
  Play,
  Pause,
  SkipForward,
  Sparkles,
  Heart,
  ThumbsDown,
  Trash2,
  Send,
  Image as ImageIcon,
  RefreshCw,
  Crown,
  Settings,
  Music,
  Music2,
  Copy,
  Check,
  Search,
  Youtube,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { useRoom } from '../../context/RoomContext.js';
import { usePlayer } from '../../context/PlayerContext.js';
import { Artwork } from '../ui/Artwork.js';
import { UserAvatar } from '../ui/UserAvatar.js';
import { Badge } from '../ui/Badge.js';
import { Button } from '../ui/Button.js';
import { FloatingReactionsLayer } from './FloatingReactionsLayer.js';
import { SongCardMessage } from './SongCardMessage.js';
import { GifPickerModal } from './GifPickerModal.js';
import { SuggestSongModal } from './SuggestSongModal.js';
import { QueueItem } from '../../mockData.js';
import { useAuth } from '../../context/AuthContext.js';
import { searchYouTube } from '../../services/searchService.js';

export const PrivateRoomModal: React.FC = () => {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || 'me';
  const {
    activeRoom,
    isRoomModalOpen,
    setIsRoomModalOpen,
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
    roomTogglePlay,
    roomSeekTo,
    roomNextTrack,
  } = useRoom();

  const { isPlaying, currentTime, duration } = usePlayer();
  const [activeTab, setActiveTab] = useState<'queue' | 'chat' | 'people'>('queue');
  const [rightPanelTab, setRightPanelTab] = useState<'chat' | 'people'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [isVideoMode, setIsVideoMode] = useState(false);
  const [resolvedYoutubeId, setResolvedYoutubeId] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  useEffect(() => {
    if (!activeRoom?.currentTrack) {
      setResolvedYoutubeId(null);
      setLoadingVideo(false);
      return;
    }

    if (activeRoom.currentTrack.youtubeId) {
      setResolvedYoutubeId(activeRoom.currentTrack.youtubeId);
      setLoadingVideo(false);
      return;
    }

    let isMounted = true;
    setLoadingVideo(true);
    searchYouTube(`${activeRoom.currentTrack.title} ${activeRoom.currentTrack.artist}`)
      .then((results) => {
        if (isMounted) {
          if (results.length > 0 && results[0].youtubeId) {
            setResolvedYoutubeId(results[0].youtubeId);
          } else {
            setResolvedYoutubeId(null);
          }
          setLoadingVideo(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoadingVideo(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeRoom?.currentTrack]);

  if (!activeRoom || !isRoomModalOpen) return null;

  const handleCopyCode = () => {
    if (!activeRoom?.code) return;
    navigator.clipboard.writeText(activeRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(chatInput.trim(), 'text');
    setChatInput('');
  };

  const reactionEmojis = ['❤️', '🔥', '😭', '⚡', '🎵', '🫶'];

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const trackDuration = duration > 0 ? duration : (activeRoom?.currentTrack?.duration || 180);
  const progressPercent = trackDuration > 0 ? Math.min(100, Math.max(0, (currentTime / trackDuration) * 100)) : 0;

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
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-body sm:text-section-heading font-extrabold text-app-text truncate">
                  {activeRoom.name}
                </h3>

                {/* Unique Room Code + 1-Click Copy */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-mono font-black px-2 py-0.5 rounded-chip bg-app-elevated text-app-accent border border-app-accent/30 tracking-wider">
                    {activeRoom.code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-chip bg-app-elevated hover:bg-app-accent/20 hover:text-app-accent border border-app-border text-[11px] font-bold text-app-text transition-colors"
                    title="Copy Room Code"
                  >
                    {copiedCode ? (
                      <>
                        <Check size={11} className="text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
              <p className="text-meta-sm text-app-muted truncate hidden sm:block">
                Host: <strong className="text-app-text">{activeRoom.host.name}</strong> • Mode:{' '}
                <span className="capitalize text-app-accent font-semibold">{activeRoom.mode}</span>
              </p>
            </div>
          </div>

          {/* Sync status, Minimize & Leave Room Actions */}
          <div className="flex items-center gap-2 shrink-0">
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
              onClick={() => setIsRoomModalOpen(false)}
              title="Minimize room (keep listening in background)"
              className="p-1.5 rounded-chip bg-app-elevated hover:bg-app-accent/20 hover:text-app-accent border border-app-border text-app-muted transition-colors flex items-center justify-center"
            >
              <ChevronDown size={18} />
            </button>

            <button
              onClick={leaveRoom}
              className="px-3 py-1.5 rounded-chip bg-app-elevated hover:bg-rose-500/15 hover:text-rose-400 border border-app-border text-meta font-bold transition-colors"
            >
              Leave Room
            </button>
          </div>
        </header>

        {/* Live Spotify Jam Bar */}
        <div className="px-4 py-2 bg-gradient-to-r from-emerald-500/15 via-app-surface/90 to-app-accent/15 border-b border-app-border flex items-center justify-between gap-3 shrink-0 flex-wrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[11px] font-black uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              LIVE SPOTIFY JAM
            </span>
            <span className="text-meta-sm font-bold text-app-text truncate">
              Listening in sync with {activeRoom.participants.length} connected
            </span>
          </div>

          {/* Participant Avatars Stack */}
          <div className="flex items-center gap-2">
            <div className="flex items-center -space-x-2 overflow-hidden py-0.5">
              {activeRoom.participants.slice(0, 5).map((p, i) => (
                <div
                  key={p.user.id || i}
                  className="relative inline-block rounded-full ring-2 ring-emerald-500/50 shadow-md"
                  title={`${p.user.name} (${p.role === 'host' ? 'Host' : 'Listener'})`}
                >
                  <UserAvatar user={p.user} size="xs" showPresence={true} />
                </div>
              ))}
            </div>
            {activeRoom.participants.length > 5 && (
              <span className="text-[11px] font-bold text-app-muted">
                +{activeRoom.participants.length - 5}
              </span>
            )}
            <button
              onClick={() => {
                setActiveTab('people');
                setRightPanelTab('people');
              }}
              className="px-2.5 py-1 rounded-chip bg-app-elevated hover:bg-emerald-500/15 text-app-text hover:text-emerald-400 border border-app-border text-[11px] font-bold transition-colors"
            >
              Jam Members ({activeRoom.participants.length})
            </button>
          </div>
        </div>

        {/* Quiet Presence Toast */}
        {presenceToast && (
          <div className="w-full bg-app-accent/15 border-b border-app-accent/30 py-1.5 px-4 text-center text-meta-sm text-app-accent font-semibold animate-fade-in shrink-0">
            {presenceToast}
          </div>
        )}

        {/* Central Layout Body: Responsive Split View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {/* Left Column: Player & Queue */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-app-border/40">
            {/* Top: Current Song State or Search-First Empty Hero State */}
            {!activeRoom.currentTrack ? (
              <div className="p-5 sm:p-6 bg-gradient-to-b from-app-surface/90 to-app-surface/40 border-b border-app-border flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-14 h-14 rounded-2xl bg-app-accent/15 text-app-accent border border-app-accent/30 flex items-center justify-center shrink-0 shadow-accent-glow">
                    <Music2 size={28} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <Badge variant="accent">Your room is ready</Badge>
                      <span className="text-meta-sm text-app-muted">Nothing playing</span>
                    </div>
                    <h4 className="text-body sm:text-section-heading font-extrabold text-app-text">
                      Search for something to listen to together
                    </h4>
                    <p className="text-meta-sm text-app-muted">
                      Play now, add to queue, or line up songs next.
                    </p>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  icon={<Search size={16} />}
                  onClick={() => setIsSuggestModalOpen(true)}
                  className="shrink-0 font-bold px-5 py-2.5 shadow-accent-glow w-full sm:w-auto"
                >
                  Search Music
                </Button>
              </div>
            ) : isVideoMode ? (
              <div className="p-3 sm:p-5 bg-black/95 border-b border-app-border shrink-0 flex flex-col items-center">
                <div className="w-full max-w-2xl aspect-video rounded-card overflow-hidden shadow-2xl border border-app-border/60 bg-black relative flex items-center justify-center">
                  {resolvedYoutubeId ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${resolvedYoutubeId}?autoplay=1&mute=1&playsinline=1&enablejsapi=1`}
                      title={activeRoom.currentTrack.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : loadingVideo ? (
                    <div className="flex flex-col items-center justify-center gap-2 p-6 text-app-muted">
                      <Loader2 size={24} className="animate-spin text-app-accent" />
                      <span className="text-meta-sm">Loading music video...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 p-6 text-center text-app-muted">
                      <Youtube size={32} className="text-rose-400/60" />
                      <p className="text-body font-bold text-app-text">Video stream not available</p>
                      <p className="text-meta-sm">Playing in high-fidelity audio mode.</p>
                    </div>
                  )}
                </div>

                {/* Video controls & details bar */}
                <div className="w-full max-w-2xl flex items-center justify-between pt-2.5 px-1 flex-wrap gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-body font-bold text-app-text truncate">{activeRoom.currentTrack.title}</p>
                    <p className="text-meta-sm text-app-muted truncate">{activeRoom.currentTrack.artist}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setIsVideoMode(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-chip text-meta-sm font-bold bg-app-elevated hover:bg-app-accent/20 text-app-text hover:text-app-accent border border-app-border transition-colors"
                    >
                      <Music2 size={14} />
                      <span>Switch to Artwork</span>
                    </button>

                    <div className="flex items-center gap-1 bg-app-elevated/80 p-1 rounded-full border border-app-border">
                      {reactionEmojis.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => sendReaction(emoji)}
                          className="w-7 h-7 rounded-full hover:scale-125 active:scale-95 transition-transform flex items-center justify-center text-base"
                          title={`Send ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Synchronized Jam Playback Controls for Video */}
                <div className="w-full max-w-2xl pt-2 border-t border-app-border/40 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5 text-[11px] font-mono text-app-muted">
                    <span className="w-9 text-right font-semibold">{formatTime(currentTime)}</span>
                    <div
                      className="relative flex-1 h-2 bg-app-elevated hover:h-2.5 rounded-full overflow-hidden cursor-pointer group transition-all"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                        roomSeekTo(ratio, false);
                      }}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-app-accent rounded-full transition-all group-hover:brightness-110"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="w-9 font-semibold">{formatTime(trackDuration)}</span>
                  </div>

                  <div className="flex items-center justify-center gap-4 py-0.5">
                    <button
                      onClick={roomTogglePlay}
                      className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all font-bold"
                      title={isPlaying ? 'Pause Jam for everyone' : 'Play Jam for everyone'}
                    >
                      {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                    </button>
                    <button
                      onClick={roomNextTrack}
                      className="p-2 rounded-full hover:bg-app-elevated text-app-text hover:text-emerald-400 active:scale-90 transition-all"
                      title="Skip to next queued track for everyone"
                    >
                      <SkipForward size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 bg-app-surface/60 border-b border-app-border flex flex-col gap-3 shrink-0">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Artwork
                    src={activeRoom.currentTrack.artworkSvg || ''}
                    alt={activeRoom.currentTrack.title}
                    size="md"
                    rounded="card"
                    isPlaying={isPlaying}
                    glowColor={activeRoom.currentTrack.accentColor || '#FF3D81'}
                  />

                  <div className="min-w-0 flex-1 text-center sm:text-left space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <Badge variant="live">Now Playing</Badge>
                      <span className="text-meta-sm text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                        Live Jam in Sync
                      </span>
                    </div>
                    <h4 className="text-section-heading font-extrabold text-app-text truncate">
                      {activeRoom.currentTrack.title}
                    </h4>
                    <p className="text-meta font-semibold text-app-accent truncate">
                      {activeRoom.currentTrack.artist}
                    </p>
                  </div>

                  {/* Watch Video Mode Button + Reaction Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsVideoMode(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-chip text-meta-sm font-bold bg-app-elevated hover:bg-rose-500/20 text-app-text hover:text-rose-400 border border-app-border hover:border-rose-500/40 transition-colors shadow-sm"
                      title="Watch Official Music Video"
                    >
                      <Youtube size={16} className="text-rose-500" />
                      <span>Watch Video</span>
                    </button>

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
                </div>

                {/* Spotify Jam Synchronized Playback Controls & Seekbar */}
                <div className="w-full pt-2 border-t border-app-border/40 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2.5 text-[11px] font-mono text-app-muted">
                    <span className="w-9 text-right font-semibold">{formatTime(currentTime)}</span>
                    <div
                      className="relative flex-1 h-2 bg-app-elevated hover:h-2.5 rounded-full overflow-hidden cursor-pointer group transition-all"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                        roomSeekTo(ratio, false);
                      }}
                    >
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-app-accent rounded-full transition-all group-hover:brightness-110 shadow-sm"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="w-9 font-semibold">{formatTime(trackDuration)}</span>
                  </div>

                  <div className="flex items-center justify-center gap-4 py-1">
                    <button
                      onClick={roomTogglePlay}
                      className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all font-bold"
                      title={isPlaying ? 'Pause Jam for everyone' : 'Play Jam for everyone'}
                    >
                      {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
                    </button>

                    <button
                      onClick={roomNextTrack}
                      className="p-2 rounded-full hover:bg-app-elevated text-app-text hover:text-emerald-400 active:scale-90 transition-all"
                      title="Skip to next queued track for everyone"
                    >
                      <SkipForward size={20} />
                    </button>
                  </div>
                </div>
              </div>
            )}

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

            {/* Queue View (Desktop or activeTab === 'queue') */}
            <div
              className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-none ${
                activeTab !== 'queue' ? 'hidden md:block' : 'block'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-section-heading font-bold text-app-text flex items-center gap-2">
                    <Vote size={18} className="text-app-accent" />
                    <span>Room Queue</span>
                  </h4>
                  <p className="text-meta-sm text-app-muted">
                    Upcoming tracks in this session
                  </p>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  icon={<Plus size={15} />}
                  onClick={() => setIsSuggestModalOpen(true)}
                >
                  Search Music
                </Button>
              </div>

              {/* Queue List: Empty or Items */}
              {activeRoom.queue.length === 0 ? (
                <div className="text-center py-12 p-6 rounded-card bg-app-surface/60 border border-app-border space-y-3">
                  <Music size={32} className="mx-auto text-app-muted/60" />
                  <div className="space-y-1">
                    <p className="text-body font-bold text-app-text">Nothing added yet</p>
                    <p className="text-meta-sm text-app-muted max-w-sm mx-auto">
                      Search and add songs to build the queue together.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Search size={14} />}
                    onClick={() => setIsSuggestModalOpen(true)}
                  >
                    Search Music
                  </Button>
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
                            {item?.track?.coverUrl ? (
                              <img
                                src={item.track.coverUrl}
                                alt={item.track.title || 'Track'}
                                className="w-10 h-10 rounded-chip object-cover shrink-0"
                              />
                            ) : (
                              <Artwork
                                src={item?.track?.artworkSvg || ''}
                                alt={item?.track?.title || 'Track'}
                                size="xs"
                                rounded="chip"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="text-body font-bold text-app-text truncate">
                                {item?.track?.title || 'Untitled Track'}
                              </p>
                              <p className="text-meta-sm text-app-muted truncate">
                                {item?.track?.artist || 'Unknown Artist'} • Added by {item?.addedBy?.name || 'Listener'}
                              </p>
                            </div>
                          </div>

                          {/* Voting & Controls */}
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

          {/* Right Column: Live Chat & Participants */}
          <div
            className={`w-full md:w-80 lg:w-96 flex flex-col bg-app-surface/40 overflow-hidden ${
              activeTab === 'queue' ? 'hidden md:flex' : 'flex'
            }`}
          >
            {/* Header Tabs on Right Panel: Chat | Jam Members */}
            <div className="flex items-center border-b border-app-border bg-app-surface/90 p-1 shrink-0">
              <button
                onClick={() => {
                  setRightPanelTab('chat');
                  setActiveTab('chat');
                }}
                className={`flex-1 py-1.5 text-meta font-bold rounded-chip flex items-center justify-center gap-1.5 transition-colors ${
                  rightPanelTab === 'chat' && activeTab !== 'people'
                    ? 'bg-app-elevated text-app-accent border border-app-border/60 shadow-sm'
                    : 'text-app-muted hover:text-app-text'
                }`}
              >
                <MessageSquare size={14} />
                <span>Chat ({activeRoom.chatMessages.length})</span>
              </button>
              <button
                onClick={() => {
                  setRightPanelTab('people');
                  setActiveTab('people');
                }}
                className={`flex-1 py-1.5 text-meta font-bold rounded-chip flex items-center justify-center gap-1.5 transition-colors ${
                  rightPanelTab === 'people' || activeTab === 'people'
                    ? 'bg-app-elevated text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-app-muted hover:text-app-text'
                }`}
              >
                <Users size={14} />
                <span>Jam ({activeRoom.participants.length})</span>
              </button>
            </div>

            {/* If People Tab Selected */}
            {rightPanelTab === 'people' || activeTab === 'people' ? (
              <div className="p-4 space-y-4 overflow-y-auto flex-1 scrollbar-none">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="text-section-heading font-bold text-app-text">
                      Jam Members ({activeRoom.participants.length})
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    IN SYNC
                  </span>
                </div>

                <div className="space-y-2">
                  {activeRoom.participants.map((p, idx) => {
                    const isHost = p.role === 'host' || p.user.id === activeRoom.host.id;
                    const isMe = p.user.id === currentUserId;
                    return (
                      <div
                        key={p.user.id || idx}
                        className="flex items-center justify-between p-2.5 rounded-chip bg-app-elevated border border-app-border"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <UserAvatar user={p.user} size="sm" showPresence={true} />
                          <div className="min-w-0">
                            <p className="text-body font-bold text-app-text truncate flex items-center gap-1">
                              <span>{p.user.name}</span>
                              {isMe && <span className="text-[10px] text-app-accent font-mono">(You)</span>}
                            </p>
                            <p className="text-meta-sm text-app-muted truncate">{p.user.handle}</p>
                          </div>
                        </div>
                        <Badge variant={isHost ? 'accent' : 'default'}>
                          {isHost && <Crown size={11} className="inline mr-1 text-amber-300" />}
                          {isHost ? 'HOST' : 'LISTENER'}
                        </Badge>
                      </div>
                    );
                  })}
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
                {activeRoom.chatMessages.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2 text-app-muted">
                    <MessageSquare size={28} className="opacity-40" />
                    <p className="text-body font-bold text-app-text">No messages yet</p>
                    <p className="text-meta-sm">Send a message or share a track with the room!</p>
                  </div>
                ) : (
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
                )}

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

                  {activeRoom.currentTrack && (
                    <button
                      type="button"
                      onClick={() =>
                        sendMessage(`Listening to "${activeRoom.currentTrack!.title}"!`, 'song_card', activeRoom.currentTrack!)
                      }
                      className="p-2 text-app-muted hover:text-app-accent rounded-full hover:bg-app-elevated transition-colors"
                      title="Share current song into chat"
                    >
                      <Music size={18} />
                    </button>
                  )}

                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Send a message..."
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
