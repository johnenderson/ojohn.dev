'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

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
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Promote the dialog to the top layer when it mounts, and lock body scroll.
  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const requestClose = () => dialogRef.current?.close();

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

      {open ? (
        <dialog
          ref={dialogRef}
          aria-label={alt || 'Imagem ampliada'}
          onClose={() => setOpen(false)}
          onClick={(e) => {
            // Close when the backdrop (the dialog element itself) is clicked.
            if (e.target === dialogRef.current) requestClose();
          }}
          className="zoom-dialog motion-safe:animate-[zoomIn_250ms_cubic-bezier(0.22,1,0.36,1)]"
        >
          <button
            type="button"
            onClick={requestClose}
            aria-label="Fechar"
            className="fixed right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
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
            className="block h-auto max-h-[90vh] w-auto max-w-[92vw] rounded-lg object-contain shadow-2xl"
            style={{ width: 'auto', height: 'auto' }}
          />
        </dialog>
      ) : null}
    </>
  );
};
