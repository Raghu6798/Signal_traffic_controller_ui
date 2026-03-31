"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-32 rounded-md" />
          <Skeleton className="h-4 w-48 rounded-md opacity-40" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1 rounded-xl" />
      </div>

      {/* Projects Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/3 space-y-4">
             <div className="flex items-center justify-between">
               <Skeleton className="size-10 rounded-xl" />
               <Skeleton className="size-8 rounded-lg opacity-20" />
             </div>
             <div className="space-y-2">
               <Skeleton className="h-5 w-40 rounded-md" />
               <Skeleton className="h-3 w-56 rounded-md opacity-30" />
             </div>
             <div className="pt-4 border-t border-white/5 flex gap-4">
                <Skeleton className="h-3 w-16 rounded-md opacity-20" />
                <Skeleton className="h-3 w-20 rounded-md opacity-20" />
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
