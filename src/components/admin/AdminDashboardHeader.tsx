
import { FC } from 'react';

interface AdminDashboardHeaderProps {
  title: string;
  description: string;
}

export const AdminDashboardHeader: FC<AdminDashboardHeaderProps> = ({ 
  title, 
  description 
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
