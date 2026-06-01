"use client";

import { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { UpdatesPopup } from "./UpdatesPopup";
import Link from 'next/link';

function openPopup(setOpen: (open: boolean) => void) {
  setOpen(true);
}

function WebGpuNavbar() {
  const [popupOpen, setPopupOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [Liquid, setLiquid] = useState<any>(null);

  useEffect(() => {
    import("@liquid-dom/react").then(setLiquid);
  }, []);

  if (!Liquid) return <Navbar />;

  const { LiquidCanvas, VStack, HStack, GlassContainer, Glass, Frame, Padding, Html } = Liquid;

  return (
    <>
      <UpdatesPopup isOpen={popupOpen} onClose={() => setPopupOpen(false)} />
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <LiquidCanvas
          className="pointer-events-auto"
          style={{ width: "auto", height: "auto" }}
          maxDpr={2}
          proposal={{ width: 600, height: 80 }}
        >
          <VStack>
            <Padding insets={{ top: 12, bottom: 12, left: 16, right: 16 }}>
              <GlassContainer
                blur={12}
                spacing={28}
                opacity={0.85}
                tint={{ r: 0.2, g: 0.22, b: 0.28, a: 0.3 }}
                shadowColor={{ r: 0, g: 0, b: 0, a: 0.3 }}
                shadowOffsetY={8}
                shadowBlur={16}
              >
                <Glass cornerRadius={28} pointerEvents>
                  <HStack spacing={8} alignment={{ horizontal: "center", vertical: "center" }}>
                    <Html sizing="intrinsic">
                      <div className="flex items-center gap-2 px-3">
                        <img src="/app.jpg" alt="cisum" width={20} height={20} className="rounded" />
                        <span
                          className="text-sm font-bold text-white/90"
                          style={{ fontStretch: "125%", fontVariationSettings: '"wdth" 125' }}
                        >
                          cisum
                        </span>
                      </div>
                    </Html>
                    <Html sizing="intrinsic">
                      <button
                        onClick={() => openPopup(setPopupOpen)}
                        className="px-3 py-1.5 text-xs font-medium text-zinc-400 rounded-full hover:bg-white/5 transition-colors"
                      >
                        Updates
                      </button>
                    </Html>
                    <Html sizing="intrinsic">
                      <Link
                        href="/docs"
                        className="px-3 py-1.5 text-xs font-medium text-zinc-400 rounded-full hover:bg-white/5 transition-colors"
                      >
                        Docs
                      </Link>
                    </Html>
                    <Html sizing="intrinsic">
                      <a
                        href="https://discord.gg/Mb4F9Gmuex"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[rgb(162,133,80)] rounded-full border border-[rgb(162,133,80)]/20 bg-[rgb(162,133,80)]/10 hover:bg-[rgb(162,133,80)]/20 transition-all"
                      >
                        💬 Discord
                      </a>
                    </Html>
                  </HStack>
                </Glass>
              </GlassContainer>
            </Padding>
          </VStack>
        </LiquidCanvas>
      </div>
    </>
  );
}

export function LiquidNavbar() {
  const [webgpu, setWebgpu] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgpu("gpu" in navigator && !!navigator.gpu);
  }, []);

  return webgpu ? <WebGpuNavbar /> : <Navbar />;
}
