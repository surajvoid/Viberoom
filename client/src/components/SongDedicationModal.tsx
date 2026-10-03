import React, { useState } from 'react';
import { useAudio } from '../context/AudioContext.js';
import { useUser } from '../context/UserContext.js';
import { useSocket } from '../context/SocketContext.js';
import { api } from '../services/api.js';
import { X, Heart, Sparkles, Send, Music } from 'lucide-react';

export const SongDedicationModal: React.FC = () => {
  const { isDedicateModalOpen, closeDedicateModal, songToDedicate, playSong } = useAudio();
  const { currentUser } = useUser();
  const [toUserName, setToUserName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isDedicateModalOpen || !songToDedicate) return null;

  const quickMessages = [
    'For the midnight drives we haven’t taken yet ❤️',
    'Every time this plays, it feels like us 🌙✨',
    'Thought of you when this came on 🎶',
    'Our song forever 🔥',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toUserName.trim() || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const dedication = await api.createDedication(
        songToDedicate.id,
        currentUser.id,
        toUserName.trim(),
        message.trim()
      );
      // Play the song with the dedication ribbon active
      playSong(songToDedicate, undefined, dedication);
      closeDedicateModal();
    } catch (err) {
      console.error('Failed to create dedication', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-surface-primary border border-border-subtle p-6 shadow-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 inset-x-0 h-36 bg-rose-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={closeDedicateModal}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-secondary text-content-muted hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-rose-300 mb-1">
          <Heart size={14} className="fill-current" />
          <span>GROIC SONG DEDICATION</span>
        </div>
        <h2 className="text-xl font-serif text-content-primary">
          Dedicate This Track
        </h2>
        <p className="text-xs text-content-secondary mt-0.5 mb-4">
          Send a personal dedication that appears during synchronized listening.
        </p>

        {/* Selected Song Preview */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-surface-secondary/70 border border-border-subtle mb-4">
          <img
            src={songToDedicate.coverUrl}
            alt={songToDedicate.title}
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-content-primary truncate">
              {songToDedicate.title}
            </div>
            <div className="text-[11px] text-content-secondary truncate">
              {songToDedicate.artist}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Recipient */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-content-muted mb-1">
              DEDICATED TO
            </label>
            <input
              type="text"
              value={toUserName}
              onChange={(e) => setToUserName(e.target.value)}
              placeholder="e.g. Someone special, bestie, squad..."
              className="w-full bg-surface-secondary border border-border-subtle rounded-xl py-2 px-3 text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-border-highlight"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-wider text-content-muted mb-1">
              PERSONAL MESSAGE
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="Write something heartfelt..."
              className="w-full bg-surface-secondary border border-border-subtle rounded-xl py-2 px-3 text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-border-highlight resize-none"
            />
          </div>

          {/* Quick Suggestions */}
          <div>
            <span className="text-[9px] font-mono uppercase tracking-wider text-content-muted block mb-1">
              QUICK INSPIRATION
            </span>
            <div className="flex flex-wrap gap-1">
              {quickMessages.map((qm, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMessage(qm)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-surface-secondary/50 hover:bg-surface-secondary border border-border-subtle text-content-secondary hover:text-content-primary truncate max-w-full text-left"
                >
                  {qm}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!toUserName.trim() || !message.trim() || isSubmitting}
            className="w-full mt-2 py-3 rounded-xl bg-content-primary text-background font-semibold text-xs hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40"
          >
            <Heart size={14} className="fill-current" />
            <span>{isSubmitting ? 'Sending Dedication...' : 'Send Dedication & Play'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
