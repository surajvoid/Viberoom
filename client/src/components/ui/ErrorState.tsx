import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button.js';

export interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message = 'Something interrupted the vibe. Let’s get the music back.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center space-y-3 rounded-card bg-rose-500/10 border border-rose-500/20 text-rose-300 ${className}`}
    >
      <AlertCircle size={28} className="text-rose-400" />
      <p className="text-body font-semibold max-w-sm text-app-text">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw size={13} />}
          onClick={onRetry}
          className="border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
