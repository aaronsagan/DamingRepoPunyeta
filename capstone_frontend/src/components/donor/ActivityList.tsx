import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, Calendar } from 'lucide-react';
import { DonorDonation } from '@/hooks/useDonorActivity';

interface ActivityListProps {
  donations: DonorDonation[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function ActivityList({ donations, loading, hasMore, onLoadMore }: ActivityListProps) {
  if (loading && donations.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Skeleton className="h-16 w-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!loading && donations.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No activity yet</h3>
          <p className="text-muted-foreground text-sm">
            Donations will appear here once they are made
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (donation: DonorDonation) => {
    if (donation.ocr_verified) {
      return <Badge className="bg-green-600">Auto-Verified</Badge>;
    }
    if (donation.manually_verified) {
      return <Badge className="bg-blue-600">Verified</Badge>;
    }
    if (donation.status === 'rejected') {
      return <Badge variant="destructive">Rejected</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <div className="space-y-4">
      {donations.map((donation) => (
        <Card key={donation.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex gap-4">
              {/* Campaign Image */}
              {donation.campaign?.cover_image && (
                <div className="shrink-0">
                  <img
                    src={donation.campaign.cover_image}
                    alt={donation.campaign.title}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1">
                      {donation.campaign?.title || 'General Donation'}
                    </h3>
                    {donation.charity && (
                      <p className="text-sm text-muted-foreground">
                        {donation.charity.name}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-green-600">
                      ₱{donation.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                    {getStatusBadge(donation)}
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                  <span>
                    {new Date(donation.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                  {donation.purpose && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{donation.purpose}</span>
                    </>
                  )}
                  {donation.receipt_url && (
                    <>
                      <span>•</span>
                      <a
                        href={donation.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        View Receipt
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center pt-4">
          <Button onClick={onLoadMore} variant="outline" disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
}
