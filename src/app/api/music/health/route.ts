import { NextResponse } from 'next/server';
import { warmRuntime } from '@/lib/music/runtime';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  await warmRuntime();

  return NextResponse.json({ ready: true });
}