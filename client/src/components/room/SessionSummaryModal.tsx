import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Clock, Music, Heart, Users, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button.js';
import { useRoom } from '../../context/RoomContext.js';

export const SessionSummaryModal: React.FC = () => {
  const { sessionSummary, dismissSessionSummary } = useRoom();

  if (!sessionSummary) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={dismissSessionSummary}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="relative w-full max-w-md bg-app-surface border border-app-accent/40 rounded-hero p-6 sm:p-8 shadow-2xl z-10 space-y-6 text-center overflow-hidden"
        >
          {/* Ambient Accent Glow */}
          <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-app-accent blur-3xl opacity-20 pointer-events-none" />

          <div className="w-16 h-16 rounded-full bg-app-accent/15 text-app-accent flex items-center justify-center mx-auto shadow-accent-glow">
            <Sparkles size={32} />
          </div>

          <div className="space-y-1">
            <span className="text-meta-sm font-bold uppercase tracking-wider text-app-accent">
              Session Wrapped
            </span>
            <h3 className="text-page-title font-extrabold text-app-text">
              {sessionSummary.roomName}
            </h3>
            <p className="text-meta text-app-muted">
              Thanks for vibing together in real-time!
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3.5 rounded-card bg-app-elevated border border-app-border space-y-1">
              <span className="text-meta-sm font-bold text-app-muted flex items-center gap-1.5">
                <Clock size={13} className="text-app-accent" />
                Listening Time
              </span>
              <p className="text-section-heading font-extrabold text-app-text">
                {sessionSummary.durationMinutes} min
              </p>
            </div>

            <div className="p-3.5 rounded-card bg-app-elevated border border-app-border space-y-1">
              <span className="text-meta-sm font-bold text-app-muted flex items-center gap-1.5">
                <Music size={13} className="text-app-accent" />
                Songs Played
              </span>
              <p className="text-section-heading font-extrabold text-app-text">
                {sessionSummary.songsPlayedCount}
              </p>
            </div>

            <div className="p-3.5 rounded-card bg-app-elevated border border-app-border space-y-1">
              <span className="text-meta-sm font-bold text-app-muted flex items-center gap-1.5">
                <Heart size={13} className="text-rose-500" />
                Live Reactions
              </span>
              <p className="text-section-heading font-extrabold text-app-text">
                {sessionSummary.totalReactions} 🔥
              </p>
            </div>

            <div className="p-3.5 rounded-card bg-app-elevated border border-app-border space-y-1">
              <span className="text-meta-sm font-bold text-app-muted flex items-center gap-1.5">
                <Users size={13} className="text-app-accent" />
                Participants
              </span>
              <p className="text-section-heading font-extrabold text-app-text">
                {sessionSummary.participantsCount}
              </p>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={dismissSessionSummary}
            >
              Save to Room Memories
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
