'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  faHeadphones,
  faNewspaper,
  faScrewdriverWrench,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { LanguageSelector } from './LanguageSelector';
import { PreferencesPanel } from './PreferencesPanel';
import { SITE_NAME } from '@/lib/site';

const navLinks = [
  { href: '/me', label: 'Sobre mim', icon: faUser },
  { href: '/now', label: 'Agora', icon: faHeadphones },
  { href: '/uses', label: 'Uso', icon: faScrewdriverWrench },
  { href: '/writings', label: 'Blog', icon: faNewspaper },
];

const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" />
  </svg>
);

export const Navbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        className={`navbar fixed top-0 left-0 z-40 h-16 w-full px-6 transition-colors duration-300 md:h-20 lg:px-0${
          scrolled ? ' scrolled' : ''
        }`}
      >
        <div className="mx-auto flex size-full max-w-5xl items-center">
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl no-underline transition-opacity hover:opacity-70 text-site-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM16.4645 15.5355L20 12L16.4645 8.46447L15.0503 9.87868L17.1716 12L15.0503 14.1213L16.4645 15.5355ZM6.82843 12L8.94975 9.87868L7.53553 8.46447L4 12L7.53553 15.5355L8.94975 14.1213L6.82843 12ZM11.2443 17L14.884 7H12.7557L9.11597 17H11.2443Z" />
            </svg>
            <span className="font-semibold tracking-normal">{SITE_NAME}</span>
          </Link>

          <div className="-mr-3 ml-auto hidden h-full items-center md:flex">
            <nav className="flex items-center h-full">
              {navLinks.map(({ href, label }) => {
                const isActive =
                  href === '/' ? pathname === '/' : pathname.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex h-full items-center px-3 font-normal no-underline transition-colors duration-200 ${
                      isActive
                        ? 'text-site-foreground'
                        : 'text-site-body hover:text-site-foreground'
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="ml-1 flex items-center gap-1">
              <PreferencesPanel />
              <LanguageSelector />
            </div>
          </div>

          <button
            type="button"
            aria-label="Abrir menu"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileMenuOpen(true)}
            className="-mr-3 ml-auto flex size-12 items-center justify-center text-site-foreground transition-colors hover:text-site-primary-hover md:hidden"
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {mobileMenuOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur md:hidden"
          onClick={() => setMobileMenuOpen(false)}
          onKeyDown={() => setMobileMenuOpen(false)}
        />
      )}

      {mobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="prefs-panel fixed inset-x-0 bottom-0 z-50 flex flex-col gap-3 rounded-t-lg border border-b-0 border-site-border p-3 shadow-2xl transition-all duration-200 md:hidden"
        >
          <div className="mx-auto mt-1 h-1.5 w-24 shrink-0 rounded-full bg-site-primary-soft" />

          <nav className="flex w-full flex-col">
            {navLinks.map(({ href, label, icon }) => {
              const isActive =
                href === '/' ? pathname === '/' : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex min-h-12 w-full items-center justify-start gap-3 rounded px-3 text-left font-normal no-underline transition-colors ${
                    isActive
                      ? 'text-site-primary'
                      : 'text-site-foreground hover:bg-site-primary-soft hover:text-site-primary-hover'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={icon}
                    className={`size-5 ${
                      isActive ? 'text-site-primary' : 'text-site-body-muted'
                    }`}
                  />
                  {label}
                </Link>
              );
            })}
          </nav>

          <hr className="my-0 w-full border-0 border-t border-site-border-muted" />

          <div className="flex w-full items-center justify-start gap-2">
            <PreferencesPanel panelAlign="left" panelPosition="top" />
            <LanguageSelector panelAlign="left" panelPosition="top" />
          </div>
        </div>
      )}
    </>
  );
};
