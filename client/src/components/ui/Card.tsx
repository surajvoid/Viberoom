import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: React.ReactNode;
  interactive?: boolean;
  elevated?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  elevated = false,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      whileHover={interactive ? { y: -3, scale: 1.01 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`
        rounded-card border border-app-border p-4 transition-colors
        ${elevated ? 'bg-app-elevated shadow-soft-2' : 'bg-app-surface shadow-soft-1'}
        ${interactive ? 'cursor-pointer hover:border-app-border-strong' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};
