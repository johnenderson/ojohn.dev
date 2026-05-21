'use client';

import { FC, useEffect, useState } from 'react';

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

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Voltar ao topo"
      className={`fixed bottom-0 right-0 p-4 md:p-6 text-[#8f879b] hover:text-white light:text-[#999] light:hover:text-[#333] transition-all duration-300 cursor-pointer ${
        visible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
};

export const Footer: FC = () => (
  <>
    <footer className="mt-12 mb-6 border-t border-[#8b5cf6]/20 light:border-[#e4e4e7] pt-6 text-center md:text-left mx-auto max-w-5xl px-6 lg:px-0">
      <div className="flex flex-col items-center md:items-start text-sm text-[#8f879b] light:text-[#777]">
        <p className="m-0">
          &copy; {new Date().getFullYear()} John Enderson
        </p>
        <p className="m-0 text-[#736c7d] light:text-[#999]">
          Feito com Next.js
        </p>
      </div>
    </footer>

    <ScrollToTop />
  </>
);
