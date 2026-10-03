import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Room, RoomMessage, FloatingReaction, Song, RoomMember } from '../types/index.js';
import { useUser } from './UserContext.js';
import { useAudio } from './AudioContext.js';

interface SocketContextType {
  isConnected: boolean;
  activeRoom: Room | null;
  joinRoom: (roomId: string) => Promise<boolean>;
  leaveRoom: () => void;
  createRoom: (
    title: string,
    mode?: 'private' | 'friends' | 'public' | 'radio',
    initialSong?: Song
  ) => Promise<string>;
  emitPlay: (positionMs?: number) => void;
  emitPause: (positionMs: number) => void;
  emitSeek: (positionMs: number) => void;
  emitChangeSong: (song: Song) => void;
  sendMessage: (text?: string, gifUrl?: string) => void;
  sendReaction: (emoji: string) => void;
  setTyping: (isTyping: boolean) => void;
  typingUsers: string[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useUser();
  const { setSyncedPlayback, currentSong, currentTime } = useAudio();
  const [isConnected, setIsConnected] = useState(false);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const clockOffsetRef = useRef<number>(0);

  const getSocketUrl = (): string => {
    if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;
    if (typeof window !== 'undefined') {
      if (window.location.port === '3000') {
        return `${window.location.protocol}//${window.location.hostname}:4000`;
      }
      return window.location.origin;
    }
    return 'http://localhost:4000';
  };

  useEffect(() => {
    const socket = io(getSocketUrl(), {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Ping for clock drift offset
      const clientSend = Date.now();
      socket.emit('sync:ping', clientSend, (ack: any) => {
        if (ack && ack.serverTimestamp) {
          const rtt = Date.now() - clientSend;
          const estimatedServerNow = ack.serverTimestamp + rtt / 2;
          clockOffsetRef.current = estimatedServerNow - Date.now();
        }
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Room member events
    socket.on('room:member_joined', ({ member, room }: { member: RoomMember; room: Room }) => {
      setActiveRoom((prev) => {
        if (!prev) return room;
        return {
          ...prev,
          members: [...prev.members.filter((m) => m.user.id !== member.user.id), member],
          listenerCount: room.listenerCount,
        };
      });
    });

    socket.on('room:member_left', ({ userId, room }: { userId: string; room: Room }) => {
      setActiveRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          members: prev.members.filter((m) => m.user.id !== userId),
          listenerCount: room?.listenerCount || prev.listenerCount - 1,
        };
      });
    });

    // Playback sync events
    socket.on('sync:played', ({ positionMs, songId }: { positionMs: number; songId: string }) => {
      setActiveRoom((prev) => {
        if (!prev) return null;
        const song = prev.currentSong;
        if (song) {
          setSyncedPlayback(song, positionMs, true);
        }
        return {
          ...prev,
          isPlaying: true,
          positionMs,
          serverTimestamp: Date.now(),
        };
      });
    });

    socket.on('sync:paused', ({ positionMs }: { positionMs: number }) => {
      setActiveRoom((prev) => {
        if (!prev) return null;
        if (prev.currentSong) {
          setSyncedPlayback(prev.currentSong, positionMs, false);
        }
        return {
          ...prev,
          isPlaying: false,
          positionMs,
          serverTimestamp: Date.now(),
        };
      });
    });

    socket.on('sync:seeked', ({ positionMs }: { positionMs: number }) => {
      setActiveRoom((prev) => {
        if (!prev) return null;
        if (prev.currentSong) {
          setSyncedPlayback(prev.currentSong, positionMs, prev.isPlaying);
        }
        return {
          ...prev,
          positionMs,
          serverTimestamp: Date.now(),
        };
      });
    });

    socket.on('sync:song_changed', ({ currentSong, isPlaying }: { currentSong: Song; isPlaying: boolean }) => {
      setActiveRoom((prev) => {
        if (!prev) return null;
        setSyncedPlayback(currentSong, 0, isPlaying);
        return {
          ...prev,
          currentSong,
          positionMs: 0,
          isPlaying,
          serverTimestamp: Date.now(),
        };
      });
    });

    // Chat events
    socket.on('chat:message', (message: RoomMessage) => {
      setActiveRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, message],
        };
      });
    });

    socket.on('chat:typing_status', ({ userName, isTyping }: { userName: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          if (!prev.includes(userName)) return [...prev, userName];
          return prev;
        } else {
          return prev.filter((u) => u !== userName);
        }
      });
    });

    // Reaction events
    socket.on('reaction:received', (reaction: FloatingReaction) => {
      setActiveRoom((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          reactions: [...prev.reactions.slice(-25), reaction],
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinRoom = async (roomId: string): Promise<boolean> => {
    if (!socketRef.current) return false;

    return new Promise((resolve) => {
      socketRef.current?.emit(
        'room:join',
        { roomId, user: currentUser },
        (response: { success: boolean; room?: Room; error?: string }) => {
          if (response?.success && response.room) {
            setActiveRoom(response.room);
            setSyncedPlayback(response.room.currentSong, response.room.positionMs, response.room.isPlaying);
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );
    });
  };

  const leaveRoom = () => {
    if (activeRoom && socketRef.current) {
      socketRef.current.emit('room:leave', { roomId: activeRoom.id });
      setActiveRoom(null);
    }
  };

  const createRoom = async (
    title: string,
    mode: 'private' | 'friends' | 'public' | 'radio' = 'private',
    initialSong?: Song
  ): Promise<string> => {
    if (!socketRef.current) return '';

    return new Promise((resolve) => {
      socketRef.current?.emit(
        'room:create',
        {
          title,
          hostUser: currentUser,
          mode,
          initialSong: initialSong || currentSong,
        },
        (response: { success: boolean; room: Room }) => {
          if (response?.success && response.room) {
            setActiveRoom(response.room);
            resolve(response.room.id);
          } else {
            resolve('');
          }
        }
      );
    });
  };

  const emitPlay = (positionMs?: number) => {
    if (!activeRoom || !socketRef.current) return;
    const pos = positionMs ?? Math.floor(currentTime * 1000);
    socketRef.current.emit('sync:play', {
      roomId: activeRoom.id,
      userId: currentUser.id,
      positionMs: pos,
    });
  };

  const emitPause = (positionMs: number) => {
    if (!activeRoom || !socketRef.current) return;
    socketRef.current.emit('sync:pause', {
      roomId: activeRoom.id,
      userId: currentUser.id,
      positionMs,
    });
  };

  const emitSeek = (positionMs: number) => {
    if (!activeRoom || !socketRef.current) return;
    socketRef.current.emit('sync:seek', {
      roomId: activeRoom.id,
      userId: currentUser.id,
      positionMs,
    });
  };

  const emitChangeSong = (song: Song) => {
    if (!activeRoom || !socketRef.current) return;
    socketRef.current.emit('sync:change_song', {
      roomId: activeRoom.id,
      userId: currentUser.id,
      song,
    });
  };

  const sendMessage = (text?: string, gifUrl?: string) => {
    if (!activeRoom || !socketRef.current) return;
    socketRef.current.emit('chat:send', {
      roomId: activeRoom.id,
      user: currentUser,
      text,
      gifUrl,
    });
  };

  const sendReaction = (emoji: string) => {
    if (!activeRoom || !socketRef.current) return;
    socketRef.current.emit('reaction:send', {
      roomId: activeRoom.id,
      user: currentUser,
      emoji,
      positionMs: Math.floor(currentTime * 1000),
    });
  };

  const setTyping = (isTyping: boolean) => {
    if (!activeRoom || !socketRef.current) return;
    socketRef.current.emit('chat:typing', {
      roomId: activeRoom.id,
      user: currentUser,
      isTyping,
    });
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        activeRoom,
        joinRoom,
        leaveRoom,
        createRoom,
        emitPlay,
        emitPause,
        emitSeek,
        emitChangeSong,
        sendMessage,
        sendReaction,
        setTyping,
        typingUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
