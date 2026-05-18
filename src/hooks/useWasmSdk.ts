'use client';

import { useEffect, useState, useRef } from 'react';
import md5 from 'blueimp-md5';

export interface WasmTrack {
  title: string;
  artist: string;
  provider: string;
  trackId: string;
  duration: string;
  coverArt?: string;
  artistImage?: string;
  albumTitle?: string;
}

export function useWasmSdk() {
  const [initialized, setInitialized] = useState(false);
  const [searchResults, setSearchResults] = useState<WasmTrack[]>([]);
  const [activeTrack, setActiveTrack] = useState<{ 
    title: string; 
    artist: string; 
    url: string; 
    provider?: string;
    coverArt?: string;
    artistImage?: string;
    albumTitle?: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const activeProviderRef = useRef<string>('');

  useEffect(() => {
    // 1. Inject prerequisite globals required by the Swift browser-shim
    if (typeof window !== 'undefined') {
      // Bundle and set the MD5 global to optimize load time (no CDN fetching)
      if (!window.md5) {
        window.md5 = md5;
      }

      // 2. Register standard callbacks that Swift WASM calls back into JS
      window.updateSearchResults = (tracks: WasmTrack[]) => {
        // Normalize the provider casing/name for the UI if needed
        const formattedTracks = tracks.map(track => ({
          ...track,
          provider: track.provider ? track.provider.toUpperCase() : 'UNKNOWN'
        }));
        setSearchResults(formattedTracks);
        setIsSearching(false);
      };

      window.playAudio = (
        url: string, 
        title: string, 
        artist: string, 
        cover?: string, 
        artistImage?: string, 
        albumTitle?: string
      ) => {
        let finalUrl = url;
        // Redirect cross-origin or hotlink-protected audio streams through our local HTTP/seek proxy
        if (url && (
          url.includes('tidal.com') || 
          url.includes('dzcdn.net') || 
          url.includes('qobuz.com') || 
          url.includes('samidy.com') || 
          url.includes('monochrome.tf') ||
          url.startsWith('http://') || 
          url.startsWith('https://')
        )) {
          finalUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
        }
        setActiveTrack({ 
          url: finalUrl, 
          title, 
          artist, 
          provider: activeProviderRef.current,
          coverArt: cover,
          artistImage: artistImage,
          albumTitle: albumTitle
        });
      };

      // 3. Dynamically import the compiled Swift package on the client side only
      const initWasm = async () => {
        try {
          // Dynamic import of our copied glue code
          const { init } = await import('@/wasm/index.js' as any);
          
          // Initialize using the static WASM stream
          await init({
            module: fetch('/wasm/ProviderSDKWasm.wasm')
          });
          
          setInitialized(true);
          console.log("🚀 Swift WASM Engine Hooked and Booted!");
        } catch (error) {
          console.error("Failed to boot Swift WASM Engine:", error);
        }
      };

      initWasm();
    }
  }, []);

  // 4. Swift WASM Interface Methods
  const search = (query: string) => {
    if (!initialized || !window.performWasmSearch) return;
    setIsSearching(true);
    window.performWasmSearch(query);
  };

  const play = (provider: string, trackId: string) => {
    if (!initialized || !window.playWasmTrack) return;
    // Providers in Swift are lowercase e.g. "qqmusic", "kuwo"
    const normalizedProvider = provider.toLowerCase();
    activeProviderRef.current = normalizedProvider;
    window.playWasmTrack(normalizedProvider, trackId);
  };

  return {
    initialized,
    isSearching,
    searchResults,
    activeTrack,
    search,
    play,
  };
}

// Declaring global window hooks to keep TypeScript compiler happy
declare global {
  interface Window {
    md5: any;
    performWasmSearch?: (query: string) => void;
    playWasmTrack?: (provider: string, trackId: string) => void;
    updateSearchResults?: (tracks: WasmTrack[]) => void;
    playAudio?: (url: string, title: string, artist: string) => void;
  }
}
