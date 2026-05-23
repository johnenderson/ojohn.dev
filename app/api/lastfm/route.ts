import { NextResponse } from 'next/server';

import { getLastfmStats } from '@/lib/lastfm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const lastfm = await getLastfmStats();

    return NextResponse.json(lastfm, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error fetching Last.fm stats:', error);

    return NextResponse.json(
      {
        nowPlaying: null,
        lastPlayed: null,
        tracks: [],
      },
      { status: 200 },
    );
  }
}
