export interface MusicTrack {
  title: string;
  artist: string;
  provider: string;
  trackId: string;
  duration: string;
  coverArt?: string;
  artistImage?: string;
  albumTitle?: string;
}

export interface ResolvedStreamPayload {
  url: string;
  title: string;
  artist: string;
  provider: string;
  trackId: string;
  coverArt?: string;
  artistImage?: string;
  albumTitle?: string;
}