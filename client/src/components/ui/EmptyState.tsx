import React from 'react';
import { Music, Radio, Users, Search, FolderHeart } from 'lucide-react';
import { Button } from './Button.js';

export interface EmptyStateProps {
  type?: 'playlists' | 'rooms' | 'friends' | 'search' | 'generic';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  const configs = {
    playlists: {
      icon: FolderHeart,
      defaultTitle: 'No playlists yet',
      defaultDesc: 'Create your first playlist or save curated editorial mixes.',
      defaultAction: 'Create Playlist',
    },
    rooms: {
      icon: Radio,
      defaultTitle: 'No rooms active right now',
      defaultDesc: 'Start listening together with friends in synchronized rooms.',
      defaultAction: 'Launch a Room',
    },
    friends: {
      icon: Users,
      defaultTitle: 'No friends listening right now',
      defaultDesc: 'Invite someone to vibe with you or explore public rooms.',
      defaultAction: 'Invite Friends',
    },
    search: {
      icon: Search,
      defaultTitle: 'No matching tracks found',
      defaultDesc: 'Try another search query, artist name, or smart natural prompt.',
      defaultAction: 'Clear Search',
    },
    generic: {
      icon: Music,
      defaultTitle: 'Nothing here yet',
      defaultDesc: 'Discover new tracks to populate this section.',
      defaultAction: 'Explore Music',
    },
  }[type];

  const Icon = configs.icon;

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center space-y-4 rounded-card bg-app-surface/50 border border-app-border ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-app-elevated border border-app-border flex items-center justify-center text-app-accent shadow-soft-1">
        <Icon size={26} />
      </div>

      <div className="space-y-1 max-w-sm">
        <h3 className="text-section-heading font-extrabold text-app-text">
          {title || configs.defaultTitle}
        </h3>
        <p className="text-body text-app-muted">
          {description || configs.defaultDesc}
        </p>
      </div>

      {actionLabel !== undefined ? (
        actionLabel && (
          <Button variant="primary" size="md" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      ) : (
        configs.defaultAction && (
          <Button variant="primary" size="md" onClick={onAction}>
            {configs.defaultAction}
          </Button>
        )
      )}
    </div>
  );
};
