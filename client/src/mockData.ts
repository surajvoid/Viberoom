// ============================================================================
// VibeRoom Mock Data Module
// Apple Music visual polish × Spotify discovery × Discord rooms × Instagram reactions
// ZERO remote image dependencies — 100% vector SVG & gradient generated
// ============================================================================

export interface LyricLine {
  time: number; // in seconds
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // duration in seconds
  accentColor: string; // One of: #FF3D81, #8B5CF6, #B6F23A, #22D3EE, #FF6B5A
  secondaryColor: string;
  artworkSvg: string; // Vector SVG data URI
  genre: string;
  bpm: number;
  energy: number; // 0-100
  plays: number;
  likes: number;
  lyrics: LyricLine[];
  youtubeId?: string;
  coverUrl?: string;
  audioUrl?: string;
}

export interface Artist {
  id: string;
  name: string;
  handle: string;
  bio: string;
  monthlyListeners: number;
  topTrackIds: string[];
  artworkSvg: string;
  accentColor: string;
  verified: boolean;
  genres: string[];
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  releaseYear: number;
  trackIds: string[];
  artworkSvg: string;
  accentColor: string;
  genre: string;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  creator: string;
  trackIds: string[];
  artworkSvg: string;
  accentColor: string;
  followers: number;
  isCurated: boolean;
}

export interface MusicPersonality {
  topGenre: string;
  vibeTag: string;
  matchPercent: number;
  sonicArchetype: string;
  weeklyListeningHours: number;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  email?: string;
  avatarSvg: string;
  status: 'online' | 'listening' | 'idle' | 'offline';
  currentTrackId?: string;
  isFriend: boolean;
  musicPersonality: MusicPersonality;
}

export interface RoomParticipant {
  user: User;
  role: 'host' | 'dj' | 'listener';
  isTyping?: boolean;
  isMuted?: boolean;
}

export interface QueueItem {
  id: string;
  track: Track;
  addedBy: User;
  votes: number;
  votedByUserIds: string[];
}

export interface ChatMessage {
  id: string;
  sender: User;
  type: 'text' | 'emoji' | 'gif' | 'song_card';
  content: string;
  timestamp: string;
  song?: Track;
  reactions?: { emoji: string; count: number; users: string[] }[];
}

export interface GIFItem {
  id: string;
  title: string;
  svg: string;
  category: string;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  description: string;
  host: User;
  mode: 'dj' | 'democratic' | 'chill';
  participants: RoomParticipant[];
  currentTrack: Track;
  queue: QueueItem[];
  history: Track[];
  chatMessages: ChatMessage[];
  isLive: boolean;
  listenerCount: number;
}

// ============================================================================
// Vector SVG Artwork Generators (Zero external network dependencies)
// ============================================================================

export function createAlbumArtSvg(
  title: string,
  primaryColor: string,
  secondaryColor: string,
  variant: 'orb' | 'waves' | 'mesh' | 'vinyl' | 'geometric' = 'orb'
): string {
  const encP = encodeURIComponent(primaryColor);
  const encS = encodeURIComponent(secondaryColor);
  const safeTitle = encodeURIComponent(title.slice(0, 14));

  let shapes = '';
  switch (variant) {
    case 'waves':
      shapes = `
        <path d='M-50 200 C50 100 150 300 250 180 C350 60 450 220 550 150 L550 500 L-50 500 Z' fill='url(%23g1)' opacity='0.85'/>
        <path d='M-50 280 C60 220 180 340 280 260 C380 180 460 300 550 240 L550 500 L-50 500 Z' fill='url(%23g2)' opacity='0.7'/>
      `;
      break;
    case 'mesh':
      shapes = `
        <circle cx='120' cy='120' r='140' fill='${encP}' filter='url(%23blur)' opacity='0.85'/>
        <circle cx='380' cy='320' r='160' fill='${encS}' filter='url(%23blur)' opacity='0.8'/>
        <circle cx='250' cy='420' r='110' fill='%23FFFFFF' filter='url(%23blur)' opacity='0.3'/>
      `;
      break;
    case 'vinyl':
      shapes = `
        <circle cx='250' cy='250' r='210' fill='%23121215' stroke='url(%23g1)' stroke-width='4'/>
        <circle cx='250' cy='250' r='180' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='2'/>
        <circle cx='250' cy='250' r='150' fill='none' stroke='rgba(255,255,255,0.06)' stroke-width='2'/>
        <circle cx='250' cy='250' r='120' fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='2'/>
        <circle cx='250' cy='250' r='80' fill='url(%23g1)'/>
        <circle cx='250' cy='250' r='20' fill='%230A0A0C'/>
      `;
      break;
    case 'geometric':
      shapes = `
        <rect x='60' y='60' width='220' height='220' rx='32' fill='${encP}' opacity='0.75' transform='rotate(18 170 170)' filter='url(%23blur-sm)'/>
        <rect x='180' y='180' width='240' height='240' rx='40' fill='${encS}' opacity='0.8' transform='rotate(-12 300 300)'/>
      `;
      break;
    case 'orb':
    default:
      shapes = `
        <circle cx='250' cy='250' r='190' fill='url(%23g1)' filter='url(%23blur)' opacity='0.9'/>
        <circle cx='360' cy='140' r='100' fill='${encS}' filter='url(%23blur)' opacity='0.75'/>
        <circle cx='140' cy='360' r='120' fill='${encP}' filter='url(%23blur)' opacity='0.85'/>
      `;
      break;
  }

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 500 500' width='100%' height='100%'>
    <defs>
      <linearGradient id='g1' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stop-color='${encP}'/>
        <stop offset='100%' stop-color='${encS}'/>
      </linearGradient>
      <linearGradient id='g2' x1='100%' y1='0%' x2='0%' y2='100%'>
        <stop offset='0%' stop-color='${encS}'/>
        <stop offset='100%' stop-color='${encP}' stop-opacity='0.4'/>
      </linearGradient>
      <filter id='blur' x='-30%' y='-30%' width='160%' height='160%'>
        <feGaussianBlur stdDeviation='65'/>
      </filter>
      <filter id='blur-sm' x='-20%' y='-20%' width='140%' height='140%'>
        <feGaussianBlur stdDeviation='20'/>
      </filter>
    </defs>
    <rect width='500' height='500' fill='%230B0B0E'/>
    ${shapes}
    <rect width='500' height='500' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='2'/>
    <text x='40' y='460' font-family='sans-serif' font-weight='800' font-size='26' fill='%23FFFFFF' opacity='0.85' letter-spacing='-0.5'>${safeTitle}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${svg.replace(/\n\s+/g, '')}`;
}

export function createUserAvatarSvg(name: string, bgGradient: [string, string]): string {
  const enc1 = encodeURIComponent(bgGradient[0]);
  const enc2 = encodeURIComponent(bgGradient[1]);
  const initials = encodeURIComponent(
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  );

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120' width='100%' height='100%'>
    <defs>
      <linearGradient id='av' x1='0%' y1='0%' x2='100%' y2='100%'>
        <stop offset='0%' stop-color='${enc1}'/>
        <stop offset='100%' stop-color='${enc2}'/>
      </linearGradient>
    </defs>
    <circle cx='60' cy='60' r='60' fill='url(%23av)'/>
    <circle cx='60' cy='48' r='24' fill='rgba(255,255,255,0.92)'/>
    <circle cx='60' cy='104' r='36' fill='rgba(255,255,255,0.92)'/>
    <text x='60' y='66' font-family='sans-serif' font-weight='700' font-size='32' fill='%230A0A0C' text-anchor='middle'>${initials}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${svg.replace(/\n\s+/g, '')}`;
}

// ============================================================================
// Curated Tracks (12 iconic tracks with lyrics, accents & audio simulation)
// ============================================================================

export const MOCK_TRACKS: Track[] = [];

// ============================================================================
// Curated Social Users (For social rooms, chat peers, & friends demonstration)
// NOTE: Authenticated user is managed dynamically via AuthContext.
// These mock users are separate peers and NEVER treated as the logged-in user.
// ============================================================================

export const MOCK_SOCIAL_USERS: User[] = [
  {
    id: 'user-maya',
    name: 'Maya Lin',
    handle: '@mayasounds',
    avatarSvg: createUserAvatarSvg('Maya Lin', ['#8B5CF6', '#FF3D81']),
    status: 'listening',
    isFriend: true,
    musicPersonality: {
      topGenre: 'Synthwave & Electronic',
      vibeTag: 'Late Night Explorer 🌙',
      matchPercent: 94,
      sonicArchetype: 'The Late Night Explorer',
      weeklyListeningHours: 14.5,
    },
  },
  {
    id: 'user-jordan',
    name: 'Jordan Patel',
    handle: '@jordanvibes',
    avatarSvg: createUserAvatarSvg('Jordan Patel', ['#22D3EE', '#B6F23A']),
    status: 'online',
    isFriend: true,
    musicPersonality: {
      topGenre: 'Indie & Lo-Fi',
      vibeTag: 'Lo-Fi Chill & Focus ☕',
      matchPercent: 88,
      sonicArchetype: 'The Lo-Fi Minimalist',
      weeklyListeningHours: 21.0,
    },
  },
  {
    id: 'user-kai',
    name: 'Kai Davies',
    handle: '@kaibeats',
    avatarSvg: createUserAvatarSvg('Kai Davies', ['#FF6B5A', '#FF3D81']),
    status: 'listening',
    isFriend: true,
    musicPersonality: {
      topGenre: 'Bass & Driving Drops',
      vibeTag: 'Synesthetic DJ ⚡',
      matchPercent: 82,
      sonicArchetype: 'The Synesthetic DJ',
      weeklyListeningHours: 18.2,
    },
  },
];

export const MOCK_USERS: User[] = MOCK_SOCIAL_USERS;
// Deprecated alias for non-auth mock fallback
export const CURRENT_USER: User = MOCK_SOCIAL_USERS[0];

// ============================================================================
// Curated Playlists & Albums
// ============================================================================

export const MOCK_PLAYLISTS: Playlist[] = [];

// ============================================================================
// Curated Artists
// ============================================================================

export const MOCK_ARTISTS: Artist[] = [
  {
    id: 'art-1',
    name: 'The Weeknd',
    handle: '@theweeknd',
    bio: 'Pioneering Canadian singer, songwriter, and record producer known for his cinematic dark R&B and 80s synthpop revival.',
    monthlyListeners: 104200500,
    topTrackIds: [],
    artworkSvg: createAlbumArtSvg('THE WEEKND', '#FF3D81', '#8B5CF6', 'orb'),
    accentColor: '#FF3D81',
    verified: true,
    genres: ['R&B', 'Synthpop', 'Darkwave'],
  },
  {
    id: 'art-2',
    name: 'Fred again..',
    handle: '@fredagainagain',
    bio: 'London-based producer and composer capturing raw human moments through immersive diary-like electronic dance music.',
    monthlyListeners: 18900400,
    topTrackIds: [],
    artworkSvg: createAlbumArtSvg('FRED AGAIN..', '#22D3EE', '#FF3D81', 'mesh'),
    accentColor: '#22D3EE',
    verified: true,
    genres: ['Electronic', 'Bass', 'UK Garage'],
  },
  {
    id: 'art-3',
    name: 'Billie Eilish',
    handle: '@billieeilish',
    bio: 'Grammy and Academy Award-winning artist blending whispering vocals, dark bass, and genre-defying pop production.',
    monthlyListeners: 84500100,
    topTrackIds: [],
    artworkSvg: createAlbumArtSvg('BILLIE EILISH', '#B6F23A', '#1F1F25', 'geometric'),
    accentColor: '#B6F23A',
    verified: true,
    genres: ['Alternative Pop', 'Electropop'],
  },
  {
    id: 'art-4',
    name: 'SZA',
    handle: '@sza',
    bio: 'Acclaimed singer-songwriter redefining modern soul with conversational vulnerability and eclectic genre blends.',
    monthlyListeners: 68120000,
    topTrackIds: [],
    artworkSvg: createAlbumArtSvg('SZA', '#FF6B5A', '#FF3D81', 'waves'),
    accentColor: '#FF6B5A',
    verified: true,
    genres: ['R&B', 'Neo-Soul'],
  },
];

// ============================================================================
// Curated Rooms (Discord-style social music hangout)
// ============================================================================

export const MOCK_ROOMS: Room[] = [];

// ============================================================================
// Curated GIFs (Animated vector SVGs)
// ============================================================================

export const MOCK_GIFS: GIFItem[] = [
  {
    id: 'gif-1',
    title: 'Dancing Cat',
    category: 'dance',
    svg: `<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><circle cx='50' cy='50' r='40' fill='%23FF3D81'/><text x='50' y='58' font-size='28' text-anchor='middle'>🐱</text></svg>`,
  },
  {
    id: 'gif-2',
    title: 'Soundwave Equalizer',
    category: 'music',
    svg: `<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><rect x='20' y='30' width='10' height='40' rx='5' fill='%238B5CF6'/><rect x='36' y='15' width='10' height='70' rx='5' fill='%2322D3EE'/><rect x='52' y='25' width='10' height='50' rx='5' fill='%23B6F23A'/><rect x='68' y='40' width='10' height='30' rx='5' fill='%23FF6B5A'/></svg>`,
  },
  {
    id: 'gif-3',
    title: 'Fire Flame',
    category: 'hype',
    svg: `<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><circle cx='50' cy='50' r='40' fill='%23FF6B5A'/><text x='50' y='58' font-size='30' text-anchor='middle'>🔥</text></svg>`,
  },
  {
    id: 'gif-4',
    title: 'Vinyl Spin',
    category: 'groove',
    svg: `<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><circle cx='50' cy='50' r='42' fill='%231F1F25' stroke='%238B5CF6' stroke-width='4'/><circle cx='50' cy='50' r='14' fill='%23FF3D81'/></svg>`,
  },
];
