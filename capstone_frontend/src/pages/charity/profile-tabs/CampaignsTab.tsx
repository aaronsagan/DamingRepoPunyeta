import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, Plus, ExternalLink, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CampaignsTabProps {
  campaigns: any[];
  setCampaigns: (campaigns: any[]) => void;
  charityId?: number;
}

export default function CampaignsTab({ campaigns, setCampaigns, charityId }: CampaignsTabProps) {
  const navigate = useNavigate();

  useEffect(() => {
    // TODO: Load campaigns from API
    // Mock data for now
    const mockCampaigns = [
      {
        id: 1,
        title: "Education for All",
        description: "Providing school supplies to underprivileged children",
        goal_amount: 100000,
        current_amount: 75000,
        status: "active",
        end_date: "2025-12-31",
        donors_count: 150
      },
      {
        id: 2,
        title: "Clean Water Project",
        description: "Building wells in rural communities",
        goal_amount: 200000,
        current_amount: 200000,
        status: "completed",
        end_date: "2025-06-30",
        donors_count: 300
      }
    ];
    setCampaigns(mockCampaigns);
  }, [charityId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'completed': return 'bg-blue-600';
      case 'pending': return 'bg-amber-600';
      default: return 'bg-gray-600';
    }
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Campaign Management
              </CardTitle>
              <CardDescription>
                View and manage your fundraising campaigns
              </CardDescription>
            </div>
            <Button onClick={() => navigate('/charity/campaigns/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
              <Megaphone className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first campaign to start raising funds
              </p>
              <Button onClick={() => navigate('/charity/campaigns/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">
                          {campaign.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {campaign.description}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">
                          {calculateProgress(campaign.current_amount, campaign.goal_amount).toFixed(0)}%
                        </span>
                      </div>
                      <Progress 
                        value={calculateProgress(campaign.current_amount, campaign.goal_amount)} 
                        className="h-2"
                      />
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-primary">
                          ₱{campaign.current_amount.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                          of ₱{campaign.goal_amount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {campaign.donors_count} donors
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {new Date(campaign.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => navigate(`/charity/campaigns/${campaign.id}`)}
                      >
                        Manage
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/campaigns/${campaign.id}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      {campaigns.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {campaigns.filter(c => c.status === 'active').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Raised
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ₱{campaigns.reduce((sum, c) => sum + c.current_amount, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Donors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {campaigns.reduce((sum, c) => sum + c.donors_count, 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
