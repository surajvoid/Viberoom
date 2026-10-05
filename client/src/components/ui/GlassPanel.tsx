import React from 'react';

export interface GlassPanelProps {
  children: React.ReactNode;
  rounded?: 'card' | 'hero' | 'none';
  className?: string;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({
  children,
  rounded = 'card',
  className = '',
}) => {
  const roundedClass = {
    card: 'rounded-card',
    hero: 'rounded-hero',
    none: 'rounded-none',
  }[rounded];

  return (
    <div
      className={`glass-panel border border-white/10 dark:border-white/5 ${roundedClass} ${className}`}
    >
      {children}
    </div>
  );
};
