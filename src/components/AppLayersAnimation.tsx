"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { PhonePlayerControls } from "./PhonePlayerControls";

const SLOGANS = [
  {
    title: "Premium feel. Free to stream.",
    description: "The aesthetic you deserve, without the subscription you don't want. cisum brings premium UI/UX to everyone."
  },
  {
    title: "No ads. No tracking. Just music.",
    description: "Zero interruptions, zero data collection. Stream from the biggest platforms completely free."
  },
  {
    title: "Listen without limits.",
    description: "Catering to everyone who loves music, whether you can't afford subscriptions or just refuse to pay for them."
  }
];

export function AppLayersAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const slogan1LeftInset = useTransform(scrollYProgress, [0.3, 0.40], ["0%", "100%"]);

  const slogan2RightInset = useTransform(scrollYProgress, [0.3, 0.40], ["100%", "0%"]);
  const slogan2LeftInset = useTransform(scrollYProgress, [0.6, 0.70], ["0%", "100%"]);

  const slogan3RightInset = useTransform(scrollYProgress, [0.6, 0.70], ["100%", "0%"]);

  const eraserLeft = useTransform(
    scrollYProgress,
    [0, 0.3, 0.40, 0.50, 0.6, 0.70, 1],
    ["0%", "0%", "100%", "0%", "0%", "100%", "100%"]
  );

  const eraserOpacity = useTransform(
    scrollYProgress,
    [0.3, 0.3, 0.39, 0.40, 0.54, 0.6, 0.70, 10.0],
    [0, 1, 1, 0, 0, 1, 1, 0]
  );

  const rotateX = useTransform(scrollYProgress, [0.2, 0.7], [80, 0]);
  const rotateZ = useTransform(scrollYProgress, [0.3, 0.7], [-90, 0]);
  const scale = useTransform(scrollYProgress, [0.2, 0.7], [0.6, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.9, 1], [0, 1, 1, 0]);

  const layerGap = 120;

  const bezelZ = useTransform(scrollYProgress, [0.2, 0.7], [layerGap * 4, 0]);
  const playerZ = useTransform(scrollYProgress, [0.2, 0.7], [layerGap * 3, 0]);
  const topUIZ = useTransform(scrollYProgress, [0.2, 0.7], [layerGap * 2, 0]);
  const lowUIZ = useTransform(scrollYProgress, [0.2, 0.7], [layerGap * 1, 0]);

  const bezelOpacity = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]);
  const topUIOpacity = useTransform(scrollYProgress, [0.4, 0.5], [0, 1]);
  const playerOpacity = useTransform(scrollYProgress, [0.25, 0.45], [0, 1]);
  const lowUIOpacity = useTransform(scrollYProgress, [0.2, 0.6], [0, 1]);

  const layers = [
    { name: "Bezel", src: "/layer-0.png", z: bezelZ, opacity: bezelOpacity },
    { name: "Top UI", src: "/layer-4.png", z: topUIZ, opacity: topUIOpacity },
    { name: "Low UI", src: "/layer-2.png", z: lowUIZ, opacity: lowUIOpacity },
  ];

  return (
    <div ref={containerRef} className="h-[300vh] relative w-full bg-black/50">
      <div className="sticky top-0 h-[100dvh] flex flex-col items-center justify-start overflow-hidden pt-22 md:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1)_0%,transparent_70%)] pointer-events-none" />

        <div className="mb-2 md:mb-4 text-center z-10 px-4 min-h-[140px] md:min-h-[200px] flex flex-col items-center justify-center relative w-full max-w-5xl">
          <div className="relative w-full flex justify-center items-center h-32 md:h-56">
            <motion.div
              className="absolute inset-0 flex flex-col justify-center items-center text-center"
              style={{ clipPath: useTransform(slogan1LeftInset, v => `inset(0 0 0 ${v})`) }}
            >
              <h2 className="text-white text-2xl md:text-5xl font-bold tracking-tight px-4 py-2">
                {SLOGANS[0].title}
              </h2>
              <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto px-4">
                {SLOGANS[0].description}
              </p>
            </motion.div>

            <motion.div
              className="absolute inset-0 flex flex-col justify-center items-center text-center"
              style={{
                clipPath: useTransform(
                  [slogan2RightInset, slogan2LeftInset],
                  ([r, l]) => `inset(0 ${r} 0 ${l})`
                )
              }}
            >
              <h2 className="text-white text-xl md:text-5xl font-bold tracking-tight px-4 py-2">
                {SLOGANS[1].title}
              </h2>
              <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto px-4">
                {SLOGANS[1].description}
              </p>
            </motion.div>

            <motion.div
              className="absolute inset-0 flex flex-col justify-center items-center text-center"
              style={{ clipPath: useTransform(slogan3RightInset, v => `inset(0 ${v} 0 0)`) }}
            >
              <h2 className="text-white text-2xl md:text-5xl font-bold tracking-tight px-4 py-2">
                {SLOGANS[2].title}
              </h2>
              <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto px-4">
                {SLOGANS[2].description}
              </p>
            </motion.div>

            <motion.div
              style={{
                left: eraserLeft,
                x: "-50%",
                opacity: eraserOpacity,
              }}
              className="absolute top-1/2 -translate-y-1/2 w-8 h-40 bg-[rgb(162,133,80)] z-20 pointer-events-none shadow-[0_0_15px_rgba(162,133,80,0.4)]"
            />
          </div>
        </div>

        <div className="relative w-full max-w-6xl flex items-center justify-center [perspective:2000px]">
          <motion.div
            style={{
              rotateX,
              rotateZ,
              scale,
              transformStyle: "preserve-3d",
            }}
            className="relative w-[230px] h-[460px] md:w-[300px] md:h-[600px]"
          >
            {layers.map((layer, index) => (
              <motion.div
                key={index}
                style={{
                  translateZ: layer.z,
                  zIndex: 100 - index,
                  opacity: layer.opacity,
                  scale: index === 0 ? 1 : 0.975,
                }}
                className="absolute inset-0"
              >
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src={layer.src}
                    alt={layer.name}
                    fill
                    quality={90}
                    className="object-contain"
                    priority
                    sizes="(max-width: 768px) 260px, 300px"
                  />
                </div>
              </motion.div>
            ))}

            <motion.div
              style={{
                translateZ: playerZ,
                zIndex: 101,
                opacity: playerOpacity,
              }}
              className="absolute inset-0 pointer-events-none"
            >
              <div className="relative w-full h-full overflow-hidden">
                <PhonePlayerControls />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
