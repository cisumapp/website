import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 256 * 1024; // 256 KB cap on a shared-playlist payload
const MAX_TRACKS = 500;

// Best-effort per-IP rate limit. In-memory → resets on cold start / per instance; a coarse abuse
// guard, not a hard quota. Upgrade to a shared store (Supabase/KV) if abuse becomes real.
const RATE_LIMIT = 30; // requests
const RATE_WINDOW_MS = 60_000; // per minute
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

// Stable, key-sorted JSON so identical payloads hash identically regardless of key order.
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = canonicalize((value as Record<string, unknown>)[key]);
        return acc;
      }, {});
  }
  return value;
}

const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

function toBase62(bytes: Buffer): string {
  const zero = BigInt(0);
  const base = BigInt(62);
  let num = BigInt('0x' + bytes.toString('hex'));
  if (num === zero) return '0';
  let out = '';
  while (num > zero) {
    out = BASE62[Number(num % base)] + out;
    num = num / base;
  }
  return out;
}

function shortId(canonicalJSON: string): string {
  const digest = createHash('sha256').update(canonicalJSON).digest();
  return toBase62(digest.subarray(0, 8)).slice(0, 11);
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const type = payload.type;
  if (type !== 'embedded' && type !== 'imported') {
    return NextResponse.json({ error: 'Invalid payload type' }, { status: 400 });
  }
  if (type === 'embedded') {
    const tracks = payload.tracks;
    if (!Array.isArray(tracks) || tracks.length === 0 || tracks.length > MAX_TRACKS) {
      return NextResponse.json({ error: 'Invalid tracklist' }, { status: 400 });
    }
  }
  if (type === 'imported' && (typeof payload.provider !== 'string' || typeof payload.sourceID !== 'string')) {
    return NextResponse.json({ error: 'Invalid imported playlist' }, { status: 400 });
  }

  const canonical = JSON.stringify(canonicalize(payload));
  const id = shortId(canonical);

  const name = typeof payload.name === 'string' ? payload.name.slice(0, 200) : null;
  const author = typeof payload.author === 'string' ? payload.author.slice(0, 200) : null;

  const admin = getSupabaseAdminClient();
  const { error } = await admin
    .from('shared_playlists')
    .upsert({ id, payload, name, author }, { onConflict: 'id' });

  if (error) {
    return NextResponse.json({ error: 'Storage failed' }, { status: 500 });
  }

  return NextResponse.json({ id });
}
