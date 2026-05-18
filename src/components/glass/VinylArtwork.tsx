import React from 'react';
import { motion } from 'framer-motion';

interface VinylArtworkProps {
  title?: string;
  artist?: string;
  isPlaying?: boolean;
}

export const VinylArtwork: React.FC<VinylArtworkProps> = ({
  title = 'No Track Selected',
  artist = 'Select a track to stream',
  isPlaying = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      {/* Vinyl Outer Sleeve */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        {/* Glow behind the record */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/15 to-purple-500/15 blur-2xl opacity-70" />

        {/* Spinning Vinyl Record */}
        <motion.div
          className="absolute w-52 h-52 rounded-full bg-[#0a0c16] border-[6px] border-[#181c32] shadow-2xl flex items-center justify-center overflow-hidden z-10"
          animate={isPlaying ? { rotate: 360 } : {}}
          transition={
            isPlaying
              ? { repeat: Infinity, duration: 15, ease: 'linear' }
              : { duration: 0.5 }
          }
        >
          {/* Vinyl Grooves Pattern */}
          <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle,#1a1a24_0px,#1a1a24_3px,#0c0c14_4px,#0c0c14_7px)] opacity-95" />

          {/* Shiny vinyl gloss effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 via-white/5 to-white/0 transform -rotate-45" />

          {/* Record center label */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-4 border-black flex items-center justify-center relative shadow-inner z-20">
            {/* Center spindle hole */}
            <div className="w-4 h-4 rounded-full bg-black shadow-inner" />
          </div>
        </motion.div>

        {/* Vinyl Arm overlay (native Apple player touch) */}
        <motion.div
          className="absolute top-0 right-0 w-24 h-24 origin-[12px_12px] z-30"
          style={{ x: 22, y: -18 }}
          animate={isPlaying ? { rotate: 20 } : { rotate: -5 }}
          transition={{ type: 'spring', stiffness: 80, damping: 15 }}
        >
          {/* Metal arm representation */}
          <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-95 drop-shadow-lg">
            <path d="M12 12C12 12 36 8 48 30C60 52 54 70 54 70" stroke="#e4e4e7" strokeWidth="3" strokeLinecap="round" />
            {/* Pivot hinge */}
            <circle cx="12" cy="12" r="7" fill="#52525b" stroke="#18181b" strokeWidth="2.5" />
            <circle cx="12" cy="12" r="2.5" fill="#09090b" />
            {/* Cartridge */}
            <rect x="48" y="66" width="12" height="6" rx="1" fill="#ec4899" transform="rotate(22 48 66)" stroke="#1e1b4b" strokeWidth="1" />
          </svg>
        </motion.div>
      </div>

      {/* Song Metadata */}
      <div className="mt-8 text-center max-w-[85%] z-10">
        <h3 className="text-base font-bold text-zinc-100 truncate tracking-wide">
          {title}
        </h3>
        <p className="text-[10px] text-zinc-400 font-extrabold truncate mt-1.5 tracking-wider uppercase">
          {artist}
        </p>
      </div>
    </div>
  );
};
