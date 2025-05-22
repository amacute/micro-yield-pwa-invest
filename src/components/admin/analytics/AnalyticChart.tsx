
import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AnalyticChartProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function AnalyticChart({ 
  title, 
  children,
  className = ''
}: AnalyticChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
