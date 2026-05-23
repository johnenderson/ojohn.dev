'use client';

import { useEffect } from 'react';

const COPIED_LABEL_TIMEOUT = 1600;

export function CodeCopyButtons() {
  useEffect(() => {
    const codeBlocks =
      document.querySelectorAll<HTMLElement>('article.post pre');

    const cleanups = Array.from(codeBlocks).map((pre) => {
      if (pre.querySelector('.code-copy-button')) {
        return () => {};
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'code-copy-button';
      button.textContent = 'Copiar';
      button.setAttribute('aria-label', 'Copiar código');

      let timeout: number | undefined;

      const onClick = async () => {
        const code = pre.querySelector('code')?.textContent ?? '';

        try {
          await navigator.clipboard.writeText(code);
          button.textContent = 'Copiado';
          button.setAttribute('aria-label', 'Código copiado');

          if (timeout) window.clearTimeout(timeout);
          timeout = window.setTimeout(() => {
            button.textContent = 'Copiar';
            button.setAttribute('aria-label', 'Copiar código');
          }, COPIED_LABEL_TIMEOUT);
        } catch {
          button.textContent = 'Falhou';
          button.setAttribute('aria-label', 'Falha ao copiar código');
        }
      };

      button.addEventListener('click', onClick);
      pre.appendChild(button);

      return () => {
        if (timeout) window.clearTimeout(timeout);
        button.removeEventListener('click', onClick);
        button.remove();
      };
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}
