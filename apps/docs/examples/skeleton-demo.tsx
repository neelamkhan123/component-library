"use client";

import { Skeleton } from "neelam-ui";

export default function SkeletonDemo() {
  return (
    // One status region for the whole batch — individual skeletons are
    // aria-hidden and say nothing on their own.
    <div
      role="status"
      aria-label="Loading profile"
      className="flex w-full max-w-sm items-center gap-4"
    >
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
