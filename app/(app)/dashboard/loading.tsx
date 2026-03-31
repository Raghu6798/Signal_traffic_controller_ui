"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 h-screen overflow-hidden">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-md opacity-50" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="p-6 rounded-2xl border border-white/5 bg-white/3 space-y-4">
             <div className="flex items-center justify-between">
               <Skeleton className="size-12 rounded-xl" />
               <Skeleton className="h-4 w-20 rounded-md" />
             </div>
             <div className="space-y-2">
               <Skeleton className="h-4 w-24 rounded-md" />
               <Skeleton className="h-10 w-32 rounded-lg" />
             </div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-white/3 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
             <Skeleton className="h-6 w-32 rounded-md" />
             <Skeleton className="h-4 w-16 rounded-md opacity-50" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 py-1">
              <Skeleton className="size-10 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                 <Skeleton className="h-4 w-full rounded-md" />
                 <Skeleton className="h-3 w-48 rounded-md opacity-40" />
              </div>
              <Skeleton className="size-9 rounded-xl opacity-20" />
            </div>
          ))}
        </div>

        {/* Sidebar Tasks */}
        <div className="rounded-2xl border border-white/5 bg-white/3 p-6 space-y-6">
           <Skeleton className="h-6 w-24 rounded-md" />
           {[1, 2].map((i) => (
             <div key={i} className="space-y-3 p-4 rounded-xl bg-white/3">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-full rounded-md opacity-40" />
                <Skeleton className="h-10 w-full rounded-lg mt-2" />
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
