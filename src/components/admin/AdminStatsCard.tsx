
import React, { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  iconBgClass: string;
  iconClass: string;
}

export function AdminStatsCard({ 
  title, 
  value, 
  icon, 
  iconBgClass, 
  iconClass 
}: AdminStatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full ${iconBgClass}`}>
            {React.isValidElement(icon) 
              ? React.cloneElement(icon, { 
                  className: `h-5 w-5 ${iconClass}` 
                })
              : icon
            }
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
