import { Room, RoomMember, RoomMessage, FloatingReaction, User, Song, SongDedication } from '../models/types.js';
import { initialRooms, mockSongs, mockDedications } from '../models/mockData.js';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private socketToRoom: Map<string, string> = new Map();
  private dedications: SongDedication[] = [...mockDedications];

  constructor() {
    // Seed initial public rooms
    for (const room of initialRooms) {
      this.rooms.set(room.id, { ...room, members: [] });
    }
  }

  public getRoom(roomId: string): Room | undefined {
    // Try by roomId first
    let room = this.rooms.get(roomId);
    if (!room) {
      // Try finding by room code or case-insensitive search
      room = this.getRoomByCode(roomId);
    }
    if (!room) return undefined;

    // Calculate elapsed playback position
    const currentPosition = this.computeCurrentPosition(room);
    return {
      ...room,
      positionMs: currentPosition,
      serverTimestamp: Date.now(),
    };
  }

  public getRoomByCode(code: string): Room | undefined {
    const cleanCode = code.trim().toUpperCase();
    for (const r of this.rooms.values()) {
      if (r.code.toUpperCase() === cleanCode || r.id.toUpperCase() === cleanCode) {
        return r;
      }
    }
    return undefined;
  }

  public getAllRooms(): Room[] {
    return Array.from(this.rooms.values()).map(r => ({
      ...r,
      positionMs: this.computeCurrentPosition(r),
      serverTimestamp: Date.now(),
    }));
  }

  public computeCurrentPosition(room: Room): number {
    if (!room.isPlaying) return room.positionMs;
    const elapsed = Date.now() - room.serverTimestamp;
    const songDurationMs = (room.currentSong?.durationSec || 200) * 1000;
    const estimated = room.positionMs + elapsed;
    return estimated > songDurationMs ? songDurationMs : estimated;
  }

  public createRoom(params: {
    title: string;
    hostUser: User;
    mode: 'private' | 'friends' | 'public' | 'radio';
    initialSong: Song;
    controlMode?: 'host_only' | 'everyone';
  }): Room {
    const slug = params.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const roomId = `room-${slug || 'vibe'}-${randomSuffix}`;
    // Groic-style short numeric code e.g. 7482
    const code = randomSuffix.toString();

    const newRoom: Room = {
      id: roomId,
      code,
      title: params.title || 'VIBE ROOM',
      mode: params.mode || 'private',
      controlMode: params.controlMode || 'everyone',
      hostId: params.hostUser.id,
      currentSong: params.initialSong || mockSongs[0],
      isPlaying: true,
      positionMs: 0,
      serverTimestamp: Date.now(),
      members: [],
      queue: [params.initialSong || mockSongs[0]],
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          roomId,
          user: params.hostUser,
          text: `created the room. Share code ${code} to listen together!`,
          timestamp: Date.now(),
          type: 'system',
        },
      ],
      reactions: [],
      listenerCount: 1,
    };

    this.rooms.set(roomId, newRoom);
    return newRoom;
  }

  public joinRoom(roomIdOrCode: string, socketId: string, user: User): { room: Room; member: RoomMember } | null {
    let room = this.rooms.get(roomIdOrCode);
    if (!room) {
      room = this.getRoomByCode(roomIdOrCode);
    }
    if (!room) {
      // If room doesn't exist, auto-create private room with this code/title
      room = this.createRoom({
        title: roomIdOrCode.startsWith('room-') ? 'LISTEN TOGETHER' : `ROOM ${roomIdOrCode}`,
        hostUser: user,
        mode: 'private',
        initialSong: mockSongs[0],
      });
    }

    // Leave any previous room
    this.leaveRoom(socketId);

    // Remove existing member entry if user reconnected with new socketId
    room.members = room.members.filter(m => m.user.id !== user.id);

    const member: RoomMember = {
      socketId,
      user,
      joinedAt: Date.now(),
    };

    room.members.push(member);
    room.listenerCount = Math.max(room.listenerCount, room.members.length);
    this.socketToRoom.set(socketId, room.id);

    return {
      room: {
        ...room,
        positionMs: this.computeCurrentPosition(room),
        serverTimestamp: Date.now(),
      },
      member,
    };
  }

  public leaveRoom(socketId: string): { roomId: string; room: Room; user?: User } | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    this.socketToRoom.delete(socketId);

    if (!room) return null;

    const memberIndex = room.members.findIndex(m => m.socketId === socketId);
    let departedUser: User | undefined;

    if (memberIndex !== -1) {
      departedUser = room.members[memberIndex].user;
      room.members.splice(memberIndex, 1);
    }

    // If host left and members remain, assign next host
    if (departedUser && departedUser.id === room.hostId && room.members.length > 0) {
      room.hostId = room.members[0].user.id;
    }

    return { roomId, room, user: departedUser };
  }

  public play(roomId: string, userId: string, positionMs?: number): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.controlMode === 'host_only' && room.hostId !== userId) {
      return null;
    }

    if (positionMs !== undefined) {
      room.positionMs = positionMs;
    }
    room.isPlaying = true;
    room.serverTimestamp = Date.now();

    return room;
  }

  public pause(roomId: string, userId: string, positionMs: number): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.controlMode === 'host_only' && room.hostId !== userId) {
      return null;
    }

    room.isPlaying = false;
    room.positionMs = positionMs;
    room.serverTimestamp = Date.now();

    return room;
  }

  public seek(roomId: string, userId: string, positionMs: number): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.controlMode === 'host_only' && room.hostId !== userId) {
      return null;
    }

    room.positionMs = positionMs;
    room.serverTimestamp = Date.now();

    return room;
  }

  public changeSong(roomId: string, userId: string, song: Song): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.controlMode === 'host_only' && room.hostId !== userId) {
      return null;
    }

    room.currentSong = song;
    room.positionMs = 0;
    room.isPlaying = true;
    room.serverTimestamp = Date.now();

    return room;
  }

  public addMessage(roomId: string, user: User, text?: string, gifUrl?: string): RoomMessage | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const message: RoomMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      roomId,
      user,
      text,
      gifUrl,
      timestamp: Date.now(),
      type: 'chat',
    };

    room.messages.push(message);
    if (room.messages.length > 100) {
      room.messages.shift();
    }

    return message;
  }

  public addReaction(roomId: string, user: User, emoji: string, positionMs: number): FloatingReaction | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const reaction: FloatingReaction = {
      id: `react-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      roomId,
      user,
      emoji,
      positionMs,
      timestamp: Date.now(),
    };

    room.reactions.push(reaction);
    if (room.reactions.length > 30) {
      room.reactions.shift();
    }

    if (room.currentSong) {
      if (!room.currentSong.reactionTimeline) {
        room.currentSong.reactionTimeline = [];
      }
      const secondMark = Math.floor(positionMs / 1000);
      const existing = room.currentSong.reactionTimeline.find(
        r => Math.abs(r.timestampSec - secondMark) <= 2 && r.type === emoji
      );
      if (existing) {
        existing.count += 1;
      } else {
        room.currentSong.reactionTimeline.push({
          timestampSec: secondMark,
          type: emoji,
          count: 1,
        });
      }
    }

    return reaction;
  }

  // Groic Song Dedications
  public getDedications(): SongDedication[] {
    return this.dedications;
  }

  public addDedication(params: {
    song: Song;
    fromUser: User;
    toUserName: string;
    message: string;
  }): SongDedication {
    const newDedication: SongDedication = {
      id: `ded-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      song: params.song,
      fromUser: params.fromUser,
      toUserName: params.toUserName,
      message: params.message,
      timestamp: Date.now(),
      likesCount: 1,
    };
    this.dedications.unshift(newDedication);
    return newDedication;
  }
}

export const roomManager = new RoomManager();
