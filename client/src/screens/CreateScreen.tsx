import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext.js';
import { useAudio } from '../context/AudioContext.js';
import { useUser } from '../context/UserContext.js';
import { Radio, Lock, Users, Globe, Disc3, Sparkles } from 'lucide-react';

interface CreateScreenProps {
  onRoomCreated: (roomId: string) => void;
}

export const CreateScreen: React.FC<CreateScreenProps> = ({ onRoomCreated }) => {
  const { createRoom } = useSocket();
  const { currentSong } = useAudio();
  const { currentUser } = useUser();

  const [title, setTitle] = useState('LATE NIGHT SESSIONS');
  const [mode, setMode] = useState<'private' | 'friends' | 'public' | 'radio'>('private');
  const [controlMode, setControlMode] = useState<'host_only' | 'everyone'>('everyone');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roomModes: { id: 'private' | 'friends' | 'public' | 'radio'; label: string; desc: string; icon: any }[] = [
    { id: 'private', label: 'Private Room', desc: 'Only invited friends with code', icon: Lock },
    { id: 'friends', label: 'Friends Only', desc: 'Anyone in your friend list can join', icon: Users },
    { id: 'public', label: 'Public Room', desc: 'Featured on the discovery feed', icon: Globe },
    { id: 'radio', label: 'Radio Broadcast', desc: 'Continuous listening room with audience', icon: Disc3 },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const roomId = await createRoom(title.trim(), mode, currentSong || undefined);
    setIsSubmitting(false);

    if (roomId) {
      onRoomCreated(roomId);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-32 pt-2 px-4 max-w-md mx-auto">
      {/* Header */}
      <section className="pt-2">
        <span className="text-xs font-mono tracking-widest text-content-muted uppercase">
          CREATE
        </span>
        <h1 className="text-3xl font-serif tracking-tight text-content-primary mt-1">
          Start a Listening Room
        </h1>
        <p className="text-xs text-content-secondary mt-1 leading-relaxed">
          Invite friends, synchronize music in real time, chat, and react together.
        </p>
      </section>

      <form onSubmit={handleCreate} className="space-y-5">
        {/* Room Title */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-widest text-content-muted mb-2">
            ROOM NAME
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. LATE NIGHT VIBES"
            className="w-full bg-surface-primary border border-border-subtle rounded-2xl py-3 px-4 font-serif text-lg text-content-primary placeholder-content-muted uppercase focus:outline-none focus:border-border-highlight"
          />
        </div>

        {/* Room Mode Selector */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-widest text-content-muted mb-2">
            ROOM VISIBILITY
          </label>
          <div className="space-y-2">
            {roomModes.map((rm) => {
              const Icon = rm.icon;
              const isSelected = mode === rm.id;
              return (
                <div
                  key={rm.id}
                  onClick={() => setMode(rm.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-surface-secondary border-content-primary'
                      : 'bg-surface-primary border-border-subtle hover:border-border-highlight'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        isSelected ? 'bg-white text-black' : 'bg-surface-secondary text-content-muted'
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-content-primary">{rm.label}</div>
                      <div className="text-[11px] text-content-muted">{rm.desc}</div>
                    </div>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-white bg-white' : 'border-border-subtle'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Playback Control Mode */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-widest text-content-muted mb-2">
            PLAYBACK CONTROL
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setControlMode('everyone')}
              className={`p-3 rounded-xl border text-xs text-left transition-all ${
                controlMode === 'everyone'
                  ? 'bg-surface-secondary border-content-primary text-content-primary font-medium'
                  : 'bg-surface-primary border-border-subtle text-content-secondary hover:border-border-highlight'
              }`}
            >
              <div className="font-semibold text-content-primary mb-0.5">Everyone</div>
              <div className="text-[10px] text-content-muted">Collaborative playback</div>
            </button>

            <button
              type="button"
              onClick={() => setControlMode('host_only')}
              className={`p-3 rounded-xl border text-xs text-left transition-all ${
                controlMode === 'host_only'
                  ? 'bg-surface-secondary border-content-primary text-content-primary font-medium'
                  : 'bg-surface-primary border-border-subtle text-content-secondary hover:border-border-highlight'
              }`}
            >
              <div className="font-semibold text-content-primary mb-0.5">Host Only</div>
              <div className="text-[10px] text-content-muted">You alone control playback</div>
            </button>
          </div>
        </div>

        {/* Initial Song Preview */}
        {currentSong && (
          <div className="p-3 rounded-xl bg-surface-secondary/40 border border-border-subtle flex items-center gap-3">
            <img
              src={currentSong.coverUrl}
              alt={currentSong.title}
              className="w-10 h-10 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono text-content-muted uppercase">
                INITIAL TRACK
              </span>
              <div className="text-xs font-semibold text-content-primary truncate">
                {currentSong.title}
              </div>
              <div className="text-[11px] text-content-secondary truncate">
                {currentSong.artist}
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="w-full py-4 rounded-2xl bg-content-primary text-background font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Radio size={16} />
          <span>{isSubmitting ? 'Creating Room...' : 'Launch Listening Room'}</span>
        </button>
      </form>
    </div>
  );
};
