import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListPlus,
  Radio,
  Share2,
  ListMusic,
  PlusCircle,
  User,
  Disc,
  X,
  Check,
} from 'lucide-react';
import { Track } from '../../mockData.js';
import { Artwork } from '../ui/Artwork.js';
import { usePlayer } from '../../context/PlayerContext.js';

interface TrackActionsSheetProps {
  track: Track;
  isOpen: boolean;
  onClose: () => void;
  onStartRoom?: () => void;
}

export const TrackActionsSheet: React.FC<TrackActionsSheetProps> = ({
  track,
  isOpen,
  onClose,
  onStartRoom,
}) => {
  const { addToQueue } = usePlayer();
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText?.(
      `Listening to "${track.title}" by ${track.artist} on VibeRoom 🎵`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const actions = [
    {
      id: 'start-room',
      label: 'Start a Social Room with this Track',
      icon: Radio,
      accent: true,
      onClick: () => {
        onClose();
        onStartRoom?.();
      },
    },
    {
      id: 'add-queue',
      label: 'Add to Queue',
      icon: PlusCircle,
      onClick: () => {
        addToQueue(track);
        onClose();
      },
    },
    {
      id: 'play-next',
      label: 'Play Next',
      icon: ListMusic,
      onClick: () => {
        addToQueue(track);
        onClose();
      },
    },
    {
      id: 'add-playlist',
      label: 'Add to Playlist',
      icon: ListPlus,
      onClick: () => {
        onClose();
      },
    },
    {
      id: 'share',
      label: copied ? 'Link Copied to Clipboard!' : 'Share to Room / Friends',
      icon: copied ? Check : Share2,
      onClick: handleShare,
    },
    {
      id: 'view-artist',
      label: `View Artist (${track.artist})`,
      icon: User,
      onClick: () => {
        onClose();
      },
    },
    {
      id: 'view-album',
      label: `View Album (${track.album})`,
      icon: Disc,
      onClick: () => {
        onClose();
      },
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Sheet Content */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative w-full max-w-md bg-app-surface border border-app-border rounded-t-hero sm:rounded-hero p-5 pb-8 sm:pb-6 shadow-2xl z-10 space-y-4 max-h-[85vh] overflow-y-auto scrollbar-none"
        >
          {/* Header Track Overview */}
          <div className="flex items-center justify-between pb-3 border-b border-app-border">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Artwork
                src={track.artworkSvg}
                alt={track.title}
                size="sm"
                rounded="chip"
              />
              <div className="min-w-0">
                <h4 className="text-body font-bold text-app-text truncate">
                  {track.title}
                </h4>
                <p className="text-meta-sm text-app-muted truncate">
                  {track.artist} • {track.album}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-app-muted hover:text-app-text rounded-full hover:bg-app-elevated transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Action List */}
          <div className="space-y-1">
            {actions.map((act) => {
              const Icon = act.icon;
              return (
                <button
                  key={act.id}
                  onClick={act.onClick}
                  className={`
                    w-full flex items-center gap-3.5 px-3 py-3 rounded-chip text-body font-semibold transition-colors text-left
                    ${
                      act.accent
                        ? 'bg-app-accent/15 text-app-accent hover:bg-app-accent/25'
                        : 'text-app-text hover:bg-app-elevated'
                    }
                  `}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{act.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
