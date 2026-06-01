"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Twitter, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";

type UpdatesPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function UpdatesPopup({ isOpen, onClose }: UpdatesPopupProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
          >
            <div className="relative rounded-3xl border border-[rgb(162,133,80)]/30 bg-[rgb(32,34,46)] p-8 shadow-2xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="text-center">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(162,133,80)]/20 border border-[rgb(162,133,80)]/30">
                  <span className="text-3xl">✨</span>
                </div>

                <h2 className="mb-3 text-2xl font-bold text-white">
                  Stay Updated!
                </h2>
                <p className="mb-8 text-zinc-400">
                  For further updates, follow me on Twitter or join the official Discord community.
                </p>

                <div className="flex flex-col gap-3">
                  <a
                    href="https://twitter.com/atpugvaraa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 rounded-full bg-[rgb(162,133,80)] px-6 py-3 font-medium text-[rgb(32,34,46)] transition-all hover:bg-[rgb(162,133,80)]/90 hover:scale-[1.02]"
                  >
                    <Twitter className="h-5 w-5" />
                    Follow on Twitter
                  </a>

                  <a
                    href="https://discord.gg/Mb4F9Gmuex"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 rounded-full border border-[rgb(162,133,80)]/50 bg-transparent px-6 py-3 font-medium text-[rgb(162,133,80)] transition-all hover:bg-[rgb(162,133,80)]/10"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Join Discord
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}