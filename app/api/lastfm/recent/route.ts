import { NextResponse } from 'next/server';

import { getLastfmRecentStats } from '@/lib/lastfm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const recent = await getLastfmRecentStats();

    return NextResponse.json(recent, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error fetching Last.fm recent tracks:', error);

    return NextResponse.json(
      {
        nowPlaying: null,
        lastPlayed: null,
        tracks: [],
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
        status: 200,
      },
    );
  }
}
