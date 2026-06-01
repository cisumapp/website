import { randomUUID } from 'node:crypto';
import { defaultNodeSetup } from '@/wasm/platforms/node.js';
import { instantiate } from '@/wasm/instantiate.js';
import type { MusicTrack, ResolvedStreamPayload } from './types';

const RUNTIME_READY_TIMEOUT_MS = 30_000;
const CALLBACK_TIMEOUT_MS = 60_000;
const STREAM_TTL_MS = 10 * 60 * 1000;

type StreamEntry = {
  url: string;
  expiresAt: number;
};

type PendingSearch = {
  resolve: (tracks: MusicTrack[]) => void;
  reject: (error: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
};

type PendingPlay = {
  resolve: (payload: ResolvedStreamPayload) => void;
  reject: (error: unknown) => void;
  provider: string;
  trackId: string;
  timer: ReturnType<typeof setTimeout>;
};

type GlobalState = {
  performWasmSearch?: (query: string) => void;
  playWasmTrack?: (provider: string, trackId: string) => void;
  updateSearchResults?: (tracks: unknown) => void;
  onPartialSearchResults?: (tracks: unknown) => void;
  playAudio?: (
    url: string,
    title: string,
    artist: string,
    cover?: string,
    artistImage?: string,
    albumTitle?: string,
  ) => void;
};

type PendingStreamSearch = {
  timer: ReturnType<typeof setTimeout>;
  onPartial: (tracks: MusicTrack[]) => void;
  onComplete: () => void;
  onError: (error: unknown) => void;
};

let runtimePromise: Promise<void> | null = null;
let requestQueue: Promise<void> = Promise.resolve();
let pendingSearch: PendingSearch | null = null;
let pendingStreamSearch: PendingStreamSearch | null = null;
let pendingPlay: PendingPlay | null = null;
const streamStore = new Map<string, StreamEntry>();

function getGlobalState(): GlobalState {
  return globalThis as unknown as GlobalState;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTrack(track: any): MusicTrack {
  return {
    title: typeof track?.title === 'string' ? track.title : '',
    artist: typeof track?.artist === 'string' ? track.artist : '',
    provider: typeof track?.provider === 'string' ? track.provider : 'UNKNOWN',
    trackId: typeof track?.trackId === 'string' ? track.trackId : '',
    duration: typeof track?.duration === 'string' ? track.duration : '',
    coverArt: typeof track?.coverArt === 'string' && track.coverArt.length > 0 ? track.coverArt : undefined,
    artistImage: typeof track?.artistImage === 'string' && track.artistImage.length > 0 ? track.artistImage : undefined,
    albumTitle: typeof track?.albumTitle === 'string' && track.albumTitle.length > 0 ? track.albumTitle : undefined,
  };
}

function normalizeTracks(tracks: unknown): MusicTrack[] {
  if (!Array.isArray(tracks)) {
    return [];
  }

  return tracks.map((track) => normalizeTrack(track));
}

function cleanupExpiredStreams() {
  const now = Date.now();

  for (const [token, entry] of streamStore.entries()) {
    if (entry.expiresAt <= now) {
      streamStore.delete(token);
    }
  }
}

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const next = requestQueue.then(task, task);
  requestQueue = next.then(() => undefined, () => undefined);
  return next;
}

function waitForGlobalFunction(name: keyof GlobalState, timeoutMs = RUNTIME_READY_TIMEOUT_MS) {
  return new Promise<void>((resolve, reject) => {
    const start = Date.now();

    const poll = () => {
      if (typeof getGlobalState()[name] === 'function') {
        resolve();
        return;
      }

      if (Date.now() - start >= timeoutMs) {
        reject(new Error(`Timed out waiting for ${String(name)} to initialize`));
        return;
      }

      setTimeout(poll, 25);
    };

    poll();
  });
}

function installCallbacks() {
  const globalState = getGlobalState();

  globalState.updateSearchResults = (tracks: unknown) => {
    if (pendingSearch) {
      const current = pendingSearch;
      pendingSearch = null;
      clearTimeout(current.timer);
      current.resolve(normalizeTracks(tracks));
    }

    if (pendingStreamSearch) {
      const current = pendingStreamSearch;
      pendingStreamSearch = null;
      clearTimeout(current.timer);
      current.onComplete();
    }
  };

  globalState.onPartialSearchResults = (tracks: unknown) => {
    if (pendingStreamSearch) {
      pendingStreamSearch.onPartial(normalizeTracks(tracks));
    }
  };

  globalState.playAudio = (
    url: string,
    title: string,
    artist: string,
    cover?: string,
    artistImage?: string,
    albumTitle?: string,
  ) => {
    if (!pendingPlay) {
      return;
    }

    const current = pendingPlay;
    pendingPlay = null;
    clearTimeout(current.timer);

    const token = randomUUID();
    streamStore.set(token, {
      url,
      expiresAt: Date.now() + STREAM_TTL_MS,
    });
    cleanupExpiredStreams();

    current.resolve({
      url: `/api/music/stream/${token}`,
      title,
      artist,
      provider: current.provider,
      trackId: current.trackId,
      coverArt: cover && cover.length > 0 ? cover : undefined,
      artistImage: artistImage && artistImage.length > 0 ? artistImage : undefined,
      albumTitle: albumTitle && albumTitle.length > 0 ? albumTitle : undefined,
    });
  };
}

async function ensureRuntime() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      installCallbacks();
      const setup = await defaultNodeSetup({
        onExit: (code: number) => {
          throw new Error(`ProviderSDK WASM exited with code ${code}`);
        },
      });

      await instantiate(setup);
      await waitForGlobalFunction('performWasmSearch');
      await waitForGlobalFunction('playWasmTrack');
    })().catch((error) => {
      runtimePromise = null;
      throw error;
    });
  }

  await runtimePromise;
}

export function getStreamUrl(token: string): string | null {
  cleanupExpiredStreams();
  return streamStore.get(token)?.url ?? null;
}

export async function warmRuntime() {
  await ensureRuntime();
}

export async function searchTracks(query: string): Promise<MusicTrack[]> {
  return enqueue(async () => {
    await ensureRuntime();

    return await new Promise<MusicTrack[]>((resolve, reject) => {
      let settled = false;
      // eslint-disable-next-line prefer-const
      let pending!: PendingSearch;

      const finalize = (callback: () => void) => {
        if (settled) {
          return;
        }

        settled = true;
        if (pendingSearch === pending) {
          pendingSearch = null;
        }

        clearTimeout(pending.timer);
        callback();
      };

      const timer = setTimeout(() => {
        finalize(() => reject(new Error(`Search timed out after ${CALLBACK_TIMEOUT_MS}ms`)));
      }, CALLBACK_TIMEOUT_MS);

      pending = {
        timer,
        resolve: (tracks) => finalize(() => resolve(tracks)),
        reject: (error) => finalize(() => reject(error)),
      };
      pendingSearch = pending;

      try {
        const globalState = getGlobalState();
        if (typeof globalState.performWasmSearch !== 'function') {
          throw new Error('performWasmSearch is not available');
        }

        globalState.performWasmSearch(query);
      } catch (error) {
        pendingSearch = null;
        clearTimeout(timer);
        reject(error);
      }
    });
  });
}

export async function searchTracksStream(
  query: string,
  onPartial: (tracks: MusicTrack[]) => void
): Promise<void> {
  return enqueue(async () => {
    await ensureRuntime();

    return await new Promise<void>((resolve, reject) => {
      let settled = false;

      const finalize = (callback: () => void) => {
        if (settled) {
          return;
        }

        settled = true;
        pendingStreamSearch = null;
        callback();
      };

      const timer = setTimeout(() => {
        finalize(() => reject(new Error(`Search timed out after ${CALLBACK_TIMEOUT_MS}ms`)));
      }, CALLBACK_TIMEOUT_MS);

      pendingStreamSearch = {
        timer,
        onPartial,
        onComplete: () => finalize(() => resolve()),
        onError: (error) => finalize(() => reject(error)),
      };

      try {
        const globalState = getGlobalState();
        if (typeof globalState.performWasmSearch !== 'function') {
          throw new Error('performWasmSearch is not available');
        }

        globalState.performWasmSearch(query);
      } catch (error) {
        pendingStreamSearch = null;
        clearTimeout(timer);
        reject(error);
      }
    });
  });
}

export async function resolveStream(provider: string, trackId: string): Promise<ResolvedStreamPayload> {
  return enqueue(async () => {
    await ensureRuntime();

    return await new Promise<ResolvedStreamPayload>((resolve, reject) => {
      let settled = false;
      // eslint-disable-next-line prefer-const
      let pending!: PendingPlay;
      const normalizedProvider = provider.toLowerCase();

      const finalize = (callback: () => void) => {
        if (settled) {
          return;
        }

        settled = true;
        if (pendingPlay === pending) {
          pendingPlay = null;
        }

        clearTimeout(pending.timer);
        callback();
      };

      const timer = setTimeout(() => {
        finalize(() => reject(new Error(`Stream resolution timed out after ${CALLBACK_TIMEOUT_MS}ms`)));
      }, CALLBACK_TIMEOUT_MS);

      pending = {
        timer,
        provider: normalizedProvider,
        trackId,
        resolve: (payload) => finalize(() => resolve(payload)),
        reject: (error) => finalize(() => reject(error)),
      };
      pendingPlay = pending;

      try {
        const globalState = getGlobalState();
        if (typeof globalState.playWasmTrack !== 'function') {
          throw new Error('playWasmTrack is not available');
        }

        globalState.playWasmTrack(normalizedProvider, trackId);
      } catch (error) {
        pendingPlay = null;
        clearTimeout(timer);
        reject(error);
      }
    });
  });
}