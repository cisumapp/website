import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-static';

// Apple Universal Links: served at https://cisum.studio/.well-known/apple-app-site-association
// with Content-Type application/json and no redirect. appID = <TeamID>.<bundleID>.
const AASA = {
  applinks: {
    apps: [],
    details: [
      {
        appID: '3YK32DPS3W.aaravgupta.cisum',
        paths: ['/song', '/song/*', '/playlist', '/playlist/*', '/artist', '/artist/*', '/album', '/album/*'],
      },
    ],
  },
};

export function GET() {
  return NextResponse.json(AASA, {
    headers: { 'Content-Type': 'application/json' },
  });
}
