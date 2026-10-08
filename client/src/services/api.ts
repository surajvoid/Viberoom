import { Song, Playlist, Room, User, MusicMatchData, SongDedication, RadioStation, TopChart } from '../types/index.js';

export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    if (window.location.port === '3000') {
      return `${window.location.protocol}//${window.location.hostname}:4000/api`;
    }
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:4000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Fallback mock items
export const fallbackUsers: Record<string, User> = {
  'user-community-1': {
    id: 'user-community-1',
    name: 'Music Lover',
    handle: 'music_lover',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    streakDays: 1,
    totalListeningHours: 1.2,
    totalPlays: 12,
  },
  'user-community-2': {
    id: 'user-community-2',
    name: 'Friend',
    handle: 'friend',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'online',
    streakDays: 1,
    totalListeningHours: 2.5,
    totalPlays: 25,
  },
};

export const fallbackSongs: Song[] = [
  {
    id: 'song-apna-bana-le',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh, Sachin-Jigar',
    album: 'Bhediya (Original Soundtrack)',
    durationSec: 261,
    audioUrl: '/audio/vibe-track-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    genre: 'Bollywood',
    mood: 'Romantic',
    dominantColor: '#2b1b17',
    youtubeId: 'UEvOsQBu1jY',
    lyrics: [
      { timeMs: 5000, text: 'Tu mera koi na hoke bhi kuch laage' },
      { timeMs: 15000, text: 'Kiya re jo bhi tune kiya re' },
      { timeMs: 25000, text: 'Apna bana le piya, apna bana le piya' },
      { timeMs: 38000, text: 'Dil ke nagar mein shehar tu basa le piya' },
      { timeMs: 52000, text: 'Chhute na chhute na aashiqui ye chhute na' },
    ],
    reactionTimeline: [
      { timestampSec: 25, type: '❤️', count: 42 },
      { timestampSec: 38, type: '😭', count: 28 },
      { timestampSec: 52, type: '🔥', count: 64 },
      { timestampSec: 110, type: '❤️', count: 89 },
    ],
  },
  {
    id: 'song-until-i-found-you',
    title: 'Until I Found You',
    artist: 'Stephen Sanchez',
    album: 'Easy on My Eyes',
    durationSec: 177,
    audioUrl: '/audio/vibe-track-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    genre: 'Indie',
    mood: 'Romantic',
    dominantColor: '#171d2b',
    youtubeId: 'GxldQ9eX2wo',
    lyrics: [
      { timeMs: 4000, text: "Georgia, wrap me up in all your—" },
      { timeMs: 9000, text: "I want you in my arms" },
      { timeMs: 16000, text: "Oh, let me hold your heart" },
      { timeMs: 23000, text: "I would never fall in love until I found her" },
      { timeMs: 35000, text: "I said, I would never fall, unless it's you I fall into" },
    ],
    reactionTimeline: [
      { timestampSec: 23, type: '❤️', count: 112 },
      { timestampSec: 35, type: '😭', count: 95 },
      { timestampSec: 78, type: '❤️', count: 140 },
    ],
  },
  {
    id: 'song-damage-done',
    title: 'Damage Done',
    artist: 'Drake',
    album: 'Certified Lover Boy',
    durationSec: 178,
    audioUrl: '/audio/vibe-track-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    genre: 'Hip-Hop',
    mood: 'Chill',
    dominantColor: '#241a2e',
    youtubeId: 'BddP6PYo2gs',
    lyrics: [
      { timeMs: 6000, text: "Late nights in the city, knowing what's done" },
      { timeMs: 14000, text: "Can't undo the damage, but we still run" },
      { timeMs: 28000, text: "Look at what we built, now it's cold as ice" },
    ],
    reactionTimeline: [
      { timestampSec: 14, type: '🔥', count: 87 },
      { timestampSec: 28, type: '🔥', count: 120 },
      { timestampSec: 42, type: '❤️', count: 45 },
    ],
  },
  {
    id: 'song-starboy',
    title: 'Starboy',
    artist: 'The Weeknd, Daft Punk',
    album: 'Starboy',
    durationSec: 230,
    audioUrl: '/audio/vibe-track-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    genre: 'R&B',
    mood: 'Energetic',
    dominantColor: '#2d1515',
    youtubeId: '34Na4j8AVgA',
    lyrics: [
      { timeMs: 8000, text: "I'm tryna put you in the worst mood, ah" },
      { timeMs: 15000, text: "Look what you've done, I'm a starboy" },
    ],
    reactionTimeline: [
      { timestampSec: 25, type: '🔥', count: 215 },
      { timestampSec: 65, type: '🔥', count: 180 },
    ],
  },
  {
    id: 'song-i-like-me-better',
    title: 'I Like Me Better',
    artist: 'Lauv',
    album: 'I met you when I was 18.',
    durationSec: 197,
    audioUrl: '/audio/vibe-track-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    genre: 'Pop',
    mood: 'Happy',
    dominantColor: '#172722',
    youtubeId: 'BcqxLCWn-CE',
    lyrics: [
      { timeMs: 5000, text: "To be young and in love in New York City" },
      { timeMs: 22000, text: "I like me better when I'm with you" },
    ],
    reactionTimeline: [
      { timestampSec: 22, type: '❤️', count: 98 },
      { timestampSec: 45, type: '❤️', count: 75 },
    ],
  },
  {
    id: 'song-midnight-city',
    title: 'Midnight Lo-Fi Echoes',
    artist: 'VibeRoom Originals',
    album: 'Night Drive Collective',
    durationSec: 165,
    audioUrl: '/audio/vibe-track-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    genre: 'Lo-Fi',
    mood: 'Chill',
    dominantColor: '#1a192e',
    youtubeId: 'jfKfPfyJRdk',
    reactionTimeline: [
      { timestampSec: 30, type: '❤️', count: 82 },
      { timestampSec: 60, type: '🔥', count: 45 },
    ],
  },
];

export const fallbackPlaylists: Playlist[] = [
  {
    id: 'playlist-late-night-vibes',
    title: 'Late Night Vibes',
    stackedTitle: ['LATE', 'NIGHT', 'VIBES'],
    description: 'Slow down the world. Intimate vocals, quiet beats, and midnight reflections.',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
    curatorName: 'Editorial VibeRoom',
    duration: '1h 42m',
    songCount: 24,
    isEditorial: true,
    songs: [fallbackSongs[0], fallbackSongs[1], fallbackSongs[4], fallbackSongs[5]],
  },
  {
    id: 'playlist-fomo',
    title: 'Fear Of Missing Out',
    stackedTitle: ['FEAR', 'OF', 'MISSING', 'OUT'],
    description: 'What everyone is listening to across the rooms right now.',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80',
    curatorName: 'VibeRoom Live',
    duration: '2h 10m',
    songCount: 38,
    isEditorial: true,
    songs: [fallbackSongs[3], fallbackSongs[2], fallbackSongs[0]],
  },
  {
    id: 'playlist-our-songs',
    title: 'Trending Favorites',
    stackedTitle: ['TRENDING', 'FAVORITES'],
    description: 'Community top rated tracks and viral sounds.',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
    curatorName: 'Community Curated',
    duration: '54m',
    songCount: 14,
    isEditorial: false,
    songs: [fallbackSongs[0], fallbackSongs[1], fallbackSongs[4]],
  },
];

export const fallbackDedications: SongDedication[] = [];

export const fallbackRadioStations: RadioStation[] = [
  {
    id: 'radio-bollywood-fm',
    name: 'Bollywood Hits FM',
    frequency: '98.3 FM',
    tagline: 'Non-stop Hindi romance & chartbusters',
    genre: 'Bollywood',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    currentSong: fallbackSongs[0],
    listenersCount: 4210,
    streamUrl: fallbackSongs[0].audioUrl,
  },
  {
    id: 'radio-midnight-lofi',
    name: 'Midnight Lo-Fi Lounge',
    frequency: '92.7 FM',
    tagline: 'Chill beats to study, relax and sleep to',
    genre: 'Lo-Fi',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    currentSong: fallbackSongs[5],
    listenersCount: 1890,
    streamUrl: fallbackSongs[5].audioUrl,
  },
  {
    id: 'radio-global-hits',
    name: 'Global Viral Top 50',
    frequency: '104.2 FM',
    tagline: 'Worldwide pop, hip-hop and viral tracks',
    genre: 'Pop / Hip-Hop',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    currentSong: fallbackSongs[3],
    listenersCount: 3120,
    streamUrl: fallbackSongs[3].audioUrl,
  },
  {
    id: 'radio-indie-acoustic',
    name: 'Acoustic Sunset',
    frequency: '101.5 FM',
    tagline: 'Raw vocals, intimate guitars and indie vibes',
    genre: 'Indie',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    currentSong: fallbackSongs[1],
    listenersCount: 940,
    streamUrl: fallbackSongs[1].audioUrl,
  },
];

export const fallbackTopCharts: TopChart[] = [
  {
    id: 'chart-india-top10',
    title: 'Top 10 India',
    subtitle: 'The most played songs in India right now',
    country: 'IN',
    coverUrl: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600&auto=format&fit=crop&q=80',
    songs: [fallbackSongs[0], fallbackSongs[1], fallbackSongs[4], fallbackSongs[2]],
  },
  {
    id: 'chart-global-viral',
    title: 'Global Viral 50',
    subtitle: 'Worldwide tracks catching fire on VibeRoom',
    country: 'GL',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    songs: [fallbackSongs[3], fallbackSongs[2], fallbackSongs[1], fallbackSongs[5]],
  },
];

export const api = {
  async getSongs(genre?: string, mood?: string): Promise<Song[]> {
    try {
      const url = new URL(`${API_BASE_URL}/songs`);
      if (genre) url.searchParams.append('genre', genre);
      if (mood) url.searchParams.append('mood', mood);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.songs || fallbackSongs;
    } catch {
      let filtered = [...fallbackSongs];
      if (genre) filtered = filtered.filter(s => s.genre.toLowerCase() === genre.toLowerCase());
      if (mood) filtered = filtered.filter(s => s.mood.toLowerCase() === mood.toLowerCase());
      return filtered;
    }
  },

  async getPlaylists(): Promise<Playlist[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/playlists`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.playlists || fallbackPlaylists;
    } catch {
      return fallbackPlaylists;
    }
  },

  async getRooms(): Promise<Room[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.rooms || [];
    } catch {
      return [];
    }
  },

  async getRoomByIdOrCode(codeOrId: string): Promise<Room | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${encodeURIComponent(codeOrId)}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.room || null;
    } catch {
      return null;
    }
  },

  async getFriendsActivity(): Promise<any[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/friends/activity`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.friends || [];
    } catch {
      return [];
    }
  },

  async getMusicMatch(user1Id: string, user2Id: string): Promise<MusicMatchData> {
    try {
      const res = await fetch(`${API_BASE_URL}/match/${user1Id}/${user2Id}`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      return {
        user1: fallbackUsers[user1Id] || fallbackUsers['user-community-1'],
        user2: fallbackUsers[user2Id] || fallbackUsers['user-community-2'],
        matchPercentage: 82,
        commonArtists: ['Arijit Singh', 'Stephen Sanchez', 'Lauv', 'Sachin-Jigar', 'The Weeknd'],
        commonArtistCount: 37,
        commonSongCount: 64,
        sharedGenres: ['Bollywood', 'Indie', 'Lo-Fi', 'Pop', 'R&B'],
        sharedPlaylist: fallbackPlaylists[2],
      };
    }
  },

  // Groic Song Dedications API
  async getDedications(): Promise<SongDedication[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/dedications`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.dedications || fallbackDedications;
    } catch {
      return fallbackDedications;
    }
  },

  async createDedication(songId: string, fromUserId: string, toUserName: string, message: string): Promise<SongDedication> {
    try {
      const res = await fetch(`${API_BASE_URL}/dedications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId, fromUserId, toUserName, message }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.dedication;
    } catch {
      const newDed: SongDedication = {
        id: `ded-${Date.now()}`,
        song: fallbackSongs.find(s => s.id === songId) || fallbackSongs[0],
        fromUser: fallbackUsers[fromUserId] || fallbackUsers['user-community-1'],
        toUserName,
        message,
        timestamp: Date.now(),
        likesCount: 1,
      };
      fallbackDedications.unshift(newDed);
      return newDed;
    }
  },

  // Groic Live Radio API
  async getRadioStations(): Promise<RadioStation[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/radio-stations`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.radioStations || fallbackRadioStations;
    } catch {
      return fallbackRadioStations;
    }
  },

  // Groic Top Charts API
  async getTopCharts(): Promise<TopChart[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/top-charts`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.topCharts || fallbackTopCharts;
    } catch {
      return fallbackTopCharts;
    }
  },

  // Groic User Music Upload API
  async uploadSong(title: string, artist: string, audioUrl: string, coverUrl?: string, genre?: string): Promise<Song> {
    try {
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, artist, audioUrl, coverUrl, genre }),
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.song;
    } catch {
      const newSong: Song = {
        id: `upload-${Date.now()}`,
        title,
        artist,
        album: 'Personal Uploads',
        durationSec: 180,
        audioUrl,
        coverUrl: coverUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
        genre: genre || 'User Track',
        mood: 'Chill',
        dominantColor: '#1F2421',
        isUserUploaded: true,
        uploadedAt: Date.now(),
      };
      fallbackSongs.unshift(newSong);
      return newSong;
    }
  },

  async searchYouTube(query: string): Promise<Song[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/youtube/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.videos || [];
    } catch {
      return [];
    }
  },

  async search(query: string): Promise<{ songs: Song[]; playlists: Playlist[]; rooms: Room[]; radioStations: RadioStation[]; trendingGenres: string[] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch {
      const q = query.toLowerCase().trim();
      return {
        trendingGenres: ['HIP-HOP', 'BOLLYWOOD', 'R&B', 'LO-FI', 'ROCK', 'K-POP'],
        songs: fallbackSongs.filter(s => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)),
        playlists: fallbackPlaylists.filter(p => p.title.toLowerCase().includes(q)),
        rooms: [],
        radioStations: fallbackRadioStations.filter(r => r.name.toLowerCase().includes(q)),
      };
    }
  },
};
