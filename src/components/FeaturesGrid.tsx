"use client";

import { motion } from "framer-motion";
import { Server, Github, Share2 } from "lucide-react";
import Image from "next/image";

import { GlobeAnimation } from "./GlobeAnimation";

export function FeaturesGrid() {
    return (
        <section className="relative z-10 w-full max-w-[1400px] px-6 mt-32">

            {/* Screenshot Background */}
            {/* <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] -z-10 select-none pointer-events-none"
            >
                <div className="relative w-full">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent via-60% to-black z-10" />
                    <Image
                        src="/screenshot2v3.png"
                        alt="App Screenshot"
                        width={1800}
                        height={1200}
                        quality={90}
                        className="w-full"
                    />
                </div>
            </motion.div> */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 relative z-10 pt-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative overflow-hidden rounded-[2.5rem] bg-zinc-900 p-6 sm:p-8 md:p-10 border border-zinc-800 min-h-[320px] md:h-[400px]"
                >
                    <div className="relative z-10 flex h-full flex-col justify-between">
                        <div>
                            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-white">
                                <Server className="h-6 w-6" />
                            </div>
                            <h2 className="text-2xl font-bold leading-tight text-white mb-4">
                                Bring your data
                            </h2>
                            <div className="text-base text-zinc-400 relative z-20">
                                Connect to your fav streaming platform.
                                <br />
                                <br />
                                
                                <ol>
                                    <li>Spotify</li>
                                    <li>Apple Music</li>
                                    <li>Tidal</li>
                                    <li>Deezer</li>
                                    <li>Qobuz</li>
                                </ol>
                            </div>
                        </div>

                        {/* <div className="mt-4 flex-1 relative flex items-center justify-center">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-px bg-gradient-to-b from-zinc-700 to-transparent z-20" />

                            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-10 w-24 rounded-lg border border-zinc-700 bg-zinc-900/80 backdrop-blur flex items-center justify-center z-30 shadow-2xl transform text-[10px]">
                                <span className="font-mono text-emerald-500 animate-pulse">ONLINE</span>
                            </div>

                            <div className="absolute -bottom-[280px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] opacity-100 pointer-events-none">
                                <GlobeAnimation />
                            </div>
                        </div> */}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 pointer-events-none z-10" />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative overflow-hidden rounded-[2.5rem] bg-zinc-950 p-6 sm:p-8 md:p-10 border border-zinc-800 hover:border-zinc-700 transition-colors min-h-[320px] md:h-[400px] flex flex-col justify-between"
                >
                    <div className="relative z-10">
                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-white">
                            <Github className="h-6 w-6" />
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Open Source</h2>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Auditable, transparent, and built by the community for the community. 100% free and open source.
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-bl from-zinc-800 to-black p-6 sm:p-8 md:p-10 border border-zinc-800 hover:border-zinc-700 transition-colors min-h-[320px] md:h-[400px] flex flex-col justify-between"
                >
                    <div className="relative z-10">
                        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-800 text-white">
                            <Share2 className="h-6 w-6" />
                        </div>
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                            Highest Quality Music.
                            <br />
                            Ad free.
                        </h2>
                        <p className="text-sm text-zinc-400 leading-relaxed">
                            Stream your music in the best quality possible, all without ads or distractions.
                        </p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
