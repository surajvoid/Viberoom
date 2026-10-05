import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track, MOCK_TRACKS } from '../mockData.js';
import { useTheme } from './ThemeContext.js';
import { searchYouTube, getSimilarTracksForSong } from '../services/searchService.js';

export type RepeatMode = 'off' | 'all' | 'one';

export interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // 0 to 1
  currentTime: number; // seconds
  duration: number; // seconds
  volume: number; // 0 to 1
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffled: boolean;
  queue: Track[];
  history: Track[];
  similarTracks: Track[];
  isAutoplayEnabled: boolean;
  isExpanded: boolean;
  likedTrackIds: string[];
  likedTracks: Track[];
  isVideoMode: boolean;
  toggleVideoMode: () => void;
  toggleAutoplay: () => void;
  isLiked: (trackId?: string) => boolean;
  toggleLike: (trackOrId?: Track | string) => void;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  seekTo: (ratio: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  expandPlayer: () => void;
  collapsePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setActiveAccent } = useTheme();

  const [currentTrack, setCurrentTrack] = useState<Track | null>(() => {
    return MOCK_TRACKS.length > 0 ? MOCK_TRACKS[0] : null;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(() => {
    return MOCK_TRACKS.length > 0 ? (MOCK_TRACKS[0].duration || 180) : 0;
  });
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  const [queue, setQueue] = useState<Track[]>(() => {
    return MOCK_TRACKS.length > 1 ? MOCK_TRACKS.slice(1) : [];
  });
  const [history, setHistory] = useState<Track[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [likedTrackIds, setLikedTrackIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('viberoom_liked_ids');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [likedTracks, setLikedTracks] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('viberoom_liked_tracks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [similarTracks, setSimilarTracks] = useState<Track[]>([]);
  const [isAutoplayEnabled, setIsAutoplayEnabled] = useState<boolean>(true);
  const [isVideoMode, setIsVideoMode] = useState<boolean>(false);

  const ytPlayerRef = useRef<any>(null);
  const ytReadyRef = useRef<boolean>(false);
  const intervalRef = useRef<any>(null);

  // Synchronization refs to prevent stale closure bugs in playback listeners
  const currentTrackRef = useRef<Track | null>(currentTrack);
  const queueRef = useRef<Track[]>(queue);
  const repeatModeRef = useRef<RepeatMode>(repeatMode);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const historyRef = useRef<Track[]>(history);
  const isAutoplayEnabledRef = useRef<boolean>(isAutoplayEnabled);
  const isAutoFetchingRef = useRef<boolean>(false);
  const handleTrackEndRef = useRef<() => void>(() => {});

  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);
  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { historyRef.current = history; }, [history]);
  useEffect(() => { isAutoplayEnabledRef.current = isAutoplayEnabled; }, [isAutoplayEnabled]);

  const toggleAutoplay = () => {
    setIsAutoplayEnabled((prev) => !prev);
  };

  const isLiked = (trackId?: string) => {
    const id = trackId || currentTrack?.id;
    return id ? likedTrackIds.includes(id) : false;
  };

  const toggleLike = (trackOrId?: Track | string) => {
    let targetTrack: Track | null = null;
    let targetId: string = '';

    if (typeof trackOrId === 'object' && trackOrId !== null) {
      targetTrack = trackOrId;
      targetId = trackOrId.id;
    } else if (typeof trackOrId === 'string') {
      targetId = trackOrId;
      targetTrack = currentTrack?.id === targetId ? currentTrack : (likedTracks.find((t) => t.id === targetId) || null);
    } else if (currentTrack) {
      targetTrack = currentTrack;
      targetId = currentTrack.id;
    }

    if (!targetId) return;

    setLikedTrackIds((prev) => {
      const next = prev.includes(targetId) ? prev.filter((tId) => tId !== targetId) : [...prev, targetId];
      try {
        localStorage.setItem('viberoom_liked_ids', JSON.stringify(next));
      } catch {}
      return next;
    });

    if (targetTrack) {
      setLikedTracks((prev) => {
        const exists = prev.some((t) => t.id === targetTrack!.id);
        const next = exists ? prev.filter((t) => t.id !== targetTrack!.id) : [targetTrack!, ...prev];
        try {
          localStorage.setItem('viberoom_liked_tracks', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };

  const toggleVideoMode = () => {
    setIsVideoMode((prev) => !prev);
  };

  // Sync track accent color to Theme system
  useEffect(() => {
    if (currentTrack?.accentColor) {
      setActiveAccent(currentTrack.accentColor);
    }
  }, [currentTrack, setActiveAccent]);

  // Initialize YouTube Background Player for Real Real-time Playback
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (!document.getElementById('viberoom-yt-container')) {
      const container = document.createElement('div');
      container.id = 'viberoom-yt-container';
      container.style.position = 'fixed';
      container.style.top = '-9999px';
      container.style.left = '-9999px';
      container.style.width = '1px';
      container.style.height = '1px';
      container.style.opacity = '0';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '-999';

      const iframeSlot = document.createElement('div');
      iframeSlot.id = 'viberoom-yt-iframe-slot';
      container.appendChild(iframeSlot);
      document.body.appendChild(container);
    }

    const initYT = () => {
      const YT = (window as any).YT;
      if (YT && YT.Player && !ytPlayerRef.current) {
        try {
          ytPlayerRef.current = new YT.Player('viberoom-yt-iframe-slot', {
            height: '100%',
            width: '100%',
            videoId: currentTrack?.youtubeId || '',
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
            },
            events: {
              onReady: (event: any) => {
                ytReadyRef.current = true;
                try {
                  event.target.setVolume(volume * 100);
                } catch (e) {}
              },
              onStateChange: (event: any) => {
                // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
                if (event.data === 1) {
                  setIsPlaying(true);
                } else if (event.data === 2) {
                  setIsPlaying(false);
                } else if (event.data === 0) {
                  // User request: auto-play next song similar to that song
                  handleTrackEndRef.current?.();
                }
              },
              onError: (err: any) => {
                console.warn('YouTube playback error, auto-advancing to next similar song:', err);
                handleTrackEndRef.current?.();
              },
            },
          });
        } catch (e) {
          console.warn('YouTube player creation notice:', e);
        }
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initYT();
    } else {
      (window as any).onYouTubeIframeAPIReady = initYT;
    }
  }, []);

  // Playback timer & YouTube position sync
  useEffect(() => {
    if (isPlaying && currentTrack) {
      intervalRef.current = setInterval(() => {
        if (currentTrack.youtubeId && ytReadyRef.current && ytPlayerRef.current) {
          try {
            const cur = ytPlayerRef.current.getCurrentTime();
            const dur = ytPlayerRef.current.getDuration();
            if (typeof cur === 'number' && !isNaN(cur)) {
              setCurrentTime(cur);
            }
            if (typeof dur === 'number' && dur > 0 && !isNaN(dur)) {
              setDuration(dur);
            }
            // Auto-advance if video reaches end (within 0.8s)
            if (typeof cur === 'number' && typeof dur === 'number' && dur > 3 && cur >= dur - 0.8) {
              handleTrackEndRef.current?.();
            }
            return;
          } catch (e) {}
        }

        // Fallback simulation timer
        setCurrentTime((prev) => {
          const next = prev + 0.5;
          const currentDur = currentTrack.duration || 30;
          if (next >= currentDur) {
            if (repeatModeRef.current === 'one') {
              return 0;
            } else {
              setTimeout(() => {
                handleTrackEndRef.current?.();
              }, 10);
              return 0;
            }
          }
          return next;
        });
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentTrack, repeatMode]);

  const progress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  // Proactively fetch similar tracks to populate queue with related music
  const prefetchSimilarTracks = async (track: Track) => {
    if (isAutoFetchingRef.current || !track) return;
    isAutoFetchingRef.current = true;
    try {
      const similar = await getSimilarTracksForSong(track);
      if (similar && similar.length > 0) {
        setSimilarTracks(similar);
        setQueue((currentQueue) => {
          // If queue is empty or has only 1 track, populate with authentic similar songs
          if (currentQueue.length <= 1) {
            const existingKeys = new Set([
              track.id.toLowerCase(),
              ...(track.youtubeId ? [track.youtubeId.toLowerCase()] : []),
            ]);
            const filtered = similar.filter(
              (s) =>
                !existingKeys.has(s.id.toLowerCase()) &&
                (!s.youtubeId || !existingKeys.has(s.youtubeId.toLowerCase()))
            );
            return filtered.slice(0, 8);
          }
          return currentQueue;
        });
      }
    } catch (err) {
      console.warn('Auto-prefetch similar tracks error:', err);
    } finally {
      isAutoFetchingRef.current = false;
    }
  };

  // Auto-play the next song: automatically chooses a similar song when queue is empty or user is idle
  const fetchSimilarAndPlayNext = async (track: Track) => {
    try {
      const similar = await getSimilarTracksForSong(track);
      const historyKeys = new Set(
        historyRef.current.flatMap((h) => [h.id.toLowerCase(), ...(h.youtubeId ? [h.youtubeId.toLowerCase()] : [])])
      );
      historyKeys.add(track.id.toLowerCase());
      if (track.youtubeId) historyKeys.add(track.youtubeId.toLowerCase());

      const candidate =
        similar.find(
          (t) =>
            !historyKeys.has(t.id.toLowerCase()) &&
            (!t.youtubeId || !historyKeys.has(t.youtubeId.toLowerCase()))
        ) || similar[0];

      if (candidate) {
        setHistory((prev) => [track, ...prev]);
        setCurrentTrack(candidate);
        setDuration(candidate.duration || 180);
        setCurrentTime(0);
        setIsPlaying(true);

        const remaining = similar
          .filter(
            (t) =>
              t.id.toLowerCase() !== candidate.id.toLowerCase() &&
              (!t.youtubeId || !candidate.youtubeId || t.youtubeId !== candidate.youtubeId)
          )
          .slice(0, 6);
        setQueue(remaining);

        if (candidate.youtubeId && ytReadyRef.current && ytPlayerRef.current) {
          try {
            ytPlayerRef.current.loadVideoById(candidate.youtubeId);
            ytPlayerRef.current.playVideo();
          } catch (e) {}
        }
        return;
      }
    } catch (err) {
      console.warn('Auto-play similar track notice:', err);
    }

    // Fallback if no similar songs found
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleTrackEnd = async () => {
    const current = currentTrackRef.current;
    const currentQueue = queueRef.current;
    const mode = repeatModeRef.current;

    if (mode === 'one' && current) {
      setCurrentTime(0);
      setIsPlaying(true);
      if (current.youtubeId && ytReadyRef.current && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.seekTo(0, true);
          ytPlayerRef.current.playVideo();
        } catch (e) {}
      }
      return;
    }

    if (currentQueue.length > 0) {
      const next = currentQueue[0];
      if (current) {
        setHistory((prev) => [current, ...prev]);
      }
      setCurrentTrack(next);
      setDuration(next.duration || 180);
      setQueue((prev) => prev.slice(1));
      setCurrentTime(0);
      setIsPlaying(true);

      if (next.youtubeId && ytReadyRef.current && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.loadVideoById(next.youtubeId);
          ytPlayerRef.current.playVideo();
        } catch (e) {}
      }

      // Keep continuous autoplay queue stocked with similar tracks
      if (currentQueue.length <= 3) {
        prefetchSimilarTracks(next);
      }
      return;
    }

    // Queue empty: auto-play next song similar to current track
    if (current && isAutoplayEnabledRef.current) {
      await fetchSimilarAndPlayNext(current);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      if (ytReadyRef.current && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch (e) {}
      }
    }
  };

  // Keep handleTrackEnd ref updated
  handleTrackEndRef.current = handleTrackEnd;

  const playTrack = (track: Track) => {
    if (!track) return;
    if (!currentTrack || track.id !== currentTrack.id) {
      if (currentTrack) {
        setHistory((prev) => [currentTrack, ...prev]);
      }
      setCurrentTrack(track);
      setDuration(track.duration || 180);
      setCurrentTime(0);
      setQueue((prev) => prev.filter((t) => t.id !== track.id));

      if (track.youtubeId && ytReadyRef.current && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.loadVideoById(track.youtubeId);
          ytPlayerRef.current.playVideo();
        } catch (e) {}
      }

      // Proactively fetch and queue similar tracks for seamless continuous playback
      prefetchSimilarTracks(track);
    } else {
      if (track.youtubeId && ytReadyRef.current && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.playVideo();
        } catch (e) {}
      }
    }
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    setIsPlaying((prev) => {
      const nextState = !prev;
      if (currentTrack.youtubeId && ytReadyRef.current && ytPlayerRef.current) {
        try {
          if (nextState) {
            ytPlayerRef.current.playVideo();
          } else {
            ytPlayerRef.current.pauseVideo();
          }
        } catch (e) {}
      }
      return nextState;
    });
  };

  const pause = () => {
    if (!currentTrack) return;
    setIsPlaying(false);
    if (currentTrack.youtubeId && ytReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch (e) {}
    }
  };

  const resume = () => {
    if (!currentTrack) return;
    setIsPlaying(true);
    if (currentTrack.youtubeId && ytReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.playVideo();
      } catch (e) {}
    }
  };

  const seekTo = (ratio: number) => {
    if (!currentTrack) return;
    const clamped = Math.min(1, Math.max(0, ratio));
    const targetSeconds = clamped * duration;
    setCurrentTime(targetSeconds);

    if (currentTrack.youtubeId && ytReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(targetSeconds, true);
      } catch (e) {}
    }
  };

  const nextTrack = () => {
    handleTrackEndRef.current?.();
  };

  const prevTrack = () => {
    if (!currentTrack) return;
    if (currentTime > 3 || history.length === 0) {
      setCurrentTime(0);
      if (currentTrack.youtubeId && ytReadyRef.current && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.seekTo(0, true);
        } catch (e) {}
      }
    } else {
      const prev = history[0];
      setHistory((h) => h.slice(1));
      setQueue((q) => [currentTrack, ...q]);
      setCurrentTrack(prev);
      setDuration(prev.duration || 180);
      setCurrentTime(0);
      setIsPlaying(true);

      if (prev.youtubeId && ytReadyRef.current && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.loadVideoById(prev.youtubeId);
          ytPlayerRef.current.playVideo();
        } catch (e) {}
      }
    }
  };

  const addToQueue = (track: Track) => {
    setQueue((prev) => [...prev, track]);
  };

  const removeFromQueue = (trackId: string) => {
    setQueue((prev) => prev.filter((t) => t.id !== trackId));
  };

  const reorderQueue = (fromIndex: number, toIndex: number) => {
    setQueue((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  };

  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (clamped > 0 && isMuted) setIsMuted(false);
    if (ytReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.setVolume(clamped * 100);
      } catch (e) {}
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (ytReadyRef.current && ytPlayerRef.current) {
        try {
          if (next) {
            ytPlayerRef.current.mute();
          } else {
            ytPlayerRef.current.unMute();
          }
        } catch (e) {}
      }
      return next;
    });
  };

  const toggleRepeat = () => {
    setRepeatMode((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  };

  const toggleShuffle = () => {
    setIsShuffled((prev) => !prev);
  };

  const expandPlayer = () => setIsExpanded(true);
  const collapsePlayer = () => setIsExpanded(false);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        currentTime,
        duration,
        volume,
        isMuted,
        repeatMode,
        isShuffled,
        queue,
        history,
        similarTracks,
        isAutoplayEnabled,
        isExpanded,
        likedTrackIds,
        likedTracks,
        isVideoMode,
        toggleVideoMode,
        toggleAutoplay,
        isLiked,
        toggleLike,
        playTrack,
        togglePlay,
        pause,
        resume,
        seekTo,
        nextTrack,
        prevTrack,
        addToQueue,
        removeFromQueue,
        reorderQueue,
        setVolume,
        toggleMute,
        toggleRepeat,
        toggleShuffle,
        expandPlayer,
        collapsePlayer,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
