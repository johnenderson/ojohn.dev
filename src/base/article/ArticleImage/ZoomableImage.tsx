'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

import { createPortal } from 'react-dom';

type ZoomableImageProps = {
  src: string;
  width: number;
  height: number;
  alt: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
};

export const ZoomableImage = ({
  src,
  width,
  height,
  alt,
  priority = false,
  placeholder = 'empty',
  blurDataURL,
}: ZoomableImageProps) => {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);

    // Lock body scroll while the lightbox is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={alt ? `Ampliar imagem: ${alt}` : 'Ampliar imagem'}
        className="group/zoom m-0 block w-full cursor-zoom-in border-0 bg-transparent p-0"
      >
        <Image
          src={src}
          width={width}
          height={height}
          alt={alt}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL}
          sizes="(max-width: 768px) 100vw, 672px"
          className="rounded-md border border-site-border-subtle transition-[filter] duration-300 group-hover/zoom:brightness-105"
          style={{ width: '100%', height: 'auto' }}
        />
      </button>

      {open && typeof document !== 'undefined'
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-label={alt || 'Imagem ampliada'}
              onClick={close}
              className="motion-safe:animate-[fadeIn_200ms_ease-out] fixed inset-0 z-[9999] flex cursor-zoom-out items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
            >
              <button
                type="button"
                onClick={close}
                aria-label="Fechar"
                className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              <Image
                src={src}
                width={width}
                height={height}
                alt={alt}
                onClick={(e) => e.stopPropagation()}
                className="motion-safe:animate-[zoomIn_250ms_cubic-bezier(0.22,1,0.36,1)] h-auto max-h-[90vh] w-auto max-w-full rounded-lg object-contain shadow-2xl"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  );
};
