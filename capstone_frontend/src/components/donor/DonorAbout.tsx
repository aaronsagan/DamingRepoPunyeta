import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DonorProfile } from '@/hooks/useDonorProfile';
import { ImpactCard } from './ImpactCard';
import { BadgeList } from './BadgeList';
import { useDonorBadges } from '@/hooks/useDonorBadges';
import { Mail, MapPin, User, CalendarDays } from 'lucide-react';

interface DonorAboutProps {
  profile: DonorProfile;
  isOwner: boolean;
}

export function DonorAbout({ profile, isOwner }: DonorAboutProps) {
  const { badges, loading: badgesLoading } = useDonorBadges(profile.id);

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT SIDE - 2 columns wide */}
      <div className="lg:col-span-2 space-y-6">
        {/* About the Donor */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle>About the Donor</CardTitle>
            <CardDescription>Learn more about this generous supporter</CardDescription>
          </CardHeader>
          <CardContent>
            {profile.bio ? (
              <p className="text-slate-300 leading-relaxed">{profile.bio}</p>
            ) : (
              <p className="text-slate-400 italic text-center py-8">
                This donor hasn't written a bio yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Donation Impact */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle>Donation Impact</CardTitle>
            <CardDescription>Making a difference in the community</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ImpactCard
                icon="Heart"
                label="Total Donated"
                value={formatCurrency(profile.total_donated)}
                gradient="bg-gradient-to-br from-pink-600/20 via-rose-500/10 to-red-500/20"
                iconColor="text-pink-400"
              />
              <ImpactCard
                icon="CalendarCheck"
                label="Campaigns Supported"
                value={profile.campaigns_supported_count}
                gradient="bg-gradient-to-br from-blue-600/20 via-indigo-500/10 to-purple-500/20"
                iconColor="text-blue-400"
              />
              <ImpactCard
                icon="ThumbsUp"
                label="Liked Campaigns"
                value={profile.liked_campaigns_count}
                gradient="bg-gradient-to-br from-green-600/20 via-emerald-500/10 to-teal-500/20"
                iconColor="text-green-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Donor Badges */}
        {!badgesLoading && <BadgeList badges={badges} />}
      </div>

      {/* RIGHT SIDE - 1 column wide */}
      <div className="lg:col-span-1 space-y-6">
        {/* Member Information */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle>Member Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {/* Member Since */}
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Member Since</p>
                  <Badge variant="outline" className="bg-slate-700/30 border-slate-600">
                    {profile.member_since
                      ? new Date(profile.member_since).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </Badge>
                </div>
              </div>

              {/* Account Type */}
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Account Type</p>
                  <Badge variant="outline" className="bg-blue-600/20 border-blue-500/50 text-blue-400">
                    Donor
                  </Badge>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 mt-0.5 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400 mb-1">Status</p>
                  <Badge className="bg-green-600 hover:bg-green-700 text-white border-0">
                    Active
                  </Badge>
                </div>
              </div>

              {/* Recent Donations */}
              <div className="pt-3 border-t border-slate-700/50">
                <p className="text-sm text-slate-400 mb-1">Recent Activity</p>
                <p className="text-lg font-bold text-slate-200">
                  {profile.recent_donations_count} donation{profile.recent_donations_count !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-slate-500">in the last 30 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        {(isOwner || profile.location) && (
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email (owner only) */}
              {isOwner && profile.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-400 mb-1">Email</p>
                    <p className="text-sm font-medium text-slate-200 break-all">
                      {profile.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Location */}
              {profile.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-400 mb-1">Location</p>
                    <p className="text-sm font-medium text-slate-200">
                      {profile.location}
                    </p>
                  </div>
                </div>
              )}

              {!isOwner && !profile.location && (
                <p className="text-sm text-slate-400 text-center py-4">
                  No contact details available
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
