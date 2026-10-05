import ytSearch from 'yt-search';
import { mockSongs, mockPlaylists, mockUsers, mockRadioStations, mockTopCharts } from '../models/mockData.js';
import { roomManager } from '../sockets/roomManager.js';
export const getSongs = (req, res) => {
    const { genre, mood } = req.query;
    let songs = [...mockSongs];
    if (genre && typeof genre === 'string') {
        songs = songs.filter(s => s.genre.toLowerCase() === genre.toLowerCase());
    }
    if (mood && typeof mood === 'string') {
        songs = songs.filter(s => s.mood.toLowerCase() === mood.toLowerCase());
    }
    res.json({ songs });
};
export const getSongById = (req, res) => {
    const songId = String(req.params.id);
    const song = mockSongs.find(s => s.id === songId);
    if (!song) {
        res.status(404).json({ error: 'Song not found' });
        return;
    }
    res.json({ song });
};
export const getPlaylists = (req, res) => {
    res.json({ playlists: mockPlaylists });
};
export const getPlaylistById = (req, res) => {
    const playlistId = String(req.params.id);
    const playlist = mockPlaylists.find(p => p.id === playlistId);
    if (!playlist) {
        res.status(404).json({ error: 'Playlist not found' });
        return;
    }
    res.json({ playlist });
};
export const getRooms = (req, res) => {
    const rooms = roomManager.getAllRooms();
    res.json({ rooms });
};
export const getRoomById = (req, res) => {
    const roomId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const room = roomManager.getRoom(roomId);
    if (!room) {
        res.status(404).json({ error: 'Room not found' });
        return;
    }
    res.json({ room });
};
export const getFriendsActivity = (req, res) => {
    res.json({ friends: [] });
};
export const getMusicMatch = (req, res) => {
    const user1Id = String(req.params.user1Id);
    const user2Id = String(req.params.user2Id);
    const user1 = mockUsers[user1Id] || {
        id: user1Id || 'user-1',
        name: 'You',
        handle: 'you',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        status: 'online',
        streakDays: 14,
        totalListeningHours: 38.4,
        totalPlays: 2341,
    };
    const user2 = mockUsers[user2Id] || mockUsers['user-community-2'];
    res.json({
        user1,
        user2,
        matchPercentage: 82,
        commonArtists: [
            'Arijit Singh',
            'Stephen Sanchez',
            'Lauv',
            'Sachin-Jigar',
            'The Weeknd',
            'Daft Punk',
        ],
        commonArtistCount: 37,
        commonSongCount: 64,
        sharedGenres: ['Bollywood', 'Indie', 'Lo-Fi', 'Pop', 'R&B', 'Soul', 'Rock', 'Acoustic'],
        sharedPlaylist: mockPlaylists[2],
    });
};
// Groic Feature: Song Dedications
export const getDedications = (req, res) => {
    const dedications = roomManager.getDedications();
    res.json({ dedications });
};
export const createDedication = (req, res) => {
    const { songId, fromUserId, fromUserName, toUserName, message, songData } = req.body;
    const song = songData || mockSongs.find(s => s.id === songId) || mockSongs[0];
    const fromUser = mockUsers[fromUserId] || {
        id: fromUserId || 'user-active',
        name: fromUserName || 'Listener',
        handle: (fromUserName || 'listener').toLowerCase().replace(/\s+/g, '_'),
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        status: 'online',
        streakDays: 1,
        totalListeningHours: 1.2,
        totalPlays: 12,
    };
    const dedication = roomManager.addDedication({
        song,
        fromUser,
        toUserName: toUserName || 'Someone Special',
        message: message || 'Dedicated with love ❤️',
    });
    res.status(201).json({ dedication });
};
// Groic Feature: Live Radio Stations
export const getRadioStations = (req, res) => {
    res.json({ radioStations: mockRadioStations });
};
// Groic Feature: Top Charts
export const getTopCharts = (req, res) => {
    res.json({ topCharts: mockTopCharts });
};
// Groic Feature: User Audio Upload
export const uploadSong = (req, res) => {
    const { title, artist, audioUrl, coverUrl, genre } = req.body;
    const newSong = {
        id: `upload-${Date.now()}`,
        title: title || 'My Uploaded Track',
        artist: artist || 'Self Upload',
        album: 'Personal Library',
        durationSec: 180,
        audioUrl: audioUrl || mockSongs[0].audioUrl,
        coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        genre: genre || 'Indie',
        mood: 'Chill',
        dominantColor: '#1F2421',
        isUserUploaded: true,
        uploadedAt: Date.now(),
    };
    mockSongs.unshift(newSong);
    res.status(201).json({ song: newSong });
};
export const searchYouTube = async (req, res) => {
    const query = (req.query.q || '').trim();
    if (!query) {
        res.json({ videos: [] });
        return;
    }
    try {
        const searchResults = await ytSearch(query);
        const videos = ((searchResults && searchResults.videos) || []).slice(0, 25).map((v) => ({
            id: `yt-${v.videoId}`,
            youtubeId: v.videoId,
            title: v.title,
            artist: v.author?.name || 'YouTube Artist',
            album: 'YouTube Music',
            durationSec: v.seconds || 180,
            audioUrl: '',
            coverUrl: v.thumbnail || v.image,
            genre: 'YouTube',
            mood: 'Vibe',
            dominantColor: '#171D2B',
        }));
        res.json({ videos });
    }
    catch (error) {
        console.error('YouTube search error:', error);
        res.status(500).json({ error: 'Failed to search YouTube', videos: [] });
    }
};
export const searchCatalog = async (req, res) => {
    const q = (req.query.q || '').toLowerCase().trim();
    if (!q) {
        res.json({
            trendingGenres: ['HIP-HOP', 'BOLLYWOOD', 'R&B', 'LO-FI', 'ROCK', 'K-POP'],
            songs: [],
            rooms: roomManager.getAllRooms(),
            playlists: [],
        });
        return;
    }
    // Real YouTube Search
    let ytSongs = [];
    try {
        const searchResults = await ytSearch(q);
        ytSongs = ((searchResults && searchResults.videos) || []).slice(0, 15).map((v) => ({
            id: `yt-${v.videoId}`,
            youtubeId: v.videoId,
            title: v.title,
            artist: v.author?.name || 'YouTube Artist',
            album: 'YouTube Music',
            durationSec: v.seconds || 180,
            audioUrl: '',
            coverUrl: v.thumbnail || v.image,
            genre: 'YouTube',
            mood: 'Vibe',
            dominantColor: '#171D2B',
        }));
    }
    catch (err) {
        console.warn('ytSearch catalog search notice:', err);
    }
    const rooms = roomManager
        .getAllRooms()
        .filter(r => r.code.includes(q) ||
        r.title.toLowerCase().includes(q));
    res.json({
        songs: ytSongs,
        rooms,
        playlists: [],
    });
};
