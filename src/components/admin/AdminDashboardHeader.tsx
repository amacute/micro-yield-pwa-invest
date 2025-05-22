
import { FC, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface AdminDashboardHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export const AdminDashboardHeader: FC<AdminDashboardHeaderProps> = ({ 
  title, 
  description,
  action
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {action && (
        <div>
          {action}
        </div>
      )}
    </div>
  );
};
