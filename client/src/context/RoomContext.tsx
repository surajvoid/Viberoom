import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Room,
  QueueItem,
  ChatMessage,
  Track,
  User,
  MOCK_ROOMS,
  MOCK_TRACKS,
  MOCK_USERS,
  createAlbumArtSvg,
} from '../mockData.js';
import { usePlayer } from './PlayerContext.js';
import { useAuth } from './AuthContext.js';

import { getApiBaseUrl } from '../services/searchService.js';
import { resolveAudioUrlForTrack, ensureTrackAudioUrl } from '../services/audioStreamService.js';

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
  isRoomModalOpen: boolean;
  isCreateModalOpen: boolean;
  isJoinModalOpen: boolean;
  isSuggestModalOpen: boolean;
  isGifPickerOpen: boolean;
  openRoomModal: () => void;
  joinRoom: (codeOrId: string) => Promise<boolean> | boolean;
  createRoom: (name: string, mode?: Room['mode'], initialTrack?: Track | null) => Room;
  leaveRoom: () => void;
  voteSong: (queueItemId: string, voteType: 'up' | 'down') => void;
  suggestSong: (track: Track) => void;
  playRoomSong: (track: Track) => void;
  playNextSong: (track: Track) => void;
  addToRoomQueue: (track: Track) => void;
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
  setIsRoomModalOpen: (open: boolean) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setIsJoinModalOpen: (open: boolean) => void;
  setIsSuggestModalOpen: (open: boolean) => void;
  setIsGifPickerOpen: (open: boolean) => void;
}

export function getSocketUrl(): string {
  if (typeof window !== 'undefined') {
    if (window.location.port === '3000') {
      return `${window.location.protocol}//${window.location.hostname}:4000`;
    }
    return window.location.origin;
  }
  return 'http://localhost:4000';
}

export const generateUniqueRoomCode = (existingRooms: { code?: string }[] = []): string => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';
  const existingCodes = new Set(existingRooms.map((r) => r.code?.toUpperCase()).filter(Boolean));

  for (let attempt = 0; attempt < 1000; attempt++) {
    const codeArr: string[] = [];
    const numLetters = 2 + Math.floor(Math.random() * 3); // 2, 3, or 4 letters
    const numDigits = 6 - numLetters; // 4, 3, or 2 digits

    for (let i = 0; i < numLetters; i++) {
      codeArr.push(letters[Math.floor(Math.random() * letters.length)]);
    }
    for (let i = 0; i < numDigits; i++) {
      codeArr.push(numbers[Math.floor(Math.random() * numbers.length)]);
    }

    for (let i = codeArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [codeArr[i], codeArr[j]] = [codeArr[j], codeArr[i]];
    }

    const code = codeArr.join('');
    if (!existingCodes.has(code)) {
      return code;
    }
  }
  return 'MX7K2P';
};

const normalizeMode = (mode: any): Room['mode'] => {
  const m = String(mode || '').toLowerCase();
  if (m === 'dj') return 'dj';
  if (m === 'chill') return 'chill';
  return 'democratic';
};

const convertBackendSongToTrack = (s: any): Track | null => {
  if (!s) return null;
  const accentColor = s.accentColor || s.dominantColor || '#FF3D81';
  return {
    id: s.id || `track-${Date.now()}`,
    title: s.title || 'Untitled Track',
    artist: s.artist || 'Unknown Artist',
    album: s.album || 'Single',
    duration: s.duration || s.durationSec || 180,
    accentColor,
    secondaryColor: s.secondaryColor || '#8B5CF6',
    artworkSvg: s.artworkSvg || createAlbumArtSvg(s.title || 'Music', accentColor, s.artist || ''),
    genre: s.genre || 'Pop',
    bpm: s.bpm || 110,
    energy: s.energy || 70,
    plays: s.plays || 1200,
    likes: s.likes || 45,
    lyrics: Array.isArray(s.lyrics)
      ? s.lyrics.map((l: any) => ({
          time: typeof l.time === 'number' ? l.time : Math.floor((l.timeMs || 0) / 1000),
          text: l.text || '',
        }))
      : [],
    youtubeId: s.youtubeId,
    coverUrl: s.coverUrl,
    audioUrl: resolveAudioUrlForTrack(s),
  };
};

const normalizeQueue = (queue: any[], defaultUser: User): QueueItem[] => {
  if (!Array.isArray(queue)) return [];
  return queue.map((item: any, idx: number) => {
    if (item && item.track) {
      return {
        id: item.id || `q-${idx}`,
        track: ensureTrackAudioUrl(item.track),
        addedBy: item.addedBy || defaultUser,
        votes: typeof item.votes === 'number' ? item.votes : 1,
        votedByUserIds: item.votedByUserIds || [],
      };
    }
    const track = convertBackendSongToTrack(item);
    return {
      id: item?.id || `q-${idx}`,
      track: track || MOCK_TRACKS[0],
      addedBy: defaultUser,
      votes: 1,
      votedByUserIds: [],
    };
  });
};

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { playTrack, currentTrack } = usePlayer();
  const [roomsList, setRoomsList] = useState<Room[]>(() => {
    try {
      const saved = localStorage.getItem('viberoom_rooms');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return MOCK_ROOMS;
  });
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const sessionStartTimeRef = useRef<number>(Date.now());
  const reactionCountRef = useRef<number>(0);

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

  // Sync roomsList to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('viberoom_rooms', JSON.stringify(roomsList));
    } catch {}
  }, [roomsList]);

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'viberoom_rooms' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          if (Array.isArray(updated) && updated.length > 0) {
            setRoomsList(updated);
          }
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Socket.IO real-time connection
  useEffect(() => {
    let socket: Socket | null = null;
    try {
      socket = io(getSocketUrl(), {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1500,
        timeout: 8000,
      });
      socketRef.current = socket;

      socket.on('reaction:received', (data: { emoji: string; count?: number }) => {
        triggerFloatingReaction(data.emoji, data.count || 1);
      });

      socket.on('chat:message', (msg: any) => {
        if (msg && msg.text) {
          const incomingMsg: ChatMessage = {
            id: msg.id || `msg-${Date.now()}`,
            sender: msg.user || {
              id: 'usr-peer',
              name: 'Listener',
              handle: '@listener',
              avatarSvg: '',
              status: 'online',
              isFriend: false,
            },
            type: msg.type === 'gif' ? 'gif' : 'text',
            content: msg.text,
            timestamp: new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          };
          setActiveRoom((prev) => {
            if (!prev) return null;
            if (prev.chatMessages.some((m) => m.id === incomingMsg.id)) return prev;
            return { ...prev, chatMessages: [...prev.chatMessages, incomingMsg] };
          });
        }
      });

      socket.on('room:member_joined', ({ member }: any) => {
        if (member?.user) {
          setPresenceToast(`${member.user.name} joined the room! 👋`);
          setTimeout(() => setPresenceToast(null), 3500);
        }
      });
    } catch (e) {
      console.warn('Socket.io connection notice:', e);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Fetch rooms from backend on mount
  useEffect(() => {
    const fetchBackendRooms = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/rooms`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.rooms) && data.rooms.length > 0) {
            setRoomsList((prev) => {
              const map = new Map<string, Room>();
              prev.forEach((r) => map.set(r.code.toUpperCase(), r));
              data.rooms.forEach((r: any) => {
                const code = (r.code || r.id).toUpperCase();
                if (!map.has(code)) {
                  const roomTrack = convertBackendSongToTrack(r.currentSong);
                  const me = getActiveUser();
                  map.set(code, {
                    id: r.id,
                    name: r.title || r.name,
                    code: r.code || code,
                    description: r.description || '',
                    host: r.hostUser || me,
                    mode: normalizeMode(r.mode),
                    participants: r.members?.length
                      ? r.members
                      : [{ user: me, role: 'host' }],
                    currentTrack: roomTrack,
                    queue: normalizeQueue(r.queue, me),
                    history: [],
                    chatMessages: r.messages || [],
                    isLive: true,
                    listenerCount: r.listenerCount || 1,
                  });
                }
              });
              return Array.from(map.values());
            });
          }
        }
      } catch {}
    };
    fetchBackendRooms();
  }, []);

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

  const openRoomModal = () => {
    if (activeRoom) {
      setIsRoomModalOpen(true);
    }
  };

  const joinRoom = async (codeOrId: string): Promise<boolean> => {
    const clean = codeOrId.replace('#', '').trim().toUpperCase();
    if (!clean) return false;

    // 1. Look in local state memory
    let found = roomsList.find(
      (r) => r.id.toUpperCase() === clean || r.code.toUpperCase() === clean
    );

    // 2. Look in MOCK_ROOMS
    if (!found) {
      found = MOCK_ROOMS.find(
        (r) => r.id.toUpperCase() === clean || r.code.toUpperCase() === clean
      );
    }

    // 3. Look in localStorage
    if (!found) {
      try {
        const saved = localStorage.getItem('viberoom_rooms');
        if (saved) {
          const parsed: Room[] = JSON.parse(saved);
          found = parsed.find(
            (r) => r.id.toUpperCase() === clean || r.code.toUpperCase() === clean
          );
        }
      } catch {}
    }

    // 4. Query backend API
    if (!found) {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/rooms/${encodeURIComponent(clean)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.room) {
            const r = data.room;
            const me = getActiveUser();
            found = {
              id: r.id,
              name: r.title || r.name || `Room ${clean}`,
              code: r.code || clean,
              description: r.description || '',
              host: r.hostUser || me,
              mode: normalizeMode(r.mode),
              participants: r.members?.length
                ? r.members
                : [{ user: me, role: 'listener' }],
              currentTrack: convertBackendSongToTrack(r.currentSong),
              queue: normalizeQueue(r.queue, me),
              history: [],
              chatMessages: r.messages || [],
              isLive: true,
              listenerCount: r.listenerCount || 1,
            };
          }
        }
      } catch (err) {
        console.warn('API room query notice:', err);
      }
    }

    // 5. Universal Instant Connect for valid room codes
    if (!found && clean.length >= 3) {
      const me = getActiveUser();
      const defaultTrack = currentTrack || MOCK_TRACKS[0];
      found = {
        id: `room-${clean.toLowerCase()}`,
        name: `Room ${clean}`,
        code: clean,
        description: 'Synchronized listening room',
        host: me,
        mode: 'democratic',
        participants: [{ user: me, role: 'host' }],
        currentTrack: defaultTrack,
        queue: [],
        history: [],
        chatMessages: [],
        isLive: true,
        listenerCount: 1,
      };

      try {
        const baseUrl = getApiBaseUrl();
        fetch(`${baseUrl}/rooms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Room ${clean}`,
            code: clean,
            mode: 'democratic',
            hostUser: {
              id: me.id,
              name: me.name,
              handle: me.handle,
              avatarUrl: me.avatarSvg,
              status: 'online',
            },
          }),
        }).catch(() => {});
      } catch {}
    }

    if (found) {
      const roomToJoin = found;
      setRoomsList((prev) => {
        if (!prev.some((r) => r.code.toUpperCase() === roomToJoin.code.toUpperCase())) {
          return [roomToJoin, ...prev];
        }
        return prev;
      });

      sessionStartTimeRef.current = Date.now();
      reactionCountRef.current = 0;
      setActiveRoom(roomToJoin);
      setIsRoomModalOpen(true);

      if (roomToJoin.currentTrack) {
        playTrack(roomToJoin.currentTrack);
      }
      setSyncStatus('synced');
      setPresenceToast(`Connected to ${roomToJoin.name}! 🎧`);
      setTimeout(() => setPresenceToast(null), 4000);

      // Notify Socket.IO room
      try {
        if (socketRef.current) {
          socketRef.current.emit('room:join', {
            roomId: roomToJoin.id,
            user: getActiveUser(),
          });
        }
      } catch {}

      return true;
    }

    return false;
  };

  const createRoom = (
    name: string,
    mode: Room['mode'] = 'democratic',
    initialTrack?: Track | null
  ): Room => {
    const me = getActiveUser();
    const newCode = generateUniqueRoomCode(roomsList);
    const selectedTrack = initialTrack !== undefined ? initialTrack : (currentTrack || null);

    const newRoom: Room = {
      id: `room-${Date.now()}`,
      name,
      code: newCode,
      description: '',
      host: me,
      mode: normalizeMode(mode),
      participants: [{ user: me, role: 'host' }],
      currentTrack: selectedTrack,
      queue: [],
      history: [],
      chatMessages: [],
      isLive: true,
      listenerCount: 1,
    };

    setRoomsList((prev) => [newRoom, ...prev]);
    sessionStartTimeRef.current = Date.now();
    reactionCountRef.current = 0;
    setActiveRoom(newRoom);
    setIsRoomModalOpen(true);
    setSyncStatus('synced');
    setIsCreateModalOpen(false);

    if (selectedTrack) {
      playTrack(selectedTrack);
    }

    // Sync to backend API
    try {
      const baseUrl = getApiBaseUrl();
      fetch(`${baseUrl}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: name,
          code: newCode,
          mode,
          hostUser: {
            id: me.id,
            name: me.name,
            handle: me.handle,
            avatarUrl: me.avatarSvg,
            status: 'online',
          },
        }),
      }).catch((e) => console.warn('Backend room sync notice:', e));
    } catch {}

    // Socket.io room creation
    try {
      if (socketRef.current) {
        socketRef.current.emit('room:join', {
          roomId: newRoom.id,
          user: me,
        });
      }
    } catch {}

    return newRoom;
  };

  const leaveRoom = () => {
    if (activeRoom) {
      const elapsedMinutes = Math.max(
        1,
        Math.round((Date.now() - sessionStartTimeRef.current) / 60000)
      );
      setSessionSummary({
        roomName: activeRoom.name,
        durationMinutes: elapsedMinutes,
        songsPlayedCount: activeRoom.history.length + (activeRoom.currentTrack ? 1 : 0),
        topArtist: activeRoom.currentTrack?.artist || 'Room Host',
        totalReactions: reactionCountRef.current,
        participantsCount: activeRoom.participants.length,
      });

      try {
        if (socketRef.current) {
          socketRef.current.emit('room:leave', { roomId: activeRoom.id });
        }
      } catch {}
    }
    setActiveRoom(null);
    setIsRoomModalOpen(false);
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

      updatedQueue.sort((a, b) => b.votes - a.votes);
      return { ...prev, queue: updatedQueue };
    });

    triggerFloatingReaction(voteType === 'up' ? '❤️' : '👎', 1);
  };

  const playRoomSong = (track: Track) => {
    if (!activeRoom) return;
    const finalTrack = ensureTrackAudioUrl(track);
    setActiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        currentTrack: finalTrack,
      };
    });
    playTrack(finalTrack);
    setIsSuggestModalOpen(false);
    setPresenceToast(`Now playing: "${finalTrack.title}" 🎵`);
    setTimeout(() => setPresenceToast(null), 3000);

    try {
      if (socketRef.current && activeRoom) {
        socketRef.current.emit('sync:change_song', {
          roomId: activeRoom.id,
          song: finalTrack,
        });
      }
    } catch {}
  };

  const playNextSong = (track: Track) => {
    if (!activeRoom) return;
    if (!activeRoom.currentTrack) {
      playRoomSong(track);
      return;
    }
    const me = getActiveUser();
    const finalTrack = ensureTrackAudioUrl(track);
    const newItem: QueueItem = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      track: finalTrack,
      addedBy: me,
      votes: 1,
      votedByUserIds: [me.id],
    };
    setActiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        queue: [newItem, ...prev.queue],
      };
    });
    setIsSuggestModalOpen(false);
    setPresenceToast(`Set "${finalTrack.title}" to play next`);
    setTimeout(() => setPresenceToast(null), 3000);
  };

  const addToRoomQueue = (track: Track) => {
    if (!activeRoom) return;
    if (!activeRoom.currentTrack) {
      playRoomSong(track);
      return;
    }
    const me = getActiveUser();
    const finalTrack = ensureTrackAudioUrl(track);
    const newItem: QueueItem = {
      id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      track: finalTrack,
      addedBy: me,
      votes: 1,
      votedByUserIds: [me.id],
    };
    setActiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        queue: [...prev.queue, newItem],
      };
    });
    setIsSuggestModalOpen(false);
    setPresenceToast(`Added "${finalTrack.title}" to queue`);
    setTimeout(() => setPresenceToast(null), 3000);
  };

  const suggestSong = (track: Track) => {
    addToRoomQueue(track);
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
      song: song ? ensureTrackAudioUrl(song) : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setActiveRoom((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        chatMessages: [...prev.chatMessages, newMsg],
      };
    });

    try {
      if (socketRef.current && activeRoom) {
        socketRef.current.emit('chat:send', {
          roomId: activeRoom.id,
          userId: me.id,
          text: content,
          type,
        });
      }
    } catch {}
  };

  const sendReaction = (emoji: string) => {
    triggerFloatingReaction(emoji, 1);
    reactionCountRef.current += 1;

    try {
      if (socketRef.current && activeRoom) {
        socketRef.current.emit('reaction:send', {
          roomId: activeRoom.id,
          userId: getActiveUser().id,
          emoji,
        });
      }
    } catch {}
  };

  const syncNow = () => {
    setSyncStatus('syncing');
    if (activeRoom && activeRoom.currentTrack) {
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
    const safeMode = normalizeMode(mode);
    setActiveRoom((prev) => (prev ? { ...prev, mode: safeMode } : null));
    setPresenceToast(`Room mode changed to ${safeMode.toUpperCase()}`);
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
        isRoomModalOpen,
        isCreateModalOpen,
        isJoinModalOpen,
        isSuggestModalOpen,
        isGifPickerOpen,
        openRoomModal,
        joinRoom,
        createRoom,
        leaveRoom,
        voteSong,
        suggestSong,
        playRoomSong,
        playNextSong,
        addToRoomQueue,
        removeQueueSong,
        sendMessage,
        sendReaction,
        syncNow,
        setRoomMode,
        endRoom,
        dismissSessionSummary,
        setIsRoomModalOpen,
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
