import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { useRoom } from '../../context/RoomContext.js';

export const JoinRoomCodeModal: React.FC = () => {
  const { isJoinModalOpen, setIsJoinModalOpen, joinRoom } = useRoom();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  if (!isJoinModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    const success = joinRoom(code.trim());
    if (success) {
      setCode('');
      setIsJoinModalOpen(false);
    } else {
      setError(true);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsJoinModalOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-sm bg-app-surface border border-app-border rounded-hero p-6 shadow-2xl z-10 space-y-4 text-center"
        >
          <div className="flex justify-end">
            <button
              onClick={() => setIsJoinModalOpen(false)}
              className="p-1 rounded-full text-app-muted hover:text-app-text transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="w-12 h-12 rounded-full bg-app-accent/15 text-app-accent flex items-center justify-center mx-auto shadow-accent-glow">
            <KeyRound size={24} />
          </div>

          <div>
            <h3 className="text-section-heading font-extrabold text-app-text">
              Join with Room Code
            </h3>
            <p className="text-meta-sm text-app-muted mt-1">
              Enter the 4-digit code provided by your host (e.g. 8492)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setError(false);
                setCode(e.target.value.toUpperCase());
              }}
              placeholder="e.g. 8492"
              className="w-full text-center text-2xl font-mono font-bold tracking-widest bg-app-elevated text-app-text px-4 py-3 rounded-card border border-app-border focus:border-app-accent focus:outline-none"
            />

            {error && (
              <p className="text-meta-sm text-rose-400 flex items-center justify-center gap-1 font-semibold">
                <AlertCircle size={14} />
                Room not found. Check code or create a room.
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={code.trim().length < 3}
            >
              Connect to Room
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
