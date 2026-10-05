import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  Room,
  QueueItem,
  ChatMessage,
  Track,
  User,
  MOCK_ROOMS,
  MOCK_TRACKS,
  MOCK_USERS,
} from '../mockData.js';
import { usePlayer } from './PlayerContext.js';
import { useAuth } from './AuthContext.js';

export interface FloatingReaction {
  id: string;
  emoji: string;
  x: number; // percentage 10-90
  count: number;
}

export interface SessionSummary {
  roomName: string;
  durationMinutes: number;
  songsPlayedCount: number;
  topArtist: string;
  totalReactions: number;
  participantsCount: number;
}

export interface RoomContextType {
  activeRoom: Room | null;
  roomsList: Room[];
  floatingReactions: FloatingReaction[];
  presenceToast: string | null;
  syncStatus: 'synced' | 'syncing' | 'drift';
  sessionSummary: SessionSummary | null;
  isCreateModalOpen: boolean;
  isJoinModalOpen: boolean;
  isSuggestModalOpen: boolean;
  isGifPickerOpen: boolean;
  joinRoom: (codeOrId: string) => boolean;
  createRoom: (name: string, mode?: Room['mode'], description?: string) => Room;
  leaveRoom: () => void;
  voteSong: (queueItemId: string, voteType: 'up' | 'down') => void;
  suggestSong: (track: Track) => void;
  removeQueueSong: (queueItemId: string) => void;
  sendMessage: (
    content: string,
    type?: 'text' | 'emoji' | 'gif' | 'song_card',
    song?: Track
  ) => void;
  sendReaction: (emoji: string) => void;
  syncNow: () => void;
  setRoomMode: (mode: Room['mode']) => void;
  endRoom: () => void;
  dismissSessionSummary: () => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setIsJoinModalOpen: (open: boolean) => void;
  setIsSuggestModalOpen: (open: boolean) => void;
  setIsGifPickerOpen: (open: boolean) => void;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { playTrack, currentTrack } = usePlayer();
  const [roomsList, setRoomsList] = useState<Room[]>(MOCK_ROOMS);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);

  const getActiveUser = (): User => {
    if (currentUser) return currentUser;
    return {
      id: 'usr-guest',
      name: 'Listener',
      handle: '@listener',
      avatarSvg: '',
      status: 'online',
      isFriend: false,
      musicPersonality: {
        topGenre: 'Electronic',
        vibeTag: 'Music Lover 🎧',
        matchPercent: 100,
        sonicArchetype: 'The Sonic Explorer',
        weeklyListeningHours: 0,
      },
    };
  };
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const [presenceToast, setPresenceToast] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'drift'>('synced');
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);

  const sessionStartTimeRef = useRef<number>(Date.now());
  const reactionCountRef = useRef<number>(0);

  // Simulated live events in active room (Discord vibe)
  useEffect(() => {
    if (!activeRoom) return;

    const interval = setInterval(() => {
      const randomAction = Math.random();

      if (randomAction < 0.35) {
        // Simulated reaction
        const emojis = ['❤️', '🔥', '😭', '⚡', '🎵', '🫶'];
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        const count = Math.floor(Math.random() * 3) + 1;
        triggerFloatingReaction(emoji, count);
        reactionCountRef.current += count;
      } else if (randomAction < 0.7) {
        // Simulated chat message from a friend
        const fakeFriends = MOCK_USERS.slice(1, 4);
        const sender = fakeFriends[Math.floor(Math.random() * fakeFriends.length)];
        const msgs = [
          'This transition is so smooth 🎧',
          'Vibing so hard right now 🔥🔥',
          'Who added this? 10/10 choice!',
          'Turn up the bass a bit 🙌',
          'Voting up the next track in queue ❤️',
        ];
        const text = msgs[Math.floor(Math.random() * msgs.length)];

        setActiveRoom((prev) => {
          if (!prev) return null;
          const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender,
            type: 'text',
            content: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          return {
            ...prev,
            chatMessages: [...prev.chatMessages, newMsg],
          };
        });

        // Show presence toast
        setPresenceToast(`${sender.name}: "${text}"`);
        setTimeout(() => setPresenceToast(null), 3500);
      } else {
        // Simulated vote bump
        setActiveRoom((prev) => {
          if (!prev || prev.queue.length === 0) return prev;
          const targetItem = prev.queue[0];
          const updated = prev.queue.map((item) =>
            item.id === targetItem.id ? { ...item, votes: item.votes + 1 } : item
          );
          // Sort by votes
          updated.sort((a, b) => b.votes - a.votes);
          return { ...prev, queue: updated };
        });
        setPresenceToast(`🔥 Trending in room: +1 vote on upcoming track`);
        setTimeout(() => setPresenceToast(null), 3000);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [activeRoom]);

  const triggerFloatingReaction = (emoji: string, count = 1) => {
    const newReaction: FloatingReaction = {
      id: `react-${Date.now()}-${Math.random()}`,
      emoji,
      x: Math.floor(Math.random() * 70) + 15,
      count,
    };
    setFloatingReactions((prev) => [...prev, newReaction]);

    setTimeout(() => {
      setFloatingReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2000);
  };

  const joinRoom = (codeOrId: string): boolean => {
    const clean = codeOrId.replace('#', '').trim().toLowerCase();
    const found = roomsList.find(
      (r) => r.id.toLowerCase() === clean || r.code.toLowerCase() === clean
    );

    if (found) {
      sessionStartTimeRef.current = Date.now();
      reactionCountRef.current = 0;
      setActiveRoom(found);
      playTrack(found.currentTrack);
      setSyncStatus('synced');
      setPresenceToast(`Connected to ${found.name} in synchronized audio!`);
      setTimeout(() => setPresenceToast(null), 4000);
      return true;
    }
    return false;
  };

  const createRoom = (
    name: string,
    mode: Room['mode'] = 'democratic',
    description = 'Late night vibe session with friends'
  ): Room => {
    const me = getActiveUser();
    const newCode = String(Math.floor(1000 + Math.random() * 9000));
    const activeTrack = currentTrack || {
      id: `session-track-${Date.now()}`,
      title: 'VibeRoom Live Sync',
      artist: me.name,
      album: 'Live Session',
      duration: 180,
      accentColor: '#FF3D81',
      secondaryColor: '#8B5CF6',
      artworkSvg: '',
      genre: 'Social Sync',
      bpm: 120,
      energy: 85,
      plays: 1,
      likes: 1,
      lyrics: [],
    };

    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name,
      code: newCode,
      description,
      host: me,
      mode,
      participants: [{ user: me, role: 'host' }],
      currentTrack: activeTrack,
      queue: [],
      history: [],
      chatMessages: [
        {
          id: `msg-${Date.now()}`,
          sender: me,
          type: 'text',
          content: `Welcome to ${name}! Ready to vibe together 🎵`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      isLive: true,
      listenerCount: 1,
    };

    setRoomsList((prev) => [newRoom, ...prev]);
    sessionStartTimeRef.current = Date.now();
    reactionCountRef.current = 0;
    setActiveRoom(newRoom);
    if (newRoom.currentTrack) {
      playTrack(newRoom.currentTrack);
    }
    setSyncStatus('synced');
    setIsCreateModalOpen(false);
    return newRoom;
  };

  const leaveRoom = () => {
    if (activeRoom) {
      const elapsedMinutes = Math.max(1, Math.round((Date.now() - sessionStartTimeRef.current) / 60000));
      setSessionSummary({
        roomName: activeRoom.name,
        durationMinutes: elapsedMinutes,
        songsPlayedCount: activeRoom.history.length + 1,
        topArtist: activeRoom.currentTrack?.artist || 'Featured Artist',
        totalReactions: Math.max(12, reactionCountRef.current),
        participantsCount: activeRoom.participants.length,
      });
    }
    setActiveRoom(null);
  };

  const endRoom = () => {
    leaveRoom();
  };

  const dismissSessionSummary = () => {
    setSessionSummary(null);
  };

  const voteSong = (queueItemId: string, voteType: 'up' | 'down') => {
    if (!activeRoom) return;

    setActiveRoom((prev) => {
      if (!prev) return null;
      const updatedQueue = prev.queue.map((item) => {
        if (item.id === queueItemId) {
          const delta = voteType === 'up' ? 1 : -1;
          const newVotes = Math.max(0, item.votes + delta);
          return { ...item, votes: newVotes };
        }
        return item;
      });

      // Sort democratically by votes
      updatedQueue.sort((a, b) => b.votes - a.votes);
      return { ...prev, queue: updatedQueue };
    });

    triggerFloatingReaction(voteType === 'up' ? '❤️' : '👎', 1);
  };

  const suggestSong = (track: Track) => {
    if (!activeRoom) return;

    const me = getActiveUser();
    const newItem: QueueItem = {
      id: `q-${Date.now()}`,
      track,
      addedBy: me,
      votes: 1,
      votedByUserIds: [me.id],
    };

    setActiveRoom((prev) => {
      if (!prev) return null;
      const updated = [...prev.queue, newItem];
      updated.sort((a, b) => b.votes - a.votes);
      return { ...prev, queue: updated };
    });

    // Also notify chat with a music card
    sendMessage(`Suggested "${track.title}" to the queue`, 'song_card', track);
    setIsSuggestModalOpen(false);
    setPresenceToast(`Suggested "${track.title}" to the room queue!`);
    setTimeout(() => setPresenceToast(null), 3000);
  };

  const removeQueueSong = (queueItemId: string) => {
    if (!activeRoom) return;
    setActiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        queue: prev.queue.filter((q) => q.id !== queueItemId),
      };
    });
  };

  const sendMessage = (
    content: string,
    type: ChatMessage['type'] = 'text',
    song?: Track
  ) => {
    if (!activeRoom || !content.trim()) return;

    const me = getActiveUser();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: me,
      type,
      content,
      song,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        chatMessages: [...prev.chatMessages, newMsg],
      };
    });
  };

  const sendReaction = (emoji: string) => {
    triggerFloatingReaction(emoji, 1);
    reactionCountRef.current += 1;
  };

  const syncNow = () => {
    setSyncStatus('syncing');
    if (activeRoom) {
      playTrack(activeRoom.currentTrack);
    }
    setTimeout(() => {
      setSyncStatus('synced');
      setPresenceToast('Playback perfectly synchronized with room host! 🎧');
      setTimeout(() => setPresenceToast(null), 3000);
    }, 700);
  };

  const setRoomMode = (mode: Room['mode']) => {
    if (!activeRoom) return;
    setActiveRoom((prev) => (prev ? { ...prev, mode } : null));
    setPresenceToast(`Room mode changed to ${mode.toUpperCase()}`);
    setTimeout(() => setPresenceToast(null), 3000);
  };

  return (
    <RoomContext.Provider
      value={{
        activeRoom,
        roomsList,
        floatingReactions,
        presenceToast,
        syncStatus,
        sessionSummary,
        isCreateModalOpen,
        isJoinModalOpen,
        isSuggestModalOpen,
        isGifPickerOpen,
        joinRoom,
        createRoom,
        leaveRoom,
        voteSong,
        suggestSong,
        removeQueueSong,
        sendMessage,
        sendReaction,
        syncNow,
        setRoomMode,
        endRoom,
        dismissSessionSummary,
        setIsCreateModalOpen,
        setIsJoinModalOpen,
        setIsSuggestModalOpen,
        setIsGifPickerOpen,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = (): RoomContextType => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoom must be used within a RoomProvider');
  }
  return context;
};
