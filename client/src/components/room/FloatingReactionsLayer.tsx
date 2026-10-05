import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoom } from '../../context/RoomContext.js';

export const FloatingReactionsLayer: React.FC = () => {
  const { floatingReactions } = useRoom();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
      <AnimatePresence>
        {floatingReactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ opacity: 0, y: 50, scale: 0.6 }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: -180,
              scale: [0.6, 1.25, 1.1, 0.9],
              x: [0, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 60],
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.8,
              ease: 'easeOut',
            }}
            style={{ left: `${reaction.x}%` }}
            className="absolute bottom-16 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white shadow-2xl select-none"
          >
            <span className="text-2xl leading-none">{reaction.emoji}</span>
            {reaction.count > 1 && (
              <span className="text-xs font-black text-app-accent leading-none font-mono">
                +{reaction.count}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
