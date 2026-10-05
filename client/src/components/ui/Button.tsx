import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'pill';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  icon,
  children,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  // Base styling adhering to Phase 1 tokens
  const baseClasses =
    'relative inline-flex items-center justify-center font-sans font-semibold transition-colors duration-200 focus:outline-none select-none disabled:opacity-50 disabled:pointer-events-none';

  // Variant classes
  const variantClasses = {
    primary:
      'bg-app-accent text-white shadow-accent-glow hover:brightness-110 active:brightness-95',
    secondary:
      'bg-app-surface text-app-text hover:bg-app-elevated border border-app-border active:bg-app-elevated/80',
    ghost:
      'bg-transparent text-app-text hover:bg-app-surface/60 active:bg-app-surface',
    icon:
      'bg-app-surface/60 text-app-text hover:bg-app-surface active:bg-app-elevated border border-app-border rounded-full',
    pill:
      'bg-app-surface text-app-text hover:bg-app-elevated rounded-full border border-app-border px-4 py-1.5 text-meta',
  }[variant];

  // Size classes
  const sizeClasses = {
    sm: variant === 'icon' ? 'w-8 h-8 p-0' : 'text-meta py-1.5 px-3 rounded-chip gap-1.5',
    md: variant === 'icon' ? 'w-10 h-10 p-0' : 'text-body py-2.5 px-5 rounded-chip gap-2',
    lg: variant === 'icon' ? 'w-12 h-12 p-0' : 'text-body py-3.5 px-7 rounded-card gap-2.5',
  }[size];

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`
        ${baseClasses}
        ${variantClasses}
        ${sizeClasses}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </motion.button>
  );
};
