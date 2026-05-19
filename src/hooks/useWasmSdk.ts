'use client';

import { useEffect, useState, useRef } from 'react';
import posthog from 'posthog-js';
import type { MusicTrack, ResolvedStreamPayload } from '@/lib/music/types';

export type WasmTrack = MusicTrack;

export function useWasmSdk() {
  const [initialized, setInitialized] = useState(false);
  const [searchResults, setSearchResults] = useState<WasmTrack[]>([]);
  const [activeTrack, setActiveTrack] = useState<ResolvedStreamPayload | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const searchRequestIdRef = useRef(0);
  const playRequestIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        await fetch('/api/music/health', {
          method: 'GET',
          cache: 'no-store',
        });
      } catch (error) {
        posthog.captureException(error);
        console.error('Failed to warm music gateway:', error);
      } finally {
        if (!cancelled) {
          setInitialized(true);
          posthog.capture('music_gateway_initialized');
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const search = async (query: string) => {
    if (!initialized) return;

    const requestId = ++searchRequestIdRef.current;
    setIsSearching(true);
    setSearchResults([]);

    try {
      const response = await fetch('/api/music/search', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Search request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedTracks: WasmTrack[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done || requestId !== searchRequestIdRef.current) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line) as { tracks?: WasmTrack[]; error?: string };
            if (chunk.error) {
              throw new Error(chunk.error);
            }
            if (chunk.tracks && chunk.tracks.length > 0) {
              if (requestId !== searchRequestIdRef.current) {
                return;
              }
              const formatted = chunk.tracks.map((track) => ({
                ...track,
                provider: track.provider ? track.provider.toUpperCase() : 'UNKNOWN',
              }));
              accumulatedTracks = [...accumulatedTracks, ...formatted];
              setSearchResults([...accumulatedTracks]);
            }
          } catch (e) {
            console.error('Error parsing search stream chunk:', e);
          }
        }
      }
    } catch (error) {
      if (requestId === searchRequestIdRef.current) {
        posthog.captureException(error);
        console.error('Search request failed:', error);
      }
    } finally {
      if (requestId === searchRequestIdRef.current) {
        setIsSearching(false);
      }
    }
  };

  const play = async (provider: string, trackId: string) => {
    if (!initialized) return;

    const requestId = ++playRequestIdRef.current;

    try {
      const response = await fetch('/api/music/play', {
        method: 'POST',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          trackId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Playback request failed with status ${response.status}`);
      }

      const payload = await response.json() as { playback?: ResolvedStreamPayload };
      if (requestId !== playRequestIdRef.current || !payload.playback) {
        return;
      }

      setActiveTrack({
        ...payload.playback,
        provider: payload.playback.provider.toUpperCase(),
      });
    } catch (error) {
      if (requestId === playRequestIdRef.current) {
        posthog.captureException(error);
        console.error('Playback request failed:', error);
      }
    }
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
