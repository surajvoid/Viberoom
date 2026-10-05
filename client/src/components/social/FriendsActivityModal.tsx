import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Radio, Play, Flame, Disc3 } from 'lucide-react';
import { MOCK_USERS, MOCK_TRACKS } from '../../mockData.js';
import { UserAvatar } from '../ui/UserAvatar.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { useRoom } from '../../context/RoomContext.js';
import { usePlayer } from '../../context/PlayerContext.js';

interface FriendsActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FriendsActivityModal: React.FC<FriendsActivityModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { joinRoom } = useRoom();
  const { playTrack } = usePlayer();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 select-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-lg h-full sm:h-[80vh] bg-app-surface border border-app-border rounded-t-hero sm:rounded-hero p-5 sm:p-7 shadow-2xl z-10 flex flex-col overflow-hidden"
        >
          <div className="flex items-center justify-between pb-3 border-b border-app-border shrink-0">
            <div>
              <h3 className="text-section-heading font-extrabold text-app-text flex items-center gap-2">
                <Users size={20} className="text-app-accent" />
                <span>Friend Activity & Live Aura</span>
              </h3>
              <p className="text-meta-sm text-app-muted">
                Tune in to what your inner circle is listening to in real-time.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-app-elevated text-app-muted hover:text-app-text transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-3 space-y-3 scrollbar-none flex flex-col justify-center">
            {MOCK_USERS.slice(1).length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-card bg-app-elevated/40 border border-app-border">
                <div className="w-12 h-12 rounded-full bg-app-accent/15 text-app-accent flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-body font-bold text-app-text">No friends listening right now</h4>
                  <p className="text-meta-sm text-app-muted max-w-xs">
                    Start a private room and share your code to listen together with friends in real-time.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    navigator.clipboard?.writeText?.(window.location.origin);
                    onClose();
                  }}
                >
                  Copy App Invite Link
                </Button>
              </div>
            ) : (
              MOCK_USERS.slice(1).map((friend, idx) => {
                const currentSong = MOCK_TRACKS[idx % MOCK_TRACKS.length];
                if (!currentSong) return null;

                return (
                  <div
                    key={friend.id}
                    className="p-3.5 rounded-card bg-app-elevated/70 border border-app-border hover:border-app-border-strong transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={friend} size="md" showPresence={true} />
                        <div>
                          <h4 className="text-body font-bold text-app-text">{friend.name}</h4>
                          <p className="text-meta-sm text-app-muted">{friend.handle}</p>
                        </div>
                      </div>

                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Listening along
                      </span>
                    </div>

                    {/* Song Card currently playing by friend */}
                    <div className="flex items-center justify-between p-2 rounded-chip bg-app-surface border border-app-border">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Disc3 size={18} className="text-app-accent animate-spin shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-meta font-bold text-app-text truncate">
                            {currentSong.title}
                          </p>
                          <p className="text-meta-sm text-app-muted truncate">
                            {currentSong.artist}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={<Play size={12} fill="currentColor" />}
                          onClick={() => {
                            playTrack(currentSong);
                            joinRoom('8492');
                            onClose();
                          }}
                        >
                          Listen Together
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
