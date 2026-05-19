import { NextRequest, NextResponse } from 'next/server';
import { resolveStream } from '@/lib/music/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const provider = typeof body.provider === 'string' ? body.provider.trim() : '';
    const trackId = typeof body.trackId === 'string' ? body.trackId.trim() : '';

    if (!provider || !trackId) {
      return NextResponse.json({ error: 'Missing provider or trackId' }, { status: 400 });
    }

    const playback = await resolveStream(provider, trackId);
    return NextResponse.json({ playback });
  } catch (error) {
    console.error('Music play relay failed:', error);
    return NextResponse.json({ error: 'Playback resolution failed' }, { status: 500 });
  }
}