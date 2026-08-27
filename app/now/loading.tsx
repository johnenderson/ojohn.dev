import { Navbar } from '@/base/components/Navbar';

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse rounded-md bg-site-card ${className}`} />
);

const SectionHeader = () => (
  <header className="mb-10 flex max-w-3xl items-start gap-3 lg:gap-6 xl:-ml-[4.5rem]">
    <Skeleton className="size-12 shrink-0 rounded-lg" />
    <div className="flex flex-col gap-2 pt-1">
      <Skeleton className="h-9 w-40 sm:h-10" />
      <Skeleton className="h-4 w-72" />
    </div>
  </header>
);

export default function Loading() {
  return (
    <>
      <Navbar />
      <main id="main">
        <div className="content">
          <div className="mt-10 mb-10">
            <Skeleton className="h-11 w-52 sm:h-12" />
            <Skeleton className="mt-3 h-5 w-80" />
          </div>

          <section className="border-b border-site-border-subtle pb-16">
            <SectionHeader />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-36" />
              <Skeleton className="h-36" />
            </div>
          </section>

          <section className="border-b border-site-border-subtle py-16">
            <SectionHeader />
            <div className="flex flex-col gap-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <Skeleton className="h-48" />
                <Skeleton className="h-48" />
              </div>
              <Skeleton className="h-32" />
            </div>
          </section>

          <section className="border-b border-site-border-subtle py-16">
            <SectionHeader />
            <div className="grid gap-12 lg:grid-cols-[1fr_32rem]">
              <div className="flex flex-col gap-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-24 max-w-md" />
                <Skeleton className="h-6 w-36" />
                <div className="flex max-w-md flex-col gap-2">
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <Skeleton className="h-6 w-52" />
                <div className="grid grid-cols-3 gap-3">
                  <Skeleton className="aspect-square" />
                  <Skeleton className="aspect-square" />
                  <Skeleton className="aspect-square" />
                  <Skeleton className="aspect-square" />
                  <Skeleton className="aspect-square" />
                  <Skeleton className="aspect-square" />
                  <Skeleton className="aspect-square" />
                  <Skeleton className="aspect-square" />
                  <Skeleton className="aspect-square" />
                </div>
              </div>
            </div>
          </section>

          <section className="pt-16">
            <SectionHeader />
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:gap-6">
              <Skeleton className="aspect-[2/3]" />
              <Skeleton className="aspect-[2/3]" />
              <Skeleton className="aspect-[2/3]" />
              <Skeleton className="aspect-[2/3]" />
              <Skeleton className="aspect-[2/3]" />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
