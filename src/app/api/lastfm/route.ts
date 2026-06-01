/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import {
  completeLastFmConnectionForSignedInUser,
  disconnectLastFmConnectionForSignedInUser,
  getLastFmConnectionStatusForSignedInUser,
  startLastFmConnectionForSignedInUser,
  submitLastFmNowPlayingForSignedInUser,
  submitLastFmScrobbleForSignedInUser,
  type LastFmPlaybackPayload,
  LastFmHttpError,
  getLastFmTrackInfo,
  searchLastFmTrack,
  getSimilarLastFmTracks,
  loveLastFmTrackForSignedInUser,
  unloveLastFmTrackForSignedInUser,
  getLastFmArtistInfo,
  searchLastFmArtist,
  getLastFmArtistTopTracks,
  getLastFmArtistTopAlbums,
  getSimilarLastFmArtists,
  getLastFmAlbumInfo,
  searchLastFmAlbum,
  getLastFmUserInfo,
  getLastFmUserRecentTracks,
  getLastFmUserTopArtists,
  getLastFmUserTopTracks,
  getLastFmUserTopAlbums
} from '@/lib/lastfm/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type LastFmActionBody = {
  action?: string;
  flowId?: string;
  payload?: LastFmPlaybackPayload;
  track?: string;
  artist?: string;
};

function toErrorResponse(error: unknown) {
  if (error instanceof LastFmHttpError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  const message = error instanceof Error ? error.message : 'Last.fm request failed';
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action) {
      // Backwards compatibility for status
      const status = await getLastFmConnectionStatusForSignedInUser();
      return NextResponse.json(status);
    }

    const params: Record<string, any> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'action') {
        params[key] = value;
      }
    }

    switch (action) {
      case 'status':
        return NextResponse.json(await getLastFmConnectionStatusForSignedInUser());
      
      case 'track.getInfo':
        return NextResponse.json(await getLastFmTrackInfo(params as any));
      case 'track.search':
        return NextResponse.json(await searchLastFmTrack(params as any));
      case 'track.getSimilar':
        return NextResponse.json(await getSimilarLastFmTracks(params as any));
        
      case 'artist.getInfo':
        return NextResponse.json(await getLastFmArtistInfo(params as any));
      case 'artist.search':
        return NextResponse.json(await searchLastFmArtist(params as any));
      case 'artist.getTopTracks':
        return NextResponse.json(await getLastFmArtistTopTracks(params as any));
      case 'artist.getTopAlbums':
        return NextResponse.json(await getLastFmArtistTopAlbums(params as any));
      case 'artist.getSimilar':
        return NextResponse.json(await getSimilarLastFmArtists(params as any));
        
      case 'album.getInfo':
        return NextResponse.json(await getLastFmAlbumInfo(params as any));
      case 'album.search':
        return NextResponse.json(await searchLastFmAlbum(params as any));
        
      case 'user.getInfo':
        return NextResponse.json(await getLastFmUserInfo(params as any));
      case 'user.getRecentTracks':
        return NextResponse.json(await getLastFmUserRecentTracks(params as any));
      case 'user.getTopArtists':
        return NextResponse.json(await getLastFmUserTopArtists(params as any));
      case 'user.getTopTracks':
        return NextResponse.json(await getLastFmUserTopTracks(params as any));
      case 'user.getTopAlbums':
        return NextResponse.json(await getLastFmUserTopAlbums(params as any));

      default:
        return NextResponse.json({ error: 'Unsupported GET action' }, { status: 400 });
    }
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as LastFmActionBody;

    switch (body.action) {
      case 'status': {
        const status = await getLastFmConnectionStatusForSignedInUser();
        return NextResponse.json(status);
      }
      case 'start': {
        const result = await startLastFmConnectionForSignedInUser();
        return NextResponse.json(result);
      }
      case 'complete': {
        if (!body.flowId) {
          return NextResponse.json({ error: 'Missing flowId' }, { status: 400 });
        }

        const result = await completeLastFmConnectionForSignedInUser(body.flowId);
        return NextResponse.json(result);
      }
      case 'disconnect': {
        const result = await disconnectLastFmConnectionForSignedInUser();
        return NextResponse.json(result);
      }
      case 'nowPlaying': {
        if (!body.payload) {
          return NextResponse.json({ error: 'Missing payload' }, { status: 400 });
        }

        const result = await submitLastFmNowPlayingForSignedInUser(body.payload);
        return NextResponse.json(result);
      }
      case 'scrobble': {
        if (!body.payload) {
          return NextResponse.json({ error: 'Missing payload' }, { status: 400 });
        }

        const result = await submitLastFmScrobbleForSignedInUser(body.payload);
        return NextResponse.json(result);
      }
      case 'track.love': {
        if (!body.track || !body.artist) {
          return NextResponse.json({ error: 'Missing track or artist' }, { status: 400 });
        }
        const result = await loveLastFmTrackForSignedInUser(body.track, body.artist);
        return NextResponse.json(result);
      }
      case 'track.unlove': {
        if (!body.track || !body.artist) {
          return NextResponse.json({ error: 'Missing track or artist' }, { status: 400 });
        }
        const result = await unloveLastFmTrackForSignedInUser(body.track, body.artist);
        return NextResponse.json(result);
      }
      default:
        return NextResponse.json({ error: 'Unsupported Last.fm action' }, { status: 400 });
    }
  } catch (error) {
    return toErrorResponse(error);
  }
}
