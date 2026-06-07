'use client';

import { FC } from 'react';

import useSWR from 'swr';

type StatusType = 'gaming' | 'music' | 'coding' | null;

type StatusResponse = {
  status: string | null;
  type: StatusType;
};

const jsonFetcher = (url: string) => fetch(url).then((r) => r.json());

const DOT_COLORS: Record<NonNullable<StatusType>, string> = {
  gaming: 'bg-[#e84057]', // League red
  music: 'bg-[#1db954]', // Spotify green
  coding: 'bg-site-primary',
};

export const LiveStatus: FC = () => {
  const { data } = useSWR<StatusResponse>('/api/status', jsonFetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  });

  if (!data?.status || !data?.type) return null;

  const dotColor = DOT_COLORS[data.type];

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-site-body-muted">
      <span className="relative flex size-2 shrink-0" aria-hidden="true">
        <span
          className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 ${dotColor}`}
        />
        <span
          className={`relative inline-flex size-2 rounded-full ${dotColor}`}
        />
      </span>
      {data.status}
    </span>
  );
};
