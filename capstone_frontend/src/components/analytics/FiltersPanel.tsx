import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { AnalyticsFilters } from '@/hooks/useAnalyticsSummary';
import { cn } from '@/lib/utils';

interface FiltersPanelProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  onApply: () => void;
  onReset: () => void;
}

const CAMPAIGN_TYPES = [
  { value: 'education', label: 'Education' },
  { value: 'feeding_program', label: 'Feeding Program' },
  { value: 'medical', label: 'Medical' },
  { value: 'disaster_relief', label: 'Disaster Relief' },
  { value: 'environment', label: 'Environment' },
  { value: 'animal_welfare', label: 'Animal Welfare' },
  { value: 'other', label: 'Other' },
];

const DATE_PRESETS = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'Last Year', days: 365 },
];

export function FiltersPanel({ filters, onFiltersChange, onApply, onReset }: FiltersPanelProps) {
  const handleDatePreset = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    
    onFiltersChange({
      ...filters,
      date_from: format(from, 'yyyy-MM-dd'),
      date_to: format(to, 'yyyy-MM-dd'),
    });
  };

  const toggleCampaignType = (type: string) => {
    const types = filters.campaign_types || [];
    const newTypes = types.includes(type)
      ? types.filter(t => t !== type)
      : [...types, type];
    
    onFiltersChange({ ...filters, campaign_types: newTypes });
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
        <CardDescription>Refine your analytics view</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Date Range Quick Presets */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <div className="grid grid-cols-2 gap-2">
            {DATE_PRESETS.map(preset => (
              <Button
                key={preset.days}
                variant="outline"
                size="sm"
                onClick={() => handleDatePreset(preset.days)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Date From */}
        <div className="space-y-2">
          <Label>From Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !filters.date_from && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.date_from ? format(new Date(filters.date_from), 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.date_from ? new Date(filters.date_from) : undefined}
                onSelect={(date) => onFiltersChange({ ...filters, date_from: date ? format(date, 'yyyy-MM-dd') : undefined })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Custom Date To */}
        <div className="space-y-2">
          <Label>To Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !filters.date_to && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.date_to ? format(new Date(filters.date_to), 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.date_to ? new Date(filters.date_to) : undefined}
                onSelect={(date) => onFiltersChange({ ...filters, date_to: date ? format(date, 'yyyy-MM-dd') : undefined })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Campaign Types */}
        <div className="space-y-2">
          <Label>Campaign Types</Label>
          <div className="space-y-2">
            {CAMPAIGN_TYPES.map(type => (
              <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(filters.campaign_types || []).includes(type.value)}
                  onChange={() => toggleCampaignType(type.value)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Granularity */}
        <div className="space-y-2">
          <Label>Time Granularity</Label>
          <Select
            value={filters.granularity || 'daily'}
            onValueChange={(value) => onFiltersChange({ ...filters, granularity: value as 'daily' | 'weekly' | 'monthly' })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={onApply} className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={onReset} variant="outline" size="icon">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Active Filters Count */}
        {(filters.campaign_types?.length || filters.date_from || filters.date_to) && (
          <div className="text-xs text-muted-foreground text-center">
            {[
              filters.campaign_types?.length && `${filters.campaign_types.length} types`,
              filters.date_from && 'date range',
            ].filter(Boolean).join(', ')} active
          </div>
        )}
      </CardContent>
    </Card>
  );
}
