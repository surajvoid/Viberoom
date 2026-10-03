import { Server, Socket } from 'socket.io';
import { roomManager } from './roomManager.js';
import { User, Song } from '../models/types.js';

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    // Ping for clock drift calculation (NTP style)
    socket.on('sync:ping', (clientSendTime: number, ack) => {
      const serverReceiveTime = Date.now();
      if (typeof ack === 'function') {
        ack({
          clientSendTime,
          serverReceiveTime,
          serverTimestamp: Date.now(),
        });
      }
    });

    // Create room
    socket.on('room:create', (params: {
      title: string;
      hostUser: User;
      mode: 'private' | 'friends' | 'public' | 'radio';
      initialSong: Song;
      controlMode?: 'host_only' | 'everyone';
    }, ack) => {
      const room = roomManager.createRoom(params);
      const joinResult = roomManager.joinRoom(room.id, socket.id, params.hostUser);
      socket.join(room.id);

      if (typeof ack === 'function') {
        ack({ success: true, room: joinResult?.room || room });
      }
      io.emit('rooms:updated', roomManager.getAllRooms());
    });

    // Join room
    socket.on('room:join', (payload: { roomId: string; user: User }, ack) => {
      const result = roomManager.joinRoom(payload.roomId, socket.id, payload.user);
      if (!result) {
        if (typeof ack === 'function') ack({ success: false, error: 'Room not found' });
        return;
      }

      socket.join(result.room.id);

      if (typeof ack === 'function') {
        ack({
          success: true,
          room: result.room,
          member: result.member,
          serverTimestamp: Date.now(),
        });
      }

      // Notify others in room
      socket.to(result.room.id).emit('room:member_joined', {
        member: result.member,
        room: result.room,
      });

      io.emit('rooms:updated', roomManager.getAllRooms());
    });

    // Playback sync: Play
    socket.on('sync:play', (payload: { roomId: string; userId: string; positionMs?: number }) => {
      const updatedRoom = roomManager.play(payload.roomId, payload.userId, payload.positionMs);
      if (updatedRoom) {
        io.to(payload.roomId).emit('sync:played', {
          roomId: payload.roomId,
          isPlaying: true,
          positionMs: updatedRoom.positionMs,
          serverTimestamp: updatedRoom.serverTimestamp,
          songId: updatedRoom.currentSong.id,
          updatedBy: payload.userId,
        });
      }
    });

    // Playback sync: Pause
    socket.on('sync:pause', (payload: { roomId: string; userId: string; positionMs: number }) => {
      const updatedRoom = roomManager.pause(payload.roomId, payload.userId, payload.positionMs);
      if (updatedRoom) {
        io.to(payload.roomId).emit('sync:paused', {
          roomId: payload.roomId,
          isPlaying: false,
          positionMs: updatedRoom.positionMs,
          serverTimestamp: updatedRoom.serverTimestamp,
          songId: updatedRoom.currentSong.id,
          updatedBy: payload.userId,
        });
      }
    });

    // Playback sync: Seek
    socket.on('sync:seek', (payload: { roomId: string; userId: string; positionMs: number }) => {
      const updatedRoom = roomManager.seek(payload.roomId, payload.userId, payload.positionMs);
      if (updatedRoom) {
        io.to(payload.roomId).emit('sync:seeked', {
          roomId: payload.roomId,
          positionMs: updatedRoom.positionMs,
          serverTimestamp: updatedRoom.serverTimestamp,
          updatedBy: payload.userId,
        });
      }
    });

    // Playback sync: Change Song
    socket.on('sync:change_song', (payload: { roomId: string; userId: string; song: Song }) => {
      const updatedRoom = roomManager.changeSong(payload.roomId, payload.userId, payload.song);
      if (updatedRoom) {
        io.to(payload.roomId).emit('sync:song_changed', {
          roomId: payload.roomId,
          currentSong: updatedRoom.currentSong,
          positionMs: 0,
          isPlaying: true,
          serverTimestamp: updatedRoom.serverTimestamp,
          updatedBy: payload.userId,
        });
      }
    });

    // Live chat message
    socket.on('chat:send', (payload: { roomId: string; user: User; text?: string; gifUrl?: string }) => {
      const message = roomManager.addMessage(payload.roomId, payload.user, payload.text, payload.gifUrl);
      if (message) {
        io.to(payload.roomId).emit('chat:message', message);
      }
    });

    // Chat typing indicator
    socket.on('chat:typing', (payload: { roomId: string; user: User; isTyping: boolean }) => {
      socket.to(payload.roomId).emit('chat:typing_status', {
        userId: payload.user.id,
        userName: payload.user.name,
        isTyping: payload.isTyping,
      });
    });

    // Floating reaction
    socket.on('reaction:send', (payload: { roomId: string; user: User; emoji: string; positionMs: number }) => {
      const reaction = roomManager.addReaction(payload.roomId, payload.user, payload.emoji, payload.positionMs);
      if (reaction) {
        io.to(payload.roomId).emit('reaction:received', reaction);
      }
    });

    // Groic Song Dedications
    socket.on('dedication:send', (payload: { song: Song; fromUser: User; toUserName: string; message: string }) => {
      const dedication = roomManager.addDedication(payload);
      io.emit('dedication:new', dedication);
    });

    // Disconnect / Leave
    socket.on('disconnect', () => {
      const result = roomManager.leaveRoom(socket.id);
      if (result) {
        socket.to(result.roomId).emit('room:member_left', {
          userId: result.user?.id,
          userName: result.user?.name,
          room: result.room,
        });
        io.emit('rooms:updated', roomManager.getAllRooms());
      }
    });
  });
}
