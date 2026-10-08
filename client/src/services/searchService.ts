import { Track, createAlbumArtSvg, MOCK_TRACKS, MOCK_ARTISTS, MOCK_PLAYLISTS, MOCK_ROOMS } from '../mockData.js';

const ACCENTS = ['#FF3D81', '#8B5CF6', '#B6F23A', '#22D3EE', '#FF6B5A'];

function hashStringToAccent(str: string): { primary: string; secondary: string } {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % ACCENTS.length;
  const secIdx = (idx + 1) % ACCENTS.length;
  return { primary: ACCENTS[idx], secondary: ACCENTS[secIdx] };
}

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    if (window.location.port === '3000') {
      return `${window.location.protocol}//${window.location.hostname}:4000/api`;
    }
    return `${window.location.origin}/api`;
  }
  return 'http://localhost:4000/api';
}

export interface SearchResults {
  query: string;
  isSmartSearch: boolean;
  smartVibe?: {
    mood: string;
    description: string;
    suggestedAccent: string;
  };
  tracks: Track[];
  artists: typeof MOCK_ARTISTS;
  playlists: typeof MOCK_PLAYLISTS;
  rooms: typeof MOCK_ROOMS;
  source: 'youtube' | 'catalog' | 'hybrid';
}

import { resolveAudioUrlForTrack } from './audioStreamService.js';

// Convert YouTube API item to first-class Track object
export function convertYouTubeVideoToTrack(ytVideo: any): Track {
  const { primary, secondary } = hashStringToAccent(ytVideo.title || 'Music');
  const duration = ytVideo.durationSec || (ytVideo.seconds ? ytVideo.seconds : 180);

  // Generate pleasant fallback lyrics
  const titleWords = (ytVideo.title || 'Music').split(' ').slice(0, 3).join(' ');
  const lyrics = [
    { time: 0, text: `♪ ${titleWords} begins ♪` },
    { time: Math.floor(duration * 0.15), text: 'Feel the rhythm and the frequency' },
    { time: Math.floor(duration * 0.35), text: 'Synchronized across the room tonight' },
    { time: Math.floor(duration * 0.6), text: 'Vibing together with the sound' },
    { time: Math.floor(duration * 0.85), text: `♪ ${titleWords} fades into the night ♪` },
  ];

  return {
    id: ytVideo.id || `yt-${ytVideo.youtubeId || ytVideo.videoId}`,
    youtubeId: ytVideo.youtubeId || ytVideo.videoId,
    title: ytVideo.title?.replace(/(\(Official.*|\(Audio.*|\[Official.*|\[Audio.*)/gi, '').trim() || 'Unknown Track',
    artist: ytVideo.artist || ytVideo.author?.name || 'YouTube Artist',
    album: ytVideo.album || 'YouTube Music',
    duration: duration,
    accentColor: primary,
    secondaryColor: secondary,
    artworkSvg: createAlbumArtSvg(ytVideo.title || 'YouTube', primary, secondary, 'mesh'),
    coverUrl: ytVideo.coverUrl || ytVideo.thumbnail || ytVideo.image,
    genre: 'YouTube Trending',
    bpm: 124,
    energy: 88,
    plays: Math.floor(Math.random() * 2000000) + 500000,
    likes: Math.floor(Math.random() * 150000) + 12000,
    lyrics,
    audioUrl: '',
  };
}

// Real-Time YouTube Search with Instant Fallback
export async function searchYouTube(query: string): Promise<Track[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/youtube/search?q=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.videos) && data.videos.length > 0) {
        return data.videos.map(convertYouTubeVideoToTrack);
      }
    }
  } catch (err) {
    console.warn('YouTube search fetch notice, falling back to local catalog:', err);
  }

  // Fallback to searching mock tracks if backend is unreachable
  return MOCK_TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(trimmed.toLowerCase()) ||
      t.artist.toLowerCase().includes(trimmed.toLowerCase()) ||
      t.genre.toLowerCase().includes(trimmed.toLowerCase())
  );
}

// Smart Natural Language & Catalog Search (PRD Section 24 & 25)
import { findContextualSoundscape } from './contextualMusicService.js';

export async function performSmartSearch(rawQuery: string): Promise<SearchResults> {
  const query = rawQuery.trim().toLowerCase();
  if (!query) {
    return {
      query: '',
      isSmartSearch: false,
      tracks: MOCK_TRACKS,
      artists: MOCK_ARTISTS,
      playlists: MOCK_PLAYLISTS,
      rooms: MOCK_ROOMS,
      source: 'catalog',
    };
  }

  // 1. Genuine Contextual Soundscape Matching (Requirement 3)
  const soundscapeMatch = findContextualSoundscape(rawQuery);
  let isSmartSearch = false;
  let smartVibe: SearchResults['smartVibe'] = undefined;
  let contextualTracks: Track[] = [];

  if (soundscapeMatch) {
    isSmartSearch = true;
    smartVibe = {
      mood: `${soundscapeMatch.name} ${soundscapeMatch.emoji}`,
      description: soundscapeMatch.tagline,
      suggestedAccent: soundscapeMatch.accentColor,
    };
    contextualTracks = soundscapeMatch.tracks;
  }

  // 2. Fetch from real YouTube search (using targeted keywords if contextual match exists)
  const ytSearchQuery = soundscapeMatch
    ? `${soundscapeMatch.name} ${soundscapeMatch.targetKeywords.slice(0, 2).join(' ')} songs`
    : rawQuery;
  const ytTracks = await searchYouTube(ytSearchQuery);

  // 3. Local catalog matches
  const localTracks = MOCK_TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(query) ||
      t.artist.toLowerCase().includes(query) ||
      t.genre.toLowerCase().includes(query) ||
      (isSmartSearch && smartVibe && t.energy > (query.includes('workout') ? 80 : 0))
  );

  // Combine and deduplicate
  const seenIds = new Set<string>();
  const combinedTracks: Track[] = [];

  for (const track of [...contextualTracks, ...localTracks, ...ytTracks]) {
    const key = track.youtubeId || track.id;
    if (!seenIds.has(key)) {
      seenIds.add(key);
      combinedTracks.push(track);
    }
  }

  const artists = MOCK_ARTISTS.filter(
    (a) => a.name.toLowerCase().includes(query) || a.genres.some((g) => g.toLowerCase().includes(query))
  );

  const playlists = MOCK_PLAYLISTS.filter(
    (p) => p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query)
  );

  const rooms = MOCK_ROOMS.filter(
    (r) =>
      r.name.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query) ||
      r.code.includes(query)
  );

  return {
    query: rawQuery,
    isSmartSearch,
    smartVibe,
    tracks: combinedTracks,
    artists,
    playlists,
    rooms,
    source: ytTracks.length > 0 ? 'youtube' : 'catalog',
  };
}

// ============================================================================
// Auto-Play & Continuous Similar Music Discovery
// Finds authentic similar tracks based on artist, contextual vibe, and YouTube
// ============================================================================
import { CONTEXTUAL_SOUNDSCAPES } from './contextualMusicService.js';

export async function getSimilarTracksForSong(track: Track): Promise<Track[]> {
  if (!track) return [];
  const similar: Track[] = [];
  const seen = new Set<string>();
  const trackKey = (track.youtubeId || track.id).toLowerCase();
  seen.add(trackKey);

  // 1. Check contextual soundscapes for closely aligned tracks
  for (const soundscape of CONTEXTUAL_SOUNDSCAPES) {
    const hasTrack = soundscape.tracks.some(
      (t) =>
        t.id === track.id ||
        (t.youtubeId && t.youtubeId === track.youtubeId) ||
        (t.artist && track.artist && t.artist.toLowerCase() === track.artist.toLowerCase())
    );
    if (hasTrack) {
      for (const st of soundscape.tracks) {
        const key = (st.youtubeId || st.id).toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          similar.push(st);
        }
      }
    }
  }

  // 2. Fetch real YouTube similar/related tracks based on artist & genre
  try {
    const cleanArtist = track.artist.replace(/ - Topic| Official| VEVO/gi, '').trim();
    const query =
      cleanArtist && cleanArtist !== 'YouTube Artist'
        ? `${cleanArtist} songs`
        : `${track.title} similar songs`;

    const ytResults = await searchYouTube(query);
    for (const yt of ytResults) {
      const key = (yt.youtubeId || yt.id).toLowerCase();
      // Avoid adding the exact same song
      const sameTitle =
        track.title.length > 3 &&
        (yt.title.toLowerCase().includes(track.title.toLowerCase()) ||
          track.title.toLowerCase().includes(yt.title.toLowerCase()));

      if (!seen.has(key) && !sameTitle) {
        seen.add(key);
        similar.push(yt);
      }
    }
  } catch (err) {
    console.warn('Error fetching similar songs from YouTube:', err);
  }

  return similar;
}
