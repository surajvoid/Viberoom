import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Radio, Vote, Disc } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { useRoom } from '../../context/RoomContext.js';

export const CreateRoomModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, createRoom } = useRoom();
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'democratic' | 'dj' | 'chill'>('democratic');

  if (!isCreateModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createRoom(name.trim(), mode);
    setName('');
  };

  const modes = [
    {
      id: 'democratic' as const,
      title: 'Democratic',
      icon: Vote,
    },
    {
      id: 'dj' as const,
      title: 'Host DJ',
      icon: Disc,
    },
    {
      id: 'chill' as const,
      title: 'Chill Lounge',
      icon: Radio,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsCreateModalOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-md bg-app-surface border border-app-border rounded-hero p-6 shadow-2xl z-10 space-y-5"
        >
          <div className="flex items-center justify-between pb-3 border-b border-app-border">
            <div>
              <h3 className="text-section-heading font-extrabold text-app-text flex items-center gap-2">
                <Radio size={20} className="text-app-accent" />
                <span>Create Private Room</span>
              </h3>
              <p className="text-meta-sm text-app-muted mt-0.5">
                Set up a room to listen together in sync.
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
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Midnight Beats 🌙"
                className="w-full bg-app-elevated text-app-text placeholder-app-muted px-4 py-3 rounded-card border border-app-border focus:border-app-accent focus:outline-none text-body font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-meta font-bold text-app-text">Room Mode</label>
              <div className="grid grid-cols-3 gap-2">
                {modes.map((m) => {
                  const Icon = m.icon;
                  const isSelected = mode === m.id;
                  return (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-card border transition-all text-center gap-1.5 ${
                        isSelected
                          ? 'border-app-accent bg-app-accent/15 text-app-accent font-bold shadow-sm'
                          : 'border-app-border bg-app-elevated/50 text-app-muted hover:text-app-text hover:bg-app-elevated'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-meta-sm">{m.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={!name.trim()}
              className="mt-3 font-bold"
            >
              Create Room
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
