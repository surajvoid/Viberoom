import React, { useState, useEffect } from 'react';
import { useAudio } from '../context/AudioContext.js';
import { RadioStation } from '../types/index.js';
import { api } from '../services/api.js';
import { Radio, Users, Play, Volume2, Sparkles, Disc3 } from 'lucide-react';
import { EditorialTitle } from '../components/EditorialTitle.js';

export const RadioScreen: React.FC = () => {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const { currentRadioStation, isRadioMode, isPlaying, tuneToRadio, togglePlayPause } = useAudio();

  useEffect(() => {
    api.getRadioStations().then(setStations);
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-32 pt-2 px-4 max-w-md mx-auto select-none">
      {/* Header */}
      <section className="pt-2">
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-amber-400 uppercase">
          <Radio size={14} />
          <span>GROIC 24/7 LIVE BROADCAST</span>
        </div>
        <h1 className="text-3xl font-serif tracking-tight text-content-primary mt-1">
          Live Radio Stations
        </h1>
        <p className="text-xs text-content-secondary mt-1 leading-relaxed">
          Stream live synchronized stations with listeners across the world without interruptions.
        </p>
      </section>

      {/* Featured On-Air Station Banner */}
      {currentRadioStation && isRadioMode && (
        <section className="p-4 rounded-3xl bg-gradient-to-br from-[#241A12] via-surface-primary to-surface-secondary border border-amber-500/30 shadow-2xl relative overflow-hidden animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono uppercase text-amber-300 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              ON AIR NOW
            </span>
            <span className="text-[11px] font-mono text-content-muted">
              {currentRadioStation.listenersCount.toLocaleString()} tuned in
            </span>
          </div>

          <div className="flex items-center gap-4 my-2">
            <img
              src={currentRadioStation.coverUrl}
              alt={currentRadioStation.name}
              className="w-16 h-16 rounded-2xl object-cover border border-amber-500/20 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-base font-serif font-bold text-content-primary truncate">
                {currentRadioStation.name}
              </div>
              <div className="text-xs text-amber-300 font-mono mt-0.5">
                {currentRadioStation.frequency} • {currentRadioStation.genre}
              </div>
              <div className="text-[11px] text-content-secondary truncate mt-1">
                Now: {currentRadioStation.currentSong.title}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
            {/* Equalizer animation */}
            <div className="flex items-end gap-1 h-4">
              <span className="w-1 h-full bg-amber-400 animate-pulse" />
              <span className="w-1 h-2/3 bg-amber-400 animate-pulse delay-75" />
              <span className="w-1 h-4/5 bg-amber-400 animate-pulse delay-150" />
              <span className="w-1 h-1/2 bg-amber-400 animate-pulse delay-200" />
            </div>

            <button
              onClick={togglePlayPause}
              className="px-4 py-1.5 rounded-xl bg-amber-400 text-black font-semibold text-xs hover:bg-amber-300 active:scale-95 transition-all"
            >
              {isPlaying ? 'Pause Station' : 'Resume Radio'}
            </button>
          </div>
        </section>
      )}

      {/* Stations List */}
      <section className="space-y-3">
        <div className="text-[11px] font-mono tracking-widest uppercase text-content-muted">
          SELECT A STATION
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {stations.map((station) => {
            const isCurrent = currentRadioStation?.id === station.id && isRadioMode;
            return (
              <div
                key={station.id}
                onClick={() => tuneToRadio(station)}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all duration-200 group ${
                  isCurrent
                    ? 'bg-surface-secondary border-amber-500/50 shadow-md'
                    : 'bg-surface-primary border-border-subtle hover:border-border-highlight'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-surface-secondary">
                    <img
                      src={station.coverUrl}
                      alt={station.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {isCurrent && isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Volume2 size={18} className="text-amber-400 animate-pulse" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-content-primary truncate">
                        {station.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-tertiary border border-border-subtle text-amber-300">
                        {station.frequency}
                      </span>
                    </div>
                    <div className="text-[11px] text-content-secondary truncate mt-0.5">
                      {station.tagline}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-content-muted mt-1 font-mono">
                      <span>{station.genre}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users size={10} />
                        {station.listenersCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ml-2 flex-shrink-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'bg-amber-400 text-black shadow-lg scale-105'
                        : 'bg-surface-secondary group-hover:bg-content-primary group-hover:text-black text-content-secondary'
                    }`}
                  >
                    <Play size={14} className="fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
