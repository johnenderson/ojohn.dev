import { Navbar } from '@/base/components/Navbar';

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-md bg-site-card ${className}`} />
);

export default function Loading() {
  return (
    <>
      <Navbar />
      <main id="main">
        <div className="content">
          <div className="flex max-w-5xl flex-col items-start gap-14">
            <div className="grid w-full gap-8 md:grid-cols-[minmax(0,1fr)_18rem] md:gap-12">
              <div className="mt-10 flex flex-col gap-4">
                <Skeleton className="h-11 w-48" />
                <Skeleton className="h-5 w-full max-w-md" />
                <Skeleton className="mt-8 h-8 w-56" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-10/12" />
              </div>
              <Skeleton className="aspect-[3/4] w-full max-w-[18rem] justify-self-center md:mt-10" />
            </div>

            <Skeleton className="h-28 w-full" />

            <div className="flex w-full max-w-3xl flex-col gap-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-9/12" />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
