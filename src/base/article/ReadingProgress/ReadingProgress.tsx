'use client';

import { useEffect, useState } from 'react';

export const ReadingProgress = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const article = document.querySelector<HTMLElement>('article.post');
    if (!article) return;

    let frame = 0;

    const update = () => {
      frame = 0;

      const rect = article.getBoundingClientRect();
      const articleTop = rect.top + window.scrollY;
      const scrollable = rect.height - window.innerHeight;

      if (scrollable <= 0) {
        setProgress(rect.bottom <= window.innerHeight ? 1 : 0);
        return;
      }

      const scrolled = window.scrollY - articleTop;
      setProgress(Math.min(1, Math.max(0, scrolled / scrollable)));
    };

    const onScroll = () => {
      if (frame) return;
      frame = globalThis.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      if (frame) globalThis.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div className="reading-progress" aria-hidden="true">
      <div
        className="reading-progress-bar"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
};
