import React from 'react';
import { Play, Shuffle, Star, MoreHorizontal, Search } from 'lucide-react';

interface ArtistHeroProps {
  name: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  imageUrl?: string;
  onPlayAll?: () => void;
  onShuffle?: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: () => void;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
}

export const ArtistHero: React.FC<ArtistHeroProps> = ({
  name,
  imageUrl,
  onPlayAll,
  onShuffle,
  isFavorited = false,
  onToggleFavorite,
  searchQuery = '',
  onSearchChange,
  onSearchSubmit,
}) => {
  return (
    <div className="relative w-full h-[380px] rounded-3xl overflow-hidden shadow-2xl group border border-white/[0.04] flex-shrink-0">
      {/* 1. Cinematic Widescreen Band Backdrop (Dynamic or Fallback high-contrast image) */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0 scale-102 group-hover:scale-100 transition duration-[2000ms] ease-out" 
        style={{ 
          backgroundImage: `url('${imageUrl || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop" }')` 
        }} 
      />
      
      {/* 2. Soft black linear gradient blend masking at the bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-[#161616]/35 to-transparent z-10" />

      {/* 3. Overlay Content: Artist Title, Play/Shuffle pill, Favorite, and Search */}
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-8 pb-7">
        <div className="flex items-end justify-between gap-6">
          
          {/* Left Area: Title + Buttons */}
          <div className="flex flex-col gap-4">
            <div className="flex items-baseline gap-6">
              {/* Massive White Sans-Serif Capitalized Header */}
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]">
                {name}
              </h1>

              {/* Consolidated Play/Shuffle glass capsule */}
              <div className="flex items-center bg-white/[0.12] hover:bg-white/[0.18] border border-white/[0.08] rounded-full px-5 py-2.5 text-white font-bold text-xs shadow-lg transition duration-300 backdrop-blur-xl">
                <button 
                  onClick={onPlayAll}
                  className="flex items-center gap-1.5 hover:text-zinc-200 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white stroke-none" />
                  Play
                </button>
                <span className="w-[1px] h-3 bg-white/20 mx-3.5" />
                <button 
                  onClick={onShuffle}
                  className="flex items-center gap-1.5 hover:text-zinc-200 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Circular Star Button */}
              <button 
                onClick={onToggleFavorite}
                className={`w-9 h-9 rounded-full flex items-center justify-center border shadow-lg backdrop-blur-xl transition duration-300 cursor-pointer ${
                  isFavorited 
                    ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' 
                    : 'bg-white/[0.08] border-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.14]'
                }`}
              >
                <Star className={`w-4 h-4 ${isFavorited ? 'fill-blue-400 stroke-none' : ''}`} />
              </button>

              {/* Circular Three-Dots Options Button */}
              <button className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.08] border border-white/[0.06] text-zinc-300 hover:text-white hover:bg-white/[0.14] shadow-lg backdrop-blur-xl transition duration-300 cursor-pointer">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Area: Transparent Search Artist pill */}
          {onSearchChange && onSearchSubmit && (
            <form onSubmit={onSearchSubmit} className="relative w-64 group flex-shrink-0 pb-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search Artist"
                className="w-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 focus:border-blue-500/40 rounded-full px-5 py-2 pl-10 text-xs text-white placeholder-zinc-400 outline-none transition duration-300 backdrop-blur-xl shadow-lg"
              />
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-zinc-400 group-focus-within:text-blue-400 transition" />
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
