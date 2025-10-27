import { 
  TrendingUp, DollarSign, Clock, CheckCircle, XCircle, 
  RefreshCw, Download, BarChart3, PieChart 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Donation } from "@/services/donations";

interface DonationStatsSidebarProps {
  stats: {
    totalReceived: number;
    totalThisMonth: number;
    pendingCount: number;
    confirmedCount: number;
    rejectedCount: number;
    averageDonation: number;
  };
  donations: Donation[];
  onOpenReconciliation: () => void;
  onRefresh: () => void;
}

export default function DonationStatsSidebar({
  stats,
  donations,
  onOpenReconciliation,
  onRefresh,
}: DonationStatsSidebarProps) {
  
  // Calculate payment method distribution
  const paymentMethodStats = donations.reduce((acc, donation) => {
    const method = donation.proof_type || 'Unknown';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate donations over last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const donationsByDay = last7Days.map(date => {
    return donations.filter(d => 
      d.donated_at.startsWith(date) && d.status === 'completed'
    ).length;
  });

  const maxDonations = Math.max(...donationsByDay, 1);

  return (
    <div className="space-y-4 lg:sticky lg:top-20">
      {/* Live KPIs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Key Metrics
          </CardTitle>
          <CardDescription>Real-time donation statistics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Total Received */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Received</span>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-primary">
              ₱{stats.totalReceived.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time confirmed</p>
          </div>

          <Separator />

          {/* This Month */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">This Month</span>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">
              ₱{stats.totalThisMonth.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.confirmedCount} donations
            </p>
          </div>

          <Separator />

          {/* Status Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="text-sm">Pending</span>
              </div>
              <span className="font-semibold">{stats.pendingCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">Confirmed</span>
              </div>
              <span className="font-semibold">{stats.confirmedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm">Rejected</span>
              </div>
              <span className="font-semibold">{stats.rejectedCount}</span>
            </div>
          </div>

          <Separator />

          {/* Average Donation */}
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Average Donation</span>
            <div className="text-xl font-bold">
              ₱{stats.averageDonation.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mini Charts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Last 7 Days
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Sparkline Chart */}
          <div className="space-y-2">
            <div className="flex items-end justify-between h-24 gap-1">
              {donationsByDay.map((count, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                    style={{ 
                      height: `${(count / maxDonations) * 100}%`,
                      minHeight: count > 0 ? '4px' : '0px'
                    }}
                    title={`${count} donations`}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(last7Days[index]).getDate()}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-muted-foreground">
              Daily confirmed donations
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(paymentMethodStats).map(([method, count]) => {
              const percentage = (count / donations.length) * 100;
              return (
                <div key={method} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">{method}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => {/* TODO: Export */}}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Current View
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={onOpenReconciliation}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Run Reconciliation
          </Button>
        </CardContent>
      </Card>

      {/* Help Links */}
      <Card>
        <CardContent className="pt-6 space-y-2">
          <Button variant="link" className="w-full justify-start p-0 h-auto text-sm">
            📖 Donation Policy
          </Button>
          <Button variant="link" className="w-full justify-start p-0 h-auto text-sm">
            📊 Accounting Export Guide
          </Button>
          <Button variant="link" className="w-full justify-start p-0 h-auto text-sm">
            💬 Contact Support
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
