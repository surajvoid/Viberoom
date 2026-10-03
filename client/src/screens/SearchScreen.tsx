import React, { useState, useEffect } from 'react';
import { Song, Playlist, Room } from '../types/index.js';
import { api } from '../services/api.js';
import { useAudio } from '../context/AudioContext.js';
import { useSocket } from '../context/SocketContext.js';
import { EditorialTitle } from '../components/EditorialTitle.js';
import { SongRow } from '../components/SongRow.js';
import { Search, X, Radio, Users, Sparkles } from 'lucide-react';

interface SearchScreenProps {
  onOpenRoom: (roomId: string) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ onOpenRoom }) => {
  const [query, setQuery] = useState('');
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const { playSong } = useAudio();
  const { joinRoom } = useSocket();

  const trendingGenres = [
    { title: 'HIP-HOP', lines: ['HIP', 'HOP'], color: '#241A2E' },
    { title: 'BOLLYWOOD', lines: ['BOLLY', 'WOOD'], color: '#2B1B17' },
    { title: 'R&B', lines: ['R &', 'B'], color: '#2D1515' },
    { title: 'LO-FI', lines: ['LO', 'FI'], color: '#1A192E' },
    { title: 'ROCK', lines: ['RO', 'CK'], color: '#172722' },
    { title: 'K-POP', lines: ['K', 'POP'], color: '#171D2B' },
  ];

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSongs([]);
      setPlaylists([]);
      setRooms([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      api.search(query)
        .then((data) => {
          setSongs(data.songs || []);
          setPlaylists(data.playlists || []);
          setRooms(data.rooms || []);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleGenreClick = (genre: string) => {
    if (selectedGenre === genre) {
      setSelectedGenre(null);
      setQuery('');
    } else {
      setSelectedGenre(genre);
      setQuery(genre);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-32 pt-2 px-4 max-w-md mx-auto">
      {/* Editorial Header */}
      <section className="pt-2">
        <span className="text-xs font-mono tracking-widest text-content-muted uppercase">
          SEARCH & STREAM
        </span>
        <h1 className="text-3xl font-serif tracking-tight text-content-primary mt-1">
          Search Any Song <br />
          <span className="italic text-emerald-400">on YouTube</span>
        </h1>
      </section>

      {/* Minimal Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search ANY song, artist, YouTube video..."
          className="w-full bg-surface-primary border border-border-subtle rounded-2xl py-3 pl-10 pr-10 text-sm text-content-primary placeholder-content-muted focus:outline-none focus:border-emerald-500 transition-colors"
        />
        {isLoading ? (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            <span className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : query ? (
          <button
            onClick={() => {
              setQuery('');
              setSelectedGenre(null);
            }}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-content-muted hover:text-content-primary"
          >
            <X size={16} />
          </button>
        ) : null}
      </div>

      {/* Trending Genres Editorial Cards (when query is empty) */}
      {!query && (
        <section>
          <div className="text-[11px] font-mono tracking-widest uppercase text-content-muted mb-3">
            TRENDING GENRES
          </div>

          <div className="grid grid-cols-2 gap-3">
            {trendingGenres.map((genre) => (
              <div
                key={genre.title}
                onClick={() => handleGenreClick(genre.title)}
                className="group relative h-28 rounded-2xl p-4 overflow-hidden border border-border-subtle cursor-pointer transition-all duration-300 hover:border-border-highlight active:scale-95 flex flex-col justify-between"
                style={{
                  backgroundColor: genre.color,
                  backgroundImage: `radial-gradient(circle at 100% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)`,
                }}
              >
                <div className="text-[10px] font-mono text-content-muted uppercase tracking-widest">
                  EXPLORE
                </div>
                <EditorialTitle lines={genre.lines} size="sm" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Search Results */}
      {query && (
        <div className="space-y-6">
          {/* Songs Results */}
          {songs.length > 0 && (
            <section>
              <div className="text-[11px] font-mono tracking-widest uppercase text-content-muted mb-2">
                SONGS
              </div>
              <div className="space-y-0.5">
                {songs.map((song, idx) => (
                  <SongRow
                    key={song.id}
                    song={song}
                    index={idx}
                    showCover={true}
                    playlistContext={songs}
                    onOpenRoomForSong={async (s) => {
                      playSong(s);
                      await joinRoom(`room-${s.id}`);
                      onOpenRoom(`room-${s.id}`);
                    }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Rooms Results */}
          {rooms.length > 0 && (
            <section>
              <div className="text-[11px] font-mono tracking-widest uppercase text-content-muted mb-2">
                LIVE ROOMS
              </div>
              <div className="space-y-2">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={async () => {
                      await joinRoom(room.id);
                      onOpenRoom(room.id);
                    }}
                    className="p-3 rounded-xl bg-surface-secondary border border-border-subtle hover:border-border-highlight cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-semibold text-content-primary uppercase">
                          {room.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-content-secondary mt-0.5">
                        Playing: {room.currentSong?.title} • {room.currentSong?.artist}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-content-muted font-mono">
                      <Users size={12} />
                      <span>{room.listenerCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Playlists Results */}
          {playlists.length > 0 && (
            <section>
              <div className="text-[11px] font-mono tracking-widest uppercase text-content-muted mb-2">
                PLAYLISTS
              </div>
              <div className="grid grid-cols-2 gap-3">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    onClick={() => {
                      if (playlist.songs.length > 0) {
                        playSong(playlist.songs[0], playlist.songs);
                      }
                    }}
                    className="p-3 rounded-xl bg-surface-secondary border border-border-subtle cursor-pointer hover:border-border-highlight"
                  >
                    <img
                      src={playlist.coverUrl}
                      alt={playlist.title}
                      className="w-full aspect-square rounded-lg object-cover mb-2"
                    />
                    <div className="text-xs font-medium text-content-primary truncate">
                      {playlist.title}
                    </div>
                    <div className="text-[10px] text-content-muted">{playlist.songCount} songs</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {songs.length === 0 && rooms.length === 0 && playlists.length === 0 && (
            <div className="text-center py-12 text-content-muted text-sm">
              No results found for "{query}". Try searching for Bollywood, Indie, or Drake.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
