import { NextResponse } from 'next/server';

import { getGithubPulse } from '@/lib/github';
import { getLastfmNowPlaying } from '@/lib/lastfm';
import { getLolLiveGame } from '@/lib/lol';

export const dynamic = 'force-dynamic';

export type StatusType = 'gaming' | 'music' | 'coding' | null;

export type StatusResponse = {
  status: string | null;
  type: StatusType;
};

const CODING_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 hours

export async function GET() {
  try {
    // Priority 1: League of Legends live game
    const liveGame = await getLolLiveGame().catch(() => null);
    if (liveGame) {
      return NextResponse.json<StatusResponse>(
        { status: 'jogando', type: 'gaming' },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    // Priority 2: Spotify / Last.fm now playing
    const nowPlaying = await getLastfmNowPlaying().catch(() => null);
    if (nowPlaying) {
      return NextResponse.json<StatusResponse>(
        { status: 'ouvindo música', type: 'music' },
        { headers: { 'Cache-Control': 'no-store' } },
      );
    }

    // Priority 3: Recent GitHub commit (within last 4 hours)
    const pulse = await getGithubPulse().catch(() => null);
    if (pulse?.lastActivity?.at) {
      const commitAge = Date.now() - new Date(pulse.lastActivity.at).getTime();
      if (commitAge < CODING_WINDOW_MS) {
        return NextResponse.json<StatusResponse>(
          { status: 'codando', type: 'coding' },
          { headers: { 'Cache-Control': 'no-store' } },
        );
      }
    }

    return NextResponse.json<StatusResponse>(
      { status: null, type: null },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json<StatusResponse>(
      { status: null, type: null },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
