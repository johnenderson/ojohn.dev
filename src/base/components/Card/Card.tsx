'use client';

import Link from 'next/link';
import {
  useState,
  type CSSProperties,
  type ButtonHTMLAttributes,
  type HTMLAttributeAnchorTarget,
  type MouseEvent,
  type MouseEventHandler,
  type ReactNode,
} from 'react';

type CardProps = {
  children: ReactNode;
  className?: string;
  href?: string;
  interactive?: boolean;
  spotlight?: boolean;
  ariaLabel?: string;
  target?: HTMLAttributeAnchorTarget;
  rel?: string;
  title?: string;
  overflow?: 'hidden' | 'visible';
  style?: CSSProperties;
  as?: 'button' | 'div' | 'li';
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

/**
 * Superfície de card padrão do site (borda + fundo + raio nos tokens do tema),
 * com um spotlight que segue o cursor no hover. O conteúdo é passado via
 * `children`, então pode continuar sendo Server Component.
 *
 * - `interactive`: adiciona o hover-lift (`.interactive-card`).
 * - `href`: renderiza como `<Link>` (cards clicáveis).
 * - `spotlight`: liga/desliga o brilho (respeita `prefers-reduced-motion`).
 */
export const Card = ({
  children,
  className = '',
  href,
  interactive = false,
  spotlight = true,
  ariaLabel,
  target,
  rel,
  title,
  overflow = 'hidden',
  style,
  as: Element = 'div',
  type,
  onClick,
}: CardProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  const surfaceClassName = [
    'relative rounded-md border border-site-border-muted bg-site-card',
    overflow === 'hidden' ? 'overflow-hidden' : 'overflow-visible',
    interactive ? 'interactive-card' : '',
    href ? 'block no-underline' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const handlers = spotlight
    ? {
        onMouseMove: handleMouseMove,
        onMouseEnter: () => setActive(true),
        onMouseLeave: () => setActive(false),
      }
    : {};

  const overlay = spotlight ? (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 motion-reduce:transition-none"
      style={
        {
          opacity: active ? 1 : 0,
          background: `radial-gradient(240px circle at ${position.x}px ${position.y}px, var(--site-spotlight), transparent 70%)`,
        } as CSSProperties
      }
    />
  ) : null;

  if (href) {
    return (
      <Link
        href={href}
        aria-label={ariaLabel}
        target={target}
        rel={rel}
        title={title}
        style={style}
        className={surfaceClassName}
        {...handlers}
      >
        {overlay}
        {children}
      </Link>
    );
  }

  if (Element === 'button') {
    return (
      <button
        className={surfaceClassName}
        style={style}
        type={type ?? 'button'}
        onClick={onClick}
        {...handlers}
      >
        {overlay}
        {children}
      </button>
    );
  }

  return (
    <Element className={surfaceClassName} style={style} {...handlers}>
      {overlay}
      {children}
    </Element>
  );
};
