import React, { useEffect, useState } from 'react';
import { FloatingReaction } from '../types/index.js';

interface FloatingItem {
  id: string;
  emoji: string;
  leftPercent: number;
  scale: number;
  userName?: string;
}

interface FloatingReactionsViewProps {
  reactions: FloatingReaction[];
}

export const FloatingReactionsView: React.FC<FloatingReactionsViewProps> = ({ reactions }) => {
  const [activeItems, setActiveItems] = useState<FloatingItem[]>([]);

  useEffect(() => {
    if (reactions.length === 0) return;
    const latest = reactions[reactions.length - 1];

    // Distribute randomly across the center-width (30% to 70%)
    const newItem: FloatingItem = {
      id: `${latest.id}-${Math.random()}`,
      emoji: latest.emoji,
      leftPercent: 25 + Math.random() * 50,
      scale: 0.9 + Math.random() * 0.4,
      userName: latest.user?.name,
    };

    setActiveItems((prev) => [...prev.slice(-15), newItem]);

    const timer = setTimeout(() => {
      setActiveItems((prev) => prev.filter((item) => item.id !== newItem.id));
    }, 2700);

    return () => clearTimeout(timer);
  }, [reactions.length]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-30">
      {activeItems.map((item) => (
        <div
          key={item.id}
          className="absolute bottom-16 transform -translate-x-1/2 animate-float-up flex flex-col items-center select-none"
          style={{
            left: `${item.leftPercent}%`,
            fontSize: `${item.scale * 2.2}rem`,
          }}
        >
          <span className="drop-shadow-lg filter">{item.emoji}</span>
          {item.userName && (
            <span className="text-[10px] font-sans text-content-secondary/80 tracking-wide mt-[-2px] uppercase">
              {item.userName}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
