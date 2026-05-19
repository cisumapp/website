import { NextRequest, NextResponse } from 'next/server';
import { searchTracksStream } from '@/lib/music/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function readQuery(request: NextRequest) {
  if (request.method === 'GET') {
    return request.nextUrl.searchParams.get('query')?.trim() ?? '';
  }

  const body = await request.json().catch(() => ({}));
  return typeof body.query === 'string' ? body.query.trim() : '';
}

async function handleSearch(request: NextRequest) {
  try {
    const query = await readQuery(request);

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing query' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          await searchTracksStream(query, (tracks) => {
            const chunk = JSON.stringify({ tracks }) + '\n';
            controller.enqueue(encoder.encode(chunk));
          });
          controller.close();
        } catch (error) {
          console.error('Search streaming failed:', error);
          const errChunk = JSON.stringify({ error: 'Search failed' }) + '\n';
          controller.enqueue(encoder.encode(errChunk));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Music search route failed:', error);
    return new Response(JSON.stringify({ error: 'Search failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(request: NextRequest) {
  return handleSearch(request);
}

export async function POST(request: NextRequest) {
  return handleSearch(request);
}