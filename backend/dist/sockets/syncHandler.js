import { roomManager } from './roomManager.js';
export function registerSocketHandlers(io) {
    io.on('connection', (socket) => {
        // Ping for clock drift calculation (NTP style)
        socket.on('sync:ping', (clientSendTime, ack) => {
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
        socket.on('room:create', (params, ack) => {
            const room = roomManager.createRoom(params);
            const joinResult = roomManager.joinRoom(room.id, socket.id, params.hostUser);
            socket.join(room.id);
            if (room.code) {
                socket.join(room.code.toUpperCase());
            }
            if (typeof ack === 'function') {
                ack({ success: true, room: joinResult?.room || room });
            }
            io.emit('rooms:updated', roomManager.getAllRooms());
        });
        // Join room
        socket.on('room:join', (payload, ack) => {
            const result = roomManager.joinRoom(payload.roomId, socket.id, payload.user);
            if (!result) {
                if (typeof ack === 'function')
                    ack({ success: false, error: 'Room not found' });
                return;
            }
            socket.join(result.room.id);
            if (result.room.code) {
                socket.join(result.room.code.toUpperCase());
            }
            if (typeof ack === 'function') {
                ack({
                    success: true,
                    room: result.room,
                    member: result.member,
                    serverTimestamp: Date.now(),
                });
            }
            // Notify others in room
            const target = socket.to(result.room.id);
            if (result.room.code) {
                target.to(result.room.code.toUpperCase());
            }
            target.emit('room:member_joined', {
                member: result.member,
                room: result.room,
            });
            io.emit('rooms:updated', roomManager.getAllRooms());
        });
        // Playback sync: Play
        socket.on('sync:play', (payload) => {
            const updatedRoom = roomManager.play(payload.roomId, payload.userId, payload.positionMs);
            if (updatedRoom) {
                const eventData = {
                    roomId: updatedRoom.id,
                    code: updatedRoom.code,
                    isPlaying: true,
                    positionMs: updatedRoom.positionMs,
                    serverTimestamp: updatedRoom.serverTimestamp,
                    songId: updatedRoom.currentSong?.id || '',
                    currentSong: updatedRoom.currentSong,
                    updatedBy: payload.userId,
                };
                const target = io.to(updatedRoom.id);
                if (updatedRoom.code)
                    target.to(updatedRoom.code.toUpperCase());
                target.emit('sync:played', eventData);
            }
        });
        // Playback sync: Pause
        socket.on('sync:pause', (payload) => {
            const updatedRoom = roomManager.pause(payload.roomId, payload.userId, payload.positionMs);
            if (updatedRoom) {
                const eventData = {
                    roomId: updatedRoom.id,
                    code: updatedRoom.code,
                    isPlaying: false,
                    positionMs: updatedRoom.positionMs,
                    serverTimestamp: updatedRoom.serverTimestamp,
                    songId: updatedRoom.currentSong?.id || '',
                    updatedBy: payload.userId,
                };
                const target = io.to(updatedRoom.id);
                if (updatedRoom.code)
                    target.to(updatedRoom.code.toUpperCase());
                target.emit('sync:paused', eventData);
            }
        });
        // Playback sync: Seek
        socket.on('sync:seek', (payload) => {
            const updatedRoom = roomManager.seek(payload.roomId, payload.userId, payload.positionMs);
            if (updatedRoom) {
                const eventData = {
                    roomId: updatedRoom.id,
                    code: updatedRoom.code,
                    positionMs: updatedRoom.positionMs,
                    serverTimestamp: updatedRoom.serverTimestamp,
                    updatedBy: payload.userId,
                };
                const target = io.to(updatedRoom.id);
                if (updatedRoom.code)
                    target.to(updatedRoom.code.toUpperCase());
                target.emit('sync:seeked', eventData);
            }
        });
        // Playback sync: Change Song
        socket.on('sync:change_song', (payload) => {
            const updatedRoom = roomManager.changeSong(payload.roomId, payload.userId, payload.song);
            if (updatedRoom) {
                const eventData = {
                    roomId: updatedRoom.id,
                    code: updatedRoom.code,
                    currentSong: updatedRoom.currentSong,
                    positionMs: 0,
                    isPlaying: true,
                    serverTimestamp: updatedRoom.serverTimestamp,
                    updatedBy: payload.userId,
                };
                const target = io.to(updatedRoom.id);
                if (updatedRoom.code)
                    target.to(updatedRoom.code.toUpperCase());
                target.emit('sync:song_changed', eventData);
            }
        });
        // Live chat message
        socket.on('chat:send', (payload) => {
            const message = roomManager.addMessage(payload.roomId, payload.user, payload.text, payload.gifUrl);
            if (message) {
                const room = roomManager.getRawRoom(payload.roomId);
                const target = room ? io.to(room.id).to(room.code.toUpperCase()) : io.to(payload.roomId);
                target.emit('chat:message', message);
            }
        });
        // Chat typing indicator
        socket.on('chat:typing', (payload) => {
            const room = roomManager.getRawRoom(payload.roomId);
            const target = room ? socket.to(room.id).to(room.code.toUpperCase()) : socket.to(payload.roomId);
            target.emit('chat:typing_status', {
                userId: payload.user.id,
                userName: payload.user.name,
                isTyping: payload.isTyping,
            });
        });
        // Floating reaction
        socket.on('reaction:send', (payload) => {
            const reaction = roomManager.addReaction(payload.roomId, payload.user, payload.emoji, payload.positionMs);
            if (reaction) {
                const room = roomManager.getRawRoom(payload.roomId);
                const target = room ? io.to(room.id).to(room.code.toUpperCase()) : io.to(payload.roomId);
                target.emit('reaction:received', reaction);
            }
        });
        // Groic Song Dedications
        socket.on('dedication:send', (payload) => {
            const dedication = roomManager.addDedication(payload);
            io.emit('dedication:new', dedication);
        });
        // Explicit room leave
        socket.on('room:leave', (payload) => {
            const result = roomManager.leaveRoom(socket.id);
            if (result) {
                const eventData = {
                    userId: result.user?.id,
                    userName: result.user?.name,
                    room: result.room,
                };
                const target = socket.to(result.roomId);
                if (result.room.code)
                    target.to(result.room.code.toUpperCase());
                target.emit('room:member_left', eventData);
                io.emit('rooms:updated', roomManager.getAllRooms());
            }
        });
        // Disconnect / Leave
        socket.on('disconnect', () => {
            const result = roomManager.leaveRoom(socket.id);
            if (result) {
                const eventData = {
                    userId: result.user?.id,
                    userName: result.user?.name,
                    room: result.room,
                };
                const target = socket.to(result.roomId);
                if (result.room.code)
                    target.to(result.room.code.toUpperCase());
                target.emit('room:member_left', eventData);
                io.emit('rooms:updated', roomManager.getAllRooms());
            }
        });
    });
}
