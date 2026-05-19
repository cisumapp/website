import { NextRequest, NextResponse } from 'next/server';
import { getStreamUrl } from '@/lib/music/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;
  const streamUrl = getStreamUrl(token);

  if (!streamUrl) {
    return NextResponse.json({ error: 'Stream token expired or missing' }, { status: 404 });
  }

  try {
    const headers = new Headers({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: '*/*',
    });

    const rangeHeader = request.headers.get('range');
    if (rangeHeader) {
      headers.set('Range', rangeHeader);
    }

    const upstreamResponse = await fetch(streamUrl, {
      headers,
      method: 'GET',
    });

    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', upstreamResponse.headers.get('Content-Type') || 'audio/mpeg');
    responseHeaders.set('Cache-Control', 'no-store');
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Range');
    responseHeaders.set('Accept-Ranges', upstreamResponse.headers.get('Accept-Ranges') || 'bytes');

    const contentRange = upstreamResponse.headers.get('Content-Range');
    const contentLength = upstreamResponse.headers.get('Content-Length');

    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Music stream relay failed:', error);
    return NextResponse.json({ error: 'Stream relay failed' }, { status: 500 });
  }
}