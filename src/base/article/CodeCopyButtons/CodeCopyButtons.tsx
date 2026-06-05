'use client';

import { useEffect } from 'react';

const COPIED_LABEL_TIMEOUT = 1600;

const COPY_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M6.9998 6V3C6.9998 2.44772 7.44752 2 7.9998 2H19.9998C20.5521 2 20.9998 2.44772 20.9998 3V17C20.9998 17.5523 20.5521 18 19.9998 18H16.9998V20.9991C16.9998 21.5519 16.5499 22 15.993 22H4.00666C3.45059 22 3 21.5554 3 20.9991L3.0026 7.00087C3.0027 6.44811 3.45264 6 4.00942 6H6.9998ZM5.00242 8L5.00019 20H14.9998V8H5.00242ZM8.9998 6H16.9998V16H18.9998V4H8.9998V6Z"></path></svg>';

const CHECK_ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true"><path d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"></path></svg>';

function setupCodeBlock(pre: HTMLElement): () => void {
  if (pre.querySelector('.code-copy-button')) return () => {};

  const title = pre.dataset.codeTitle;
  const language = pre.dataset.codeLanguage;
  let header: HTMLDivElement | undefined;

  if (title || language) {
    header = document.createElement('div');
    header.className = 'code-block-header';

    if (language) {
      const languageElement = document.createElement('span');
      languageElement.className = 'code-block-language';
      languageElement.textContent = language;
      header.appendChild(languageElement);
    }

    if (title) {
      const titleElement = document.createElement('span');
      titleElement.className = 'code-block-title';
      titleElement.textContent = title;
      header.appendChild(titleElement);
    }

    pre.prepend(header);
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'code-copy-button';
  button.innerHTML = COPY_ICON;
  button.setAttribute('aria-label', 'Copiar código');

  let timeout: number | undefined;

  const onClick = async () => {
    const code = pre.querySelector('code')?.textContent ?? '';

    try {
      await navigator.clipboard.writeText(code);
      button.innerHTML = CHECK_ICON;
      button.classList.add('is-copied');
      button.setAttribute('aria-label', 'Código copiado');

      if (timeout) window.clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        button.innerHTML = COPY_ICON;
        button.classList.remove('is-copied');
        button.setAttribute('aria-label', 'Copiar código');
      }, COPIED_LABEL_TIMEOUT);
    } catch {
      button.setAttribute('aria-label', 'Falha ao copiar código');
    }
  };

  button.addEventListener('click', onClick);
  pre.appendChild(button);

  return () => {
    if (timeout) window.clearTimeout(timeout);
    button.removeEventListener('click', onClick);
    button.remove();
    header?.remove();
  };
}

export function CodeCopyButtons() {
  useEffect(() => {
    const codeBlocks =
      document.querySelectorAll<HTMLElement>('article.post pre');

    const cleanups = Array.from(codeBlocks).map(setupCodeBlock);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}
