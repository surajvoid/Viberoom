import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Radio, Vote, Disc, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { useRoom } from '../../context/RoomContext.js';

export const CreateRoomModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, createRoom } = useRoom();
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'democratic' | 'dj' | 'chill'>('democratic');
  const [description, setDescription] = useState('');

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createRoom(name.trim(), mode, description.trim() || undefined);
  };

  const modes = [
    {
      id: 'democratic' as const,
      title: 'Democratic Voting',
      desc: 'Everyone upvotes ❤️ and downvotes 👎. Top voted tracks play next.',
      icon: Vote,
    },
    {
      id: 'dj' as const,
      title: 'Host DJ Mode',
      desc: 'Only the room host controls playback and reorders the queue.',
      icon: Disc,
    },
    {
      id: 'chill' as const,
      title: 'Chillout Lounge',
      desc: 'Casual background listening with minimal distraction and friendly chat.',
      icon: Radio,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCreateModalOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-lg bg-app-surface border border-app-border rounded-t-hero sm:rounded-hero p-6 shadow-2xl z-10 space-y-5"
        >
          <div className="flex items-center justify-between pb-2 border-b border-app-border">
            <div>
              <h3 className="text-section-heading font-extrabold text-app-text flex items-center gap-2">
                <Radio size={20} className="text-app-accent" />
                <span>Create Social Room</span>
              </h3>
              <p className="text-meta-sm text-app-muted">
                Host a synchronized session with friends or the community.
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="p-1.5 rounded-full hover:bg-app-elevated text-app-muted hover:text-app-text transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-meta font-bold text-app-text">Room Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Midnight Beats Club 🌙"
                className="w-full bg-app-elevated text-app-text placeholder-app-muted px-4 py-3 rounded-card border border-app-border focus:border-app-accent focus:outline-none text-body font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-meta font-bold text-app-text">Room Mode</label>
              <div className="space-y-2">
                {modes.map((m) => {
                  const Icon = m.icon;
                  const isSelected = mode === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`flex items-start gap-3 p-3 rounded-card border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-app-accent bg-app-accent/10 shadow-sm'
                          : 'border-app-border bg-app-elevated/50 hover:bg-app-elevated'
                      }`}
                    >
                      <Icon
                        size={20}
                        className={`shrink-0 mt-0.5 ${
                          isSelected ? 'text-app-accent' : 'text-app-muted'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-body font-bold text-app-text">{m.title}</p>
                        <p className="text-meta-sm text-app-muted">{m.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-meta font-bold text-app-text">Description (Optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What vibe are you creating tonight?"
                className="w-full bg-app-elevated text-app-text placeholder-app-muted px-4 py-2.5 rounded-card border border-app-border focus:border-app-accent focus:outline-none text-body"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!name.trim()}
              className="mt-2"
            >
              Launch Room Now
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
