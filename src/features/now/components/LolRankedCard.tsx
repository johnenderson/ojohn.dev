import Image from 'next/image';

import { LolRanked } from '@/lib/lol';

const TIER_LABELS: Record<string, string> = {
  IRON: 'Ferro',
  BRONZE: 'Bronze',
  SILVER: 'Prata',
  GOLD: 'Ouro',
  PLATINUM: 'Platina',
  EMERALD: 'Esmeralda',
  DIAMOND: 'Diamante',
  MASTER: 'Mestre',
  GRANDMASTER: 'Grão-Mestre',
  CHALLENGER: 'Desafiante',
};

const RANK_LABEL: Record<string, string> = {
  I: 'I',
  II: 'II',
  III: 'III',
  IV: 'IV',
};

export const LolRankedCard = ({ ranked }: { ranked: LolRanked }) => {
  const tierLabel = TIER_LABELS[ranked.tier] ?? ranked.tier;
  const rankLabel = RANK_LABEL[ranked.rank] ?? ranked.rank;
  const showRank = !['MASTER', 'GRANDMASTER', 'CHALLENGER'].includes(
    ranked.tier,
  );

  return (
    <div className="flex flex-col gap-3 rounded-md border border-site-border-muted bg-site-card p-4">
      {/* Linha principal: emblema · tier info · stats */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:flex-nowrap">
        <div className="relative size-16 shrink-0">
          <Image
            src={ranked.emblemUrl}
            alt={tierLabel}
            fill
            unoptimized
            priority
            loading="eager"
            sizes="64px"
            className="object-contain drop-shadow-md"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-bold uppercase tracking-widest text-site-primary">
            Solo/Duo
          </span>
          <span className="text-xl font-bold leading-tight text-site-foreground">
            {tierLabel}
            {showRank && ` ${rankLabel}`}
          </span>
          <span className="text-sm font-semibold text-site-body-muted">
            {ranked.leaguePoints} LP
          </span>
        </div>
        <div className="ml-auto flex flex-col items-end gap-0.5">
          <span className="text-sm font-semibold text-site-foreground">
            {ranked.winRate}%{' '}
            <span className="font-normal text-site-body-muted">winrate</span>
          </span>
          <span className="text-xs text-site-body-muted">
            {ranked.wins}W <span className="text-site-border-muted">/</span>{' '}
            {ranked.losses}L
          </span>
        </div>
      </div>

      {/* Barra visual de winrate */}
      <div className="h-1 overflow-hidden rounded-full bg-site-card-hover">
        <div
          className="h-full rounded-full bg-site-primary transition-[width] duration-500"
          style={{ width: `${ranked.winRate}%` }}
        />
      </div>
    </div>
  );
};
