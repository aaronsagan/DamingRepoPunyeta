import { Card, CardContent } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface ImpactCardProps {
  icon: keyof typeof Icons;
  label: string;
  value: string | number;
  gradient?: string;
  iconColor?: string;
}

export function ImpactCard({ icon, label, value, gradient, iconColor }: ImpactCardProps) {
  const IconComponent = (Icons[icon] as LucideIcon) || Icons.Heart;

  return (
    <Card className={`group relative overflow-hidden border border-slate-700/40 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:border-blue-500/40 ${
      gradient || 'bg-gradient-to-br from-slate-800/50 to-slate-900/50'
    }`}>
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center space-y-2">
          {/* Icon */}
          <div className={`w-12 h-12 rounded-full bg-slate-700/50 flex items-center justify-center transition-transform duration-200 group-hover:scale-110 ${
            iconColor || 'text-blue-400'
          }`}>
            <IconComponent className="h-6 w-6" />
          </div>

          {/* Value */}
          <p className="text-2xl font-bold text-slate-100">
            {value}
          </p>

          {/* Label */}
          <p className="text-xs text-slate-400 font-medium">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
