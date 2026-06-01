import { NextRequest, NextResponse } from 'next/server';
import { Innertube, Platform } from 'youtubei.js';
import vm from 'vm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

Platform.shim.eval = async (data, env) => {
  const code = '(function() { ' + data.output + ' })()';
  const sandbox = {};
  const context = vm.createContext(sandbox);
  return new vm.Script(code).runInContext(context);
};

let ytSession: Innertube | null = null;
let sessionPromise: Promise<void> | null = null;
let cachedUrl: string | null = null;
let cachedUrlExpiresAt = 0;

async function getSession() {
  if (!sessionPromise) {
    sessionPromise = Innertube.create({
      lang: 'en',
      location: 'US',
      generate_session_locally: true,
    }).then((yt) => {
      ytSession = yt;
    });
  }
  return sessionPromise;
}

getSession();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return new NextResponse('Missing videoId parameter', { status: 400 });
  }

  const rangeHeader = req.headers.get('range');

  try {
    await getSession();
    if (!ytSession) throw new Error('Failed to initialize YouTube session');

    const getFormatUrl = async () => {
      const format = await ytSession!.getStreamingData(videoId, {
        type: 'audio',
        quality: 'best',
        client: 'IOS'
      });
      if (!format || !format.url) throw new Error('No audio format available');
      return format.url;
    };

    let url: string;

    if (cachedUrl && cachedUrlExpiresAt > Date.now()) {
      url = cachedUrl;
    } else {
      url = await getFormatUrl();
      cachedUrl = url;
      const expires = new URL(url).searchParams.get('expire');
      cachedUrlExpiresAt = expires ? parseInt(expires) * 1000 : Date.now() + 3600000;
    }

    return NextResponse.redirect(url, {
      status: 302,
      headers: {
        'Cache-Control': 'no-cache',
      }
    });
  } catch (error) {
    cachedUrl = null;
    console.error('YT audio proxy error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Failed to stream audio', detail: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Range',
    },
  });
}
