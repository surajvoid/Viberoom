import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Sparkles,
  TrendingUp,
  Music2,
  Play,
  X,
  Youtube,
  Radio,
  Disc3,
  Loader2,
  Flame,
} from 'lucide-react';
import { Card } from '../../components/ui/Card.js';
import { Badge } from '../../components/ui/Badge.js';
import { Artwork } from '../../components/ui/Artwork.js';
import { Button } from '../../components/ui/Button.js';
import { usePlayer } from '../../context/PlayerContext.js';
import { performSmartSearch, searchYouTube, SearchResults } from '../../services/searchService.js';
import {
  CONTEXTUAL_SOUNDSCAPES,
  ContextualSoundscape,
} from '../../services/contextualMusicService.js';
import { ContextualSoundscapeModal } from '../../components/discovery/ContextualSoundscapeModal.js';
import { MOCK_TRACKS, MOCK_ARTISTS, Track } from '../../mockData.js';

const SMART_PROMPTS = [
  'Songs for a 2 AM drive 🌙',
  'High-tempo workout music ⚡',
  'Morning sunlight golden hour ✨',
  'Deep study & focus lofi ☕',
  'Rainy evening late night 🌧️',
  'Nightclub dance energy 🪩',
];

const GENRE_TILES = [
  { name: 'Trending', gradient: 'from-[#FF3D81] to-[#8B5CF6]', accent: '#FF3D81' },
  { name: 'Electronic', gradient: 'from-[#8B5CF6] to-[#22D3EE]', accent: '#8B5CF6' },
  { name: 'Hip-Hop', gradient: 'from-[#FF6B5A] to-[#FF3D81]', accent: '#FF6B5A' },
  { name: 'Lo-Fi Chill', gradient: 'from-[#22D3EE] to-[#B6F23A]', accent: '#22D3EE' },
  { name: 'Bollywood', gradient: 'from-[#FF3D81] to-[#FF6B5A]', accent: '#FF3D81' },
  { name: 'Indie Pop', gradient: 'from-[#B6F23A] to-[#22D3EE]', accent: '#B6F23A' },
  { name: 'Dark Pop', gradient: 'from-[#1F1F25] to-[#8B5CF6]', accent: '#8B5CF6' },
  { name: 'Deep Focus', gradient: 'from-[#22D3EE] to-[#8B5CF6]', accent: '#22D3EE' },
];

export const DiscoverScreen: React.FC = () => {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [trendingTracks, setTrendingTracks] = useState<Track[]>([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [selectedSoundscape, setSelectedSoundscape] = useState<ContextualSoundscape | null>(null);
  const debounceTimerRef = useRef<any>(null);

  // Fetch live trending tracks on mount
  useEffect(() => {
    searchYouTube('global trending hits')
      .then((tracks) => {
        if (tracks && tracks.length > 0) {
          setTrendingTracks(tracks.slice(0, 8));
        }
      })
      .catch((err) => console.warn('Trending tracks load notice:', err))
      .finally(() => setIsLoadingTrending(false));
  }, []);

  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await performSmartSearch(searchQuery);
        setSearchResults(results);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery]);

  const handlePromptClick = (prompt: string) => {
    const clean = prompt.replace(/[🌙🎬⚡🏎️☕]/g, '').trim();
    setSearchQuery(clean);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  return (
    <div className="space-y-8 pb-32">
      {/* Search Bar Input */}
      <div className="space-y-3">
        <div className="relative flex items-center">
          <Search size={19} className="absolute left-4 text-app-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any song, artist, YouTube track, or natural prompt..."
            className="w-full bg-app-surface text-app-text placeholder-app-muted pl-11 pr-12 py-3.5 rounded-card border border-app-border focus:border-app-accent focus:outline-none transition-colors text-body font-medium shadow-soft-1"
          />

          {isSearching ? (
            <div className="absolute right-4 text-app-accent animate-spin">
              <Loader2 size={18} />
            </div>
          ) : searchQuery ? (
            <button
              onClick={handleClear}
              className="absolute right-4 p-1 text-app-muted hover:text-app-text transition-colors"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>

        {/* Smart Natural Language Prompt Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-meta-sm font-bold text-app-accent shrink-0 flex items-center gap-1 pl-1">
            <Sparkles size={13} />
            Smart:
          </span>
          {SMART_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handlePromptClick(prompt)}
              className="px-3 py-1 rounded-chip text-meta-sm font-semibold bg-app-surface hover:bg-app-elevated border border-app-border text-app-text/90 shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* SEARCH ACTIVE RESULTS VIEW */}
      {searchResults ? (
        <div className="space-y-8">
          {/* Smart Vibe Recommendation Banner */}
          {searchResults.isSmartSearch && searchResults.smartVibe && (
            <div
              className="p-5 rounded-hero border border-app-border relative overflow-hidden bg-app-surface/80"
              style={{
                borderColor: `${searchResults.smartVibe.suggestedAccent}40`,
              }}
            >
              <div
                className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-2xl opacity-25 pointer-events-none"
                style={{ backgroundColor: searchResults.smartVibe.suggestedAccent }}
              />
              <div className="relative z-10 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant="accent" icon={<Sparkles size={12} />}>
                    AI Vibe Match
                  </Badge>
                  <span className="text-meta-sm text-app-muted">Natural Language Intent</span>
                </div>
                <h3 className="text-section-heading font-extrabold text-app-text">
                  {searchResults.smartVibe.mood}
                </h3>
                <p className="text-body text-app-muted max-w-xl">
                  {searchResults.smartVibe.description}
                </p>
              </div>
            </div>
          )}

          {/* YouTube & Catalog Tracks Results */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-section-heading font-bold text-app-text flex items-center gap-2">
                <span>Songs ({searchResults.tracks.length})</span>
                {searchResults.source === 'youtube' && (
                  <Badge variant="live" icon={<Youtube size={12} />}>
                    Synced from YouTube
                  </Badge>
                )}
              </h3>
              <span className="text-meta-sm text-app-muted">1-Tap Real Play</span>
            </div>

            {searchResults.tracks.length === 0 ? (
              <div className="text-center py-12 p-6 rounded-card bg-app-surface border border-app-border space-y-2">
                <Music2 size={32} className="mx-auto text-app-muted" />
                <h4 className="text-body font-bold text-app-text">No matching songs found</h4>
                <p className="text-meta text-app-muted">
                  Try searching a different artist, song title, or smart prompt.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.tracks.map((track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <Card
                      key={track.id}
                      interactive={true}
                      onClick={() => playTrack(track)}
                      className={`flex items-center justify-between p-3 transition-colors ${
                        isCurrent
                          ? 'border-app-accent bg-app-elevated/70 shadow-accent-glow/20'
                          : 'hover:border-app-border-strong'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <span className="text-meta-sm font-mono font-bold text-app-muted w-4 text-center">
                          {String(idx + 1).padStart(2, '0')}
                        </span>

                        {track.coverUrl ? (
                          <div className="relative w-12 h-12 rounded-chip overflow-hidden shrink-0 shadow-soft-1">
                            <img
                              src={track.coverUrl}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                            {isCurrent && isPlaying && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Disc3 size={18} className="text-white animate-spin" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <Artwork
                            src={track.artworkSvg}
                            alt={track.title}
                            size="sm"
                            rounded="chip"
                            isPlaying={isCurrent && isPlaying}
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <p className="text-body font-bold text-app-text truncate">
                            {track.title}
                          </p>
                          <div className="flex items-center gap-2 text-meta-sm text-app-muted truncate">
                            <span>{track.artist}</span>
                            {track.youtubeId && (
                              <span className="flex items-center gap-0.5 text-rose-400 font-bold text-[10px]">
                                <Youtube size={10} /> YouTube
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <Button
                          variant={isCurrent && isPlaying ? 'primary' : 'ghost'}
                          size="sm"
                          icon={<Play size={13} fill="currentColor" />}
                          onClick={(e) => {
                            e.stopPropagation();
                            playTrack(track);
                          }}
                        >
                          {isCurrent && isPlaying ? 'Playing' : 'Play'}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>

          {/* Grouped Artists Results */}
          {searchResults.artists.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-section-heading font-bold text-app-text">Artists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {searchResults.artists.map((artist) => (
                  <Card
                    key={artist.id}
                    interactive={true}
                    className="flex flex-col items-center text-center p-4 space-y-2"
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-app-border">
                      <img
                        src={artist.artworkSvg}
                        alt={artist.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-body font-bold text-app-text truncate w-full">
                      {artist.name}
                    </p>
                    <Badge variant="accent">Artist</Badge>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        /* DEFAULT DISCOVERY CATALOG VIEW (PRD Section 5) */
        <div className="space-y-8">
          {/* Curated Contextual Soundscapes (Requirement 3: Genuine mood & genre alignment) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-section-heading font-bold text-app-text flex items-center gap-2">
                  <Sparkles size={18} className="text-app-accent" />
                  <span>Contextual Soundscapes</span>
                </h3>
                <p className="text-meta text-app-muted">
                  Curated sound environments tuned with verified iconic tracks
                </p>
              </div>
              <span className="text-meta-sm text-app-muted font-mono">
                {CONTEXTUAL_SOUNDSCAPES.length} Curated
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {CONTEXTUAL_SOUNDSCAPES.map((soundscape) => (
                <div
                  key={soundscape.id}
                  onClick={() => setSelectedSoundscape(soundscape)}
                  className={`relative rounded-card overflow-hidden p-4 sm:p-5 flex flex-col justify-between cursor-pointer select-none group transition-all duration-200 hover:-translate-y-1 shadow-soft-1 border border-app-border hover:border-white/30 bg-gradient-to-br ${soundscape.gradient}`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl">{soundscape.emoji}</span>
                    <Badge variant="accent" className="bg-black/30 border-white/20 text-white font-mono text-[10px]">
                      {soundscape.tempo.split(' ')[0]}
                    </Badge>
                  </div>

                  <div className="pt-4 space-y-1">
                    <h4 className="font-extrabold text-[18px] text-white tracking-tight drop-shadow-sm flex items-center justify-between">
                      <span>{soundscape.name}</span>
                      <Play size={14} className="text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-meta-sm text-white/80 line-clamp-1">{soundscape.tagline}</p>
                    <p className="text-[11px] text-white/60 font-medium">
                      {soundscape.tracks.length} tracks • {soundscape.mood}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Genre & Mood Expressive Category Tiles */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-section-heading font-bold text-app-text">
                Browse Genres & Moods
              </h3>
              <span className="text-meta-sm text-app-muted">Instant Filters</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {GENRE_TILES.map((tile) => (
                <div
                  key={tile.name}
                  onClick={() => setSearchQuery(tile.name)}
                  className={`
                    relative h-24 rounded-card overflow-hidden p-4 flex flex-col justify-between cursor-pointer select-none group transition-transform duration-200 hover:-translate-y-1 shadow-soft-1 bg-gradient-to-br ${tile.gradient}
                  `}
                >
                  <span className="font-extrabold text-[17px] text-white tracking-tight drop-shadow-sm">
                    {tile.name}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-white/80">Explore</span>
                    <Play size={14} className="text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Top Charts & Trending Now */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-section-heading font-bold text-app-text flex items-center gap-2">
                  <Flame size={18} className="text-app-accent" />
                  <span>Trending on VibeRoom</span>
                </h3>
                <p className="text-meta text-app-muted">Most synced tracks across social rooms</p>
              </div>
              <span className="text-meta-sm text-app-muted">Top Picks</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trendingTracks.length === 0 && isLoadingTrending ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-card bg-app-elevated/40 animate-pulse border border-app-border"
                  />
                ))
              ) : (
                trendingTracks.map((track: Track, idx) => {
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <Card
                      key={track.id}
                      interactive={true}
                      onClick={() => playTrack(track)}
                      className={`flex items-center justify-between p-3 ${
                        isCurrent ? 'border-app-accent bg-app-elevated/40' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-meta-sm font-bold text-app-muted w-4 text-center">
                          {idx + 1}
                        </span>

                        {track.coverUrl ? (
                          <div className="w-10 h-10 rounded-chip overflow-hidden shrink-0">
                            <img
                              src={track.coverUrl}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <Artwork
                            src={track.artworkSvg}
                            alt={track.title}
                            size="sm"
                            rounded="chip"
                            isPlaying={isCurrent && isPlaying}
                          />
                        )}

                        <div className="min-w-0">
                          <p className="text-body font-bold text-app-text truncate">
                            {track.title}
                          </p>
                          <div className="flex items-center gap-1.5 text-meta-sm text-app-muted truncate">
                            <span>{track.artist}</span>
                            <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
                              <Youtube size={10} /> YT
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        variant={isCurrent && isPlaying ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          playTrack(track);
                        }}
                      >
                        {isCurrent && isPlaying ? 'Playing' : 'Play'}
                      </Button>
                    </Card>
                  );
                })
              )}
            </div>
          </section>

          {/* Spotlight Artists */}
          <section className="space-y-4">
            <h3 className="text-section-heading font-bold text-app-text flex items-center gap-2">
              <Music2 size={18} className="text-app-accent" />
              <span>Spotlight Artists</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {MOCK_ARTISTS.map((artist) => (
                <Card
                  key={artist.id}
                  interactive={true}
                  onClick={() => setSearchQuery(artist.name)}
                  className="flex flex-col items-center text-center p-4 space-y-3"
                >
                  <div className="w-20 h-20 rounded-full overflow-hidden shadow-soft-1 border border-app-border">
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
          </section>
        </div>
      )}

      {/* Contextual Soundscape Modal for 1-Tap Playback & Inspection */}
      <ContextualSoundscapeModal
        soundscape={selectedSoundscape}
        isOpen={Boolean(selectedSoundscape)}
        onClose={() => setSelectedSoundscape(null)}
      />
    </div>
  );
};
