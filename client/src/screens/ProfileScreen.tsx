import React from 'react';
import { useUser } from '../context/UserContext.js';
import { useAudio } from '../context/AudioContext.js';
import { Flame, Award, Clock, Music, Headphones, Settings, ShieldCheck } from 'lucide-react';
import { EditorialTitle } from '../components/EditorialTitle.js';

export const ProfileScreen: React.FC = () => {
  const { currentUser, openProfileModal } = useUser();
  const { currentSong, openFullPlayer } = useAudio();

  const badges = [
    { title: 'Night Owl', icon: '🌙', desc: 'Midnight listening sessions' },
    { title: 'Room Host', icon: '🎙️', desc: 'Hosted 10+ listening rooms' },
    { title: 'Music Explorer', icon: '🧭', desc: 'Listened to 12+ genres' },
    { title: 'Social Listener', icon: '🎧', desc: 'Over 20 shared hours' },
  ];

  const userPlaylists = [
    { title: 'LATE NIGHT VIBES', songs: 24, duration: '1h 42m' },
    { title: 'GYM FOCUS', songs: 18, duration: '1h 12m' },
    { title: 'HEAVY ROTATION', songs: 48, duration: '2h 50m' },
    { title: 'ROAD TRIPS', songs: 32, duration: '2h 05m' },
  ];

  return (
    <div className="flex flex-col gap-6 pb-32 pt-2 px-4 max-w-md mx-auto">
      {/* Profile Header */}
      <section className="pt-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-border-highlight shadow-xl"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl tracking-tight text-content-primary">
                {currentUser.name}
              </h1>
              <span className="flex items-center gap-1 text-[11px] font-mono text-orange-400 bg-orange-950/40 border border-orange-800/40 px-2 py-0.5 rounded-full">
                <Flame size={12} className="fill-current" />
                {currentUser.streakDays}d
              </span>
            </div>
            <p className="text-xs text-content-muted font-mono">@{currentUser.handle}</p>
          </div>
        </div>

        <button
          onClick={openProfileModal}
          title="Edit Profile"
          className="p-2.5 rounded-full bg-surface-secondary hover:bg-surface-tertiary text-content-muted hover:text-emerald-400 transition-colors border border-border-subtle"
        >
          <Settings size={18} />
        </button>
      </section>

      {/* Currently Listening Card */}
      {currentSong && (
        <section
          onClick={openFullPlayer}
          className="p-4 rounded-2xl bg-surface-secondary/70 border border-border-subtle cursor-pointer hover:border-border-highlight transition-all"
        >
          <div className="text-[10px] font-mono uppercase tracking-widest text-content-muted mb-2.5">
            CURRENTLY LISTENING
          </div>
          <div className="flex items-center gap-3">
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-content-primary truncate">
                {currentSong.title}
              </div>
              <div className="text-xs text-content-secondary truncate">
                {currentSong.artist}
              </div>
            </div>
            <Headphones size={18} className="text-content-muted" />
          </div>
        </section>
      )}

      {/* Stats Grid */}
      <section>
        <div className="text-[11px] font-mono tracking-widest uppercase text-content-muted mb-3">
          YOUR MUSIC STATS
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 rounded-2xl bg-surface-primary border border-border-subtle">
            <div className="font-serif text-xl text-content-primary">
              {currentUser.totalListeningHours}h
            </div>
            <div className="text-[10px] text-content-muted mt-1 uppercase">Listening</div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-primary border border-border-subtle">
            <div className="font-serif text-xl text-content-primary">
              {currentUser.totalPlays}
            </div>
            <div className="text-[10px] text-content-muted mt-1 uppercase">Plays</div>
          </div>

          <div className="p-3 rounded-2xl bg-surface-primary border border-border-subtle">
            <div className="font-serif text-xl text-content-primary">284</div>
            <div className="text-[10px] text-content-muted mt-1 uppercase">Songs</div>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section>
        <div className="text-[11px] font-mono tracking-widest uppercase text-content-muted mb-3">
          BADGES & ACHIEVEMENTS
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {badges.map((b, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-surface-primary border border-border-subtle flex items-start gap-2.5"
            >
              <span className="text-xl select-none">{b.icon}</span>
              <div>
                <div className="text-xs font-semibold text-content-primary">{b.title}</div>
                <div className="text-[10px] text-content-muted leading-tight mt-0.5">{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Playlists */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-mono tracking-widest uppercase text-content-muted">
            YOUR PLAYLISTS
          </span>
          <span className="text-xs text-content-muted">{userPlaylists.length}</span>
        </div>

        <div className="space-y-2">
          {userPlaylists.map((pl, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-surface-primary border border-border-subtle hover:border-border-highlight cursor-pointer flex items-center justify-between transition-colors"
            >
              <div>
                <div className="font-serif tracking-wide text-sm uppercase text-content-primary">
                  {pl.title}
                </div>
                <div className="text-[11px] text-content-muted mt-0.5">
                  {pl.songs} songs • {pl.duration}
                </div>
              </div>
              <Music size={14} className="text-content-muted" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
