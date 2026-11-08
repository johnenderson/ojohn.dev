'use client';

import Image from 'next/image';
import { useState } from 'react';

type GameCoverProps = {
  name: string;
  coverUrl: string;
  headerUrl: string;
};

/**
 * Capa do jogo com fallback em cascata: capa vertical → header horizontal →
 * placeholder com o nome. Evita o ícone de imagem quebrada quando a Steam não
 * publica a capa no caminho esperado (caso do AION 2).
 */
export const GameCover = ({ name, coverUrl, headerUrl }: GameCoverProps) => {
  const sources = [coverUrl, headerUrl].filter(
    (src, index, all) => src && all.indexOf(src) === index,
  );
  const [attempt, setAttempt] = useState(0);
  const src = sources[attempt];

  if (!src) {
    return (
      <span className="flex size-full items-center justify-center bg-site-card p-3 text-center text-xs font-bold leading-snug text-site-body-muted">
        {name}
      </span>
    );
  }

  return (
    <Image
      key={src}
      src={src}
      alt={name}
      fill
      unoptimized
      sizes="(min-width: 768px) 20vw, 33vw"
      className="object-cover"
      onError={() => setAttempt((current) => current + 1)}
    />
  );
};
