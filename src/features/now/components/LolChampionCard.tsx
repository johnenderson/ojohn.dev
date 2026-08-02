import Image from 'next/image';

import { CardTooltip } from './CardTooltip';
import {
  CARD_HOVER_SMALL,
  CARD_INNER_RING,
  hoverRotation,
} from '@/base/card-animation';
import { LolChampion } from '@/lib/lol';

const formatMastery = (points: number): string => {
  if (points >= 1_000_000) return `${+(points / 1_000_000).toFixed(1)}M`;
  if (points >= 1_000) return `${Math.round(points / 1_000)}k`;
  return String(points);
};

export const LolChampionCard = ({
  champion,
  index,
}: {
  champion: LolChampion;
  index: number;
}) => (
  <CardTooltip
    content={
      <>
        <p className="text-xs font-bold leading-snug text-site-foreground">
          {champion.name}
        </p>
        <p className="mt-0.5 text-[11px] leading-none text-site-body-muted">
          <span className="text-site-foreground">
            {formatMastery(champion.masteryPoints)}
          </span>{' '}
          pts · nível {champion.masteryLevel}
        </p>
      </>
    }
  >
    <div
      className={`relative aspect-square overflow-hidden rounded-md bg-site-card-hover ${CARD_HOVER_SMALL} ${hoverRotation(
        index,
      )}`}
    >
      <Image
        src={champion.iconUrl}
        alt={champion.name}
        fill
        unoptimized
        sizes="(min-width: 1024px) 8rem, (min-width: 768px) 7rem, (min-width: 640px) 6rem, 5rem"
        className="object-cover"
      />
      <span aria-hidden="true" className={CARD_INNER_RING} />
    </div>
  </CardTooltip>
);
