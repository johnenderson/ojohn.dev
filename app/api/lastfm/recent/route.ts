import { NextResponse } from 'next/server';

import { getLastfmRecentStats } from '@/lib/lastfm';

export const revalidate = 120;

export async function GET() {
  try {
    const recent = await getLastfmRecentStats();

    return NextResponse.json(recent, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
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
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
        status: 200,
      },
    );
  }
}
