import { CSSProperties, ReactNode } from 'react';

type AdmonitionType =
  | 'info'
  | 'note'
  | 'tip'
  | 'success'
  | 'warning'
  | 'danger'
  | 'secondary';

type AdmonitionProps = {
  type?: AdmonitionType;
  title?: string;
  children: ReactNode;
};

const defaultTitles: Record<AdmonitionType, string> = {
  info: 'Info',
  note: 'Nota',
  tip: 'Dica',
  success: 'Sucesso',
  warning: 'Atenção',
  danger: 'Perigo',
  secondary: 'Nota',
};

const icons: Record<AdmonitionType, string> = {
  info: 'i',
  note: '•',
  tip: '✓',
  success: '✓',
  warning: '!',
  danger: '!',
  secondary: '•',
};

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 9.5C12.8284 9.5 13.5 8.82843 13.5 8C13.5 7.17157 12.8284 6.5 12 6.5C11.1716 6.5 10.5 7.17157 10.5 8C10.5 8.82843 11.1716 9.5 12 9.5ZM14 15H13V10.5H10V12.5H11V15H10V17H14V15Z" />
  </svg>
);

const TipIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM17.4571 9.45711L11 15.9142L6.79289 11.7071L8.20711 10.2929L11 13.0858L16.0429 8.04289L17.4571 9.45711Z" />
  </svg>
);

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM11 7V13H13V7H11Z" />
  </svg>
);

const DangerIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 23C7.85786 23 4.5 19.6421 4.5 15.5C4.5 13.3462 5.40786 11.4045 6.86179 10.0366C8.20403 8.77375 11.5 6.49951 11 1.5C17 5.5 20 9.5 14 15.5C15 15.5 16.5 15.5 19 13.0296C19.2697 13.8032 19.5 14.6345 19.5 15.5C19.5 19.6421 16.1421 23 12 23Z" />
  </svg>
);

function getAdmonitionIcon(type: AdmonitionType) {
  if (type === 'info') return <InfoIcon />;
  if (type === 'tip' || type === 'success') return <TipIcon />;
  if (type === 'warning') return <WarningIcon />;
  if (type === 'danger') return <DangerIcon />;
  return icons[type];
}

const accents: Record<AdmonitionType, string> = {
  info: '#6bb7ff',
  note: 'var(--site-primary)',
  tip: '#79d9a5',
  success: '#79d9a5',
  warning: '#f5b84b',
  danger: '#ff7b7b',
  secondary: 'var(--site-primary)',
};

export function Admonition({
  type = 'info',
  title,
  children,
}: Readonly<AdmonitionProps>) {
  const normalizedType = type === 'success' ? 'tip' : type;
  const accent = accents[type];
  const style = {
    '--admonition-accent': accent,
    '--admonition-bg': `color-mix(in srgb, ${accent} 11%, transparent)`,
    '--admonition-border': `color-mix(in srgb, ${accent} 44%, transparent)`,
    '--admonition-icon-bg': `color-mix(in srgb, ${accent} 18%, transparent)`,
    '--admonition-icon-text': accent,
    display: 'block',
    margin: '1.5rem 0 2rem',
    padding: '1rem 1.1rem',
    border: '1px solid var(--admonition-border)',
    borderLeftWidth: '4px',
    borderRadius: '6px',
    background: 'var(--admonition-bg)',
    color: 'var(--site-foreground)',
  } as CSSProperties;

  return (
    <aside
      className={`mdx-admonition mdx-admonition-${normalizedType}`}
      style={style}
      aria-label={title ?? defaultTitles[type]}
    >
      <div
        className="mdx-admonition-heading"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.55rem',
          marginBottom: '0.45rem',
          color: 'var(--site-foreground)',
          fontSize: '0.9rem',
          lineHeight: 1.35,
        }}
      >
        <span
          className="mdx-admonition-icon"
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            width: '1.25rem',
            height: '1.25rem',
            flex: '0 0 auto',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '999px',
            background: 'var(--admonition-icon-bg)',
            color: 'var(--admonition-icon-text)',
            fontSize: '0.78rem',
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          {getAdmonitionIcon(type)}
        </span>
        <strong>{title ?? defaultTitles[type]}</strong>
      </div>
      <div className="mdx-admonition-content">{children}</div>
    </aside>
  );
}

export const Info = (props: Omit<AdmonitionProps, 'type'>) => (
  <Admonition type="info" {...props} />
);

export const Note = (props: Omit<AdmonitionProps, 'type'>) => (
  <Admonition type="note" {...props} />
);

export const Tip = (props: Omit<AdmonitionProps, 'type'>) => (
  <Admonition type="tip" {...props} />
);

export const Warning = (props: Omit<AdmonitionProps, 'type'>) => (
  <Admonition type="warning" {...props} />
);

export const Danger = (props: Omit<AdmonitionProps, 'type'>) => (
  <Admonition type="danger" {...props} />
);
