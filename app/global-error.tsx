'use client';

import { useEffect } from 'react';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({
  error,
  reset,
}: Readonly<GlobalErrorProps>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          alignItems: 'center',
          background: '#09080d',
          color: '#fffaf5',
          display: 'flex',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          justifyContent: 'center',
          margin: 0,
          minHeight: '100vh',
          padding: '24px',
        }}
      >
        <main style={{ maxWidth: '32rem', width: '100%' }}>
          <p
            style={{
              color: 'rgba(255, 250, 245, 0.6)',
              fontSize: '0.875rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              margin: 0,
              textTransform: 'uppercase',
            }}
          >
            Erro
          </p>
          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 700,
              lineHeight: 1.2,
              margin: '1rem 0 0.75rem',
            }}
          >
            Algo deu errado
          </h1>
          <p style={{ color: 'rgba(255, 250, 245, 0.78)', margin: 0 }}>
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: 'transparent',
              border: 0,
              color: '#fffaf5',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              marginTop: '1.5rem',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  );
}
