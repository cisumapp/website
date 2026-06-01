"use client";

import { useEffect, useState } from "react";
import { playerStore } from "@/lib/audio-store";

function formatTime(t: number) {
  if (!isFinite(t)) return "0:00";
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function PhonePlayerControls() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = playerStore.audio;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onLoaded = () => setDuration(audio.duration || 0);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("loadedmetadata", onLoaded);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsPlaying(!audio.paused);
    setDuration(audio.duration || 0);
    setCurrentTime(audio.currentTime);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("loadedmetadata", onLoaded);
    };
  }, []);

  const togglePlay = () => {
    const audio = playerStore.audio;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = playerStore.audio;
    if (!audio) return;
    audio.currentTime = parseFloat(e.target.value);
    setCurrentTime(audio.currentTime);
  };

  return (
    <div className="absolute inset-x-0 bottom-0 h-1/4 pointer-events-auto select-none px-4 flex flex-col justify-end pb-30">
      <h3
        className="text-white text-[12px] md:text-sm font-bold tracking-tight leading-tight mb-0.5 ml-2"
        style={{ fontStretch: "125%", fontVariationSettings: '"wdth" 125' }}
      >
        Don&apos;t stop til&apos; you get enough
      </h3>
      <p
        className="text-white text-[10px] md:text-xs font-medium mb-3 ml-2"
        style={{ fontStretch: "125%", fontVariationSettings: '"wdth" 125' }}
      >
        Michael Jackson
      </p>

      <div className="w-full flex items-center gap-2 mb-2 px-2">
        <span className="text-white text-[9px] w-7 text-right tabular-nums">{formatTime(currentTime)}</span>
        <div className="flex-1 h-1 relative">
          <div className="absolute inset-0 rounded-full bg-zinc-700" />
          <div
            className="absolute top-0 left-0 h-full rounded-full bg-white"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <span className="text-white text-[9px] w-7 tabular-nums">{formatTime(duration)}</span>
      </div>

      <button
        onClick={togglePlay}
        className="self-center w-10 h-10 m-1 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center
          hover:bg-white/20 active:scale-90 transition-all border border-white/10"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="6" y="4" width="4" height="16" rx="1" fill="white" />
            <rect x="14" y="4" width="4" height="16" rx="1" fill="white" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="ml-0.5">
            <path d="M8 5v14l11-7z" fill="white" />
          </svg>
        )}
      </button>
    </div>
  );
}
