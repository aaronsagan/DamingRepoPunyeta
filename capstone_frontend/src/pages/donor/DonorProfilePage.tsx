import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Share2, MoreVertical, MapPin, TrendingUp, Heart, Calendar, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useDonorProfile, updateDonorProfile, updateDonorImage } from '@/hooks/useDonorProfile';
import { useDonorActivity } from '@/hooks/useDonorActivity';
import { useDonorMilestones } from '@/hooks/useDonorMilestones';
import { MetricCard } from '@/components/donor/MetricCard';
import { MilestonesGrid } from '@/components/donor/MilestonesGrid';
import { ActivityList } from '@/components/donor/ActivityList';
import { DonorAbout } from '@/components/donor/DonorAbout';
import { ImageViewerModal } from '@/components/charity/ImageViewerModal';

export default function DonorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('about');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalType, setImageModalType] = useState<'profile' | 'cover'>('profile');
  
  // Use current user's ID if not specified
  const donorId = id || user?.id?.toString() || '';
  
  // Fetch data
  const { profile, loading: profileLoading, refetch: refetchProfile } = useDonorProfile(donorId);
  const { donations, loading: activityLoading, hasMore, loadMore } = useDonorActivity(donorId);
  const { milestones, loading: milestonesLoading } = useDonorMilestones(donorId);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    bio: '',
    address: '',
    phone: '',
  });

  const handleShare = () => {
    const url = `${window.location.origin}/donor/profile/${donorId}`;
    if (navigator.share) {
      navigator.share({
        title: profile?.name || 'Donor Profile',
        text: 'Check out this donor profile',
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Profile link copied to clipboard!');
    }
  };

  const openImageModal = (type: 'profile' | 'cover') => {
    setImageModalType(type);
    setImageModalOpen(true);
  };

  const handleImageUpdate = async (file: File, type: 'profile' | 'cover') => {
    if (!profile) return;
    const res = await updateDonorImage(profile.id, file, type);
    if (!res.success) throw new Error(res.error || 'Update failed');
    await refetchProfile();
  };

  const openEditDialog = () => {
    if (profile) {
      setEditForm({
        bio: profile.bio || '',
        address: profile.location || '',
        phone: '',
      });
    }
    setEditDialogOpen(true);
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    const result = await updateDonorProfile(profile.id, editForm);
    
    if (result.success) {
      toast.success('Profile updated successfully');
      setEditDialogOpen(false);
      refetchProfile();
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
  };

  const formatCurrency = (amount: number) => {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="relative bg-gradient-to-br from-orange-50/30 via-pink-50/20 to-blue-50/30 dark:from-orange-950/10 dark:via-pink-950/10 dark:to-blue-950/10">
          <div className="container mx-auto px-4 lg:px-8 pt-4">
            <Skeleton className="h-8 w-32" />
          </div>
          <div className="container mx-auto px-4 lg:px-8 pt-4 pb-16">
            <Skeleton className="h-[280px] lg:h-[340px] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const isOwner = (!!profile?.is_owner) || (!!user?.id && user.id === profile.id);

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Donor not found</h2>
            <p className="text-muted-foreground mb-4">
              The donor profile you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsConfig = [
    {
      icon: TrendingUp,
      label: 'Total Donated',
      value: formatCurrency(profile.total_donated),
      gradient: 'from-emerald-500/20 via-emerald-400/10 to-transparent',
      ring: 'ring-emerald-500/30',
      iconColor: 'text-emerald-400',
      valueColor: 'text-emerald-400',
    },
    {
      icon: Calendar,
      label: 'Campaigns Supported',
      value: profile.campaigns_supported_count.toString(),
      gradient: 'from-indigo-500/20 via-indigo-400/10 to-transparent',
      ring: 'ring-indigo-500/30',
      iconColor: 'text-indigo-400',
      valueColor: 'text-indigo-400',
    },
    {
      icon: Heart,
      label: 'Recent Donations',
      value: profile.recent_donations_count.toString(),
      gradient: 'from-sky-500/20 via-sky-400/10 to-transparent',
      ring: 'ring-sky-500/30',
      iconColor: 'text-sky-400',
      valueColor: 'text-sky-400',
    },
    {
      icon: FileText,
      label: 'Liked Campaigns',
      value: profile.liked_campaigns_count.toString(),
      gradient: 'from-fuchsia-500/20 via-fuchsia-400/10 to-transparent',
      ring: 'ring-fuchsia-500/30',
      iconColor: 'text-fuchsia-400',
      valueColor: 'text-fuchsia-400',
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-8">
      {/* Profile Header - Matching Charity Profile */}
      <div className="relative bg-gradient-to-br from-orange-50/30 via-pink-50/20 to-blue-50/30 dark:from-orange-950/10 dark:via-pink-950/10 dark:to-blue-950/10">
        {/* Back Button */}
        <div className="container mx-auto px-4 lg:px-8 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Cover Photo */}
        <div className="container mx-auto px-4 lg:px-8 pt-4 pb-16">
          <div
            className={`relative h-[280px] lg:h-[340px] rounded-2xl overflow-hidden shadow-lg group ${isOwner ? 'cursor-pointer' : ''}`}
            onClick={() => isOwner && openImageModal('cover')}
            tabIndex={isOwner ? 0 : -1}
            onKeyDown={(e) => isOwner && e.key === 'Enter' && openImageModal('cover')}
            aria-label={isOwner ? 'Click to view or change cover photo' : undefined}
          >
            {profile.cover_url ? (
              <img src={profile.cover_url} alt={`${profile.name} cover`} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center relative bg-gradient-to-br from-orange-100/50 via-pink-100/40 to-blue-100/50 dark:from-orange-900/20 dark:via-pink-900/20 dark:to-blue-900/20">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-200/40 via-pink-200/30 to-blue-200/40 dark:from-orange-800/20 dark:via-pink-800/20 dark:to-blue-800/20" />
                <div className="absolute inset-0 opacity-10">
                  <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="hearts" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M50 70 L30 50 Q20 40 30 30 T50 30 T70 30 Q80 40 70 50 Z" fill="currentColor" opacity="0.1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hearts)"/>
                  </svg>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-white/40 via-transparent to-transparent dark:from-gray-900/40" />
            {isOwner && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Click to view or change cover photo
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Content */}
        <div className="container mx-auto px-4 lg:px-8">
          <div className="relative -mt-24 lg:-mt-28">
            <div className="flex flex-col lg:flex-row items-start lg:items-end gap-4 lg:gap-6 lg:pl-6">
              {/* Avatar */}
              <Avatar
                className={`h-32 w-32 lg:h-40 lg:w-40 ring-6 ring-white dark:ring-gray-900 shadow-2xl transition-transform duration-200 hover:scale-105 bg-white dark:bg-gray-800 lg:ml-8 ${isOwner ? 'cursor-pointer' : ''}`}
                onClick={() => isOwner && openImageModal('profile')}
              >
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.name} />
                <AvatarFallback className="text-4xl lg:text-5xl font-bold bg-gradient-to-br from-[#F2A024] to-orange-500 text-white">
                  {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'DD'}
                </AvatarFallback>
              </Avatar>

              {/* Info & Actions */}
              <div className="flex-1 pb-2 w-full">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left: Name & Info */}
                  <div className="flex-1 pt-0">
                    <h1 className="text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-tight mb-1">
                      {profile.name}
                    </h1>
                    
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge className="bg-gray-700 hover:bg-gray-600 text-white border-0 px-3 py-1.5 text-sm font-medium">
                        Donor Account
                      </Badge>
                    </div>
                    
                    {profile.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Action Buttons */}
                  {profile.is_owner && (
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        onClick={openEditDialog}
                        className="bg-[#F2A024] hover:bg-[#E89015] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-150"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={handleShare}
                        className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon"
                            className="shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={openEditDialog}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleShare}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share Profile
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 lg:px-8 pt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-8">
          {statsConfig.map((stat, index) => (
            <MetricCard key={index} {...stat} />
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="w-full mb-4">
            <TabsList className="bg-transparent p-0" role="tablist">
              <div className="flex items-center gap-4">
                <TabsTrigger
                  value="about"
                  role="tab"
                  aria-controls="about-panel"
                  className="rounded-lg px-5 py-2 text-base text-muted-foreground hover:bg-white/10 transition-colors data-[state=active]:bg-white/15 data-[state=active]:text-foreground"
                >
                  About
                </TabsTrigger>
                <TabsTrigger
                  value="milestones"
                  role="tab"
                  aria-controls="milestones-panel"
                  className="rounded-lg px-5 py-2 text-base text-muted-foreground hover:bg-white/10 transition-colors data-[state=active]:bg-white/15 data-[state=active]:text-foreground"
                >
                  Milestones
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  role="tab"
                  aria-controls="activity-panel"
                  className="rounded-lg px-5 py-2 text-base text-muted-foreground hover:bg-white/10 transition-colors data-[state=active]:bg-white/15 data-[state=active]:text-foreground"
                >
                  Recent Activity
                </TabsTrigger>
              </div>
            </TabsList>
          </div>

          {/* About Tab */}
          <TabsContent value="about" id="about-panel" role="tabpanel" className="mt-6">
            <DonorAbout profile={profile} isOwner={isOwner} />
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" id="milestones-panel" role="tabpanel" className="mt-6">
            <MilestonesGrid milestones={milestones} loading={milestonesLoading} />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" id="activity-panel" role="tabpanel" className="mt-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Left Large Card - Activity List */}
              <div className="md:col-span-2">
                <ActivityList
                  donations={donations}
                  loading={activityLoading}
                  hasMore={hasMore}
                  onLoadMore={loadMore}
                />
              </div>

              {/* Right Small Card - Quick Actions */}
              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={() => navigate('/donor/campaigns')} 
                      className="w-full"
                      variant="outline"
                    >
                      Explore Campaigns
                    </Button>
                    <Button 
                      onClick={() => navigate('/donor/donations')} 
                      className="w-full"
                      variant="outline"
                    >
                      View All Donations
                    </Button>
                  </CardContent>
                </Card>

                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle>Activity Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Donations</p>
                        <p className="text-xl font-bold">{donations.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell others about yourself..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Location</Label>
              <Input
                id="address"
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="+1234567890"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProfile}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer / Uploader */}
      {isOwner && (
        <ImageViewerModal
          open={imageModalOpen}
          onOpenChange={setImageModalOpen}
          imageUrl={imageModalType === 'profile' ? (profile.avatar_url || null) : (profile.cover_url || null)}
          imageType={imageModalType}
          charityName={profile.name}
          onImageUpdate={handleImageUpdate}
        />
      )}
    </div>
  );
}
