import React from 'react';

export const SkeletonBox: React.FC<{
  className?: string;
  rounded?: 'chip' | 'card' | 'hero' | 'full';
}> = ({ className = '', rounded = 'chip' }) => {
  const roundedClass = {
    chip: 'rounded-chip',
    card: 'rounded-card',
    hero: 'rounded-hero',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      className={`animate-pulse bg-app-elevated/80 ${roundedClass} ${className}`}
    />
  );
};

export const SongRowSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-between p-3 rounded-chip bg-app-surface border border-app-border">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <SkeletonBox className="w-12 h-12 shrink-0" rounded="chip" />
        <div className="space-y-2 flex-1 min-w-0">
          <SkeletonBox className="w-3/5 h-4" />
          <SkeletonBox className="w-2/5 h-3" />
        </div>
      </div>
      <SkeletonBox className="w-16 h-8 shrink-0 ml-3" rounded="chip" />
    </div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-card bg-app-surface border border-app-border space-y-3">
      <SkeletonBox className="w-full aspect-square" rounded="card" />
      <SkeletonBox className="w-4/5 h-4" />
      <SkeletonBox className="w-1/2 h-3" />
    </div>
  );
};
