import { MilestoneCard } from './MilestoneCard';
import { DonorMilestone } from '@/hooks/useDonorMilestones';
import { Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MilestonesGridProps {
  milestones: DonorMilestone[];
  loading?: boolean;
}

export function MilestonesGrid({ milestones, loading }: MilestonesGridProps) {
  // Loading state
  if (loading) {
    return (
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="rounded-2xl border border-slate-700/40 bg-slate-800/50 animate-pulse">
            <CardContent className="p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-slate-700/50" />
              </div>
              <div className="h-6 bg-slate-700/50 rounded mb-2" />
              <div className="h-10 bg-slate-700/50 rounded mb-4" />
              <div className="h-6 bg-slate-700/50 rounded mx-auto w-24" />
            </CardContent>
          </Card>
        ))}
      </section>
    );
  }

  // Empty state
  if (milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <Card className="max-w-md w-full border-dashed border-2 border-slate-700/50 bg-slate-800/30">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center mx-auto mb-4">
              <Award className="h-10 w-10 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-200 mb-2">
              No milestones yet
            </h3>
            <p className="text-slate-400">
              Start donating to unlock achievements and track your impact!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Grid of milestone cards
  return (
    <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {milestones.map((milestone) => (
        <MilestoneCard key={milestone.id} milestone={milestone} />
      ))}
    </section>
  );
}
