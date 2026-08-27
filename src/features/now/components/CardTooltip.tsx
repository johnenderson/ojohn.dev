'use client';

import { MouseEvent, ReactNode, useState, useSyncExternalStore } from 'react';

import * as Tooltip from '@radix-ui/react-tooltip';

const subscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/** Sem hover de verdade (touch) — primeiro toque só mostra o tooltip, segundo toque navega. */
const usesCoarsePointer = () => window.matchMedia('(hover: none)').matches;

/**
 * Tooltip padrão dos cards de imagem da página /now.
 *
 * Usa @radix-ui/react-tooltip para replicar o comportamento do doce.sh:
 *  - delayDuration={300}  → abre após 300ms de hover (evita flashes ao passar o mouse)
 *  - skipDelayDuration={0} → se mover de um card para outro, abre imediatamente
 *  - disableHoverableContent → fecha ao sair do trigger, sem "entrar" no tooltip
 *  - em telas de toque, o Root vira controlado e o primeiro tap intercepta a navegação
 */
export const CardTooltip = ({
  children,
  content,
  delayDuration = 300,
}: {
  children: ReactNode;
  content: ReactNode;
  /** ms antes do tooltip aparecer. 300 para grids de navegação, 0 para coleções inspecionadas. */
  delayDuration?: number;
}) => {
  const isMounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [tapOpen, setTapOpen] = useState(false);

  if (!isMounted) return children;

  const isTouch = usesCoarsePointer();

  const handleTriggerClick = (event: MouseEvent<HTMLElement>) => {
    if (!isTouch) return;
    if (tapOpen) {
      setTapOpen(false);
      return;
    }
    event.preventDefault();
    setTapOpen(true);
  };

  return (
    <Tooltip.Provider
      delayDuration={delayDuration}
      skipDelayDuration={0}
      disableHoverableContent
    >
      <Tooltip.Root
        {...(isTouch && { open: tapOpen, onOpenChange: setTapOpen })}
      >
        <Tooltip.Trigger asChild onClick={handleTriggerClick}>
          {children}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="bottom"
            align="center"
            sideOffset={6}
            className="z-20 w-max max-w-[18ch] rounded-md border border-site-border bg-site-popover px-3 py-1.5 text-center shadow-xl shadow-black/30 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-1"
          >
            {content}
            <Tooltip.Arrow asChild>
              <div className="size-2.5 rotate-45 rounded-[2px] bg-site-popover" />
            </Tooltip.Arrow>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
