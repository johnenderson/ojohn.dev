'use client';

import { FC, useEffect, useState } from 'react';

import { SocialIcons } from '@/base/components/SocialIcons';
import { AUTHOR_NAME } from '@/lib/site';

const ELEVATOR_SPEED_KEY = 'elevator_speed';
const NORMAL_SCROLL_SPEED = 600;
const FAST_SCROLL_SPEED = 1000;

const easeOutSine = (progress: number) => Math.sin((progress * Math.PI) / 2);

const ScrollToTop: FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      setVisible(scrolled > 200 && total > 0 && scrolled >= total - 150);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    const makeElevatorFaster =
      localStorage.getItem(ELEVATOR_SPEED_KEY) === 'true';
    const scrollSpeed = makeElevatorFaster
      ? FAST_SCROLL_SPEED
      : NORMAL_SCROLL_SPEED;
    const startPosition = window.scrollY;
    const distance = startPosition;
    const duration = Math.max((distance / scrollSpeed) * 1000, 300);
    let startTime: number | null = null;

    const animation = (currentTime: number) => {
      startTime ??= currentTime;

      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const currentPosition = startPosition - distance * easeOutSine(progress);

      window.scrollTo(0, currentPosition);

      if (progress < 1) {
        requestAnimationFrame(animation);
      }
    };

    requestAnimationFrame(animation);
  };

  return (
    <button
      onClick={scrollToTop}
      aria-label="Voltar ao topo"
      className={`fixed bottom-0 right-0 p-4 md:p-6 text-site-body-muted hover:text-site-foreground transition-all duration-300 cursor-pointer ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
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
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
};

export const Footer: FC = () => (
  <>
    <footer className="mt-12 mb-6 border-t border-site-border pt-6 text-center md:text-left mx-auto max-w-5xl px-6 lg:px-0">
      <div className="flex flex-col items-center gap-3 md:items-start">
        <SocialIcons className="-ml-1.5" />
        <div className="text-sm text-site-body-muted">
          <p className="m-0">
            &copy; {new Date().getFullYear()} {AUTHOR_NAME}
          </p>
          <p className="m-0">Website licenciado sob a MIT.</p>
        </div>
      </div>
    </footer>

    <ScrollToTop />
  </>
);
