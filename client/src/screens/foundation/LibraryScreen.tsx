import React, { useState } from 'react';
import { Heart, ListMusic, Disc, History, Play, Search, UserCheck } from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Button } from '../../components/ui/Button.js';
import { Artwork } from '../../components/ui/Artwork.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { PlaylistDetailModal } from '../../components/library/PlaylistDetailModal.js';
import { ArtistDetailModal } from '../../components/library/ArtistDetailModal.js';
import { MOCK_TRACKS, MOCK_PLAYLISTS, MOCK_ARTISTS, Track, Playlist, Artist } from '../../mockData.js';
import { usePlayer } from '../../context/PlayerContext.js';

export const LibraryScreen: React.FC = () => {
  const { playTrack, currentTrack, likedTracks, history } = usePlayer();
  const [activeTab, setActiveTab] = useState<'playlists' | 'liked' | 'artists' | 'history'>('playlists');
  const [libraryFilter, setLibraryFilter] = useState('');

  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  const filteredPlaylists = MOCK_PLAYLISTS.filter((p) =>
    p.title.toLowerCase().includes(libraryFilter.toLowerCase())
  );

  const filteredLiked = likedTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(libraryFilter.toLowerCase()) ||
      t.artist.toLowerCase().includes(libraryFilter.toLowerCase())
  );

  const filteredArtists = MOCK_ARTISTS.filter((a) =>
    a.name.toLowerCase().includes(libraryFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-32 select-none">
      {/* Header & Local Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-section-heading md:text-page-title font-extrabold text-app-text">
            Your Library
          </h2>
          <p className="text-meta text-app-muted">Personal collection & curated playlists</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-3 text-app-muted pointer-events-none" />
          <input
            type="text"
            value={libraryFilter}
            onChange={(e) => setLibraryFilter(e.target.value)}
            placeholder="Filter library..."
            className="w-full bg-app-surface text-app-text placeholder-app-muted pl-9 pr-3 py-2 rounded-chip border border-app-border focus:border-app-accent focus:outline-none text-meta"
          />
        </div>
      </div>

      {/* Segmented Tab Controls */}
      <div className="flex items-center gap-1.5 p-1 rounded-chip bg-app-surface border border-app-border overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-chip text-body font-semibold transition-all ${
            activeTab === 'playlists'
              ? 'bg-app-elevated text-app-text shadow-sm'
              : 'text-app-muted hover:text-app-text'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <ListMusic size={15} />
            <span>Playlists ({MOCK_PLAYLISTS.length})</span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('liked')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-chip text-body font-semibold transition-all ${
            activeTab === 'liked'
              ? 'bg-app-elevated text-app-text shadow-sm'
              : 'text-app-muted hover:text-app-text'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Heart size={15} className="text-rose-500 fill-rose-500" />
            <span>Liked ({likedTracks.length})</span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('artists')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-chip text-body font-semibold transition-all ${
            activeTab === 'artists'
              ? 'bg-app-elevated text-app-text shadow-sm'
              : 'text-app-muted hover:text-app-text'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <UserCheck size={15} />
            <span>Artists ({MOCK_ARTISTS.length})</span>
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 min-w-[90px] py-2 px-3 rounded-chip text-body font-semibold transition-all ${
            activeTab === 'history'
              ? 'bg-app-elevated text-app-text shadow-sm'
              : 'text-app-muted hover:text-app-text'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <History size={15} />
            <span>History</span>
          </span>
        </button>
      </div>

      {/* Playlists Tab View */}
      {activeTab === 'playlists' && (
        <>
          {filteredPlaylists.length === 0 ? (
            <EmptyState
              type="playlists"
              actionLabel="Reset Filter"
              onAction={() => setLibraryFilter('')}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPlaylists.map((playlist) => (
                <Card
                  key={playlist.id}
                  interactive={true}
                  onClick={() => setSelectedPlaylist(playlist)}
                  className="flex items-center gap-4 p-4 group"
                >
                  <Artwork
                    src={playlist.artworkSvg}
                    alt={playlist.title}
                    size="md"
                    rounded="card"
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <h4 className="text-body font-bold text-app-text truncate group-hover:text-app-accent transition-colors">
                      {playlist.title}
                    </h4>
                    <p className="text-meta-sm text-app-muted truncate">
                      {playlist.trackIds.length} songs • {playlist.creator}
                    </p>
                    <Badge variant={playlist.isCurated ? 'accent' : 'default'}>
                      {playlist.isCurated ? 'Editorial' : 'Custom'}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Liked Songs Tab View */}
      {activeTab === 'liked' && (
        <>
          {filteredLiked.length === 0 ? (
            <EmptyState
              title="No liked songs found"
              description="Tap the heart icon on any playing track to save it here."
              actionLabel="Discover Songs"
              onAction={() => setActiveTab('playlists')}
            />
          ) : (
            <div className="space-y-2">
              {filteredLiked.map((track: Track, idx) => {
                const isPlayingThis = currentTrack?.id === track.id;
                return (
                  <Card
                    key={track.id}
                    interactive={true}
                    onClick={() => playTrack(track)}
                    className={`flex items-center justify-between p-3 ${
                      isPlayingThis ? 'border-app-accent bg-app-elevated/40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-meta-sm text-app-muted w-4 font-mono">
                        {idx + 1}
                      </span>
                      <Artwork
                        src={track.artworkSvg}
                        alt={track.title}
                        size="sm"
                        rounded="chip"
                        isPlaying={isPlayingThis}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-body font-bold text-app-text truncate">{track.title}</p>
                        <p className="text-meta-sm text-app-muted truncate">
                          {track.artist} • {track.album}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <Heart size={16} className="text-rose-500 fill-rose-500" />
                      <span className="text-meta-sm text-app-muted">{track.duration}s</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Artists Tab View */}
      {activeTab === 'artists' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {filteredArtists.map((artist) => (
            <Card
              key={artist.id}
              interactive={true}
              onClick={() => setSelectedArtist(artist)}
              className="flex flex-col items-center text-center p-4 space-y-3"
            >
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-app-border shadow-soft-1">
                <img
                  src={artist.artworkSvg}
                  alt={artist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 w-full">
                <p className="text-body font-bold text-app-text truncate">{artist.name}</p>
                <p className="text-meta-sm text-app-muted truncate">
                  {(artist.monthlyListeners / 1000000).toFixed(1)}M listeners
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* History Tab View */}
      {activeTab === 'history' && (
        <>
          {history.length === 0 ? (
            <EmptyState
              title="No listening history yet"
              description="Tracks you play will be recorded here so you can revisit them anytime."
              actionLabel="Discover Music"
              onAction={() => setActiveTab('liked')}
            />
          ) : (
            <div className="space-y-2">
              {history.map((track: Track, idx) => {
                const isPlayingThis = currentTrack?.id === track.id;
                return (
                  <Card
                    key={`${track.id}-${idx}`}
                    interactive={true}
                    onClick={() => playTrack(track)}
                    className={`flex items-center justify-between p-3 ${
                      isPlayingThis ? 'border-app-accent bg-app-elevated/40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Artwork src={track.artworkSvg} alt={track.title} size="sm" rounded="chip" />
                      <div className="min-w-0 flex-1">
                        <p className="text-body font-bold text-app-text truncate">{track.title}</p>
                        <p className="text-meta-sm text-app-muted truncate">
                          {track.artist} • Recently played
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" icon={<Play size={14} />}>
                      Replay
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <PlaylistDetailModal
        playlist={selectedPlaylist}
        isOpen={Boolean(selectedPlaylist)}
        onClose={() => setSelectedPlaylist(null)}
      />

      <ArtistDetailModal
        artist={selectedArtist}
        isOpen={Boolean(selectedArtist)}
        onClose={() => setSelectedArtist(null)}
      />
    </div>
  );
};
