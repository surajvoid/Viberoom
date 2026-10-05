import { Track } from '../mockData.js';

/**
 * Creates an in-memory 2-second silent 44.1kHz 16-bit PCM WAV audio Blob URL.
 * Used as an HTML5 audio carrier so mobile browsers (iOS Safari, Android Chrome)
 * grant continuous background audio playback privilege (AVAudioSession / STREAM_MUSIC)
 * when the phone screen is locked or the user switches tabs/apps.
 */
export const createSilentAudioBlob = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    const sampleRate = 44100;
    const numChannels = 1;
    const bitsPerSample = 16;
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    const blockAlign = numChannels * (bitsPerSample / 8);
    const numSamples = sampleRate * 2; // 2 seconds loop
    const subChunk2Size = numSamples * blockAlign;
    const buffer = new ArrayBuffer(44 + subChunk2Size);
    const view = new DataView(buffer);

    // RIFF header
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, 36 + subChunk2Size, true);
    view.setUint32(8, 0x57415645, false); // "WAVE"
    // fmt subchunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // Subchunk1Size
    view.setUint16(20, 1, true); // AudioFormat: PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    // data subchunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, subChunk2Size, true);

    // Sub-audible 15Hz dither (amplitude = 2 out of 32767 = -84dB)
    // Completely imperceptible to human ear and below physical phone speaker reproduction,
    // but ensures iOS AVAudioSession and Android AudioTrack detect non-zero PCM energy
    // so mobile power management will NOT suspend the audio session when the screen turns off.
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.round(Math.sin((2 * Math.PI * 15 * i) / sampleRate) * 2);
      view.setInt16(offset, sample, true);
      offset += 2;
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.warn('Failed to create audio blob:', err);
    // Fallback base64 1s silent WAV data URI
    return 'data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YRAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
  }
};

/**
 * Generates verified MediaSession artwork images for iOS Lock Screen & Android Notifications.
 * If the track already has a remote or data URL, it uses it. Otherwise, it generates
 * crisp SVG vector gradient artwork matching the track's accent palette.
 */
export const getMediaSessionArtwork = (track: Track): MediaImage[] => {
  const customImg = track.coverUrl || track.artworkSvg;
  if (customImg && (customImg.startsWith('http') || customImg.startsWith('data:'))) {
    const mime = customImg.startsWith('data:image/svg') ? 'image/svg+xml' : 'image/jpeg';
    return [
      { src: customImg, sizes: '512x512', type: mime },
      { src: customImg, sizes: '256x256', type: mime },
      { src: customImg, sizes: '96x96', type: mime },
    ];
  }

  const color1 = track.accentColor || '#6366F1';
  const color2 = track.accentColor ? `${track.accentColor}99` : '#EC4899';
  const initial = track.title ? track.title.charAt(0).toUpperCase() : 'V';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}"/>
        <stop offset="100%" stop-color="${color2}"/>
      </linearGradient>
    </defs>
    <rect width="512" height="512" fill="url(#bgGrad)" rx="72"/>
    <circle cx="256" cy="256" r="140" fill="none" stroke="#ffffff" stroke-width="6" opacity="0.15"/>
    <circle cx="256" cy="256" r="80" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.25"/>
    <text x="256" y="295" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="150" font-weight="800" fill="#ffffff" text-anchor="middle" opacity="0.95">${initial}</text>
  </svg>`;

  const svgDataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

  return [
    { src: svgDataUri, sizes: '512x512', type: 'image/svg+xml' },
    { src: svgDataUri, sizes: '256x256', type: 'image/svg+xml' },
    { src: svgDataUri, sizes: '96x96', type: 'image/svg+xml' },
  ];
};

export interface MediaSessionHandlers {
  onPlay: () => void;
  onPause: () => void;
  onNextTrack: () => void;
  onPrevTrack: () => void;
  onSeekTo: (timeSeconds: number) => void;
  onSeekBackward: (offsetSeconds: number) => void;
  onSeekForward: (offsetSeconds: number) => void;
}

/**
 * Registers Media Session API action handlers for lock-screen controls,
 * Bluetooth headsets, smartwatch, and car audio dashboards.
 */
export const registerMediaSessionHandlers = (handlers: MediaSessionHandlers): (() => void) => {
  if (typeof window === 'undefined' || !('mediaSession' in navigator)) {
    return () => {};
  }

  const actions: [MediaSessionAction, (details: any) => void][] = [
    ['play', () => handlers.onPlay()],
    ['pause', () => handlers.onPause()],
    ['previoustrack', () => handlers.onPrevTrack()],
    ['nexttrack', () => handlers.onNextTrack()],
    ['stop', () => handlers.onPause()],
    [
      'seekto',
      (details) => {
        if (details.seekTime !== undefined) {
          handlers.onSeekTo(details.seekTime);
        }
      },
    ],
    [
      'seekbackward',
      (details) => {
        handlers.onSeekBackward(details.seekOffset || 10);
      },
    ],
    [
      'seekforward',
      (details) => {
        handlers.onSeekForward(details.seekOffset || 10);
      },
    ],
  ];

  actions.forEach(([action, handler]) => {
    try {
      navigator.mediaSession.setActionHandler(action, handler);
    } catch (e) {
      // Ignore unsupported optional actions in specific browsers
    }
  });

  return () => {
    actions.forEach(([action]) => {
      try {
        navigator.mediaSession.setActionHandler(action, null);
      } catch (e) {}
    });
  };
};

/**
 * Updates Media Session metadata & position timeline on lock-screen / notification shade.
 */
export const updateMediaSessionState = (
  track: Track | null,
  isPlaying: boolean,
  currentTime: number,
  duration: number
) => {
  if (typeof window === 'undefined' || !('mediaSession' in navigator) || !track) {
    return;
  }

  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: track.album || 'VibeRoom',
      artwork: getMediaSessionArtwork(track),
    });

    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

    if (duration > 0 && typeof navigator.mediaSession.setPositionState === 'function') {
      navigator.mediaSession.setPositionState({
        duration: Math.max(1, duration),
        playbackRate: 1,
        position: Math.min(Math.max(0, currentTime), duration),
      });
    }
  } catch (err) {
    // Non-fatal metadata sync catch
  }
};
