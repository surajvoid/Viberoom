import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { useRoom } from '../../context/RoomContext.js';

export const JoinRoomCodeModal: React.FC = () => {
  const { isJoinModalOpen, setIsJoinModalOpen, joinRoom } = useRoom();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isJoinModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim();
    if (!clean || loading) return;

    setError(false);
    setLoading(true);

    try {
      const success = await joinRoom(clean);
      if (success) {
        setCode('');
        setIsJoinModalOpen(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !loading && setIsJoinModalOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-sm bg-app-surface border border-app-border rounded-hero p-6 shadow-2xl z-10 space-y-4 text-center"
        >
          <div className="flex justify-end">
            <button
              onClick={() => setIsJoinModalOpen(false)}
              disabled={loading}
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
              Enter the room code (e.g. MX7K2P)
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              maxLength={8}
              autoFocus
              value={code}
              onChange={(e) => {
                setError(false);
                setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
              }}
              placeholder="e.g. MX7K2P"
              className="w-full text-center text-2xl font-mono font-bold tracking-widest bg-app-elevated text-app-text px-4 py-3 rounded-card border border-app-border focus:border-app-accent focus:outline-none uppercase"
            />

            {error && (
              <p className="text-meta-sm text-rose-400 flex items-center justify-center gap-1 font-semibold">
                <AlertCircle size={14} />
                Unable to join room. Please check the code and try again.
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              disabled={code.trim().length < 3 || loading}
              icon={loading ? <Loader2 size={16} className="animate-spin" /> : undefined}
            >
              {loading ? 'Connecting...' : 'Connect to Room'}
            </Button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
