import Image from 'next/image';
import React from 'react';

import {
  CARD_HOVER_LARGE,
  CARD_INNER_RING,
  hoverRotation,
} from '../card-animation';
import { faCalendarAlt, faGamepad } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { CardTooltip } from './CardTooltip';
import { SteamGame } from '@/lib/steam';

/**
 * Formata minutos em texto legível:
 * < 60 min  → "45min"
 * < 10 h    → "1.5h"  (1 decimal, sem zeros finais)
 * >= 10 h   → "776h"  (arredondado)
 */
const formatPlaytime = (minutes: number): string => {
  if (minutes < 60) return `${minutes}min`;
  const hours = minutes / 60;
  if (hours >= 10) return `${Math.round(hours)}h`;
  return `${+hours.toFixed(1)}h`;
};

/**
 * Tempo relativo em PT-BR usando Intl.RelativeTimeFormat.
 * Recebe Unix timestamp em segundos (como retorna a Steam API).
 */
const timeAgo = (unixSeconds: number): string => {
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  const diffSeconds = (unixSeconds * 1000 - Date.now()) / 1000;
  const abs = Math.abs(diffSeconds);

  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diffSeconds / 3600), 'hour');
  if (abs < 604800) return rtf.format(Math.round(diffSeconds / 86400), 'day');
  if (abs < 2592000)
    return rtf.format(Math.round(diffSeconds / 604800), 'week');
  if (abs < 31536000)
    return rtf.format(Math.round(diffSeconds / 2592000), 'month');
  return rtf.format(Math.round(diffSeconds / 31536000), 'year');
};

export const GameCard = ({ game }: { game: SteamGame }) => {
  const hasRecentPlaytime = game.playtime2weeks > 0;
  const hasLastPlayed = game.lastPlayedAt && game.lastPlayedAt > 0;

  let playtimeContent: React.ReactNode;
  if (hasRecentPlaytime) {
    playtimeContent = (
      <>
        <span className="text-site-foreground">
          {formatPlaytime(game.playtime2weeks)}
        </span>{' '}
        nas últimas 2 semanas
      </>
    );
  } else if (hasLastPlayed) {
    playtimeContent = <>jogado {timeAgo(game.lastPlayedAt!)}</>;
  } else {
    playtimeContent = (
      <>
        <span className="text-site-foreground">
          {formatPlaytime(game.playtimeForever)}
        </span>{' '}
        no total
      </>
    );
  }

  return (
    <CardTooltip
      content={
        <>
          <p className="text-xs font-bold leading-snug text-site-foreground">
            {game.name}
          </p>
          <div className="mt-1 flex items-center justify-center gap-1.5">
            <FontAwesomeIcon
              icon={hasRecentPlaytime ? faGamepad : faCalendarAlt}
              aria-hidden="true"
              className="size-3 shrink-0 text-site-body-muted"
            />
            <p className="text-[11px] leading-none text-site-body-muted">
              {playtimeContent}
            </p>
          </div>
        </>
      }
    >
      <a
        href={game.storeUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={game.name}
        className={`relative flex aspect-[2/3] overflow-hidden rounded-md bg-site-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-site-primary ${CARD_HOVER_LARGE} ${hoverRotation(
          game.appid,
        )}`}
      >
        <Image
          src={game.coverUrl}
          alt={game.name}
          fill
          unoptimized
          sizes="(min-width: 768px) 20vw, 33vw"
          className="object-cover"
        />
        <span aria-hidden="true" className={CARD_INNER_RING} />
      </a>
    </CardTooltip>
  );
};
