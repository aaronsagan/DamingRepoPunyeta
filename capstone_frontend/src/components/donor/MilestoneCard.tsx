import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import * as Icons from 'lucide-react';
import { DonorMilestone } from '@/hooks/useDonorMilestones';
import { CheckCircle2 } from 'lucide-react';

interface MilestoneCardProps {
  milestone: DonorMilestone;
}

export function MilestoneCard({ milestone }: MilestoneCardProps) {
  // Get icon component dynamically
  const IconComponent = (Icons as any)[milestone.icon] || Icons.Award;
  
  // Calculate progress percentage
  const progressPercentage = milestone.progress && milestone.threshold
    ? Math.min((milestone.progress / milestone.threshold) * 100, 100)
    : 0;

  // Format progress label
  const getProgressLabel = () => {
    if (!milestone.progress || !milestone.threshold) return '';
    if (milestone.key.includes('total_')) {
      return `₱${milestone.progress.toLocaleString()} / ₱${milestone.threshold.toLocaleString()}`;
    }
    if (milestone.key.includes('campaigns')) {
      return `${milestone.progress} / ${milestone.threshold} campaigns`;
    }
    return `${milestone.progress} / ${milestone.threshold}`;
  };

  return (
    <Card
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
        milestone.achieved
          ? 'bg-gradient-to-br from-blue-600/20 via-green-500/10 to-emerald-500/20 border-green-500/40 shadow-green-500/10'
          : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/40 hover:border-blue-500/40'
      }`}
    >
      <CardContent className="p-6">
        {/* Icon Area */}
        <div className="flex justify-center mb-4">
          <div
            className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
              milestone.achieved
                ? 'bg-gradient-to-br from-green-500/30 to-blue-500/30 text-green-400'
                : 'bg-slate-700/50 text-slate-400'
            }`}
          >
            <IconComponent className="h-8 w-8" />
            {milestone.achieved && (
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-center font-bold text-lg mb-2 text-slate-200">
          {milestone.title}
        </h3>

        {/* Description */}
        <p className="text-center text-sm text-slate-400 mb-4 min-h-[40px]">
          {milestone.description}
        </p>

        {/* Status Badge */}
        <div className="flex justify-center mb-4">
          {milestone.achieved ? (
            <Badge className="bg-green-600 hover:bg-green-700 text-white border-0">
              ✅ Achieved
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-blue-600/20 border-blue-500/50 text-blue-400">
              In Progress
            </Badge>
          )}
        </div>

        {/* Progress Bar (for non-achieved) */}
        {!milestone.achieved && milestone.progress !== null && milestone.threshold !== null && (
          <div className="space-y-2">
            <Progress
              value={progressPercentage}
              className="h-2.5 bg-slate-700/50"
            />
            <p className="text-center text-xs text-slate-400 font-medium">
              {getProgressLabel()}
            </p>
          </div>
        )}

        {/* Achievement Date */}
        {milestone.achieved && milestone.achieved_at && (
          <div className="mt-4 pt-4 border-t border-green-500/20">
            <p className="text-center text-xs text-green-400/80">
              Achieved on {new Date(milestone.achieved_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
