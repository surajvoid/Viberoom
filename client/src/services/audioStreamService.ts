/**
 * Audio Stream Service
 * 
 * Ensures authentic, real-time playback for all tracks.
 * Does NOT inject or play default/demo audio tracks.
 * Audio is streamed in real time directly from the authentic source (YouTube stream or uploaded media).
 */

import { Track } from '../mockData.js';

export function isDefaultAudioUrl(url?: string | null): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('/audio/vibe-track') ||
    lower.includes('pixabay.com')
  );
}

/**
 * Resolves an authentic audio stream URL only if a genuine custom stream is present.
 * Never returns default / demo audio tracks.
 */
export function resolveAudioUrlForTrack(track: Partial<Track> | null | undefined): string {
  if (!track || !track.audioUrl) return '';
  const trimmed = track.audioUrl.trim();
  if (isDefaultAudioUrl(trimmed)) {
    return '';
  }
  return trimmed;
}

/**
 * Sanitizes a Track object to ensure NO default / demo audio files are used.
 */
export function ensureTrackAudioUrl(track: Track): Track {
  if (!track) return track;
  if (isDefaultAudioUrl(track.audioUrl)) {
    return {
      ...track,
      audioUrl: '',
    };
  }
  return track;
}
