import React from 'react';
import { useUser } from '../context/UserContext.js';
import { useSocket } from '../context/SocketContext.js';
import { Radio, User, Edit3 } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentUser, openProfileModal } = useUser();
  const { isConnected } = useSocket();

  return (
    <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md px-4 py-3 border-b border-border-subtle/50 flex items-center justify-between select-none">
      {/* Brand */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-surface-secondary border border-border-subtle flex items-center justify-center">
          <Radio size={15} className="text-content-primary" />
        </div>
        <div>
          <span className="font-serif tracking-widest text-base uppercase text-content-primary">
            VibeRoom
          </span>
          <span className="text-[9px] font-mono text-content-muted block tracking-widest leading-none">
            MUSIC IS BETTER TOGETHER
          </span>
        </div>
      </div>

      {/* Right: Live Connection Status & User Profile Button */}
      <div className="flex items-center gap-2.5">
        {/* Socket Status Indicator */}
        <div
          title={isConnected ? 'Connected to VibeRoom Real-Time Engine' : 'Reconnecting...'}
          className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-secondary border border-border-subtle text-[10px] text-content-secondary"
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="font-mono">{isConnected ? 'LIVE' : 'SYNCING'}</span>
        </div>

        {/* User Profile Button */}
        <button
          onClick={openProfileModal}
          title="Click to edit your name & avatar"
          className="flex items-center gap-1.5 py-1 px-2 rounded-full bg-surface-secondary hover:bg-surface-tertiary border border-border-subtle transition-all active:scale-95 group"
        >
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-500/50"
          />
          <span className="text-xs font-medium text-content-primary pr-0.5 max-w-[90px] truncate">
            {currentUser.name}
          </span>
          <Edit3 size={11} className="text-content-muted group-hover:text-emerald-400 transition-colors" />
        </button>
      </div>
    </header>
  );
};
