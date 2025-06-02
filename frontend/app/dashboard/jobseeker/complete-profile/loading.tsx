"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <div className="w-64 bg-background border-r hidden lg:block">
        <Skeleton className="h-full w-full" />
      </div>

      <div className="flex-1">
        <div className="h-14 border-b px-4 flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>

        <main className="p-6">
          <div className="mb-6">
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="space-y-6">
            {/* Personal Information Section */}
            <Skeleton className="h-80 w-full" />

            {/* Work Experience Section */}
            <Skeleton className="h-60 w-full" />

            {/* Education Section */}
            <Skeleton className="h-60 w-full" />

            {/* Skills Section */}
            <Skeleton className="h-40 w-full" />

            {/* Professional URLs Section */}
            <Skeleton className="h-40 w-full" />

            <div className="flex justify-end space-x-4">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
