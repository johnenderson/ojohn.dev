import type { ReactNode } from 'react';

export type Device = 'monitor' | 'keyboard' | 'mouse' | 'headset' | 'earbuds';

const ACCENT = 'var(--site-primary)';

const range = (length: number) => Array.from({ length }, (_, index) => index);

// Desenhos em traço, sem fotos de fabricante: herdam o tema e a paleta.
const ART: Record<Device, ReactNode> = {
  monitor: (
    <>
      <rect x="28" y="8" width="104" height="62" rx="4" />
      <path d="M28 62h104" />
      <path d="M73 70l-3 17M87 70l3 17M56 91l14-4h20l14 4" />
      <path d="M40 48l18-20M52 50l26-29" stroke={ACCENT} />
    </>
  ),
  keyboard: (
    <>
      <path d="M80 28V16c0-6 8-5 8-10" />
      <rect x="14" y="28" width="132" height="54" rx="6" />
      {range(11).map((column) => (
        <rect
          key={`f-${column}`}
          x={21 + column * 10.9}
          y="35"
          width="8"
          height="6"
          rx="1.5"
        />
      ))}
      {[46, 56].map((y) =>
        range(11).map((column) => (
          <rect
            key={`${y}-${column}`}
            x={21 + column * 10.9}
            y={y}
            width="8"
            height="7"
            rx="1.5"
          />
        )),
      )}
      <path d="M22 72h18M47 72h66M120 72h18" />
      <path d="M21 38h8" stroke={ACCENT} strokeWidth="6" />
    </>
  ),
  mouse: (
    <>
      <path d="M80 18V12c0-6 9-5 9-10" />
      <path d="M80 18c-17 0-25 12-25 30v17c0 18 11 29 25 29s25-11 25-29V48c0-18-8-30-25-30z" />
      <path d="M55 52c16 6 34 6 50 0M80 18v12M80 46v10" />
      <rect x="76" y="30" width="8" height="16" rx="4" stroke={ACCENT} />
    </>
  ),
  headset: (
    <>
      <path d="M48 58V46c0-21 14-36 32-36s32 15 32 36v12" />
      <path d="M56 56V46c0-16 10-28 24-28s24 12 24 28v10" />
      <rect x="40" y="52" width="20" height="34" rx="9" />
      <rect x="100" y="52" width="20" height="34" rx="9" />
      <path d="M50 62v14M110 62v14" stroke={ACCENT} />
    </>
  ),
  earbuds: (
    <>
      <path d="M62 20c-10 0-17 7-17 16s7 15 15 15h3v32a5 5 0 0010 0V32c0-7-4-12-11-12z" />
      <path d="M98 20c10 0 17 7 17 16s-7 15-15 15h-3v32a5 5 0 01-10 0V32c0-7 4-12 11-12z" />
      <path d="M53 31v9M107 31v9" stroke={ACCENT} />
    </>
  ),
};

export const DeviceArt = ({
  device,
  className = '',
}: {
  device: Device;
  className?: string;
}) => (
  <svg
    viewBox="0 0 160 100"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    className={className}
  >
    {ART[device]}
  </svg>
);
