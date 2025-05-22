
import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  iconBgClass?: string;
  iconClass?: string;
  className?: string;
}

export function AdminStatsCard({
  title,
  value,
  icon,
  description,
  trend,
  iconBgClass,
  iconClass,
  className
}: AdminStatsCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h4 className="text-2xl font-bold mt-1">{value}</h4>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            {trend && (
              <div className={`text-sm flex items-center mt-2 ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
                <span>{trend.positive ? '+' : ''}{trend.value}%</span>
                <span className="ml-1">vs last week</span>
              </div>
            )}
          </div>
          <div className={cn("p-3 bg-muted/50 rounded-full", iconBgClass)}>
            <div className={cn(iconClass)}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
