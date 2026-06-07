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
  music: 'bg-spotify', // Spotify green
  coding: 'bg-site-primary',
};

export const LiveStatus: FC = () => {
  const { data } = useSWR<StatusResponse>('/api/status', jsonFetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  });

  const active = Boolean(data?.status && data?.type);
  const dotColor =
    active && data?.type ? DOT_COLORS[data.type] : 'bg-site-body-muted';

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs text-site-body-muted transition-opacity duration-500 ${
        active ? 'opacity-100' : 'invisible opacity-0'
      }`}
    >
      <span className="relative flex size-2 shrink-0" aria-hidden="true">
        <span
          className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 ${dotColor}`}
        />
        <span
          className={`relative inline-flex size-2 rounded-full ${dotColor}`}
        />
      </span>
      {data?.status}
    </span>
  );
};
