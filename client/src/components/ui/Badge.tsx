import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'outline' | 'live';
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  icon,
  className = '',
  onClick,
}) => {
  const baseClasses =
    'inline-flex items-center gap-1.5 px-3 py-1 rounded-chip text-meta-sm font-medium tracking-wide transition-colors select-none';

  const variantClasses = {
    default: 'bg-app-elevated text-app-text/90 border border-app-border',
    accent: 'bg-app-accent/15 text-app-accent border border-app-accent/25 font-semibold',
    outline: 'bg-transparent text-app-muted border border-app-border hover:border-app-border-strong',
    live: 'bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold',
  }[variant];

  return (
    <span
      onClick={onClick}
      className={`
        ${baseClasses}
        ${variantClasses}
        ${onClick ? 'cursor-pointer hover:brightness-110 active:scale-95' : ''}
        ${className}
      `}
    >
      {variant === 'live' && (
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
