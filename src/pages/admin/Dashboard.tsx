import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, LineChart, DollarSign, PieChart, Shield } from 'lucide-react';
import { UserManagement } from '@/components/admin/UserManagement';
import { InvestmentManagement } from '@/components/admin/InvestmentManagement';
import { P2PMatching } from '@/components/admin/P2PMatching';
import { DataAnalytics } from '@/components/admin/DataAnalytics';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { AdminDashboardHeader } from '@/components/admin/AdminDashboardHeader';
import { AdminMessaging } from '@/components/admin/AdminMessaging';
import { UserMatching } from '@/components/admin/UserMatching';
import { UserBlockingManagement } from '@/components/admin/UserBlockingManagement';
import { ExpiredInvestments } from '@/components/admin/ExpiredInvestments';
import { NotificationCenter } from '@/components/admin/NotificationCenter';
import { KYCVerificationManagement } from '@/components/admin/KYCVerificationManagement';

type AdminStat = {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: {
    value: string;
    label: string;
    positive: boolean;
  };
};

export default function AdminDashboard() {
  const [stats] = useState<AdminStat[]>([
    {
      title: 'Total Users',
      value: '2,345',
      icon: <Users className="h-4 w-4" />,
      change: {
        value: '12%',
        label: 'vs last month',
        positive: true
      }
    },
    {
      title: 'Active Investments',
      value: '$1.2M',
      icon: <PieChart className="h-4 w-4" />,
      change: {
        value: '8%',
        label: 'vs last month',
        positive: true
      }
    },
    {
      title: 'Total Revenue',
      value: '$45,231',
      icon: <DollarSign className="h-4 w-4" />,
      change: {
        value: '15%',
        label: 'vs last month',
        positive: true
      }
    },
    {
      title: 'Growth Rate',
      value: '24.5%',
      icon: <LineChart className="h-4 w-4" />,
      change: {
        value: '3%',
        label: 'vs last month',
        positive: true
      }
    }
  ]);
  
  return (
    <div className="space-y-6">
      <AdminDashboardHeader 
        title="Admin Dashboard" 
        description="Manage platform investments and users" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <AdminStatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>
      
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid grid-cols-9">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="p2p">P2P Matching</TabsTrigger>
          <TabsTrigger value="user-matching">User Matching</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="space-y-4">
          <DataAnalytics />
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <UserManagement />
          <UserBlockingManagement />
        </TabsContent>
        
        <TabsContent value="investments" className="space-y-4">
          <InvestmentManagement />
        </TabsContent>
        
        <TabsContent value="p2p" className="space-y-4">
          <P2PMatching />
        </TabsContent>
        
        <TabsContent value="user-matching" className="space-y-4">
          <UserMatching />
        </TabsContent>
        
        <TabsContent value="messaging" className="space-y-4">
          <AdminMessaging />
        </TabsContent>
        
        <TabsContent value="expired" className="space-y-4">
          <ExpiredInvestments />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <NotificationCenter />
        </TabsContent>

        <TabsContent value="kyc" className="space-y-4">
          <KYCVerificationManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
