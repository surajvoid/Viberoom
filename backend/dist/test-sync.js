import http from 'http';
import express from 'express';
import { Server } from 'socket.io';
import { io as ioClient } from 'socket.io-client';
import apiRoutes from './routes/apiRoutes.js';
import { registerSocketHandlers } from './sockets/syncHandler.js';
import { mockUsers } from './models/mockData.js';
async function runTest() {
    console.log('🧪 Starting VibeRoom Automated Test Suite...');
    // Setup test server
    const app = express();
    app.use(express.json());
    app.use('/api', apiRoutes);
    const server = http.createServer(app);
    const io = new Server(server, { cors: { origin: '*' } });
    registerSocketHandlers(io);
    await new Promise((resolve) => server.listen(4001, () => resolve()));
    console.log('✅ Test server listening on port 4001');
    try {
        // 1. Test REST API
        console.log('\n--- 1. Testing REST Endpoints ---');
        const songsRes = await fetch('http://localhost:4001/api/songs');
        const songsData = await songsRes.json();
        console.log(`Songs loaded: ${songsData.songs?.length} songs found`);
        if (!songsData.songs || songsData.songs.length === 0)
            throw new Error('Failed to load songs');
        const matchRes = await fetch('http://localhost:4001/api/match/user-suraj/user-sayli');
        const matchData = await matchRes.json();
        console.log(`Music Match: Suraj × Sayli = ${matchData.matchPercentage}% match (${matchData.commonArtistCount} artists)`);
        if (matchData.matchPercentage !== 82)
            throw new Error('Music match verification failed');
        // Test Groic Radio & Dedications API
        const radioRes = await fetch('http://localhost:4001/api/radio-stations');
        const radioData = await radioRes.json();
        console.log(`Groic Radio: ${radioData.radioStations?.length} live stations found`);
        if (!radioData.radioStations || radioData.radioStations.length === 0)
            throw new Error('Radio stations failed');
        const dedRes = await fetch('http://localhost:4001/api/dedications');
        const dedData = await dedRes.json();
        console.log(`Groic Dedications: ${dedData.dedications?.length} song dedications found`);
        if (!dedData.dedications || dedData.dedications.length === 0)
            throw new Error('Dedications failed');
        // 2. Test Real-Time Sockets & Multi-Client Sync
        console.log('\n--- 2. Testing Multi-Client Real-Time Sync & Rooms ---');
        const surajSocket = ioClient('http://localhost:4001', { transports: ['websocket'] });
        const sayliSocket = ioClient('http://localhost:4001', { transports: ['websocket'] });
        await Promise.all([
            new Promise((res) => { surajSocket.on('connect', () => res()); }),
            new Promise((res) => { sayliSocket.on('connect', () => res()); }),
        ]);
        console.log('✅ Both Suraj and Sayli connected to Socket.IO');
        // Test Clock Ping / Drift
        const pingAck = await new Promise((res) => {
            surajSocket.emit('sync:ping', Date.now(), res);
        });
        console.log(`Clock sync ping roundtrip confirmed: serverTimestamp=${pingAck.serverTimestamp}`);
        // Join room using short Groic code: 8492
        const targetRoomCode = '8492';
        const surajJoin = await new Promise((res) => {
            surajSocket.emit('room:join', { roomId: targetRoomCode, user: mockUsers['user-suraj'] }, res);
        });
        console.log(`Suraj joined room by code "${targetRoomCode}": ${surajJoin.room.title} (current song: ${surajJoin.room.currentSong.title})`);
        const targetRoomId = surajJoin.room.id;
        const sayliJoin = await new Promise((res) => {
            sayliSocket.emit('room:join', { roomId: targetRoomCode, user: mockUsers['user-sayli'] }, res);
        });
        console.log(`Sayli joined room by code "${targetRoomCode}": members count=${sayliJoin.room.members.length}`);
        // Test synchronized Play broadcast
        console.log('\n--- 3. Testing Playback Synchronization Broadcast ---');
        const playPromise = new Promise((resolve) => {
            sayliSocket.on('sync:played', (data) => {
                resolve(data);
            });
        });
        surajSocket.emit('sync:play', {
            roomId: targetRoomId,
            userId: 'user-suraj',
            positionMs: 45000,
        });
        const playEvent = await playPromise;
        console.log(`✅ Sayli received synchronized play: songId=${playEvent.songId}, position=${playEvent.positionMs}ms`);
        // Test Floating Reaction broadcast
        console.log('\n--- 4. Testing Floating Reactions & Timeline ---');
        const reactionPromise = new Promise((resolve) => {
            sayliSocket.on('reaction:received', (reaction) => {
                resolve(reaction);
            });
        });
        surajSocket.emit('reaction:send', {
            roomId: targetRoomId,
            user: mockUsers['user-suraj'],
            emoji: '🔥',
            positionMs: 45000,
        });
        const receivedReaction = await reactionPromise;
        console.log(`✅ Sayli received floating reaction: ${receivedReaction.emoji} from ${receivedReaction.user.name}`);
        // Test Chat Message broadcast
        console.log('\n--- 5. Testing Live Room Chat ---');
        const chatPromise = new Promise((resolve) => {
            surajSocket.on('chat:message', (msg) => {
                resolve(msg);
            });
        });
        sayliSocket.emit('chat:send', {
            roomId: targetRoomId,
            user: mockUsers['user-sayli'],
            text: 'this part 😭❤️ so good!',
        });
        const receivedChat = await chatPromise;
        console.log(`✅ Suraj received chat from Sayli: "${receivedChat.text}"`);
        // Disconnect
        surajSocket.disconnect();
        sayliSocket.disconnect();
        console.log('\n🎉 ALL BACKEND & REAL-TIME SYNC TESTS PASSED SUCCESSFULLY! 🎉\n');
        setTimeout(() => {
            process.exit(0);
        }, 100);
    }
    catch (err) {
        console.error('❌ Test failed:', err);
        process.exit(1);
    }
}
runTest();
