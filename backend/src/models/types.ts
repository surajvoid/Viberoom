export interface User {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  status: 'online' | 'offline' | 'listening';
  currentlyListening?: {
    songId: string;
    songTitle: string;
    artist: string;
    coverUrl: string;
  };
  streakDays: number;
  totalListeningHours: number;
  totalPlays: number;
}

export interface LyricLine {
  timeMs: number;
  text: string;
}

export interface ReactionTimestamp {
  timestampSec: number;
  type: string; // '❤️' | '🔥' | '😭' | '😂'
  count: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  audioUrl: string;
  coverUrl: string;
  genre: string;
  mood: string;
  dominantColor: string;
  youtubeId?: string;
  lyrics?: LyricLine[];
  reactionTimeline?: ReactionTimestamp[];
  isUserUploaded?: boolean;
  uploadedAt?: number;
}

export interface Playlist {
  id: string;
  title: string;
  stackedTitle: string[];
  description: string;
  coverUrl: string;
  curatorName: string;
  duration: string;
  songCount: number;
  songs: Song[];
  isEditorial: boolean;
}

export interface RoomMember {
  socketId: string;
  user: User;
  joinedAt: number;
}

export interface RoomMessage {
  id: string;
  roomId: string;
  user: User;
  text?: string;
  gifUrl?: string;
  timestamp: number;
  type: 'chat' | 'system';
}

export interface FloatingReaction {
  id: string;
  roomId: string;
  user: User;
  emoji: string;
  positionMs: number;
  timestamp: number;
}

export interface Room {
  id: string;
  code: string; // Short 4-6 character Groic-style join code, e.g. "8492"
  title: string;
  mode: 'private' | 'friends' | 'public' | 'radio';
  controlMode: 'host_only' | 'everyone';
  hostId: string;
  currentSong: Song;
  isPlaying: boolean;
  positionMs: number;
  serverTimestamp: number;
  members: RoomMember[];
  queue: Song[];
  messages: RoomMessage[];
  reactions: FloatingReaction[];
  listenerCount: number;
}

export interface SongDedication {
  id: string;
  song: Song;
  fromUser: User;
  toUserName: string;
  message: string;
  timestamp: number;
  likesCount: number;
}

export interface RadioStation {
  id: string;
  name: string;
  frequency: string;
  tagline: string;
  genre: string;
  coverUrl: string;
  currentSong: Song;
  listenersCount: number;
  streamUrl: string;
}

export interface TopChart {
  id: string;
  title: string;
  subtitle: string;
  country: string;
  coverUrl: string;
  songs: Song[];
}
