"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useState, useRef } from "react";
import { VinylAnimation } from "@/components/VinylAnimation";
import { GridRuler } from "@/components/GridRuler";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackgroundAudioPlayer } from "@/components/BackgroundAudioPlayer";
import Link from "next/link";
import posthog from "posthog-js";

const FeaturesGrid = dynamic(() =>
  import("@/components/FeaturesGrid").then((mod) => mod.FeaturesGrid),
);
const AppLayersAnimation = dynamic(
  () =>
    import("@/components/AppLayersAnimation").then(
      (mod) => mod.AppLayersAnimation,
    ),
  { ssr: false },
);

const transition = {
  duration: 1,
  ease: [0.16, 1, 0.3, 1] as const,
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition,
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const heroText = "an experience, like no other.";

export default function Home() {
  const [hasEntered, setHasEntered] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-clip">
      <BackgroundAudioPlayer onEnter={() => setHasEntered(true)} />

      <div
        className="transition-opacity duration-1000 ease-in-out"
        style={{
          opacity: hasEntered ? 1 : 0,
          pointerEvents: hasEntered ? "auto" : "none",
        }}
      >
        <div className="fixed inset-0 z-0 pointer-events-none">
          <GridRuler />

          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-full max-w-[1400px] opacity-30 mix-blend-screen"
            style={{
              background:
                "radial-gradient(circle at center, rgba(59, 130, 246, 0.4) 0%, rgba(59, 130, 246, 0) 60%)",
            }}
          />
        </div>

        <Navbar />

        <main className="relative z-10 flex flex-col items-center pt-32 md:pt-48">
          <section className="relative flex flex-col items-center px-6 text-center">
            <motion.div
              initial="hidden"
              animate={hasEntered ? "visible" : "hidden"}
              variants={{
                hidden: { opacity: 0, scale: 0.8, filter: "blur(10px)" },
                visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
              }}
              transition={{
                duration: 1.2,
                delay: 0.4,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="relative z-10 mb-10"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full" />
                <Image
                  src="/app.jpg"
                  alt="cisum Logo"
                  width={64}
                  height={64}
                  quality={90}
                  className="relative rounded-2xl shadow-2xl border border-white/10"
                />
              </div>
            </motion.div>

            <VinylAnimation />

            <motion.h1
              initial="hidden"
              animate={hasEntered ? "visible" : "hidden"}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {},
              }}
              className="relative z-10 mb-6 max-w-4xl text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl"
              style={{
                fontStretch: "125%",
                fontVariationSettings: '"wdth" 125',
              }}
              aria-label="hero-text"
            >
              {heroText.split(" ").map((word, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                      transition: {
                        duration: 0.8,
                        ease: [0.2, 0.65, 0.3, 0.9],
                      },
                    },
                  }}
                  className="inline-block mr-4 last:mr-0 text-white"
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              initial="hidden"
              animate={hasEntered ? "visible" : "hidden"}
              variants={{
                hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)" },
              }}
              transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 mb-12 max-w-2xl text-base md:text-xl lg:text-2xl text-zinc-400 leading-relaxed px-4"
            >
              cisum is a music streaming app that caters to your needs.
              <br />a never ending library, all with no ads, no distractions.
              {/* The premium music experience, without the premium price.
              <br />
              Stream from the biggest platforms — free, ad-free, and tracker-free. */}
            </motion.p>

            <motion.div
              initial="hidden"
              animate={hasEntered ? "visible" : "hidden"}
              variants={{
                hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)" },
              }}
              transition={{ duration: 1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex flex-col items-center gap-6 sm:flex-row"
            >
              <Button
                size="lg"
                className="h-14 rounded-full bg-[rgb(162,133,80)] px-10 text-base font-medium text-[rgb(32,34,46)] transition-all hover:bg-[rgb(162,133,80)]/90 hover:scale-105 active:scale-95"
                asChild
              >
                <Link
                  // href="/downloads"
                  // href="https://testflight.apple.com/join/DA8bhKJH"
                  href={"https://discord.gg/Mb4F9Gmuex"}
                  onClick={() => posthog.capture("hero_download_clicked")}
                >
                  Join the Discord
                </Link>
              </Button>
              {/* DISABLED: Web Player coming soon - using popup instead
              <Button variant="ghost" size="lg" className="h-14 rounded-full text-base font-medium text-zinc-400 hover:text-white hover:bg-white/10 transition-all" asChild>
                <a href="/play" onClick={() => posthog.capture("web_player_opened")}>Open Web Player</a>
              </Button>
              */}
            </motion.div>
          </section>

          <FeaturesGrid />

          <AppLayersAnimation />

          <ClosingSection />
        </main>

        <Footer />
      </div>
    </div>
  );
}

function ClosingSection() {
  const [startPhysics, setStartPhysics] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      onViewportEnter={() => setStartPhysics(true)}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 1 }}
      className="relative flex min-h-[600px] w-full flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <div className="relative z-10 flex flex-col items-center">
        <Badge
          variant="outline"
          className="mb-6 border-zinc-800 bg-black/50 py-1.5 text-zinc-400 backdrop-blur-md"
        >
          Ready to start?
        </Badge>
        <h2
          ref={titleRef}
          className="mb-8 max-w-2xl text-3xl font-bold tracking-tight md:text-6xl text-white drop-shadow-2xl"
          style={{ fontStretch: "125%", fontVariationSettings: '"wdth" 125' }}
        >
          stop kneeling to large corps.
          <br />
          try cisum.
        </h2>
        <Button
          size="lg"
          className="h-14 rounded-full bg-[rgb(162,133,80)] px-10 text-base font-medium text-[rgb(32,34,46)] transition-all hover:scale-105 active:scale-95 hover:bg-[rgb(162,133,80)]/90 shadow-xl"
          asChild
        >
          <Link
            // href="/downloads"
            href={"https://discord.gg/Mb4F9Gmuex"}
            onClick={() => posthog.capture("cta_download_clicked")}
          >
            Join the Discord
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </motion.section>
  );
}
