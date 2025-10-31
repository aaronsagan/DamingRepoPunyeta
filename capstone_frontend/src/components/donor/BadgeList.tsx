import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface DonorBadge {
  id?: number;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}

interface BadgeListProps {
  badges: DonorBadge[];
}

export function BadgeList({ badges }: BadgeListProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <CardTitle>Recognition & Badges</CardTitle>
        <CardDescription>Achievements earned through generous giving</CardDescription>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">
            No badges earned yet — start donating to earn achievements!
          </p>
        ) : (
          <div className="flex flex-wrap gap-4 justify-center">
            {badges.map((badge, index) => {
              const IconComponent = (Icons as any)[badge.icon] || Icons.Award;
              
              return (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 cursor-pointer ${
                          badge.earned
                            ? 'bg-gradient-to-br from-green-500/30 to-blue-500/30 ring-2 ring-green-500/40 shadow-lg shadow-green-400/10'
                            : 'bg-slate-700/30 opacity-50'
                        }`}
                      >
                        <IconComponent
                          className={`h-8 w-8 ${
                            badge.earned ? 'text-green-400' : 'text-slate-500'
                          }`}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-center">
                        <p className="font-semibold">{badge.name}</p>
                        <p className="text-xs text-slate-400">{badge.description}</p>
                        {!badge.earned && (
                          <p className="text-xs text-orange-400 mt-1">Not yet earned</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
