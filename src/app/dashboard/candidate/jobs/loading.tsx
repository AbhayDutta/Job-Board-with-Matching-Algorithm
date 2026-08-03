import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingCandidateDashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-32 rounded-md" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-24 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Banner Skeleton */}
        <Skeleton className="h-32 w-full rounded-2xl mb-8" />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Profile Sidebar Skeleton */}
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-[420px] w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
          </div>

          {/* Job Feed Skeleton */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <Skeleton className="h-7 w-48 rounded-lg" />
              <Skeleton className="h-8 w-36 rounded-full" />
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 rounded-2xl border border-border/60 bg-card space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-56 rounded-md" />
                    <Skeleton className="h-4 w-40 rounded-md" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
                <Skeleton className="h-12 w-full rounded-lg" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-18 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
