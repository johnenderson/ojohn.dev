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
          <div className="mt-10 mb-10">
            <Skeleton className="h-11 w-52 sm:h-12" />
            <Skeleton className="mt-3 h-5 w-full max-w-md" />
          </div>

          <Skeleton className="mb-14 h-28 w-full" />

          <Skeleton className="mb-3 h-9 w-48" />
          <Skeleton className="mb-6 h-5 w-full max-w-lg" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-44" />
            <Skeleton className="h-44" />
          </div>

          <Skeleton className="mb-6 mt-16 h-9 w-40" />
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </main>
    </>
  );
}
