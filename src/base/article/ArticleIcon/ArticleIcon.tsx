import Image from 'next/image';
import { FC } from 'react';

type ArticleIconProps = {
  icon: string;
  /** 'lg' = article header (36–40px), 'sm' = list card (20px) */
  size?: 'lg' | 'sm';
};

export const ArticleIcon: FC<ArticleIconProps> = ({ icon, size = 'lg' }) => {
  const isImage = icon.startsWith('/');

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

  return isImage ? (
    <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-site-border bg-site-card sm:size-10">
      <Image
        src={icon}
        alt=""
        aria-hidden="true"
        width={24}
        height={24}
        className="size-6 object-contain"
      />
    </span>
  ) : (
    <span className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-site-border bg-site-primary-soft text-xl leading-none text-site-primary sm:size-10 sm:text-2xl">
      {icon}
    </span>
  );
};
