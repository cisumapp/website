'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Music, Compass, Radio, Library, Disc, Calendar,
  TrendingUp, User, ChevronRight, ChevronLeft, Info, Headphones, 
  Sparkles, ListMusic, Star, Flame, ArrowDown, MoreHorizontal, ArrowLeft, ArrowRight, Play
} from 'lucide-react';
import { useWasmSdk, WasmTrack } from '@/hooks/useWasmSdk';
import { 
  SidebarItem, SongRow, 
  ArtistHero, FloatingPlayer, VinylArtwork 
} from '@/components/glass';
import { NavPill } from '@/components/glass/NavPill';
import posthog from "posthog-js";

export default function MusicPlayerPage() {
  const [query, setQuery] = useState('Linkin Park');
  const [activeTab, setActiveTab] = useState('Overview');
  const [activeNav, setActiveNav] = useState('Home');
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null);
  
  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isFavoritedArtist, setIsFavoritedArtist] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Integrate the compiled Swift WASM SDK
  const { 
    initialized, 
    isSearching, 
    searchResults, 
    activeTrack, 
    search, 
    play 
  } = useWasmSdk();

  // Search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      search(query.trim());
      posthog.capture("music_searched", { query: query.trim() });
    }
  };

  // Trigger search on sidebar recommendation click
  const triggerQuickSearch = (artistName: string) => {
    setQuery(artistName);
    search(artistName);
  };

  // Play track via WASM resolver
  const handlePlayTrack = (track: WasmTrack) => {
    play(track.provider, track.trackId);
    posthog.capture("track_played", { title: track.title, artist: track.artist, provider: track.provider, track_id: track.trackId });
  };

  // Handle Play/Pause toggling
  const handlePlayPause = () => {
    if (!audioRef.current || !activeTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio playback error:", err);
      });
    }
  };

  // Handle Audio Progress
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const duration = audioRef.current.duration;
    if (duration > 0) {
      setProgress((current / duration) * 100);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  // Handle scrub/timeline seeks
  const handleProgressChange = (newProgress: number) => {
    if (!audioRef.current) return;
    const duration = audioRef.current.duration;
    if (duration > 0) {
      const newTime = (newProgress / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(newProgress);
    }
  };

  // Handle volume updates
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Sync state when activeTrack resolves from WASM
  useEffect(() => {
    if (activeTrack && audioRef.current) {
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("AutoPlay failed:", err);
      });
    }
  }, [activeTrack]);

  // Initial load search to have rich content
  useEffect(() => {
    if (initialized) {
      search('Linkin Park');
    }
  }, [initialized]);

  const activeHeroName = query.trim() ? query : "Linkin Park";

  // Dynamic artist banner and album cover resolutions straight from Swift WASM SDK
  const latestAlbumTrack = searchResults.find(t => t.coverArt && t.albumTitle) || 
                           (searchResults.length > 0 ? searchResults[0] : null);

  const latestAlbumTitle = latestAlbumTrack?.albumTitle || "From Zero (Deluxe Edition)";
  const latestAlbumCover = latestAlbumTrack?.coverArt || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=180&auto=format&fit=crop";
  const latestArtistImage = searchResults.find(t => t.artistImage)?.artistImage || undefined;

  // Pre-compiled list of featured standard tracks when no search results exist
  const sampleTracks: WasmTrack[] = [
    { title: "In the End", artist: "Linkin Park", provider: "QQMUSIC", trackId: "in_the_end", duration: "5:12" },
    { title: "Numb", artist: "Linkin Park", provider: "QOBUZ", trackId: "numb", duration: "3:08" },
    { title: "BURN IT DOWN", artist: "Linkin Park", provider: "TIDAL", trackId: "burn_it_down", duration: "3:50" },
    { title: "Castle of Glass", artist: "Linkin Park", provider: "KUWO", trackId: "castle_of_glass", duration: "3:25" },
  ];

  // Custom Playlists matching your screenshot with colored square thumbnail icons
  const playlistItems = [
    { id: 'all', title: "All Playlists", icon: <ListMusic className="w-3.5 h-3.5 text-white" />, color: 'bg-zinc-800' },
    { id: 'fav', title: "Favorite Songs", icon: <Star className="w-3.5 h-3.5 fill-white stroke-none" />, color: 'bg-[#ff3b30]' },
    { id: 'chill', title: "Chill Songs", icon: <Music className="w-3.5 h-3.5 text-white" />, color: 'bg-[#ff9500]' },
    { id: 'intl', title: "Fav International S...", icon: <Disc className="w-3.5 h-3.5 text-white" />, color: 'bg-[#8e8e93]' },
    { id: 'lp', title: "Fav Linkin Park", icon: <User className="w-3.5 h-3.5 text-white" />, color: 'bg-[#ff2d55]' },
    { id: 'metal', title: "Fav Metal & Rock", icon: <Flame className="w-3.5 h-3.5 text-white" />, color: 'bg-[#ff453a]' },
    { id: 'pop', title: "Fav Pop", icon: <Radio className="w-3.5 h-3.5 text-white" />, color: 'bg-[#5856d6]' }
  ];

  return (
    <div className="w-screen h-screen overflow-hidden flex bg-[#161616] relative select-none font-sans">
      
      {/* 1. ATMOSPHERIC DEEPLY BLURRED COVER BACKDROP */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-cover bg-center filter blur-[70px] opacity-40 scale-102" 
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200')` 
        }} 
      />
      <div className="absolute inset-0 bg-[#060606]/85 z-0 pointer-events-none" />

      {/* Hidden audio player */}
      {activeTrack && (
        <audio 
          ref={audioRef} 
          src={activeTrack.url}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleAudioEnded}
          preload="auto"
        />
      )}

      {/* LEFT SIDEBAR: Frosted edge layout (Expanded Full Height) */}
      <div className="w-64 border-r border-white/[0.05] bg-black/45 backdrop-blur-3xl flex flex-col justify-between p-5 flex-shrink-0 z-20 relative">
        <div className="flex flex-col gap-5 overflow-hidden">
          
          {/* Top Title + Avatar Header (Clean & WITHOUT simulated macOS Traffic Lights) */}
          <div className="flex items-center gap-2 select-none px-2 pt-1 mb-2 justify-between">
            <span className="text-[11px] font-black uppercase text-zinc-400 tracking-[0.2em]">
              Cisum
            </span>
            <div className="flex items-center gap-2.5 text-zinc-500">
              <div className="w-5.5 h-5.5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-[10px] text-blue-400 font-bold select-none cursor-pointer">
                A
              </div>
              <button className="hover:text-white transition cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Search inside sidebar */}
          <div className="px-1 mt-1">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <input
                type="text"
                placeholder="Search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] focus:border-blue-500/35 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition duration-300 shadow-inner font-medium"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-blue-400 transition" />
            </form>
          </div>

          {/* Section 1: Navigation */}
          <div className="flex flex-col gap-1 px-1">
            <SidebarItem 
              icon={<Search className="w-4 h-4" />} 
              label="Search" 
              active={activeNav === 'Search'} 
              onClick={() => setActiveNav('Search')} 
            />
            <SidebarItem 
              icon={<Compass className="w-4 h-4" />} 
              label="Home" 
              active={activeNav === 'Home'} 
              onClick={() => setActiveNav('Home')} 
            />
            <SidebarItem 
              icon={<Sparkles className="w-4 h-4" />} 
              label="New" 
              active={activeNav === 'New'} 
              onClick={() => setActiveNav('New')} 
            />
            <SidebarItem 
              icon={<Radio className="w-4 h-4" />} 
              label="Radio" 
              active={activeNav === 'Radio'} 
              onClick={() => setActiveNav('Radio')} 
            />
          </div>

          {/* Section 2: Library */}
          <div className="flex flex-col gap-1 px-1">
            <div className="flex items-center justify-between pl-3 mb-1 mt-2">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.12em] select-none">
                Library
              </span>
              <span className="text-[9px] font-bold text-zinc-500 hover:text-white cursor-pointer select-none uppercase tracking-wider flex items-center gap-1 transition">
                Edit <ChevronRight className="w-2.5 h-2.5 rotate-90" />
              </span>
            </div>
            <SidebarItem 
              icon={<Library className="w-4 h-4" />} 
              label="Pins" 
              active={activeNav === 'Pins'} 
              onClick={() => setActiveNav('Pins')} 
            />
            <SidebarItem 
              icon={<Disc className="w-4 h-4" />} 
              label="Recently Added" 
              active={activeNav === 'Recent'} 
              onClick={() => setActiveNav('Recent')} 
            />
            <SidebarItem 
              icon={<Music className="w-4 h-4" />} 
              label="Songs" 
              active={activeNav === 'Songs'} 
              onClick={() => setActiveNav('Songs')} 
            />
            <SidebarItem 
              icon={<User className="w-4 h-4" />} 
              label="Artists" 
              active={activeNav === 'Artists'} 
              onClick={() => setActiveNav('Artists')} 
            />
            <SidebarItem 
              icon={<Library className="w-4 h-4" />} 
              label="Albums" 
              active={activeNav === 'Albums'} 
              onClick={() => setActiveNav('Albums')} 
            />
          </div>

          {/* Section 3: Playlists (Colored Square Icons) */}
          <div className="flex flex-col gap-1 px-1 flex-grow overflow-hidden">
            <div className="flex items-center justify-between pl-3 mb-1 mt-2">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.12em] select-none">
                Playlists
              </span>
              <span className="text-[9px] font-bold text-zinc-500 hover:text-white cursor-pointer select-none uppercase tracking-wider flex items-center gap-1 transition">
                Edit <ChevronRight className="w-2.5 h-2.5 rotate-90" />
              </span>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto pr-1">
              {playlistItems.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => {
                    setActivePlaylist(pl.id);
                    const searchTerm = pl.id === 'lp' ? 'Linkin Park' : 'Frank Ocean';
                    triggerQuickSearch(searchTerm);
                    posthog.capture("playlist_selected", { playlist_id: pl.id, playlist_title: pl.title });
                  }}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition duration-200 cursor-pointer text-left w-full ${
                    activePlaylist === pl.id ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 shadow-md ${pl.color}`}>
                    {pl.icon}
                  </div>
                  <span className="text-xs font-medium truncate">{pl.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Swift WASM Status */}
        <div className="px-3 py-2 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex items-center justify-between select-none mt-3">
          <span className="text-[9px] font-semibold text-zinc-500">
            Swift WASM Engine
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${initialized ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)] animate-pulse' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'}`} />
            <span className="text-[9px] font-bold text-zinc-300">
              Active
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT WORKSTATION PANEL: Full Viewport Width/Height Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-[#161616]/90 backdrop-blur-2xl z-20">
        
        {/* 2. Curved vinyl disc background peaking from the top-center (Concentric ridged design) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[84%] w-[1000px] h-[1000px] rounded-full border-[1.5px] border-white/[0.04] pointer-events-none z-0 bg-[#0d0d0d]/40 flex items-center justify-center shadow-[inset_0_0_40px_rgba(255,255,255,0.02)]">
          {/* Inner concentric grooves peaking exactly behind the player */}
          <div className="w-[940px] h-[940px] rounded-full border border-white/[0.03] flex items-center justify-center">
            <div className="w-[880px] h-[880px] rounded-full border border-white/[0.035] flex items-center justify-center">
              <div className="w-[820px] h-[820px] rounded-full border border-white/[0.03] flex items-center justify-center">
                <div className="w-[760px] h-[760px] rounded-full border border-white/[0.025] flex items-center justify-center">
                  <div className="w-[700px] h-[700px] rounded-full border border-white/[0.02] flex items-center justify-center">
                    <div className="w-[640px] h-[640px] rounded-full border border-white/[0.015] flex items-center justify-center">
                      <div className="w-[580px] h-[580px] rounded-full border border-white/[0.01] flex items-center justify-center">
                        <div className="w-[520px] h-[520px] rounded-full border border-white/[0.008] bg-black/5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FLOATING PLAYBACK CAPSULE: Center Top Bar */}
        <div className="w-full flex justify-center px-4 pt-4 md:pt-6 z-40 relative pointer-events-none">
          <FloatingPlayer
            activeTrack={activeTrack}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            progress={progress}
            onProgressChange={handleProgressChange}
            volume={volume}
            onVolumeChange={handleVolumeChange}
          />
        </div>

        {/* Scrolling Workspace Body */}
        <div className="flex-grow flex flex-col p-6 md:p-8 overflow-y-auto bg-transparent relative z-30">
          
          {/* Top Navigation chevrons & Segmented tabs Row */}
          <div className="flex items-center gap-5 mb-6 z-30 select-none">
            
            {/* Back / Forward circular buttons */}
            <div className="flex items-center bg-white/[0.04] border border-white/[0.06] rounded-full p-1.5 gap-1 shadow-lg backdrop-blur-xl">
              <button className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition duration-200 cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="w-[1px] h-3.5 bg-white/10" />
              <button className="w-6 h-6 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition duration-200 cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Segmented Icon Control Tab bar */}
            <NavPill
              tabs={['Overview', 'Trending', 'Discover', 'Bio', 'Search']}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>

          {/* Widescreen Hero banner */}
          <div className="mb-8">
            <ArtistHero
              name={activeHeroName}
              imageUrl={latestArtistImage}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onPlayAll={() => {
                const track = searchResults.length > 0 ? searchResults[0] : sampleTracks[0];
                handlePlayTrack(track);
                posthog.capture("play_all_clicked", { artist: activeHeroName });
              }}
              onShuffle={() => {
                const trackList = searchResults.length > 0 ? searchResults : sampleTracks;
                const randomIndex = Math.floor(Math.random() * trackList.length);
                handlePlayTrack(trackList[randomIndex]);
                posthog.capture("shuffle_clicked", { artist: activeHeroName, track_count: trackList.length });
              }}
              isFavorited={isFavoritedArtist}
              onToggleFavorite={() => {
                const newState = !isFavoritedArtist;
                setIsFavoritedArtist(newState);
                posthog.capture("artist_favorited", { artist: activeHeroName, favorited: newState });
              }}
              searchQuery={query}
              onSearchChange={setQuery}
              onSearchSubmit={handleSearchSubmit}
            />
          </div>

          {/* Bottom Split Layout: Top Songs & Latest Release */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 flex-grow">
            
            {/* Left Column (3/5): Top Songs List */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              <div className="flex items-center gap-1.5 px-2 mb-1 select-none text-white font-extrabold text-sm hover:text-zinc-200 cursor-pointer transition">
                Top Songs
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </div>

              <div className="flex flex-col gap-1">
                {isSearching ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.01] animate-pulse">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 bg-zinc-800 rounded-lg" />
                        <div className="flex-1 flex flex-col gap-1.5">
                          <div className="w-32 h-3 bg-zinc-800 rounded" />
                          <div className="w-20 h-2 bg-zinc-800 rounded" />
                        </div>
                      </div>
                      <div className="w-8 h-3 bg-zinc-800 rounded" />
                    </div>
                  ))
                ) : searchResults.length === 0 ? (
                  sampleTracks.map((track, i) => (
                    <SongRow
                      key={track.trackId}
                      track={track}
                      index={i}
                      isActive={activeTrack?.title === track.title}
                      isPlaying={isPlaying}
                      onPlay={() => handlePlayTrack(track)}
                    />
                  ))
                ) : (
                  searchResults.map((track, i) => (
                    <SongRow
                      key={track.trackId}
                      track={track}
                      index={i}
                      isActive={activeTrack?.title === track.title}
                      isPlaying={isPlaying}
                      onPlay={() => handlePlayTrack(track)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right Column (2/5): Latest Release */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.15em] pl-2 mb-1 select-none">
                Latest Release
              </span>

              <div className="flex items-center gap-4 p-4 rounded-3xl border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.03] transition-all duration-300 relative group cursor-pointer"
                onClick={() => {
                  const trackList = searchResults.length > 0 ? searchResults : sampleTracks;
                  handlePlayTrack(trackList[0]);
                  posthog.capture("latest_release_played", { album_title: latestAlbumTitle, artist: activeHeroName });
                }}
              >
                {/* Left Side: Large Square Album cover */}
                <div 
                  className="w-[120px] h-[120px] rounded-2xl bg-cover bg-center border border-white/10 shadow-md relative overflow-hidden flex-shrink-0 flex items-center justify-center group-hover:scale-102 transition duration-300" 
                  style={{ backgroundImage: `url('${latestAlbumCover}')` }}
                >
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <Play className="w-7 h-7 text-white fill-white stroke-none" />
                  </div>
                </div>
                
                {/* Right Side: Album info details */}
                <div className="min-w-0 flex flex-col gap-1.5 justify-center">
                  <span className="text-[9px] font-bold text-zinc-500">
                    Nov 4, 2024
                  </span>
                  <h4 className="text-xs font-bold text-zinc-100 truncate group-hover:text-white">
                    {latestAlbumTitle}
                  </h4>
                  <p className="text-[10px] text-zinc-500 truncate font-semibold">
                    {searchResults.length > 0 ? `${searchResults.length} Songs` : '14 Songs'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* CONFINED INTEGRATED FOOTER */}
          <div className="w-full flex items-center justify-between border-t border-white/[0.03] pt-6 mt-8 text-[9px] text-zinc-600 font-medium">
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5" />
              <span>Immersive Edge-to-Edge Spatial Canvas powered by Next.js & Framer Motion</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5" />
              <span>Cisum Web Player Ecosystem v3.0.0</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}