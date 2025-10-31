import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Target, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { buildApiUrl, getAuthToken } from '@/lib/api';
import { toast } from 'sonner';
import { CampaignCard, type Campaign as CharityCampaign } from '@/components/charity/CampaignCard';

interface FilterOptions {
  types: Array<{ value: string; label: string }>;
  regions: string[];
  provinces: string[];
  cities: string[];
}

export default function BrowseCampaigns() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState<any>(null);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    campaign_type: '',
    region: '',
    province: '',
    city: '',
    min_goal: '',
    max_goal: '',
    start_date: '',
    end_date: '',
    status: 'published', // Default to published campaigns
  });

  useEffect(() => {
    fetchFilterOptions();
    fetchCampaigns();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      const token = getAuthToken();
      const res = await fetch(buildApiUrl('/campaigns/filter-options'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFilterOptions(data);
    } catch (error) {
      console.error('Filter options error:', error);
    }
  };

  const fetchCampaigns = async (page = 1) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      
      // Build query params
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
      params.append('page', page.toString());
      params.append('per_page', '12');

      const res = await fetch(buildApiUrl(`/campaigns/filter?${params.toString()}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      setCampaigns(data.data || []);
      setPagination({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
      });
    } catch (error) {
      console.error('Campaigns error:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchCampaigns(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      campaign_type: '',
      region: '',
      province: '',
      city: '',
      min_goal: '',
      max_goal: '',
      start_date: '',
      end_date: '',
      status: 'published',
    });
    setTimeout(() => fetchCampaigns(1), 100);
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value !== '' && key !== 'status'
  ).length;

  // Map backend campaign status to CampaignCard status
  const mapBackendStatus = (status?: string): "active" | "completed" | "draft" | "expired" => {
    switch (status) {
      case "published":
        return "active";
      case "closed":
        return "completed";
      case "archived":
        return "expired";
      case "draft":
      default:
        return "draft";
    }
  };

  // Adapt API campaign -> CampaignCard props
  const toCampaignCardData = (c: any): CharityCampaign => ({
    id: c.id,
    title: c.title,
    description: c.description || "Support this campaign",
    goal: c.target_amount || 0,
    amountRaised: c.current_amount || 0,
    donorsCount: c.donors_count || 0,
    views: c.views || 0,
    status: mapBackendStatus(c.status),
    bannerImage: c.cover_image_path,
    endDate: c.deadline_at || new Date().toISOString(),
    createdAt: c.created_at || new Date().toISOString(),
  });

  if (loading && !campaigns.length) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <Target className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-5xl font-bold">Browse Campaigns</h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl">
            Discover meaningful causes and make an impact today.{' '}
            {pagination && <span className="font-semibold text-primary">{pagination.total} campaigns</span>} available.
          </p>

          {/* Search Bar */}
          <div className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search campaigns by title, description, or beneficiaries..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="pl-10 h-12 text-base"
              />
            </div>
            <Button onClick={applyFilters} size="lg">
              Search
            </Button>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-5 w-5" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Filters Panel */}
        {showFilters && filterOptions && (
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter Campaigns
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* Campaign Type */}
              <div className="space-y-2">
                <Label>Campaign Type</Label>
                <Select value={filters.campaign_type} onValueChange={(v) => handleFilterChange('campaign_type', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    {filterOptions.types.map((type: any) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Region */}
              <div className="space-y-2">
                <Label>Region</Label>
                <Select value={filters.region} onValueChange={(v) => handleFilterChange('region', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All regions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All regions</SelectItem>
                    {filterOptions.regions.map((region: string) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Province */}
              <div className="space-y-2">
                <Label>Province</Label>
                <Select value={filters.province} onValueChange={(v) => handleFilterChange('province', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All provinces" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All provinces</SelectItem>
                    {filterOptions.provinces.map((province: string) => (
                      <SelectItem key={province} value={province}>
                        {province}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* City */}
              <div className="space-y-2">
                <Label>City</Label>
                <Select value={filters.city} onValueChange={(v) => handleFilterChange('city', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All cities</SelectItem>
                    {filterOptions.cities.map((city: string) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Min Goal */}
              <div className="space-y-2">
                <Label>Minimum Goal (₱)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.min_goal}
                  onChange={(e) => handleFilterChange('min_goal', e.target.value)}
                />
              </div>

              {/* Max Goal */}
              <div className="space-y-2">
                <Label>Maximum Goal (₱)</Label>
                <Input
                  type="number"
                  placeholder="No limit"
                  value={filters.max_goal}
                  onChange={(e) => handleFilterChange('max_goal', e.target.value)}
                />
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label>Start Date (From)</Label>
                <Input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleFilterChange('start_date', e.target.value)}
                />
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>End Date (Until)</Label>
                <Input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleFilterChange('end_date', e.target.value)}
                />
              </div>

              {/* Apply Button - spans 2 columns on larger screens */}
              <div className="md:col-span-3 lg:col-span-4 flex justify-end gap-2">
                <Button onClick={clearFilters} variant="outline">
                  Reset
                </Button>
                <Button onClick={applyFilters} className="min-w-32">
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Filters Pills */}
        {activeFilterCount > 0 && !showFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: {filters.search.substring(0, 20)}{filters.search.length > 20 && '...'}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => {
                    handleFilterChange('search', '');
                    setTimeout(applyFilters, 100);
                  }}
                />
              </Badge>
            )}
            {filters.campaign_type && (
              <Badge variant="secondary" className="gap-1">
                Type: {filterOptions?.types.find((t: any) => t.value === filters.campaign_type)?.label}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => {
                    handleFilterChange('campaign_type', '');
                    setTimeout(applyFilters, 100);
                  }}
                />
              </Badge>
            )}
            {filters.region && (
              <Badge variant="secondary" className="gap-1">
                Region: {filters.region}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => {
                    handleFilterChange('region', '');
                    setTimeout(applyFilters, 100);
                  }}
                />
              </Badge>
            )}
            {filters.province && (
              <Badge variant="secondary" className="gap-1">
                Province: {filters.province}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => {
                    handleFilterChange('province', '');
                    setTimeout(applyFilters, 100);
                  }}
                />
              </Badge>
            )}
            {filters.city && (
              <Badge variant="secondary" className="gap-1">
                City: {filters.city}
                <X
                  className="h-3 w-3 cursor-pointer hover:text-destructive"
                  onClick={() => {
                    handleFilterChange('city', '');
                    setTimeout(applyFilters, 100);
                  }}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading campaigns...</p>
            </div>
          </div>
        ) : campaigns.length > 0 ? (
          <>
            {/* Campaigns Grid - Using CampaignCard component */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={toCampaignCardData(campaign)}
                  viewMode="donor"
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6">
                <Button
                  variant="outline"
                  disabled={pagination.current_page === 1}
                  onClick={() => fetchCampaigns(pagination.current_page - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2 px-4">
                  <span className="text-sm text-muted-foreground">
                    Page <span className="font-semibold text-foreground">{pagination.current_page}</span> of{' '}
                    <span className="font-semibold text-foreground">{pagination.last_page}</span>
                  </span>
                </div>
                <Button
                  variant="outline"
                  disabled={pagination.current_page === pagination.last_page}
                  onClick={() => fetchCampaigns(pagination.current_page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <Card className="shadow-lg">
            <CardContent className="py-16 text-center">
              <Target className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-50" />
              <h3 className="text-2xl font-semibold mb-3">No campaigns found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {activeFilterCount > 0
                  ? "Try adjusting your filters to see more results, or browse all campaigns."
                  : "No campaigns are currently available. Please check back later."}
              </p>
              {activeFilterCount > 0 && (
                <Button onClick={clearFilters} size="lg">
                  <X className="mr-2 h-4 w-4" />
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
