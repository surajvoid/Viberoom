import React from 'react';
import { ReactionTimestamp } from '../types/index.js';
import { Flame } from 'lucide-react';

interface ReactionTimelineViewProps {
  timeline: ReactionTimestamp[];
  durationSec: number;
  currentSec: number;
  onSeek: (seconds: number) => void;
}

export const ReactionTimelineView: React.FC<ReactionTimelineViewProps> = ({
  timeline,
  durationSec,
  currentSec,
  onSeek,
}) => {
  if (!timeline || timeline.length === 0) return null;

  // Find most reacted moment
  const mostReacted = [...timeline].sort((a, b) => b.count - a.count)[0];

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full my-3 px-1">
      {/* Most Reacted Highlight Badge */}
      {mostReacted && (
        <div className="flex items-center justify-between text-xs text-content-secondary mb-1.5">
          <div
            onClick={() => onSeek(mostReacted.timestampSec)}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-tertiary border border-border-subtle cursor-pointer hover:border-content-secondary transition-colors"
          >
            <Flame size={12} className="text-orange-400" />
            <span className="text-[11px] font-medium text-content-primary">
              Peak Moment: {formatTime(mostReacted.timestampSec)} ({mostReacted.type} {mostReacted.count})
            </span>
          </div>
          <span className="text-[10px] text-content-muted tracking-wider uppercase">Reaction Timeline</span>
        </div>
      )}

      {/* Timeline track with pinned reaction badges */}
      <div className="relative h-6 w-full flex items-center">
        {/* Background track line */}
        <div className="absolute inset-x-0 h-0.5 bg-border-subtle rounded-full" />

        {/* Reaction Pins */}
        {timeline.map((item, idx) => {
          const percent = Math.min(100, Math.max(0, (item.timestampSec / durationSec) * 100));
          const isNear = Math.abs(currentSec - item.timestampSec) < 3;

          return (
            <button
              key={idx}
              onClick={() => onSeek(item.timestampSec)}
              title={`Jump to ${formatTime(item.timestampSec)} (${item.count} reactions)`}
              className={`absolute top-1/2 transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-all duration-200 z-10 ${
                isNear ? 'scale-125' : 'hover:scale-110'
              }`}
              style={{ left: `${percent}%` }}
            >
              <div
                className={`flex items-center justify-center text-xs w-5 h-5 rounded-full bg-surface-primary border shadow-sm ${
                  isNear ? 'border-white bg-surface-secondary scale-110' : 'border-border-highlight'
                }`}
              >
                <span>{item.type}</span>
              </div>

              {/* Hover Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 left-1/2 -translate-x-1/2 pointer-events-none bg-surface-primary border border-border-highlight px-1.5 py-0.5 rounded text-[9px] whitespace-nowrap text-content-primary">
                {formatTime(item.timestampSec)} ({item.count})
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
