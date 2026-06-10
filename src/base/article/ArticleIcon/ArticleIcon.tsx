import Image from 'next/image';
import { FC } from 'react';

type ArticleIconProps = {
  icon: string;
  /** 'lg' = article header, 'card' = list card (large, no bg), 'sm' = compact inline */
  size?: 'lg' | 'card' | 'sm';
};

export const ArticleIcon: FC<ArticleIconProps> = ({ icon, size = 'lg' }) => {
  const isImage = icon.startsWith('/');

  // List card: large icon, no background container — same pattern as doce.sh
  if (size === 'card') {
    return isImage ? (
      <span className="shrink-0">
        <Image
          src={icon}
          alt=""
          aria-hidden="true"
          width={48}
          height={48}
          className="size-12 object-contain"
        />
      </span>
    ) : (
      <span className="shrink-0 text-4xl leading-none">{icon}</span>
    );
  }

  // Inline small (default/non-compact card icon slot)
  if (size === 'sm') {
    return isImage ? (
      <span className="mt-0.5 shrink-0">
        <Image
          src={icon}
          alt=""
          aria-hidden="true"
          width={20}
          height={20}
          className="size-5 object-contain"
        />
      </span>
    ) : (
      <span className="mt-1 shrink-0 text-xl leading-none text-site-primary">
        {icon}
      </span>
    );
  }

  // Article header (lg): standalone icon, no badge — same spirit as doce.sh
  return isImage ? (
    <span className="mt-0.5 shrink-0">
      <Image
        src={icon}
        alt=""
        aria-hidden="true"
        width={44}
        height={44}
        className="size-10 object-contain sm:size-11"
      />
    </span>
  ) : (
    <span className="mt-0.5 shrink-0 text-4xl leading-none">{icon}</span>
  );
};
