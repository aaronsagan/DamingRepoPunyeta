import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const CampaignCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border-border/40 bg-card">
      {/* Banner Skeleton */}
      <Skeleton className="h-[200px] w-full rounded-t-lg rounded-b-none" />

      {/* Content Section */}
      <CardHeader className="pb-3">
        {/* Title Skeleton */}
        <Skeleton className="h-7 w-3/4 mb-2" />
        {/* Description Skeleton */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3 mt-1" />
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar Skeleton */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-2.5 w-full" />
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Skeleton className="h-4 w-4 rounded flex-shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-3 w-12 mb-1" />
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
};
