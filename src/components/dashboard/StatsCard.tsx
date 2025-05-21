
import { Card, CardContent } from '@/components/ui/card';
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    positive: boolean;
  };
  icon?: ReactNode;
}

export function StatsCard({ title, value, change, icon }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            
            {change && (
              <p className={`text-xs font-medium flex items-center mt-1 ${
                change.positive ? 'text-green-600' : 'text-red-600'
              }`}>
                <span>{change.positive ? '↑' : '↓'} {change.value}</span>
              </p>
            )}
          </div>
          
          {icon && (
            <div className="p-2 bg-axiom-primary/10 rounded-full">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
