import Image, { ImageProps } from 'next/image';
import { FC } from 'react';

interface CoverImagePropTypes extends ImageProps {
  src: string;
  alt: string;
  authorHref: string;
  authorName: string;
  blurDataURL?: string;
}

export const CoverImage: FC<CoverImagePropTypes> = ({
  src,
  width,
  height,
  alt,
  authorHref,
  authorName,
  blurDataURL,
}) => (
  <div className="my-8 flex flex-col gap-3 text-center">
    <Image
      src={src}
      width={width}
      height={height}
      alt={alt}
      blurDataURL={blurDataURL}
      placeholder="blur"
      className="rounded-md border border-site-border-subtle"
      style={{ height: 'auto' }}
    />
    {authorName ? (
      <span className="text-xs">
        Photo by{' '}
        <a
          href={authorHref}
          className="no-underline"
          target="_blank"
          rel="noreferrer"
        >
          {authorName}
        </a>
      </span>
    ) : null}
  </div>
);
