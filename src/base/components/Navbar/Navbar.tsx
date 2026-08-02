'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  faEnvelope,
  faHeadphones,
  faNewspaper,
  faScrewdriverWrench,
  faUser,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { LanguageSelector } from './LanguageSelector';
import { PreferencesPanel } from './PreferencesPanel';
import { SITE_NAME } from '@/lib/site';

// `disabled` marca itens ainda sem página: aparecem no menu, mas não navegam.
const navLinks = [
  { href: '/blog', label: 'Blog', icon: faNewspaper },
  { href: '/me', label: 'Sobre mim', icon: faUser },
  { href: '/now', label: 'Agora', icon: faHeadphones },
  { href: '/uses', label: 'Uso', icon: faScrewdriverWrench },
  { href: '/contact', label: 'Contato', icon: faEnvelope, disabled: true },
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

// Marca do site: o wordmark com o ponto em teal, sem ícone — mesma
// assinatura do "John Enderson." no hero da home.
const Logo = () => {
  const dotIndex = SITE_NAME.indexOf('.');
  if (dotIndex === -1) return <>{SITE_NAME}</>;

  return (
    <>
      {SITE_NAME.slice(0, dotIndex)}
      <span className="text-site-primary">.</span>
      {SITE_NAME.slice(dotIndex + 1)}
    </>
  );
};

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
            className="text-2xl font-bold tracking-normal text-site-foreground no-underline transition-opacity hover:opacity-70"
          >
            <Logo />
          </Link>

          <div className="-mr-3 ml-auto hidden h-full items-center md:flex">
            <nav className="flex items-center h-full">
              {navLinks.map(({ href, label, disabled }) => {
                if (disabled) {
                  return (
                    <span
                      key={href}
                      title="Em breve"
                      aria-disabled="true"
                      className="flex h-full cursor-default select-none items-center px-3 font-normal text-site-body-muted opacity-60"
                    >
                      {label}
                    </span>
                  );
                }

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
          className="prefs-panel fixed inset-x-0 bottom-0 z-50 flex flex-col gap-3 rounded-t-lg border border-b-0 border-site-border p-3 shadow-2xl transition-[transform] duration-200 md:hidden"
        >
          <div className="mx-auto mt-1 h-1.5 w-24 shrink-0 rounded-full bg-site-primary-soft" />

          <nav className="flex w-full flex-col">
            {navLinks.map(({ href, label, icon, disabled }) => {
              if (disabled) {
                return (
                  <span
                    key={href}
                    aria-disabled="true"
                    className="flex min-h-12 w-full cursor-default select-none items-center justify-start gap-3 rounded px-3 text-left font-normal text-site-body-muted opacity-60"
                  >
                    <FontAwesomeIcon
                      icon={icon}
                      className="size-5 text-site-body-muted"
                    />
                    <span>
                      {label}{' '}
                      <span className="text-xs text-site-body-muted">
                        · em breve
                      </span>
                    </span>
                  </span>
                );
              }

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
