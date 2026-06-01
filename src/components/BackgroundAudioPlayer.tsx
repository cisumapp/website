"use client";

import { useEffect, useRef, useState } from "react";
import { playerStore } from "@/lib/audio-store";
import { motion, AnimatePresence } from "framer-motion";

const FADE_DURATION = 1000;
const TARGET_VOLUME = 0.3;

export function BackgroundAudioPlayer({ onEnter }: { onEnter?: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    playerStore.audio = audio;
    audio.volume = 0;
    audio.src = "/background.m4a";

    const fadeIn = () => {
      audio.muted = false;
      const startTime = performance.now();
      const interval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / FADE_DURATION, 1);
        audio.volume = progress * TARGET_VOLUME;
        if (progress >= 1) clearInterval(interval);
      }, 50);
    };

    audio.addEventListener("playing", () => {
      fadeIn();
    }, { once: true });
  }, []);

  const handleEnter = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().catch(console.error);
    }
    setHasEntered(true);
    onEnter?.();
  };

  return (
    <>
      <AnimatePresence>
        {!hasEntered && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl"
          >
            <div className="flex flex-col items-center max-w-md px-6 text-center">
              <h2 className="mb-4 text-2xl font-bold text-white tracking-tight" style={{ fontStretch: "125%", fontVariationSettings: '"wdth" 125' }}>
                Immersive Experience
              </h2>
              <p className="mb-8 text-sm text-zinc-400 leading-relaxed">
                This website will play background audio to demonstrate the experience of the application.
              </p>
              <button
                onClick={handleEnter}
                className="h-12 px-8 rounded-full bg-[rgb(162,133,80)] text-base font-medium text-[rgb(32,34,46)] transition-all hover:bg-[rgb(162,133,80)]/90 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(162,133,80,0.3)]"
              >
                Enter Site
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <audio
        ref={audioRef}
        controls={false}
        preload="auto"
        muted
        className="fixed -left-[9999px] top-0 w-px h-px opacity-0 pointer-events-none"
        playsInline
      />
    </>
  );
}
