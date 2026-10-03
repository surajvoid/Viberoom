import { initialRooms, mockSongs, mockDedications } from '../models/mockData.js';
export class RoomManager {
    rooms = new Map();
    socketToRoom = new Map();
    dedications = [...mockDedications];
    constructor() {
        // Seed initial public rooms
        for (const room of initialRooms) {
            this.rooms.set(room.id, { ...room, members: [] });
        }
    }
    getRoom(roomId) {
        // Try by roomId first
        let room = this.rooms.get(roomId);
        if (!room) {
            // Try finding by room code or case-insensitive search
            room = this.getRoomByCode(roomId);
        }
        if (!room)
            return undefined;
        // Calculate elapsed playback position
        const currentPosition = this.computeCurrentPosition(room);
        return {
            ...room,
            positionMs: currentPosition,
            serverTimestamp: Date.now(),
        };
    }
    getRoomByCode(code) {
        const cleanCode = code.trim().toUpperCase();
        for (const r of this.rooms.values()) {
            if (r.code.toUpperCase() === cleanCode || r.id.toUpperCase() === cleanCode) {
                return r;
            }
        }
        return undefined;
    }
    getAllRooms() {
        return Array.from(this.rooms.values()).map(r => ({
            ...r,
            positionMs: this.computeCurrentPosition(r),
            serverTimestamp: Date.now(),
        }));
    }
    computeCurrentPosition(room) {
        if (!room.isPlaying)
            return room.positionMs;
        const elapsed = Date.now() - room.serverTimestamp;
        const songDurationMs = (room.currentSong?.durationSec || 200) * 1000;
        const estimated = room.positionMs + elapsed;
        return estimated > songDurationMs ? songDurationMs : estimated;
    }
    createRoom(params) {
        const slug = params.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const roomId = `room-${slug || 'vibe'}-${randomSuffix}`;
        // Groic-style short numeric code e.g. 7482
        const code = randomSuffix.toString();
        const newRoom = {
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
    joinRoom(roomIdOrCode, socketId, user) {
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
        const member = {
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
    leaveRoom(socketId) {
        const roomId = this.socketToRoom.get(socketId);
        if (!roomId)
            return null;
        const room = this.rooms.get(roomId);
        this.socketToRoom.delete(socketId);
        if (!room)
            return null;
        const memberIndex = room.members.findIndex(m => m.socketId === socketId);
        let departedUser;
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
    play(roomId, userId, positionMs) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
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
    pause(roomId, userId, positionMs) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
        if (room.controlMode === 'host_only' && room.hostId !== userId) {
            return null;
        }
        room.isPlaying = false;
        room.positionMs = positionMs;
        room.serverTimestamp = Date.now();
        return room;
    }
    seek(roomId, userId, positionMs) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
        if (room.controlMode === 'host_only' && room.hostId !== userId) {
            return null;
        }
        room.positionMs = positionMs;
        room.serverTimestamp = Date.now();
        return room;
    }
    changeSong(roomId, userId, song) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
        if (room.controlMode === 'host_only' && room.hostId !== userId) {
            return null;
        }
        room.currentSong = song;
        room.positionMs = 0;
        room.isPlaying = true;
        room.serverTimestamp = Date.now();
        return room;
    }
    addMessage(roomId, user, text, gifUrl) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
        const message = {
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
    addReaction(roomId, user, emoji, positionMs) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
        const reaction = {
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
            const existing = room.currentSong.reactionTimeline.find(r => Math.abs(r.timestampSec - secondMark) <= 2 && r.type === emoji);
            if (existing) {
                existing.count += 1;
            }
            else {
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
    getDedications() {
        return this.dedications;
    }
    addDedication(params) {
        const newDedication = {
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
