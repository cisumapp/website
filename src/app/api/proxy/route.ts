import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    // Forward headers from incoming request that might be useful
    const rangeHeader = req.headers.get('range');
    const headers = new Headers({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
    });

    if (rangeHeader) {
      headers.set('Range', rangeHeader);
    }

    const response = await fetch(targetUrl, {
      headers,
      method: 'GET',
    });

    // Create streaming response
    const headersToReturn = new Headers();
    headersToReturn.set('Content-Type', response.headers.get('Content-Type') || 'audio/mpeg');
    headersToReturn.set('Cache-Control', 'no-cache');
    
    // Forward CORS & range headers to the browser
    headersToReturn.set('Access-Control-Allow-Origin', '*');
    headersToReturn.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headersToReturn.set('Access-Control-Allow-Headers', 'Range');
    
    const contentRange = response.headers.get('Content-Range');
    const contentLength = response.headers.get('Content-Length');
    
    if (contentRange) {
      headersToReturn.set('Content-Range', contentRange);
    }
    if (contentLength) {
      headersToReturn.set('Content-Length', contentLength);
    }

    // Set HTTP status (e.g., 206 for partial content / ranges)
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: headersToReturn,
    });
  } catch (error) {
    console.error('Streaming proxy error:', error);
    return new NextResponse('Proxy failed', { status: 500 });
  }
}

// Support OPTIONS preflight requests for CORS
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
