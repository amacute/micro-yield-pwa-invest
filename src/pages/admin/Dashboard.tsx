
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { UserManagement } from '@/components/admin/UserManagement';
import { InvestmentManagement } from '@/components/admin/InvestmentManagement';
import { P2PMatching } from '@/components/admin/P2PMatching';
import { DataAnalytics } from '@/components/admin/DataAnalytics';
import { AdminStatsCard } from '@/components/admin/AdminStatsCard';
import { AdminDashboardHeader } from '@/components/admin/AdminDashboardHeader';

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Mock admin stats
  const stats = {
    totalUsers: 724,
    activeInvestments: 47,
    completedInvestments: 156,
    totalVolume: 542690,
  };
  
  return (
    <div className="space-y-6">
      <AdminDashboardHeader 
        title="Admin Dashboard" 
        description="Manage platform investments and users" 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users />}
          iconBgClass="bg-blue-100 dark:bg-blue-900/30"
          iconClass="text-blue-600 dark:text-blue-400"
        />
        
        <AdminStatsCard
          title="Active Investments"
          value={stats.activeInvestments}
          icon={<ArrowUp />}
          iconBgClass="bg-green-100 dark:bg-green-900/30"
          iconClass="text-green-600 dark:text-green-400"
        />
        
        <AdminStatsCard
          title="Completed Investments"
          value={stats.completedInvestments}
          icon={<Clock />}
          iconBgClass="bg-purple-100 dark:bg-purple-900/30"
          iconClass="text-purple-600 dark:text-purple-400"
        />
        
        <AdminStatsCard
          title="Total Volume"
          value={`$${stats.totalVolume.toLocaleString()}`}
          icon={<ArrowDown />}
          iconBgClass="bg-yellow-100 dark:bg-yellow-900/30"
          iconClass="text-yellow-600 dark:text-yellow-400"
        />
      </div>
      
      <Tabs defaultValue="overview" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="matching">P2P Matching</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <DataAnalytics />
        </TabsContent>
        
        <TabsContent value="investments">
          <InvestmentManagement />
        </TabsContent>
        
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="matching">
          <P2PMatching />
        </TabsContent>
      </Tabs>
    </div>
  );
}
