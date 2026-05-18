import React from 'react';
import { motion } from 'framer-motion';
import { Music } from 'lucide-react';

interface PlaylistItemProps {
  title: string;
  songCount?: number;
  active?: boolean;
  onClick?: () => void;
}

export const PlaylistItem: React.FC<PlaylistItemProps> = ({
  title,
  songCount = 0,
  active = false,
  onClick,
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left cursor-pointer transition-all duration-300 relative group ${
        active
          ? 'bg-white/[0.06] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.02]'
      }`}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border-indigo-500/30 text-indigo-400' 
          : 'bg-zinc-900 border-zinc-800 text-zinc-500 group-hover:border-zinc-700 group-hover:text-zinc-300'
      }`}>
        <Music className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold truncate transition-colors duration-300 group-hover:text-white">
          {title}
        </h4>
        <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
          {songCount > 0 ? `${songCount} songs` : 'Playlist'}
        </p>
      </div>
    </motion.button>
  );
};
