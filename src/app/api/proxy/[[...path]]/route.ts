import { NextRequest, NextResponse } from "next/server";

function copyHeader(headerName: string, to: Headers, from: Headers) {
  const hdrVal = from.get(headerName);
  if (hdrVal) {
    to.set(headerName, hdrVal);
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse("", {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers":
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-goog-visitor-id, x-goog-api-key, x-origin, x-youtube-client-version, x-youtube-client-name, x-goog-api-format-version, x-user-agent, Accept-Language, Range, Referer",
      "Access-Control-Max-Age": "86400",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

async function handler(request: NextRequest) {
  const url = new URL(request.url);
  
  if (!url.searchParams.has("__host")) {
    return new NextResponse(
      "Request is formatted incorrectly. Please include __host in the query string.",
      { status: 400 }
    );
  }

  url.host = url.searchParams.get("__host")!;
  url.protocol = "https:";
  url.port = "443";
  url.pathname = url.pathname.replace(/^\/api\/proxy/, "");
  url.searchParams.delete("__host");

  let request_headers = new Headers();
  try {
    const rawHeaders = url.searchParams.get("__headers");
    if (rawHeaders) {
      request_headers = new Headers(JSON.parse(rawHeaders));
    }
  } catch (e) {
    // Ignore invalid JSON headers
  }

  // Copy essential headers from the original request
  const headersToCopy = [
    "range", "user-agent", "content-type", "accept-language"
  ];
  for (const h of headersToCopy) {
    if (!request_headers.has(h) && request.headers.has(h)) {
      copyHeader(h, request_headers, request.headers);
    }
  }

  const fetchOptions: RequestInit = {
    method: request.method,
    headers: request_headers,
  };

  url.searchParams.delete("__headers");
  url.searchParams.delete("__host");

  if (request.method !== "GET" && request.method !== "HEAD" && request.body) {
    fetchOptions.body = request.body;
    // @ts-ignore - Required for Node.js undici fetch with ReadableStream bodies
    fetchOptions.duplex = "half";
  }

  const fetchRes = await fetch(url.toString(), fetchOptions);

  const headers = new Headers();

  copyHeader("content-type", headers, fetchRes.headers);
  copyHeader("content-disposition", headers, fetchRes.headers);
  copyHeader("accept-ranges", headers, fetchRes.headers);
  copyHeader("content-range", headers, fetchRes.headers);

  headers.set("Access-Control-Allow-Origin", request.headers.get("origin") || "*");
  headers.set("Access-Control-Allow-Headers", "*");
  headers.set("Access-Control-Allow-Methods", "*");
  headers.set("Access-Control-Allow-Credentials", "true");

  return new NextResponse(fetchRes.body, {
    status: fetchRes.status,
    headers,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const HEAD = handler;
export const PATCH = handler;
