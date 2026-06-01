"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { UpdatesPopup } from "./UpdatesPopup";

function openPopup(setOpen: (open: boolean) => void) {
  setOpen(true);
}

export function Navbar() {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <>
      <UpdatesPopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} />
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 8 }}
        transition={{ duration: 2.0, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-2 py-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-md"
      >
        <Link href="/" className="flex items-center gap-2 px-3">
          <Image
            src="/app.jpg"
            alt="cisum Logo"
            width={20}
            height={20}
            quality={90}
            className="rounded"
          />
          <span
            className="text-sm font-bold tracking-tight text-white/90"
            style={{ fontStretch: "125%", fontVariationSettings: '"wdth" 125' }}
          >
            cisum
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => openPopup(setPopupOpen)}
            className="px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-white rounded-full hover:bg-white/5"
          >
            Updates
          </button>
          <button
            onClick={() => openPopup(setPopupOpen)}
            className="px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-white rounded-full hover:bg-white/5"
          >
            Docs
          </button>
          {/* <Link href="/docs" className="px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-white rounded-full hover:bg-white/5">Docs</Link> */}
          <a
            href="https://discord.gg/Mb4F9Gmuex"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[rgb(162,133,80)] rounded-full border border-[rgb(162,133,80)]/20 bg-[rgb(162,133,80)]/10 hover:bg-[rgb(162,133,80)]/20 transition-all"
          >
            <span>💬</span>
            Discord
          </a>
        </div>
      </motion.nav>
    </>
  );
}
