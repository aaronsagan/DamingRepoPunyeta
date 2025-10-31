import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  gradient: string;
  ring: string;
  iconColor: string;
  valueColor: string;
  onClick?: () => void;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  gradient,
  ring,
  iconColor,
  valueColor,
  onClick
}: MetricCardProps) {
  return (
    <Card
      className={`relative overflow-hidden bg-background/40 border-border/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-150 ${onClick ? 'cursor-pointer' : ''} rounded-2xl ring-1 ${ring} hover:ring-2 active:scale-[0.98]`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      {/* Gradient tint */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient}`} />
      
      <CardContent className="relative p-5 h-24 lg:h-28 flex items-center justify-between">
        {/* Left: value + label */}
        <div>
          <p className={`text-2xl lg:text-3xl font-extrabold ${valueColor}`}>{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>

        {/* Right: decorative icon bubble */}
        <div className="shrink-0">
          <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/5 ring-1 ring-white/10 flex items-center justify-center">
            <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
