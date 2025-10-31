import { useState } from "react";
import { Search, Filter, X, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { DonationFilters as Filters } from "./DonationsPage";

interface DonationFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  totalCount: number;
}

export default function DonationFilters({
  filters,
  onFilterChange,
  totalCount,
}: DonationFiltersProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<Filters>(filters);

  const handleQuickFilter = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFilterChange(newFilters);
  };

  const handleAdvancedApply = () => {
    onFilterChange(localFilters);
    setIsAdvancedOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters: Filters = { status: 'all' };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([key, value]) => value && value !== 'all' && key !== 'status'
  ).length;

  // Quick date presets
  const applyDatePreset = (preset: string) => {
    const now = new Date();
    let dateFrom = '';
    
    switch (preset) {
      case 'today':
        dateFrom = now.toISOString().split('T')[0];
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFrom = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFrom = monthAgo.toISOString().split('T')[0];
        break;
      case '3months':
        const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        dateFrom = threeMonthsAgo.toISOString().split('T')[0];
        break;
    }
    
    handleQuickFilter('dateFrom', dateFrom);
    handleQuickFilter('dateTo', now.toISOString().split('T')[0]);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search and Quick Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by donor name, transaction ID, or email..."
                value={filters.search || ''}
                onChange={(e) => handleQuickFilter('search', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleQuickFilter('status', value)}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced Filters Button */}
            <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced
                  {activeFilterCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="ml-2 px-1.5 py-0 h-5 min-w-[20px] bg-primary text-primary-foreground"
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-96" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Advanced Filters</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFilters}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  </div>

                  {/* Date Range */}
                  <div className="space-y-2">
                    <Label>Date Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Input
                          type="date"
                          value={localFilters.dateFrom || ''}
                          onChange={(e) =>
                            setLocalFilters({ ...localFilters, dateFrom: e.target.value })
                          }
                          placeholder="From"
                        />
                      </div>
                      <div>
                        <Input
                          type="date"
                          value={localFilters.dateTo || ''}
                          onChange={(e) =>
                            setLocalFilters({ ...localFilters, dateTo: e.target.value })
                          }
                          placeholder="To"
                        />
                      </div>
                    </div>
                    {/* Quick Date Presets */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyDatePreset('today')}
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyDatePreset('week')}
                      >
                        Last 7 Days
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyDatePreset('month')}
                      >
                        Last 30 Days
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyDatePreset('3months')}
                      >
                        Last 3 Months
                      </Button>
                    </div>
                  </div>

                  {/* Amount Range */}
                  <div className="space-y-2">
                    <Label>Amount Range (₱)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        value={localFilters.amountMin || ''}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            amountMin: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        value={localFilters.amountMax || ''}
                        onChange={(e) =>
                          setLocalFilters({
                            ...localFilters,
                            amountMax: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <Label>Payment Method</Label>
                    <Select
                      value={localFilters.paymentMethod || 'all'}
                      onValueChange={(value) =>
                        setLocalFilters({ ...localFilters, paymentMethod: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Methods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="gcash">GCash</SelectItem>
                        <SelectItem value="paymaya">PayMaya</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="offline">Offline/Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Campaign Filter */}
                  <div className="space-y-2">
                    <Label>Campaign</Label>
                    <Select
                      value={localFilters.campaign || 'all'}
                      onValueChange={(value) =>
                        setLocalFilters({ ...localFilters, campaign: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All Campaigns" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Campaigns</SelectItem>
                        <SelectItem value="general">General Donations</SelectItem>
                        {/* TODO: Load actual campaigns from API */}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Apply Button */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsAdvancedOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAdvancedApply}>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {filters.dateFrom && (
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  From: {filters.dateFrom}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleQuickFilter('dateFrom', undefined)}
                  />
                </Badge>
              )}
              {filters.dateTo && (
                <Badge variant="secondary" className="gap-1">
                  <Calendar className="h-3 w-3" />
                  To: {filters.dateTo}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleQuickFilter('dateTo', undefined)}
                  />
                </Badge>
              )}
              {filters.amountMin && (
                <Badge variant="secondary" className="gap-1">
                  Min: ₱{filters.amountMin}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleQuickFilter('amountMin', undefined)}
                  />
                </Badge>
              )}
              {filters.amountMax && (
                <Badge variant="secondary" className="gap-1">
                  Max: ₱{filters.amountMax}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleQuickFilter('amountMax', undefined)}
                  />
                </Badge>
              )}
              {filters.paymentMethod && filters.paymentMethod !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {filters.paymentMethod}
                  <X
                    className="h-3 w-3 cursor-pointer hover:text-destructive"
                    onClick={() => handleQuickFilter('paymentMethod', undefined)}
                  />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-6 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{totalCount}</span> donations
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
