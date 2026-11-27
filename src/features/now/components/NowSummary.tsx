export type NowSummaryItem = {
  label: string;
  value: string;
  detail: string;
  /** Âncora da seção correspondente na página. */
  href: `#${string}`;
};

/**
 * Faixa "o momento": um recorte de cada seção, com atalho para ela. Os itens
 * quebram em linhas e esticam, então a faixa fecha mesmo quando falta algum.
 */
export const NowSummary = ({ items }: { items: NowSummaryItem[] }) => (
  <nav aria-label="Resumo do momento">
    {/* O gap de 1px sobre o fundo da borda desenha as divisórias. */}
    <ul className="m-0 flex list-none flex-wrap gap-px overflow-hidden rounded-md border border-site-border-muted bg-site-border-subtle p-0">
      {items.map((item) => (
        <li key={item.label} className="flex min-w-0 flex-[1_1_14rem]">
          <a
            href={item.href}
            className="group flex min-w-0 flex-1 flex-col gap-1.5 bg-site-background p-5 no-underline transition-colors hover:bg-site-card-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-site-primary"
          >
            <span className="font-mono text-xs uppercase tracking-wider text-site-body-muted">
              {item.label}
            </span>
            <span className="truncate text-lg font-bold leading-snug text-site-primary group-hover:text-site-primary-hover">
              {item.value}
            </span>
            <span className="truncate text-sm text-site-body-muted">
              {item.detail}
            </span>
          </a>
        </li>
      ))}
    </ul>
  </nav>
);
