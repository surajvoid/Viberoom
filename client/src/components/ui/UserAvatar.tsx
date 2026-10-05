import React from 'react';
import { User } from '../../mockData.js';

export interface UserAvatarProps {
  user: Pick<User, 'name' | 'avatarSvg' | 'status'>;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showPresence?: boolean;
  className?: string;
  onClick?: () => void;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  user,
  size = 'md',
  showPresence = true,
  className = '',
  onClick,
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 min-w-[24px]',
    sm: 'w-8 h-8 min-w-[32px]',
    md: 'w-10 h-10 min-w-[40px]',
    lg: 'w-12 h-12 min-w-[48px]',
    xl: 'w-16 h-16 min-w-[64px]',
  }[size];

  const dotSizeClasses = {
    xs: 'w-1.5 h-1.5 border-[1px]',
    sm: 'w-2 h-2 border-[1.5px]',
    md: 'w-2.5 h-2.5 border-2',
    lg: 'w-3 h-3 border-2',
    xl: 'w-3.5 h-3.5 border-2',
  }[size];

  const presenceBg = {
    online: 'bg-emerald-500',
    listening: 'bg-app-accent',
    idle: 'bg-amber-500',
    offline: 'bg-zinc-500',
  }[user.status || 'offline'];

  return (
    <div
      onClick={onClick}
      className={`relative inline-block select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Listening pulse ring */}
      {showPresence && user.status === 'listening' && (
        <div className="absolute -inset-0.5 rounded-full border border-app-accent/60 animate-ping opacity-40 pointer-events-none" />
      )}

      {/* Avatar circular frame */}
      <div
        className={`
          relative rounded-full overflow-hidden border border-white/10 dark:border-white/5 bg-app-elevated shadow-soft-1
          ${sizeClasses}
        `}
      >
        <img
          src={user.avatarSvg}
          alt={user.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Presence Dot */}
      {showPresence && (
        <span
          className={`
            absolute bottom-0 right-0 rounded-full border-app-bg ${presenceBg} ${dotSizeClasses}
          `}
          title={`Status: ${user.status}`}
        />
      )}
    </div>
  );
};
