import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext.js';
import { useAudio } from '../context/AudioContext.js';
import { X, KeyRound, Radio, Users, ArrowRight } from 'lucide-react';

interface JoinRoomCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined: (roomId: string) => void;
}

export const JoinRoomCodeModal: React.FC<JoinRoomCodeModalProps> = ({
  isOpen,
  onClose,
  onJoined,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { joinRoom } = useSocket();
  const { openRoom } = useAudio();

  if (!isOpen) return null;

  const publicRooms = [
    { code: '8492', title: 'LATE NIGHT BOLLYWOOD', currentSong: 'Apna Bana Le', listeners: 1284 },
    { code: '5120', title: 'LO-FI & CHILL', currentSong: 'Midnight Lo-Fi Echoes', listeners: 734 },
  ];

  const handleJoin = async (targetCode: string) => {
    const clean = targetCode.trim();
    if (!clean) return;

    setIsJoining(true);
    setError('');

    try {
      const success = await joinRoom(clean);
      if (success) {
        onClose();
        openRoom(clean);
        onJoined(clean);
      } else {
        setError('Room not found. Check the code or try one of the public rooms.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-surface-primary border border-border-subtle p-6 shadow-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 inset-x-0 h-36 bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-secondary text-content-muted hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 mb-1">
          <KeyRound size={14} />
          <span>GROIC ROOM ACCESS</span>
        </div>
        <h2 className="text-xl font-serif text-content-primary">
          Join with Room Code
        </h2>
        <p className="text-xs text-content-secondary mt-0.5 mb-4">
          Enter your friend's 4-digit code to listen synchronized.
        </p>

        {/* Code Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleJoin(code);
          }}
          className="space-y-3"
        >
          <div className="relative">
            <input
              type="text"
              autoFocus
              maxLength={8}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. 8492"
              className="w-full bg-surface-secondary border border-border-highlight rounded-2xl py-3 px-4 text-center font-mono text-2xl tracking-[0.25em] text-content-primary placeholder-content-muted focus:outline-none focus:border-content-primary"
            />
          </div>

          {error && <p className="text-[11px] text-red-400 text-center">{error}</p>}

          <button
            type="submit"
            disabled={!code.trim() || isJoining}
            className="w-full py-3.5 rounded-xl bg-content-primary text-background font-semibold text-xs hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40"
          >
            <Radio size={14} />
            <span>{isJoining ? 'Joining Room...' : 'Enter Listening Room'}</span>
          </button>
        </form>

        {/* Active Public Rooms with Codes */}
        <div className="mt-5 pt-4 border-t border-border-subtle/50">
          <div className="text-[10px] font-mono uppercase tracking-wider text-content-muted mb-2.5">
            OR JOIN ACTIVE ROOMS
          </div>

          <div className="space-y-2">
            {publicRooms.map((room) => (
              <div
                key={room.code}
                onClick={() => handleJoin(room.code)}
                className="p-2.5 rounded-xl bg-surface-secondary/60 hover:bg-surface-secondary border border-border-subtle hover:border-border-highlight cursor-pointer flex items-center justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-content-primary">
                      {room.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-content-secondary mt-0.5">
                    {room.currentSong} • {room.listeners} listening
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-surface-primary border border-border-subtle font-mono text-[11px] font-bold text-content-primary">
                    {room.code}
                  </span>
                  <ArrowRight size={13} className="text-content-muted group-hover:text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
