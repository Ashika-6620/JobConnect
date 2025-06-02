import Header from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-10 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column Skeleton */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <Skeleton className="h-32 w-32 rounded-full mb-4" />
                <Skeleton className="h-8 w-48 mb-2" />
                <Skeleton className="h-5 w-36 mb-2" />
                <Skeleton className="h-5 w-32 mt-2" />
              </div>

              <div className="my-4 h-px bg-border" />

              <div className="space-y-3">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </div>

              <div className="my-4 h-px bg-border" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm">
              <Skeleton className="h-7 w-24 mb-4" />
              <div className="flex flex-wrap gap-2">
                {Array(8)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-6 w-16 rounded-full" />
                  ))}
              </div>
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <Skeleton className="h-7 w-24 mb-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm">
              <Skeleton className="h-7 w-36 mb-4" />
              <div className="space-y-6">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="border-l-2 border-muted pl-4">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-36 mb-1" />
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm">
              <Skeleton className="h-7 w-36 mb-4" />
              <div className="space-y-6">
                {Array(2)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="border-l-2 border-muted pl-4">
                      <Skeleton className="h-6 w-48 mb-2" />
                      <Skeleton className="h-4 w-36 mb-1" />
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
