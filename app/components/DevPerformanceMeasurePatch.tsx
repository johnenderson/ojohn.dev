import Script from 'next/script';

export function DevPerformanceMeasurePatch() {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Script id="dev-performance-measure-patch" strategy="beforeInteractive">
      {`
        (() => {
          const measure = performance.measure.bind(performance);

          performance.measure = (...args) => {
            try {
              return measure(...args);
            } catch (error) {
              if (
                error instanceof TypeError &&
                String(error.message).includes('negative time stamp')
              ) {
                return undefined;
              }

              throw error;
            }
          };
        })();
      `}
    </Script>
  );
}
