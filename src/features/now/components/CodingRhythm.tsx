const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type CodingRhythmProps = {
  rhythm: number[];
};

export const CodingRhythm = ({ rhythm }: CodingRhythmProps) => {
  const max = Math.max(...rhythm, 1);
  const busiest = rhythm.indexOf(Math.max(...rhythm));
  const total = rhythm.reduce((sum, count) => sum + count, 0);
  const activeDays = rhythm.filter((count) => count > 0).length;
  const busiestLabel = rhythm[busiest] > 0 ? WEEKDAYS[busiest] : 'sem pico';

  return (
    <div className="rounded-md border border-site-border-muted bg-site-card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="m-0 text-base font-semibold text-site-foreground">
            Quando eu codo
          </h3>
          <p className="mb-0 mt-1 text-xs text-site-body-muted">
            Contribuições por dia da semana (último ano)
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="m-0 text-lg font-bold leading-none text-site-foreground">
            {busiestLabel}
          </p>
          <p className="m-0 mt-1 text-[11px] font-semibold uppercase text-site-primary">
            pico
          </p>
        </div>
      </div>

      <div className="my-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-site-border-subtle bg-site-card-hover px-2.5 py-1 text-xs font-semibold text-site-body">
          {total} contribuições
        </span>
        <span className="rounded-full border border-site-border-subtle bg-site-card-hover px-2.5 py-1 text-xs font-semibold text-site-body">
          {activeDays}/7 dias ativos
        </span>
      </div>

      <div className="flex items-end gap-1.5">
        {rhythm.map((count, index) => {
          const height = Math.round((count / max) * 100);
          const isBusiest = index === busiest && count > 0;

          return (
            <div
              key={WEEKDAYS[index]}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <div className="flex h-24 w-full items-end">
                <div
                  className={`w-full rounded-sm transition-[height,background-color] ${
                    isBusiest ? 'bg-site-primary' : 'bg-site-card-hover'
                  }`}
                  style={{ height: `${Math.max(height, 6)}%` }}
                  title={`${WEEKDAYS[index]}: ${count} contribuições`}
                />
              </div>
              <span className="text-[11px] font-medium text-site-body-muted">
                {WEEKDAYS[index]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
