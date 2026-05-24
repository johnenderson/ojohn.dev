import { NextResponse } from 'next/server';

import { getLastfmNowPlaying } from '@/lib/lastfm';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const nowPlaying = await getLastfmNowPlaying();

    return NextResponse.json(
      { nowPlaying },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (error) {
    console.error('Error fetching Last.fm now playing:', error);

    return NextResponse.json(
      { nowPlaying: null },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
        status: 200,
      },
    );
  }
}
