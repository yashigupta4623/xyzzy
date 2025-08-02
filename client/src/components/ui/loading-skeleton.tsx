import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-6 w-3/4 bg-gh-border" />
          <Skeleton className="h-4 w-full bg-gh-border" />
          <Skeleton className="h-4 w-1/2 bg-gh-border" />
        </div>
      ))}
    </div>
  );
}
