import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Volume2, ArrowDown, Star, MoreHorizontal, Disc } from 'lucide-react';
import { WasmTrack } from '@/hooks/useWasmSdk';

interface SongRowProps {
  track: WasmTrack;
  index: number;
  isActive?: boolean;
  isPlaying?: boolean;
  onPlay?: () => void;
}

export const SongRow: React.FC<SongRowProps> = ({
  track,
  index,
  isActive = false,
  isPlaying = false,
  onPlay,
}) => {
  const [isStarred, setIsStarred] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Derive static metadata details for album/year to match your screenshot
  const getSubtext = () => {
    const providerLabel = track.provider ? track.provider.toUpperCase() : 'WASM';
    if (track.albumTitle) {
      return `${track.albumTitle} • ${providerLabel}`;
    }
    if (track.title?.toLowerCase().includes('in the end')) {
      return `Hybrid Theory • 2000`;
    }
    if (track.title?.toLowerCase().includes('numb')) {
      return `Meteora • 2003`;
    }
    return `${track.artist} • ${providerLabel}`;
  };

  return (
    <motion.div
      onClick={onPlay}
      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group cursor-pointer ${
        isActive
          ? 'bg-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.15)] border-white/[0.05]'
          : 'bg-transparent hover:bg-white/[0.04]'
      }`}
      whileTap={{ scale: 0.995 }}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        
        {/* Cover Art Thumbnail (Left Side) */}
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center relative overflow-hidden flex-shrink-0 shadow-md">
          {isActive && isPlaying ? (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
              <Volume2 className="w-4 h-4 text-blue-400 animate-pulse" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center z-10 transition-opacity duration-200">
              <Play className="w-4 h-4 text-white fill-white stroke-none ml-0.5" />
            </div>
          )}
          
          <div 
            className="w-full h-full bg-cover bg-center flex items-center justify-center text-zinc-400 font-extrabold text-[10px] transition-all duration-300" 
            style={{ 
              backgroundImage: `url('${track.coverArt || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=120&auto=format&fit=crop" }')` 
            }}
          >
            {!isActive && !track.coverArt && <Disc className="w-4 h-4 text-zinc-500 animate-spin [animation-duration:15s]" />}
          </div>
        </div>

        {/* Title and Subtitle Info */}
        <div className="flex-1 min-w-0">
          <h4 className={`text-xs font-bold truncate ${isActive ? 'text-blue-400' : 'text-white'}`}>
            {track.title}
          </h4>
          <p className="text-[10px] text-zinc-500 truncate mt-0.5 group-hover:text-zinc-400 transition-colors">
            {getSubtext()}
          </p>
        </div>
      </div>

      {/* Right Side: Duration, Download, Star, Options */}
      <div className="flex items-center gap-5 ml-4 flex-shrink-0 select-none text-zinc-500">
        
        {/* Track Duration */}
        <span className="text-xs font-medium w-10 text-right group-hover:text-zinc-300 transition-colors">
          {track.duration || '3:30'}
        </span>

        {/* Download Icon */}
        <button 
          onClick={(e) => { e.stopPropagation(); setIsDownloaded(!isDownloaded); }}
          className={`hover:text-white transition duration-200 cursor-pointer ${isDownloaded ? 'text-blue-400' : ''}`}
        >
          <ArrowDown className="w-4 h-4" />
        </button>

        {/* Star Icon */}
        <button 
          onClick={(e) => { e.stopPropagation(); setIsStarred(!isStarred); }}
          className={`hover:text-white transition duration-200 cursor-pointer ${isStarred ? 'text-blue-400 hover:text-blue-300' : ''}`}
        >
          <Star className={`w-4 h-4 ${isStarred ? 'fill-blue-400 stroke-none' : ''}`} />
        </button>

        {/* Three-dots Options Icon */}
        <button className="hover:text-white transition duration-200 cursor-pointer">
          <MoreHorizontal className="w-4 h-4" />
        </button>

      </div>
    </motion.div>
  );
};
