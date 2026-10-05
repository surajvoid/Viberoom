import React from 'react';

export interface ArtworkProps {
  src: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'hero';
  rounded?: 'chip' | 'card' | 'hero' | 'full';
  glowColor?: string;
  isPlaying?: boolean;
  className?: string;
}

export const Artwork: React.FC<ArtworkProps> = ({
  src,
  alt = 'Track Artwork',
  size = 'md',
  rounded = 'card',
  glowColor,
  isPlaying = false,
  className = '',
}) => {
  const sizeClasses = {
    xs: 'w-10 h-10 min-w-[40px]',
    sm: 'w-14 h-14 min-w-[56px]',
    md: 'w-20 h-20 min-w-[80px]',
    lg: 'w-36 h-36 min-w-[144px]',
    hero: 'w-full aspect-square max-w-[340px]',
  }[size];

  const roundedClasses = {
    chip: 'rounded-chip',
    card: 'rounded-card',
    hero: 'rounded-hero',
    full: 'rounded-full',
  }[rounded];

  return (
    <div className={`relative inline-block select-none ${className}`}>
      {/* Dynamic ambient accent glow if active */}
      {glowColor && (
        <div
          className="absolute -inset-1 blur-xl opacity-40 transition-opacity duration-500 pointer-events-none"
          style={{ backgroundColor: glowColor }}
        />
      )}

      {/* Main artwork container */}
      <div
        className={`
          relative overflow-hidden shadow-soft-1 border border-white/10 dark:border-white/5
          ${sizeClasses}
          ${roundedClasses}
        `}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-500"
          loading="lazy"
        />

        {/* Playing animated equalizer icon overlay if specified */}
        {isPlaying && (
          <div className="absolute bottom-2 right-2 flex items-end gap-0.5 bg-black/60 backdrop-blur-sm px-1.5 py-1 rounded-full">
            <span className="w-1 h-3 bg-app-accent rounded-full animate-pulse" />
            <span
              className="w-1 h-4 bg-app-accent rounded-full animate-pulse"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="w-1 h-2 bg-app-accent rounded-full animate-pulse"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
