import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, 
  Volume2, VolumeX, Heart, ListMusic, MessageSquare, 
  MoreHorizontal, Star, Share2, Disc
} from 'lucide-react';

interface FloatingPlayerProps {
  activeTrack: { 
    title: string; 
    artist: string; 
    url: string;
    coverArt?: string;
    artistImage?: string;
    albumTitle?: string;
  } | null;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  progress?: number; // 0 to 100
  onProgressChange?: (progress: number) => void;
  volume?: number; // 0 to 1
  onVolumeChange?: (volume: number) => void;
}

export const FloatingPlayer: React.FC<FloatingPlayerProps> = ({
  activeTrack,
  isPlaying = false,
  onPlayPause,
  onPrev,
  onNext,
  progress = 0,
  onProgressChange,
  volume = 0.8,
  onVolumeChange,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);

  const toggleMute = () => {
    if (isMuted) {
      onVolumeChange?.(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      onVolumeChange?.(0);
      setIsMuted(true);
    }
  };

  // Format progress to display time e.g. 0:24 and 3:51
  const getElapsedText = () => {
    if (!activeTrack) return '0:00';
    const totalSeconds = 231; // 3:51 in seconds
    const elapsedSeconds = Math.floor((progress / 100) * totalSeconds);
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <motion.div
      initial={{ y: -55, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between px-6 py-2.5 rounded-full border border-white/[0.06] bg-[#1a1a1a]/75 backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-[820px] pointer-events-auto select-none flex-shrink-0"
    >
      {/* Left Section: Artwork, Track/Artist Info and integrated scrubber */}
      <div className="flex items-center gap-3 w-[280px] min-w-0 flex-shrink-0">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 flex items-center justify-center relative overflow-hidden flex-shrink-0 shadow-md">
          {activeTrack ? (
            <div 
              className="w-full h-full bg-cover bg-center transition-all duration-500" 
              style={{ 
                backgroundImage: `url('${activeTrack.coverArt || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=120&auto=format&fit=crop" }')` 
              }} 
            />
          ) : (
            <Disc className="w-5 h-5 text-zinc-500 animate-spin" style={{ animationDuration: '3s' }} />
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <h4 className="text-[11px] font-bold text-white truncate uppercase tracking-wider">
              {activeTrack ? activeTrack.title : 'Not Playing'}
            </h4>
            <span className="text-[9px] text-zinc-400 font-semibold truncate uppercase tracking-wider">
              - {activeTrack ? activeTrack.artist : 'Select track'}
            </span>
          </div>

          {/* Mini-seek timeline bar and elapsed/duration text */}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[8px] text-zinc-500 font-bold select-none min-w-[20px]">
              {getElapsedText()}
            </span>
            <div
              className="flex-1 h-[2px] rounded-full bg-zinc-800 relative cursor-pointer group py-1"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const percent = ((e.clientX - rect.left) / rect.width) * 100;
                onProgressChange?.(percent);
              }}
            >
              <div className="absolute top-[3px] left-0 h-[2px] rounded-full bg-zinc-400 w-full" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[8px] text-zinc-500 font-bold select-none min-w-[20px] text-right">
              {activeTrack ? '3:51' : '--:--'}
            </span>
          </div>
        </div>
      </div>

      {/* Center Section: Core Media Mechanical controls */}
      <div className="flex items-center justify-center gap-4 flex-1">
        {/* Shuffle */}
        <button
          onClick={() => setShuffle(!shuffle)}
          className={`transition duration-200 cursor-pointer ${shuffle ? 'text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Shuffle className="w-4 h-4" />
        </button>

        {/* Skip Back */}
        <button
          onClick={onPrev}
          className="text-zinc-400 hover:text-white transition duration-200 cursor-pointer active:scale-90"
        >
          <SkipBack className="w-4 h-4 fill-current stroke-none" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={onPlayPause}
          className="text-white hover:text-zinc-200 flex items-center justify-center transition duration-200 cursor-pointer active:scale-95 hover:scale-105"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-white stroke-none" />
          ) : (
            <Play className="w-5 h-5 fill-white stroke-none ml-0.5" />
          )}
        </button>

        {/* Skip Forward */}
        <button
          onClick={onNext}
          className="text-zinc-400 hover:text-white transition duration-200 cursor-pointer active:scale-90"
        >
          <SkipForward className="w-4 h-4 fill-current stroke-none" />
        </button>

        {/* Repeat */}
        <button
          onClick={() => setRepeat(!repeat)}
          className={`transition duration-200 cursor-pointer ${repeat ? 'text-zinc-200' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>

      {/* Right Section: Volume Slider, AirPlay and visual actions */}
      <div className="flex items-center justify-end gap-3.5 w-[280px] text-zinc-400 flex-shrink-0">
        {/* Options */}
        <button className="hover:text-white transition duration-200 cursor-pointer">
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {/* Favorite */}
        <button
          onClick={() => setIsFavorite(!isFavorite)}
          className={`transition duration-200 cursor-pointer ${isFavorite ? 'text-blue-400 hover:text-blue-300' : 'hover:text-white'}`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-blue-400 stroke-none' : ''}`} />
        </button>

        {/* Airplay / Output */}
        <button className="hover:text-white transition duration-200 cursor-pointer">
          <Share2 className="w-4 h-4" />
        </button>

        {/* Volume control */}
        <div className="flex items-center gap-1.5 group/vol">
          <button onClick={toggleMute} className="hover:text-white cursor-pointer transition">
            {volume === 0 || isMuted ? (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume * 100}
            onChange={(e) => {
              const val = parseFloat(e.target.value) / 100;
              onVolumeChange?.(val);
              if (val > 0) setIsMuted(false);
            }}
            className="w-14 h-1 rounded-full bg-zinc-800 appearance-none cursor-pointer accent-white focus:outline-none transition group-hover/vol:w-16"
          />
        </div>

        {/* Lyrics */}
        <button className="hover:text-white transition duration-200 cursor-pointer">
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Queue list */}
        <button className="hover:text-white transition duration-200 cursor-pointer">
          <ListMusic className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
