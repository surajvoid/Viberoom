import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Song, SongDedication, RadioStation } from '../types/index.js';
import { fallbackSongs, fallbackDedications } from '../services/api.js';

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  queue: Song[];
  likedSongs: Set<string>;
  isFullPlayerOpen: boolean;
  isRoomOpen: boolean;
  activeRoomId: string | null;
  currentDedication: SongDedication | null;
  isRadioMode: boolean;
  currentRadioStation: RadioStation | null;
  userUploadedSongs: Song[];
  continuousPlay: boolean;
  isDedicateModalOpen: boolean;
  songToDedicate: Song | null;
  isVideoMode: boolean;
  toggleVideoMode: () => void;
  toggleLike: (songId: string) => void;
  playSong: (song: Song, newQueue?: Song[], dedication?: SongDedication) => void;
  togglePlayPause: () => void;
  seek: (seconds: number) => void;
  next: () => void;
  prev: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  openFullPlayer: () => void;
  closeFullPlayer: () => void;
  openRoom: (roomId: string) => void;
  closeRoom: () => void;
  setSyncedPlayback: (song: Song, positionMs: number, shouldPlay: boolean) => void;
  tuneToRadio: (station: RadioStation) => void;
  addUploadedSong: (song: Song) => void;
  setSongDedication: (dedication: SongDedication | null) => void;
  openDedicateModal: (song?: Song) => void;
  closeDedicateModal: () => void;
  toggleContinuousPlay: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(fallbackSongs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(fallbackSongs[0].durationSec);
  const [volume, setVolumeState] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState<Song[]>(fallbackSongs);
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set(['song-apna-bana-le']));
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);
  const [isRoomOpen, setIsRoomOpen] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isVideoMode, setIsVideoMode] = useState(false);

  // Groic Features State
  const [currentDedication, setCurrentDedication] = useState<SongDedication | null>(null);
  const [isRadioMode, setIsRadioMode] = useState(false);
  const [currentRadioStation, setCurrentRadioStation] = useState<RadioStation | null>(null);
  const [userUploadedSongs, setUserUploadedSongs] = useState<Song[]>([]);
  const [continuousPlay, setContinuousPlay] = useState(true);
  const [isDedicateModalOpen, setIsDedicateModalOpen] = useState(false);
  const [songToDedicate, setSongToDedicate] = useState<Song | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytReadyRef = useRef<boolean>(false);
  const pendingTrackRef = useRef<{ song: Song; queue?: Song[]; dedication?: SongDedication } | null>(null);

  // 1. Initialize HTML5 Audio Element for MP3s / Radio / Local uploads
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume;
    audio.preload = 'auto';

    if (currentSong && !currentSong.youtubeId) {
      audio.src = currentSong.audioUrl;
    }

    const onTimeUpdate = () => {
      if (audioRef.current && !currentSong?.youtubeId) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    const onLoadedMetadata = () => {
      if (audioRef.current && !currentSong?.youtubeId) {
        setDuration(audioRef.current.duration || (currentSong?.durationSec || 180));
      }
    };

    const onEnded = () => {
      if (!currentSong?.youtubeId) {
        next();
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // 2. Initialize YouTube IFrame Player API for Real Streaming & Real-Time Sync
  useEffect(() => {
    const initYT = () => {
      if ((window as any).YT && (window as any).YT.Player && !ytPlayerRef.current) {
        try {
          ytPlayerRef.current = new (window as any).YT.Player('groic-youtube-iframe', {
            height: '100%',
            width: '100%',
            videoId: currentSong?.youtubeId || 'UEvOsQBu1jY',
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
              origin: typeof window !== 'undefined' ? window.location.origin : '',
            },
            events: {
              onReady: (event: any) => {
                ytReadyRef.current = true;
                try {
                  event.target.setVolume(volume * 100);
                } catch (e) {}

                if (pendingTrackRef.current) {
                  const p = pendingTrackRef.current;
                  pendingTrackRef.current = null;
                  playSong(p.song, p.queue, p.dedication);
                }
              },
              onStateChange: (event: any) => {
                // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
                if (event.data === 1) {
                  setIsPlaying(true);
                } else if (event.data === 2) {
                  setIsPlaying(false);
                } else if (event.data === 0) {
                  setIsPlaying(false);
                  next();
                }
              },
              onError: (err: any) => {
                console.warn('YouTube streaming player event', err);
              },
            },
          });
        } catch (e) {
          console.warn('YouTube player init notice', e);
        }
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initYT();
    } else {
      (window as any).onYouTubeIframeAPIReady = initYT;
    }
  }, []);

  // 3. YouTube Time Polling
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentSong?.youtubeId && ytReadyRef.current && ytPlayerRef.current) {
        try {
          const cur = ytPlayerRef.current.getCurrentTime();
          const dur = ytPlayerRef.current.getDuration();
          if (typeof cur === 'number' && !isNaN(cur)) {
            setCurrentTime(cur);
          }
          if (typeof dur === 'number' && dur > 0 && !isNaN(dur)) {
            setDuration(dur);
          }
        } catch (e) {}
      }
    }, 250);

    return () => clearInterval(interval);
  }, [currentSong]);

  const toggleVideoMode = () => {
    setIsVideoMode((prev) => !prev);
  };

  const playSong = (song: Song, newQueue?: Song[], dedication?: SongDedication) => {
    setIsRadioMode(false);
    setCurrentRadioStation(null);
    setCurrentSong(song);
    if (newQueue) setQueue(newQueue);
    setCurrentTime(0);
    setDuration(song.durationSec);

    if (dedication) {
      setCurrentDedication(dedication);
    } else {
      setCurrentDedication(null);
    }

    if (song.youtubeId) {
      // Pause HTML5 audio
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }

      if (ytReadyRef.current && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.loadVideoById({
            videoId: song.youtubeId,
            startSeconds: 0,
          });
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        } catch (err) {
          console.warn('YouTube play attempt', err);
        }
      } else {
        pendingTrackRef.current = { song, queue: newQueue, dedication };
      }
    } else {
      // Standard audio
      if (ytReadyRef.current && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch (e) {}
      }
      if (audioRef.current) {
        if (audioRef.current.src !== song.audioUrl) {
          audioRef.current.src = song.audioUrl;
        }
        audioRef.current.currentTime = 0;
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.log('Autoplay interaction needed', err);
            setIsPlaying(false);
          });
      }
    }
  };

  const tuneToRadio = (station: RadioStation) => {
    setIsRadioMode(true);
    setCurrentRadioStation(station);
    setCurrentSong(station.currentSong);
    setCurrentDedication(null);
    setCurrentTime(0);
    setDuration(station.currentSong.durationSec);

    if (ytReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch (e) {}
    }

    if (audioRef.current) {
      audioRef.current.src = station.streamUrl;
      audioRef.current.currentTime = 0;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log('Radio interaction needed', err));
    }
  };

  const togglePlayPause = () => {
    if (currentSong?.youtubeId) {
      if (ytReadyRef.current && ytPlayerRef.current) {
        try {
          if (isPlaying) {
            ytPlayerRef.current.pauseVideo();
            setIsPlaying(false);
          } else {
            ytPlayerRef.current.playVideo();
            setIsPlaying(true);
          }
        } catch (e) {}
      }
    } else {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.log('Audio interaction needed', err));
      }
    }
  };

  const seek = (seconds: number) => {
    setCurrentTime(seconds);
    if (currentSong?.youtubeId) {
      if (ytReadyRef.current && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.seekTo(seconds, true);
        } catch (e) {}
      }
    } else {
      if (audioRef.current) {
        audioRef.current.currentTime = seconds;
      }
    }
  };

  const next = () => {
    if (!currentSong) return;

    if (queue.length > 0) {
      const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
      if (currentIndex !== -1 && currentIndex < queue.length - 1) {
        playSong(queue[currentIndex + 1]);
        return;
      }
    }

    // Groic Continuous Autoplay: Find similar track to keep music going
    if (continuousPlay) {
      const pool = [...fallbackSongs, ...userUploadedSongs];
      const nextCandidate =
        pool.find((s) => s.genre === currentSong.genre && s.id !== currentSong.id) ||
        pool[(pool.findIndex((s) => s.id === currentSong.id) + 1) % pool.length];

      if (nextCandidate) {
        playSong(nextCandidate);
      }
    }
  };

  const prev = () => {
    if (!currentSong || queue.length === 0) return;
    if (currentTime > 3) {
      seek(0);
      return;
    }
    const currentIndex = queue.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    playSong(queue[prevIndex]);
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (ytReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.setVolume(val * 100);
      } catch (e) {}
    }
    if (val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (isMuted) {
      if (audioRef.current) audioRef.current.muted = false;
      if (ytReadyRef.current && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.unMute();
        } catch (e) {}
      }
      setIsMuted(false);
    } else {
      if (audioRef.current) audioRef.current.muted = true;
      if (ytReadyRef.current && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.mute();
        } catch (e) {}
      }
      setIsMuted(true);
    }
  };

  const toggleLike = (songId: string) => {
    setLikedSongs((prev) => {
      const nextSet = new Set(prev);
      if (nextSet.has(songId)) {
        nextSet.delete(songId);
      } else {
        nextSet.add(songId);
      }
      return nextSet;
    });
  };

  const openFullPlayer = () => setIsFullPlayerOpen(true);
  const closeFullPlayer = () => setIsFullPlayerOpen(false);

  const openRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    setIsRoomOpen(true);
  };
  const closeRoom = () => {
    setIsRoomOpen(false);
  };

  const setSongDedication = (dedication: SongDedication | null) => {
    setCurrentDedication(dedication);
  };

  const openDedicateModal = (song?: Song) => {
    setSongToDedicate(song || currentSong);
    setIsDedicateModalOpen(true);
  };

  const closeDedicateModal = () => {
    setIsDedicateModalOpen(false);
    setSongToDedicate(null);
  };

  const addUploadedSong = (song: Song) => {
    setUserUploadedSongs((prev) => [song, ...prev]);
    setQueue((prev) => [song, ...prev]);
  };

  const toggleContinuousPlay = () => {
    setContinuousPlay((prev) => !prev);
  };

  // Real-time synchronization handler for Listening Rooms
  const setSyncedPlayback = (song: Song, positionMs: number, shouldPlay: boolean) => {
    const targetSec = positionMs / 1000;

    if (song.youtubeId) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }

      const isDifferentSong = !currentSong || currentSong.youtubeId !== song.youtubeId;

      if (isDifferentSong) {
        setCurrentSong(song);
        setDuration(song.durationSec);
      }

      if (ytReadyRef.current && ytPlayerRef.current) {
        try {
          if (isDifferentSong) {
            ytPlayerRef.current.loadVideoById({
              videoId: song.youtubeId,
              startSeconds: targetSec,
            });
            if (shouldPlay) {
              ytPlayerRef.current.playVideo();
              setIsPlaying(true);
            } else {
              ytPlayerRef.current.pauseVideo();
              setIsPlaying(false);
            }
          } else {
            const ytCur = ytPlayerRef.current.getCurrentTime() || 0;
            if (Math.abs(ytCur - targetSec) > 0.6) {
              ytPlayerRef.current.seekTo(targetSec, true);
              setCurrentTime(targetSec);
            }
            if (shouldPlay && !isPlaying) {
              ytPlayerRef.current.playVideo();
              setIsPlaying(true);
            } else if (!shouldPlay && isPlaying) {
              ytPlayerRef.current.pauseVideo();
              setIsPlaying(false);
            }
          }
        } catch (err) {
          console.warn('Sync YouTube playback notice', err);
        }
      }
    } else {
      if (ytReadyRef.current && ytPlayerRef.current) {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch (e) {}
      }

      if (!audioRef.current) return;

      if (!currentSong || currentSong.id !== song.id) {
        setCurrentSong(song);
        setDuration(song.durationSec);
        audioRef.current.src = song.audioUrl;
      }

      const diff = Math.abs(audioRef.current.currentTime - targetSec);
      if (diff > 0.35) {
        audioRef.current.currentTime = targetSec;
        setCurrentTime(targetSec);
      }

      if (shouldPlay && audioRef.current.paused) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      } else if (!shouldPlay && !audioRef.current.paused) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <AudioContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        queue,
        likedSongs,
        isFullPlayerOpen,
        isRoomOpen,
        activeRoomId,
        currentDedication,
        isRadioMode,
        currentRadioStation,
        userUploadedSongs,
        continuousPlay,
        isDedicateModalOpen,
        songToDedicate,
        isVideoMode,
        toggleVideoMode,
        toggleLike,
        playSong,
        togglePlayPause,
        seek,
        next,
        prev,
        setVolume,
        toggleMute,
        openFullPlayer,
        closeFullPlayer,
        openRoom,
        closeRoom,
        setSyncedPlayback,
        tuneToRadio,
        addUploadedSong,
        setSongDedication,
        openDedicateModal,
        closeDedicateModal,
        toggleContinuousPlay,
      }}
    >
      {children}

      {/* Docked YouTube Streamer Container (Audio-First or Video HD Mode) */}
      <div
        id="groic-youtube-wrapper"
        className={`transition-all duration-300 ${
          isVideoMode && isFullPlayerOpen && currentSong?.youtubeId
            ? 'fixed top-20 left-1/2 -translate-x-1/2 w-[90%] max-w-[360px] aspect-video rounded-2xl overflow-hidden shadow-2xl z-50 border border-white/20 bg-black pointer-events-auto'
            : 'fixed -bottom-[9999px] -left-[9999px] w-[240px] h-[180px] opacity-[0.001] pointer-events-none -z-50'
        }`}
      >
        <div id="groic-youtube-iframe" className="w-full h-full" />
      </div>
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) throw new Error('useAudio must be used within AudioProvider');
  return context;
};
