import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Heart,
  ListMusic,
  MoreHorizontal,
  Share2,
  Disc,
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

type IconButtonProps = {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
};

const IconButton = ({
  children,
  label,
  onClick,
  active = false,
  disabled = false,
}: IconButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className={`flex h-11 w-11 items-center justify-center rounded-full border transition ${
      active
        ? 'border-white/[0.18] bg-white/[0.14] text-white'
        : 'border-white/[0.10] bg-white/[0.06] text-white/65 hover:bg-white/[0.12] hover:text-white'
    } ${disabled ? 'cursor-not-allowed opacity-40 hover:bg-white/[0.06] hover:text-white/65' : ''}`}
  >
    {children}
  </button>
);

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

  const totalSeconds = 231;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const elapsedSeconds = Math.floor((progress / 100) * totalSeconds);
  const remainingSeconds = Math.max(totalSeconds - elapsedSeconds, 0);

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

  const hasPrev = typeof onPrev === 'function';
  const hasNext = typeof onNext === 'function';

  return (
    <motion.div
      initial={{ y: 18, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      className="player-bar player-bar__floating-player w-full max-w-[1180px] pointer-events-auto select-none"
    >
      <div className="rounded-[28px] border border-white/[0.12] bg-[#0b0f16]/84 px-4 py-4 shadow-[0_28px_80px_rgba(0,0,0,0.5)] backdrop-blur-[48px] sm:px-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_auto_minmax(0,1fr)] lg:items-center">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[18px] border border-white/[0.10] bg-white/[0.06] shadow-[0_12px_32px_rgba(0,0,0,0.38)]">
              {activeTrack ? (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url('${activeTrack.coverArt || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=120&auto=format&fit=crop'}')`,
                  }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.10)_0%,rgba(255,255,255,0.03)_100%)]">
                  <Disc className="h-6 w-6 text-white/45" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="truncate text-[15px] font-semibold text-white sm:text-[17px]">
                  {activeTrack ? activeTrack.title : 'Not playing'}
                </h4>
                <span className="rounded-full border border-white/[0.10] bg-white/[0.06] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.24em] text-white/55">
                  320kb/s
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-white/55">
                {activeTrack ? activeTrack.artist : 'Select a track to start playback'}
              </p>

              <div className="mt-3 flex items-center gap-3">
                <span className="min-w-[44px] text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
                  {activeTrack ? formatTime(elapsedSeconds) : '0:00'}
                </span>
                <button
                  type="button"
                  onClick={(event) => {
                    if (!onProgressChange) return;
                    const rect = event.currentTarget.getBoundingClientRect();
                    const percent = ((event.clientX - rect.left) / rect.width) * 100;
                    onProgressChange(percent);
                  }}
                  className="group relative h-2 flex-1 overflow-hidden rounded-full bg-white/[0.10]"
                  aria-label="Seek playback"
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0.92)_100%)]"
                    style={{ width: `${progress}%` }}
                  />
                  <div className="absolute inset-0 bg-white/[0.0] transition group-hover:bg-white/[0.05]" />
                </button>
                <span className="min-w-[44px] text-right text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
                  {activeTrack ? `-${formatTime(remainingSeconds)}` : '--:--'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <IconButton
              label="Shuffle"
              onClick={() => setShuffle((current) => !current)}
              active={shuffle}
            >
              <Shuffle className="h-4 w-4" />
            </IconButton>

            <IconButton label="Previous track" onClick={onPrev} disabled={!hasPrev}>
              <SkipBack className="h-4 w-4 fill-current stroke-none" />
            </IconButton>

            <button
              type="button"
              onClick={onPlayPause}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#070c14] shadow-[0_14px_34px_rgba(255,255,255,0.18)] transition hover:scale-[1.02] active:scale-95"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5 fill-[#070c14] stroke-none" />
              ) : (
                <Play className="ml-0.5 h-5 w-5 fill-[#070c14] stroke-none" />
              )}
            </button>

            <IconButton label="Next track" onClick={onNext} disabled={!hasNext}>
              <SkipForward className="h-4 w-4 fill-current stroke-none" />
            </IconButton>

            <IconButton
              label="Repeat"
              onClick={() => setRepeat((current) => !current)}
              active={repeat}
            >
              <Repeat className="h-4 w-4" />
            </IconButton>
          </div>

          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <div className="flex items-center gap-2">
              <IconButton
                label="Favorite"
                onClick={() => setIsFavorite((current) => !current)}
                active={isFavorite}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-white stroke-none' : ''}`} />
              </IconButton>

              <IconButton label="More options">
                <MoreHorizontal className="h-4 w-4" />
              </IconButton>

              <IconButton label="Share">
                <Share2 className="h-4 w-4" />
              </IconButton>

              <IconButton label="Queue">
                <ListMusic className="h-4 w-4" />
              </IconButton>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.06] px-3 py-2 text-white/70 md:flex">
              <button type="button" onClick={toggleMute} className="transition hover:text-white" aria-label="Mute">
                {volume === 0 || isMuted ? (
                  <VolumeX className="h-4 w-4 text-white/45" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={isMuted ? 0 : volume * 100}
                onChange={(event) => {
                  const valueAsNumber = parseFloat(event.target.value) / 100;
                  onVolumeChange?.(valueAsNumber);
                  if (valueAsNumber > 0) setIsMuted(false);
                }}
                className="w-24 cursor-pointer accent-white"
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
